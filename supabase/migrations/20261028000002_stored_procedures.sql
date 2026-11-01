-- Migration: 20261028000002_stored_procedures.sql
-- Description: Stored procedures, triggers, and atomic inventory transactions

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE OR REPLACE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE OR REPLACE TRIGGER trg_addresses_updated_at BEFORE UPDATE ON public.addresses FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE OR REPLACE TRIGGER trg_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE OR REPLACE TRIGGER trg_product_variants_updated_at BEFORE UPDATE ON public.product_variants FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE OR REPLACE TRIGGER trg_carts_updated_at BEFORE UPDATE ON public.carts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE OR REPLACE TRIGGER trg_cart_items_updated_at BEFORE UPDATE ON public.cart_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE OR REPLACE TRIGGER trg_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE OR REPLACE TRIGGER trg_shipments_updated_at BEFORE UPDATE ON public.shipments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE OR REPLACE TRIGGER trg_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE OR REPLACE TRIGGER trg_return_requests_updated_at BEFORE UPDATE ON public.return_requests FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE OR REPLACE TRIGGER trg_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE OR REPLACE TRIGGER trg_homepage_sections_updated_at BEFORE UPDATE ON public.homepage_sections FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Role check security definer functions
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role = 'admin'
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_staff()
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role IN ('admin', 'staff')
    );
END;
$$;

-- Atomic stock reservation
-- p_items JSON format: [{"variant_id": "uuid", "quantity": 1}]
CREATE OR REPLACE FUNCTION public.reserve_stock_for_checkout(
    p_order_id UUID,
    p_session_id TEXT,
    p_items JSONB,
    p_duration_minutes INT DEFAULT 15
)
RETURNS JSONB
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
    item RECORD;
    v_variant_id UUID;
    v_quantity INT;
    v_current_stock INT;
    v_expires_at TIMESTAMPTZ;
    v_reservations_created JSONB := '[]'::jsonb;
BEGIN
    v_expires_at := timezone('utc'::text, now()) + (p_duration_minutes || ' minutes')::interval;

    -- Clean up any existing expired reservations first to accurately reflect stock
    PERFORM public.release_expired_reservations();

    FOR item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(variant_id UUID, quantity INT)
    LOOP
        v_variant_id := item.variant_id;
        v_quantity := item.quantity;

        IF v_quantity <= 0 THEN
            RAISE EXCEPTION 'Invalid reservation quantity: %', v_quantity;
        END IF;

        -- Row-level lock on the variant
        SELECT stock_quantity INTO v_current_stock
        FROM public.product_variants
        WHERE id = v_variant_id AND is_active = true
        FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Variant % not found or inactive', v_variant_id;
        END IF;

        IF v_current_stock < v_quantity THEN
            RAISE EXCEPTION 'Insufficient stock for variant %. Available: %, Requested: %', v_variant_id, v_current_stock, v_quantity;
        END IF;

        -- Create reservation
        INSERT INTO public.inventory_reservations (
            order_id,
            variant_id,
            quantity,
            status,
            session_id,
            expires_at
        ) VALUES (
            p_order_id,
            v_variant_id,
            v_quantity,
            'reserved',
            p_session_id,
            v_expires_at
        );
    END LOOP;

    RETURN jsonb_build_object(
        'success', true,
        'expires_at', v_expires_at
    );
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$;

-- Release expired reservations
CREATE OR REPLACE FUNCTION public.release_expired_reservations()
RETURNS INT
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
    v_count INT;
BEGIN
    WITH expired AS (
        UPDATE public.inventory_reservations
        SET status = 'expired'
        WHERE status = 'reserved' AND expires_at < timezone('utc'::text, now())
        RETURNING id
    )
    SELECT count(*) INTO v_count FROM expired;
    RETURN v_count;
END;
$$;

-- Confirm order and deduct stock atomically
CREATE OR REPLACE FUNCTION public.confirm_order_and_deduct_stock(
    p_order_id UUID
)
RETURNS JSONB
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
    v_item RECORD;
    v_current_stock INT;
    v_new_stock INT;
BEGIN
    -- Check order existence and status
    IF NOT EXISTS (SELECT 1 FROM public.orders WHERE id = p_order_id) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Order not found');
    END IF;

    -- Process each order item
    FOR v_item IN SELECT id, variant_id, quantity, product_name, sku FROM public.order_items WHERE order_id = p_order_id
    LOOP
        IF v_item.variant_id IS NOT NULL THEN
            -- Row lock
            SELECT stock_quantity INTO v_current_stock
            FROM public.product_variants
            WHERE id = v_item.variant_id
            FOR UPDATE;

            IF v_current_stock < v_item.quantity THEN
                RAISE EXCEPTION 'Cannot confirm order %: stock deficit on % (Available: %, Needed: %)', 
                    p_order_id, v_item.sku, v_current_stock, v_item.quantity;
            END IF;

            v_new_stock := v_current_stock - v_item.quantity;

            -- Deduct stock
            UPDATE public.product_variants
            SET stock_quantity = v_new_stock,
                updated_at = timezone('utc'::text, now())
            WHERE id = v_item.variant_id;

            -- Audit inventory movement
            INSERT INTO public.inventory_movements (
                variant_id,
                change_quantity,
                previous_stock,
                new_stock,
                movement_type,
                reason,
                reference_id
            ) VALUES (
                v_item.variant_id,
                -v_item.quantity,
                v_current_stock,
                v_new_stock,
                'order_placed',
                'Stock deducted for order placed',
                p_order_id::text
            );
        END IF;
    END LOOP;

    -- Update inventory reservations to confirmed if any exist for this order
    UPDATE public.inventory_reservations
    SET status = 'confirmed'
    WHERE order_id = p_order_id AND status = 'reserved';

    -- Update order status to confirmed
    UPDATE public.orders
    SET status = 'confirmed',
        updated_at = timezone('utc'::text, now())
    WHERE id = p_order_id;

    -- Add status history entry
    INSERT INTO public.order_status_history (
        order_id,
        from_status,
        to_status,
        comment
    ) VALUES (
        p_order_id,
        'pending',
        'confirmed',
        'Order confirmed and inventory deducted'
    );

    RETURN jsonb_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Cancel order and restore stock atomically (guarantees idempotency)
CREATE OR REPLACE FUNCTION public.cancel_order_and_restore_stock(
    p_order_id UUID,
    p_reason TEXT,
    p_actor_id UUID DEFAULT NULL
)
RETURNS JSONB
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
    v_order RECORD;
    v_item RECORD;
    v_current_stock INT;
    v_new_stock INT;
BEGIN
    SELECT * INTO v_order
    FROM public.orders
    WHERE id = p_order_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Order not found');
    END IF;

    IF v_order.status = 'cancelled' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Order is already cancelled');
    END IF;

    IF v_order.status IN ('delivered', 'returned') THEN
        RETURN jsonb_build_object('success', false, 'error', 'Cannot cancel order in status: ' || v_order.status);
    END IF;

    -- If the order was confirmed/processing/shipped, stock was deducted and needs restoring
    IF v_order.status IN ('confirmed', 'processing', 'shipped') THEN
        FOR v_item IN SELECT variant_id, quantity, sku FROM public.order_items WHERE order_id = p_order_id
        LOOP
            IF v_item.variant_id IS NOT NULL THEN
                SELECT stock_quantity INTO v_current_stock
                FROM public.product_variants
                WHERE id = v_item.variant_id
                FOR UPDATE;

                v_new_stock := v_current_stock + v_item.quantity;

                UPDATE public.product_variants
                SET stock_quantity = v_new_stock,
                    updated_at = timezone('utc'::text, now())
                WHERE id = v_item.variant_id;

                INSERT INTO public.inventory_movements (
                    variant_id,
                    change_quantity,
                    previous_stock,
                    new_stock,
                    movement_type,
                    reason,
                    reference_id,
                    created_by
                ) VALUES (
                    v_item.variant_id,
                    v_item.quantity,
                    v_current_stock,
                    v_new_stock,
                    'order_cancelled',
                    'Stock restored upon order cancellation: ' || COALESCE(p_reason, 'No reason provided'),
                    p_order_id::text,
                    p_actor_id
                );
            END IF;
        END LOOP;
    END IF;

    -- Release any active reservations
    UPDATE public.inventory_reservations
    SET status = 'released'
    WHERE order_id = p_order_id AND status = 'reserved';

    -- Mark order cancelled
    UPDATE public.orders
    SET status = 'cancelled',
        updated_at = timezone('utc'::text, now())
    WHERE id = p_order_id;

    -- Record status history
    INSERT INTO public.order_status_history (
        order_id,
        from_status,
        to_status,
        comment,
        created_by
    ) VALUES (
        p_order_id,
        v_order.status,
        'cancelled',
        p_reason,
        p_actor_id
    );

    RETURN jsonb_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Atomic coupon validation and application
CREATE OR REPLACE FUNCTION public.check_coupon_validity(
    p_code TEXT,
    p_user_id UUID,
    p_order_amount_paise BIGINT
)
RETURNS JSONB
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
    v_coupon RECORD;
    v_user_uses INT := 0;
    v_discount_paise BIGINT := 0;
BEGIN
    SELECT * INTO v_coupon
    FROM public.coupons
    WHERE UPPER(code) = UPPER(p_code) AND is_active = true;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('valid', false, 'message', 'Invalid or inactive coupon code');
    END IF;

    IF v_coupon.start_date > timezone('utc'::text, now()) THEN
        RETURN jsonb_build_object('valid', false, 'message', 'Coupon is not yet active');
    END IF;

    IF v_coupon.end_date IS NOT NULL AND v_coupon.end_date < timezone('utc'::text, now()) THEN
        RETURN jsonb_build_object('valid', false, 'message', 'Coupon has expired');
    END IF;

    IF v_coupon.usage_limit IS NOT NULL AND v_coupon.used_count >= v_coupon.usage_limit THEN
        RETURN jsonb_build_object('valid', false, 'message', 'Coupon usage limit has been reached');
    END IF;

    IF p_order_amount_paise < v_coupon.min_order_paise THEN
        RETURN jsonb_build_object('valid', false, 'message', 'Minimum order value of ₹' || (v_coupon.min_order_paise / 100) || ' required');
    END IF;

    IF p_user_id IS NOT NULL THEN
        SELECT count(*) INTO v_user_uses
        FROM public.coupon_redemptions
        WHERE coupon_id = v_coupon.id AND user_id = p_user_id;

        IF v_user_uses >= v_coupon.per_customer_limit THEN
            RETURN jsonb_build_object('valid', false, 'message', 'You have already reached the usage limit for this coupon');
        END IF;
    END IF;

    -- Calculate discount
    IF v_coupon.discount_type = 'percentage' THEN
        v_discount_paise := (p_order_amount_paise * v_coupon.discount_value) / 100;
        IF v_coupon.max_discount_paise IS NOT NULL AND v_discount_paise > v_coupon.max_discount_paise THEN
            v_discount_paise := v_coupon.max_discount_paise;
        END IF;
    ELSE
        v_discount_paise := v_coupon.discount_value;
        IF v_discount_paise > p_order_amount_paise THEN
            v_discount_paise := p_order_amount_paise;
        END IF;
    END IF;

    RETURN jsonb_build_object(
        'valid', true,
        'coupon_id', v_coupon.id,
        'code', v_coupon.code,
        'discount_type', v_coupon.discount_type,
        'discount_value', v_coupon.discount_value,
        'discount_paise', v_discount_paise
    );
END;
$$;
