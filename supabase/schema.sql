-- ==============================================================================
-- SHRÎ ATELIER — COMPLETE SUPABASE DATABASE SCHEMA
-- Version: 2.0 (PostgreSQL & Supabase Auth with Mobile OTP)
-- Instructions: Run this entire script in Supabase Dashboard -> SQL Editor -> Run
-- ==============================================================================

-- ==============================================================================
-- 1. EXTENSIONS
-- ==============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. CORE TABLES (32 TABLES)
-- ==============================================================================

-- 1. PROFILES (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);

-- 2. USER ROLES (Privilege separation: customer, staff, admin)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('customer', 'staff', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, role)
);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);

-- 3. ADDRESSES (Customer Address Book)
CREATE TABLE IF NOT EXISTS public.addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'India',
    is_default_shipping BOOLEAN NOT NULL DEFAULT false,
    is_default_billing BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON public.addresses(user_id);

-- 4. CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories(parent_id);

-- 5. PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    fabric TEXT,
    fit TEXT,
    care_instructions TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
    seo_title TEXT,
    seo_description TEXT,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);

-- 6. PRODUCT IMAGES
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    alt_text TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    color_variant TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);

-- 7. PRODUCT VARIANTS (SKU, Size, Color, Pricing in Paise, Stock)
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    sku TEXT NOT NULL UNIQUE,
    size TEXT NOT NULL,
    color_name TEXT NOT NULL,
    color_hex TEXT,
    price_paise BIGINT NOT NULL CHECK (price_paise >= 0),
    compare_at_price_paise BIGINT CHECK (compare_at_price_paise IS NULL OR compare_at_price_paise >= price_paise),
    stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON public.product_variants(sku);

-- 8. COLLECTIONS
CREATE TABLE IF NOT EXISTS public.collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    banner_image TEXT,
    is_published BOOLEAN NOT NULL DEFAULT true,
    sort_order INT NOT NULL DEFAULT 0,
    seo_title TEXT,
    seo_description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_collections_slug ON public.collections(slug);

-- 9. COLLECTION PRODUCTS (M2M)
CREATE TABLE IF NOT EXISTS public.collection_products (
    collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    sort_order INT NOT NULL DEFAULT 0,
    PRIMARY KEY (collection_id, product_id)
);

-- 10. INVENTORY MOVEMENTS (Stock Audit Log)
CREATE TABLE IF NOT EXISTS public.inventory_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
    change_quantity INT NOT NULL,
    previous_stock INT NOT NULL,
    new_stock INT NOT NULL,
    movement_type TEXT NOT NULL CHECK (movement_type IN ('adjustment', 'order_placed', 'order_cancelled', 'return_restocked', 'reservation_expired')),
    reason TEXT NOT NULL,
    reference_id TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_variant ON public.inventory_movements(variant_id);

-- 11. INVENTORY RESERVATIONS (Locks inventory during checkout)
CREATE TABLE IF NOT EXISTS public.inventory_reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID,
    variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
    quantity INT NOT NULL CHECK (quantity > 0),
    status TEXT NOT NULL DEFAULT 'reserved' CHECK (status IN ('reserved', 'confirmed', 'released', 'expired')),
    session_id TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_inventory_reservations_status_expires ON public.inventory_reservations(status, expires_at);
CREATE INDEX IF NOT EXISTS idx_inventory_reservations_variant ON public.inventory_reservations(variant_id);

-- 12. CARTS
CREATE TABLE IF NOT EXISTS public.carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT,
    coupon_code TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_carts_user_id ON public.carts(user_id);
CREATE INDEX IF NOT EXISTS idx_carts_session_id ON public.carts(session_id);

-- 13. CART ITEMS
CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
    variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
    quantity INT NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(cart_id, variant_id)
);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON public.cart_items(cart_id);

-- 14. WISHLISTS
CREATE TABLE IF NOT EXISTS public.wishlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, product_id)
);
CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON public.wishlists(user_id);

-- 15. COUPONS
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value BIGINT NOT NULL CHECK (discount_value > 0),
    min_order_paise BIGINT NOT NULL DEFAULT 0,
    max_discount_paise BIGINT,
    start_date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    end_date TIMESTAMPTZ,
    usage_limit INT,
    per_customer_limit INT NOT NULL DEFAULT 1,
    used_count INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);

-- 16. COUPON REDEMPTIONS
CREATE TABLE IF NOT EXISTS public.coupon_redemptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE RESTRICT,
    order_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    discount_applied_paise BIGINT NOT NULL CHECK (discount_applied_paise >= 0),
    redeemed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_coupon_user ON public.coupon_redemptions(coupon_id, user_id);

-- 17. ORDERS
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT NOT NULL UNIQUE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    guest_email TEXT,
    guest_phone TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned')),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('online_razorpay', 'cod')),
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'authorized', 'captured', 'failed', 'refunded', 'partially_refunded')),
    currency TEXT NOT NULL DEFAULT 'INR',
    subtotal_paise BIGINT NOT NULL CHECK (subtotal_paise >= 0),
    discount_paise BIGINT NOT NULL DEFAULT 0 CHECK (discount_paise >= 0),
    shipping_paise BIGINT NOT NULL DEFAULT 0 CHECK (shipping_paise >= 0),
    tax_paise BIGINT NOT NULL DEFAULT 0 CHECK (tax_paise >= 0),
    total_paise BIGINT NOT NULL CHECK (total_paise >= 0),
    coupon_code TEXT,
    notes TEXT,
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- 18. ORDER ITEMS (Immutable snapshot of purchased item)
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    sku TEXT NOT NULL,
    size TEXT NOT NULL,
    color TEXT NOT NULL,
    unit_price_paise BIGINT NOT NULL CHECK (unit_price_paise >= 0),
    quantity INT NOT NULL CHECK (quantity > 0),
    line_total_paise BIGINT NOT NULL CHECK (line_total_paise >= 0),
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- 19. ORDER ADDRESSES (Immutable snapshot of delivery/billing addresses)
CREATE TABLE IF NOT EXISTS public.order_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('shipping', 'billing')),
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'India',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_order_addresses_order_id ON public.order_addresses(order_id);

-- 20. ORDER STATUS HISTORY (Timeline audit)
CREATE TABLE IF NOT EXISTS public.order_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    from_status TEXT,
    to_status TEXT NOT NULL,
    comment TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON public.order_status_history(order_id);

-- 21. SHIPMENTS
CREATE TABLE IF NOT EXISTS public.shipments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    courier_name TEXT NOT NULL,
    tracking_number TEXT,
    awb_code TEXT,
    shipping_status TEXT NOT NULL DEFAULT 'manifested' CHECK (shipping_status IN ('manifested', 'in_transit', 'out_for_delivery', 'delivered', 'rto', 'cancelled')),
    label_url TEXT,
    manifest_url TEXT,
    shipped_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    estimated_delivery TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_shipments_order_id ON public.shipments(order_id);

-- 22. SHIPMENT EVENTS (Tracking telemetry)
CREATE TABLE IF NOT EXISTS public.shipment_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shipment_id UUID NOT NULL REFERENCES public.shipments(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    location TEXT,
    event_time TIMESTAMPTZ NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_shipment_events_shipment_id ON public.shipment_events(shipment_id);

-- 23. PAYMENTS (Razorpay & COD verification record)
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    provider TEXT NOT NULL DEFAULT 'razorpay',
    provider_order_id TEXT,
    provider_payment_id TEXT UNIQUE,
    provider_signature TEXT,
    amount_paise BIGINT NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    status TEXT NOT NULL CHECK (status IN ('created', 'authorized', 'captured', 'failed', 'refunded')),
    error_code TEXT,
    error_description TEXT,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_provider_order_id ON public.payments(provider_order_id);

-- 24. WEBHOOK EVENTS (Idempotency storage for Razorpay / courier webhooks)
CREATE TABLE IF NOT EXISTS public.webhook_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider TEXT NOT NULL DEFAULT 'razorpay',
    provider_event_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    processing_status TEXT NOT NULL DEFAULT 'received' CHECK (processing_status IN ('received', 'processed', 'failed', 'ignored')),
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    processed_at TIMESTAMPTZ,
    UNIQUE (provider, provider_event_id)
);
CREATE INDEX IF NOT EXISTS idx_webhook_events_lookup ON public.webhook_events(provider, provider_event_id);

-- 25. REFUNDS
CREATE TABLE IF NOT EXISTS public.refunds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
    return_request_id UUID,
    amount_paise BIGINT NOT NULL CHECK (amount_paise > 0),
    currency TEXT NOT NULL DEFAULT 'INR',
    gateway_refund_id TEXT,
    status TEXT NOT NULL DEFAULT 'initiated' CHECK (status IN ('initiated', 'processed', 'failed')),
    refund_method TEXT NOT NULL CHECK (refund_method IN ('gateway', 'bank_transfer_cod', 'store_credit')),
    reason TEXT NOT NULL,
    processed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_refunds_order_id ON public.refunds(order_id);

-- 26. RETURN REQUESTS
CREATE TABLE IF NOT EXISTS public.return_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    request_number TEXT NOT NULL UNIQUE,
    reason TEXT NOT NULL,
    customer_comment TEXT,
    status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'approved', 'rejected', 'item_received', 'inspected', 'completed')),
    inspection_notes TEXT,
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_return_requests_order_id ON public.return_requests(order_id);

-- 27. RETURN ITEMS
CREATE TABLE IF NOT EXISTS public.return_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    return_request_id UUID NOT NULL REFERENCES public.return_requests(id) ON DELETE CASCADE,
    order_item_id UUID NOT NULL REFERENCES public.order_items(id) ON DELETE RESTRICT,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    condition TEXT CHECK (condition IN ('unopened', 'like_new', 'damaged', 'unsellable')),
    restock_approved BOOLEAN NOT NULL DEFAULT false,
    restocked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_return_items_request_id ON public.return_items(return_request_id);

-- 28. REVIEWS
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    comment TEXT NOT NULL,
    author_name TEXT NOT NULL,
    is_verified_buyer BOOLEAN NOT NULL DEFAULT false,
    status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON public.reviews(status);

-- 29. NEWSLETTER SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS public.newsletter_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 30. STORE SETTINGS (Key-Value configuration)
CREATE TABLE IF NOT EXISTS public.store_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 31. HOMEPAGE SECTIONS
CREATE TABLE IF NOT EXISTS public.homepage_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_key TEXT NOT NULL UNIQUE,
    title TEXT,
    subtitle TEXT,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_visible BOOLEAN NOT NULL DEFAULT true,
    sort_order INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 32. AUDIT LOGS (Admin actions & operations history)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    old_values JSONB,
    new_values JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);


-- ==============================================================================
-- 3. STORED PROCEDURES & TRIGGERS
-- ==============================================================================

-- Timestamp updater
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply timestamp triggers
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_addresses_updated_at ON public.addresses;
CREATE TRIGGER trg_addresses_updated_at BEFORE UPDATE ON public.addresses FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_products_updated_at ON public.products;
CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_product_variants_updated_at ON public.product_variants;
CREATE TRIGGER trg_product_variants_updated_at BEFORE UPDATE ON public.product_variants FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_carts_updated_at ON public.carts;
CREATE TRIGGER trg_carts_updated_at BEFORE UPDATE ON public.carts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_cart_items_updated_at ON public.cart_items;
CREATE TRIGGER trg_cart_items_updated_at BEFORE UPDATE ON public.cart_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_orders_updated_at ON public.orders;
CREATE TRIGGER trg_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_shipments_updated_at ON public.shipments;
CREATE TRIGGER trg_shipments_updated_at BEFORE UPDATE ON public.shipments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_payments_updated_at ON public.payments;
CREATE TRIGGER trg_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_return_requests_updated_at ON public.return_requests;
CREATE TRIGGER trg_return_requests_updated_at BEFORE UPDATE ON public.return_requests FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_reviews_updated_at ON public.reviews;
CREATE TRIGGER trg_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_homepage_sections_updated_at ON public.homepage_sections;
CREATE TRIGGER trg_homepage_sections_updated_at BEFORE UPDATE ON public.homepage_sections FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Role check security functions
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

-- Automatic profile & role assignment upon Mobile OTP / Email Signup
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger AS $$
DECLARE
    extracted_name TEXT;
    extracted_phone TEXT;
BEGIN
    extracted_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        ''
    );

    extracted_phone := COALESCE(
        NEW.phone,
        NEW.raw_user_meta_data->>'phone',
        ''
    );

    -- 1. Insert or update public.profiles
    INSERT INTO public.profiles (id, full_name, phone, created_at, updated_at)
    VALUES (
        NEW.id,
        NULLIF(extracted_name, ''),
        NULLIF(extracted_phone, ''),
        timezone('utc'::text, now()),
        timezone('utc'::text, now())
    )
    ON CONFLICT (id) DO UPDATE SET
        phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
        full_name = CASE 
            WHEN public.profiles.full_name IS NULL OR public.profiles.full_name = '' 
            THEN EXCLUDED.full_name 
            ELSE public.profiles.full_name 
        END,
        updated_at = timezone('utc'::text, now());

    -- 2. Assign role: if master admin phone (9788394119), grant 'admin', otherwise 'customer'
    IF extracted_phone LIKE '%9788394119%' THEN
        INSERT INTO public.user_roles (user_id, role, created_at)
        VALUES (NEW.id, 'admin', timezone('utc'::text, now()))
        ON CONFLICT (user_id, role) DO UPDATE SET role = 'admin';
    ELSE
        INSERT INTO public.user_roles (user_id, role, created_at)
        VALUES (NEW.id, 'customer', timezone('utc'::text, now()))
        ON CONFLICT (user_id, role) DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

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

-- Atomic stock reservation during checkout
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
BEGIN
    v_expires_at := timezone('utc'::text, now()) + (p_duration_minutes || ' minutes')::interval;

    -- Clean up any existing expired reservations first
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
    IF NOT EXISTS (SELECT 1 FROM public.orders WHERE id = p_order_id) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Order not found');
    END IF;

    FOR v_item IN SELECT id, variant_id, quantity, product_name, sku FROM public.order_items WHERE order_id = p_order_id
    LOOP
        IF v_item.variant_id IS NOT NULL THEN
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
                'Stock deducted for confirmed order',
                p_order_id::text
            );
        END IF;
    END LOOP;

    -- Update inventory reservations to confirmed
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
        'Order confirmed and stock successfully deducted'
    );

    RETURN jsonb_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Cancel order and restore stock atomically
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

    -- If stock was already deducted, restore it
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
                    'Stock restored upon cancellation: ' || COALESCE(p_reason, 'No reason provided'),
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

-- Atomic coupon validation
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
        RETURN jsonb_build_object('valid', false, 'message', 'Coupon usage limit reached');
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


-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.return_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.return_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Staff/Admin can view all profiles" ON public.profiles;
CREATE POLICY "Staff/Admin can view all profiles" ON public.profiles FOR SELECT USING (public.is_admin_or_staff());

-- User Roles Policies
DROP POLICY IF EXISTS "Users can read their own role" ON public.user_roles;
CREATE POLICY "Users can read their own role" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins have full access to user_roles" ON public.user_roles;
CREATE POLICY "Admins have full access to user_roles" ON public.user_roles FOR ALL USING (public.is_admin());

-- Addresses Policies
DROP POLICY IF EXISTS "Users can manage their own addresses" ON public.addresses;
CREATE POLICY "Users can manage their own addresses" ON public.addresses FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Staff/Admin can view all addresses" ON public.addresses;
CREATE POLICY "Staff/Admin can view all addresses" ON public.addresses FOR SELECT USING (public.is_admin_or_staff());

-- Categories Policies (Public read active, staff/admin write)
DROP POLICY IF EXISTS "Public can view active categories" ON public.categories;
CREATE POLICY "Public can view active categories" ON public.categories FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Staff/Admin full access to categories" ON public.categories;
CREATE POLICY "Staff/Admin full access to categories" ON public.categories FOR ALL USING (public.is_admin_or_staff());

-- Products Policies (Public read active, staff/admin write)
DROP POLICY IF EXISTS "Public can view active products" ON public.products;
CREATE POLICY "Public can view active products" ON public.products FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Staff/Admin full access to products" ON public.products;
CREATE POLICY "Staff/Admin full access to products" ON public.products FOR ALL USING (public.is_admin_or_staff());

-- Product Images Policies
DROP POLICY IF EXISTS "Public can view images of active products" ON public.product_images;
CREATE POLICY "Public can view images of active products" ON public.product_images FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND (p.status = 'active' OR public.is_admin_or_staff()))
);

DROP POLICY IF EXISTS "Staff/Admin full access to product images" ON public.product_images;
CREATE POLICY "Staff/Admin full access to product images" ON public.product_images FOR ALL USING (public.is_admin_or_staff());

-- Product Variants Policies
DROP POLICY IF EXISTS "Public can view active variants of active products" ON public.product_variants;
CREATE POLICY "Public can view active variants of active products" ON public.product_variants FOR SELECT USING (
    is_active = true AND EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND (p.status = 'active' OR public.is_admin_or_staff()))
);

DROP POLICY IF EXISTS "Staff/Admin full access to variants" ON public.product_variants;
CREATE POLICY "Staff/Admin full access to variants" ON public.product_variants FOR ALL USING (public.is_admin_or_staff());

-- Collections Policies
DROP POLICY IF EXISTS "Public can view published collections" ON public.collections;
CREATE POLICY "Public can view published collections" ON public.collections FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "Staff/Admin full access to collections" ON public.collections;
CREATE POLICY "Staff/Admin full access to collections" ON public.collections FOR ALL USING (public.is_admin_or_staff());

-- Collection Products Policies
DROP POLICY IF EXISTS "Public can view collection products" ON public.collection_products;
CREATE POLICY "Public can view collection products" ON public.collection_products FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.collections c WHERE c.id = collection_id AND (c.is_published = true OR public.is_admin_or_staff()))
);

DROP POLICY IF EXISTS "Staff/Admin full access to collection products" ON public.collection_products;
CREATE POLICY "Staff/Admin full access to collection products" ON public.collection_products FOR ALL USING (public.is_admin_or_staff());

-- Inventory Movements Policies
DROP POLICY IF EXISTS "Only staff and admins can view inventory movements" ON public.inventory_movements;
CREATE POLICY "Only staff and admins can view inventory movements" ON public.inventory_movements FOR SELECT USING (public.is_admin_or_staff());

DROP POLICY IF EXISTS "Staff and admin can record inventory movements" ON public.inventory_movements;
CREATE POLICY "Staff and admin can record inventory movements" ON public.inventory_movements FOR INSERT WITH CHECK (public.is_admin_or_staff());

-- Inventory Reservations Policies
DROP POLICY IF EXISTS "Staff and admin can view reservations" ON public.inventory_reservations;
CREATE POLICY "Staff and admin can view reservations" ON public.inventory_reservations FOR SELECT USING (public.is_admin_or_staff());

-- Carts & Cart Items
DROP POLICY IF EXISTS "Users can manage their own carts" ON public.carts;
CREATE POLICY "Users can manage their own carts" ON public.carts FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can manage items in their carts" ON public.cart_items;
CREATE POLICY "Users can manage items in their carts" ON public.cart_items FOR ALL USING (
    EXISTS (SELECT 1 FROM public.carts c WHERE c.id = cart_id AND (c.user_id = auth.uid() OR c.user_id IS NULL))
);

-- Wishlists Policies
DROP POLICY IF EXISTS "Users can manage their own wishlist" ON public.wishlists;
CREATE POLICY "Users can manage their own wishlist" ON public.wishlists FOR ALL USING (auth.uid() = user_id);

-- Coupons Policies
DROP POLICY IF EXISTS "Public can view active coupons" ON public.coupons;
CREATE POLICY "Public can view active coupons" ON public.coupons FOR SELECT USING (is_active = true AND start_date <= timezone('utc'::text, now()));

DROP POLICY IF EXISTS "Staff/Admin full access to coupons" ON public.coupons;
CREATE POLICY "Staff/Admin full access to coupons" ON public.coupons FOR ALL USING (public.is_admin_or_staff());

DROP POLICY IF EXISTS "Users can view their own redemptions" ON public.coupon_redemptions;
CREATE POLICY "Users can view their own redemptions" ON public.coupon_redemptions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Staff/Admin view all redemptions" ON public.coupon_redemptions;
CREATE POLICY "Staff/Admin view all redemptions" ON public.coupon_redemptions FOR SELECT USING (public.is_admin_or_staff());

-- Orders & Order Items Policies
DROP POLICY IF EXISTS "Customers can view their own orders" ON public.orders;
CREATE POLICY "Customers can view their own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Staff/Admin full access to orders" ON public.orders;
CREATE POLICY "Staff/Admin full access to orders" ON public.orders FOR ALL USING (public.is_admin_or_staff());

DROP POLICY IF EXISTS "Customers can view items of their own orders" ON public.order_items;
CREATE POLICY "Customers can view items of their own orders" ON public.order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.is_admin_or_staff()))
);

DROP POLICY IF EXISTS "Staff/Admin full access to order items" ON public.order_items;
CREATE POLICY "Staff/Admin full access to order items" ON public.order_items FOR ALL USING (public.is_admin_or_staff());

DROP POLICY IF EXISTS "Customers can view addresses of their own orders" ON public.order_addresses;
CREATE POLICY "Customers can view addresses of their own orders" ON public.order_addresses FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.is_admin_or_staff()))
);

DROP POLICY IF EXISTS "Staff/Admin full access to order addresses" ON public.order_addresses;
CREATE POLICY "Staff/Admin full access to order addresses" ON public.order_addresses FOR ALL USING (public.is_admin_or_staff());

DROP POLICY IF EXISTS "Customers can view status history of their own orders" ON public.order_status_history;
CREATE POLICY "Customers can view status history of their own orders" ON public.order_status_history FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.is_admin_or_staff()))
);

DROP POLICY IF EXISTS "Staff/Admin full access to order status history" ON public.order_status_history;
CREATE POLICY "Staff/Admin full access to order status history" ON public.order_status_history FOR ALL USING (public.is_admin_or_staff());

-- Shipments & Payments
DROP POLICY IF EXISTS "Customers can view shipments of their own orders" ON public.shipments;
CREATE POLICY "Customers can view shipments of their own orders" ON public.shipments FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.is_admin_or_staff()))
);

DROP POLICY IF EXISTS "Staff/Admin full access to shipments" ON public.shipments;
CREATE POLICY "Staff/Admin full access to shipments" ON public.shipments FOR ALL USING (public.is_admin_or_staff());

DROP POLICY IF EXISTS "Customers can view shipment events of their own shipments" ON public.shipment_events;
CREATE POLICY "Customers can view shipment events of their own shipments" ON public.shipment_events FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.shipments s JOIN public.orders o ON o.id = s.order_id WHERE s.id = shipment_id AND (o.user_id = auth.uid() OR public.is_admin_or_staff()))
);

DROP POLICY IF EXISTS "Staff/Admin full access to shipment events" ON public.shipment_events;
CREATE POLICY "Staff/Admin full access to shipment events" ON public.shipment_events FOR ALL USING (public.is_admin_or_staff());

DROP POLICY IF EXISTS "Customers can view payment status of their own orders" ON public.payments;
CREATE POLICY "Customers can view payment status of their own orders" ON public.payments FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.is_admin_or_staff()))
);

DROP POLICY IF EXISTS "Staff/Admin full access to payments" ON public.payments;
CREATE POLICY "Staff/Admin full access to payments" ON public.payments FOR ALL USING (public.is_admin_or_staff());

DROP POLICY IF EXISTS "Only staff/admins can view webhook events" ON public.webhook_events;
CREATE POLICY "Only staff/admins can view webhook events" ON public.webhook_events FOR SELECT USING (public.is_admin_or_staff());

-- Refunds & Returns
DROP POLICY IF EXISTS "Customers can view refunds on their own orders" ON public.refunds;
CREATE POLICY "Customers can view refunds on their own orders" ON public.refunds FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.is_admin_or_staff()))
);

DROP POLICY IF EXISTS "Staff/Admin full access to refunds" ON public.refunds;
CREATE POLICY "Staff/Admin full access to refunds" ON public.refunds FOR ALL USING (public.is_admin_or_staff());

DROP POLICY IF EXISTS "Customers can view and submit their own return requests" ON public.return_requests;
CREATE POLICY "Customers can view and submit their own return requests" ON public.return_requests FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Staff/Admin full access to return requests" ON public.return_requests;
CREATE POLICY "Staff/Admin full access to return requests" ON public.return_requests FOR ALL USING (public.is_admin_or_staff());

DROP POLICY IF EXISTS "Customers can view items of their return requests" ON public.return_items;
CREATE POLICY "Customers can view items of their return requests" ON public.return_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.return_requests r WHERE r.id = return_request_id AND (r.user_id = auth.uid() OR public.is_admin_or_staff()))
);

DROP POLICY IF EXISTS "Staff/Admin full access to return items" ON public.return_items;
CREATE POLICY "Staff/Admin full access to return items" ON public.return_items FOR ALL USING (public.is_admin_or_staff());

-- Reviews Policies
DROP POLICY IF EXISTS "Public can view approved reviews" ON public.reviews;
CREATE POLICY "Public can view approved reviews" ON public.reviews FOR SELECT USING (status = 'approved');

DROP POLICY IF EXISTS "Authenticated users can submit reviews" ON public.reviews;
CREATE POLICY "Authenticated users can submit reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Staff/Admin full access to reviews" ON public.reviews;
CREATE POLICY "Staff/Admin full access to reviews" ON public.reviews FOR ALL USING (public.is_admin_or_staff());

-- Newsletter Subscriptions Policies
DROP POLICY IF EXISTS "Public can insert newsletter subscriptions" ON public.newsletter_subscriptions;
CREATE POLICY "Public can insert newsletter subscriptions" ON public.newsletter_subscriptions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Staff/Admin can view newsletter subscriptions" ON public.newsletter_subscriptions;
CREATE POLICY "Staff/Admin can view newsletter subscriptions" ON public.newsletter_subscriptions FOR SELECT USING (public.is_admin_or_staff());

-- Store Settings Policies
DROP POLICY IF EXISTS "Public can view non-secret store settings" ON public.store_settings;
CREATE POLICY "Public can view non-secret store settings" ON public.store_settings FOR SELECT USING (
    key IN ('store_name', 'currency', 'free_shipping_threshold_paise', 'cod_enabled', 'tax_percentage', 'announcement_bar')
);

DROP POLICY IF EXISTS "Admin full access to store settings" ON public.store_settings;
CREATE POLICY "Admin full access to store settings" ON public.store_settings FOR ALL USING (public.is_admin());

-- Homepage Sections Policies
DROP POLICY IF EXISTS "Public can view visible homepage sections" ON public.homepage_sections;
CREATE POLICY "Public can view visible homepage sections" ON public.homepage_sections FOR SELECT USING (is_visible = true);

DROP POLICY IF EXISTS "Staff/Admin full access to homepage sections" ON public.homepage_sections;
CREATE POLICY "Staff/Admin full access to homepage sections" ON public.homepage_sections FOR ALL USING (public.is_admin_or_staff());

-- Audit Logs Policies
DROP POLICY IF EXISTS "Only admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Only admins can view audit logs" ON public.audit_logs FOR SELECT USING (public.is_admin());


-- ==============================================================================
-- 5. SUPABASE STORAGE SETUP (Product Images Bucket)
-- ==============================================================================
DO $$
BEGIN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('product-images', 'product-images', true)
    ON CONFLICT (id) DO UPDATE SET public = true;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Public Access to Product Images'
    ) THEN
        CREATE POLICY "Public Access to Product Images" 
        ON storage.objects FOR SELECT 
        USING (bucket_id = 'product-images');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Authenticated users can upload product images'
    ) THEN
        CREATE POLICY "Authenticated users can upload product images" 
        ON storage.objects FOR INSERT 
        WITH CHECK (bucket_id = 'product-images');
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Storage setup skipped or deferred: %', SQLERRM;
END $$;


-- ==============================================================================
-- 6. STORE CONFIGURATION & SEED DATA
-- ==============================================================================

-- 1. Store settings
INSERT INTO public.store_settings (key, value) VALUES
('store_name', '"SHRÎ Atelier"'::jsonb),
('currency', '"INR"'::jsonb),
('free_shipping_threshold_paise', '250000'::jsonb),
('standard_shipping_paise', '15000'::jsonb),
('cod_enabled', 'true'::jsonb),
('cod_fee_paise', '9900'::jsonb),
('tax_percentage', '5'::jsonb),
('low_stock_threshold', '3'::jsonb),
('announcement_bar', '{"text": "Complimentary Express Delivery Across India on Orders Above ₹2,500 | Handcrafted Silhouettes", "enabled": true}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 2. Core Categories
INSERT INTO public.categories (id, name, slug, description, image_url, sort_order) VALUES
('c1000000-0000-0000-0000-000000000001', 'Sculptural Dresses', 'dresses', 'Architectural tailoring rendered in breathable organic silks and linens.', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1200&q=80', 1),
('c1000000-0000-0000-0000-000000000002', 'Silk & Linen Co-ords', 'co-ords', 'Effortless monochrome matching sets designed for seamless day-to-night transitions.', 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=80', 2),
('c1000000-0000-0000-0000-000000000003', 'Handcrafted Tunics & Kurtas', 'tunics-kurtas', 'Contemporary interpretations of heritage drapery and fine pleating.', 'https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?auto=format&fit=crop&w=1200&q=80', 3),
('c1000000-0000-0000-0000-000000000004', 'Evening & Occasion Wear', 'evening-wear', 'Refined gala gowns and decadent raw silk ensembles for celebratory evenings.', 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1200&q=80', 4)
ON CONFLICT (slug) DO UPDATE SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    image_url = EXCLUDED.image_url;

-- 3. Launch Collections
INSERT INTO public.collections (id, name, slug, description, banner_image, sort_order) VALUES
('c0110000-0000-0000-0000-000000000001', 'Autumn Nocturne 2026', 'autumn-nocturne', 'Deep earthy tones, charcoal silhouettes, and midnight silk jacquards.', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80', 1),
('c0110000-0000-0000-0000-000000000002', 'Pure European Linen', 'pure-linen', 'Unbleached natural flax linen tailored for hot climates with effortless grace.', 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=1600&q=80', 2)
ON CONFLICT (slug) DO UPDATE SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    banner_image = EXCLUDED.banner_image;

-- 4. Launch Atelier Products
INSERT INTO public.products (id, category_id, name, slug, description, fabric, fit, care_instructions, status, is_featured, seo_title, seo_description) VALUES
(
    'a1000000-0000-0000-0000-000000000001',
    'c1000000-0000-0000-0000-000000000001',
    'The Vayu Pleated Silk Maxi Dress',
    'vayu-pleated-silk-maxi-dress',
    'Flowing knife-pleated floor-length gown featuring an asymmetric neckline and concealed side zip. Tailored from hand-spun Mulberry silk that catches ambient light with an understated luster.',
    '100% Hand-spun Mulberry Silk with organic cotton lining',
    'Fluid relaxed fit with softly tailored bust. Fits true to size.',
    'Dry clean only. Store in a breathable cotton garment bag away from direct sunlight.',
    'active',
    true,
    'Vayu Pleated Silk Maxi Dress | SHRÎ Atelier',
    'Shop the handcrafted Vayu Pleated Silk Maxi Dress. Pure Mulberry silk designed in India with architectural elegance.'
),
(
    'a1000000-0000-0000-0000-000000000002',
    'c1000000-0000-0000-0000-000000000002',
    'Kashvi Linen Belted Co-ord Set',
    'kashvi-linen-belted-co-ord-set',
    'A minimalist two-piece set featuring an elongated buttonless tunic with sash belt and wide-leg cropped trousers. Crafted from Normandy flax linen that softens beautifully with every wear.',
    '100% Certified European Normandy Linen (240 GSM)',
    'Relaxed silhouette. Trousers have a tailored high waistband with hidden elastic back.',
    'Gentle cold machine wash on delicate cycle with mild detergent. Line dry in shade. Warm iron while slightly damp.',
    'active',
    true,
    'Kashvi Linen Belted Co-ord Set | SHRÎ Atelier',
    'Minimalist luxury two-piece pure linen co-ord set in natural earthy tones.'
),
(
    'a1000000-0000-0000-0000-000000000003',
    'c1000000-0000-0000-0000-000000000003',
    'Ananya Chanderi Silk Tunic',
    'ananya-chanderi-silk-tunic',
    'A contemporary high-slit tunic combining traditional handwoven Chanderi tissue with subtle zari detailing along the mandarin collar and cuffs. Paired effortlessly over narrow trousers or worn as a floating coat.',
    'Handwoven Silk-Cotton Chanderi with fine metallic yarn accents',
    'A-line structure with deep side vents for comfortable movement.',
    'Professional dry clean recommended. Light steam iron only.',
    'active',
    true,
    'Ananya Chanderi Silk Tunic | SHRÎ Atelier',
    'Handwoven Chanderi silk tunic for intimate gatherings and understated celebrations.'
),
(
    'a1000000-0000-0000-0000-000000000004',
    'c1000000-0000-0000-0000-000000000004',
    'Mira Midnight Velvet Evening Gown',
    'mira-midnight-velret-evening-gown',
    'A statuesque column gown crafted from plush micro-velvet in deep midnight charcoal. Detailed with subtle ruched shoulders and an open low-draped cowl back.',
    'Silk-rayon micro-velvet with stretch satin lining',
    'Form-skimming column silhouette. Model wears size S.',
    'Specialist dry clean only. Do not iron; use vertical steam from reverse side.',
    'active',
    true,
    'Mira Midnight Velvet Evening Gown | SHRÎ Atelier',
    'Sculptural midnight velvet evening gown designed for special galas and soirées.'
)
ON CONFLICT (slug) DO UPDATE SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    fabric = EXCLUDED.fabric,
    fit = EXCLUDED.fit,
    care_instructions = EXCLUDED.care_instructions,
    status = EXCLUDED.status,
    is_featured = EXCLUDED.is_featured;

-- 5. Product Images
INSERT INTO public.product_images (id, product_id, storage_path, alt_text, sort_order) VALUES
('e1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1200&q=80', 'The Vayu Pleated Silk Maxi Dress Front View', 1),
('e1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1200&q=80', 'The Vayu Pleated Silk Maxi Dress Detail', 2),
('e1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=80', 'Kashvi Linen Belted Co-ord Set Front View', 1),
('e1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?auto=format&fit=crop&w=1200&q=80', 'Ananya Chanderi Silk Tunic Front View', 1),
('e1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1200&q=80', 'Mira Midnight Velvet Evening Gown Editorial', 1)
ON CONFLICT (id) DO NOTHING;

-- 6. Product Variants & Inventory Stock
INSERT INTO public.product_variants (id, product_id, sku, size, color_name, color_hex, price_paise, compare_at_price_paise, stock_quantity, is_active) VALUES
-- Vayu Silk Dress
('f1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'VAYU-SLK-IVR-XS', 'XS', 'Warm Ivory', '#FDFBF7', 1250000, 1450000, 5, true),
('f1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'VAYU-SLK-IVR-S', 'S', 'Warm Ivory', '#FDFBF7', 1250000, 1450000, 8, true),
('f1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'VAYU-SLK-IVR-M', 'M', 'Warm Ivory', '#FDFBF7', 1250000, 1450000, 6, true),
('f1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 'VAYU-SLK-IVR-L', 'L', 'Warm Ivory', '#FDFBF7', 1250000, 1450000, 3, true),

-- Kashvi Co-ord Set
('f1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000002', 'KASH-LIN-SND-S', 'S', 'Desert Sand', '#EAE6DF', 980000, NULL, 7, true),
('f1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000002', 'KASH-LIN-SND-M', 'M', 'Desert Sand', '#EAE6DF', 980000, NULL, 10, true),
('f1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000002', 'KASH-LIN-SND-L', 'L', 'Desert Sand', '#EAE6DF', 980000, NULL, 4, true),

-- Ananya Silk Tunic
('f1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000003', 'ANAN-CHN-GLD-S', 'S', 'Burnished Gold', '#C5A880', 740000, 890000, 8, true),
('f1000000-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000003', 'ANAN-CHN-GLD-M', 'M', 'Burnished Gold', '#C5A880', 740000, 890000, 12, true),
('f1000000-0000-0000-0000-000000000010', 'a1000000-0000-0000-0000-000000000003', 'ANAN-CHN-GLD-L', 'L', 'Burnished Gold', '#C5A880', 740000, 890000, 5, true),

-- Mira Velvet Gown
('f1000000-0000-0000-0000-000000000011', 'a1000000-0000-0000-0000-000000000004', 'MIRA-VLV-MID-XS', 'XS', 'Midnight Charcoal', '#232528', 1850000, NULL, 3, true),
('f1000000-0000-0000-0000-000000000012', 'a1000000-0000-0000-0000-000000000004', 'MIRA-VLV-MID-S', 'S', 'Midnight Charcoal', '#232528', 1850000, NULL, 4, true),
('f1000000-0000-0000-0000-000000000013', 'a1000000-0000-0000-0000-000000000004', 'MIRA-VLV-MID-M', 'M', 'Midnight Charcoal', '#232528', 1850000, NULL, 5, true)
ON CONFLICT (sku) DO UPDATE SET 
    price_paise = EXCLUDED.price_paise,
    compare_at_price_paise = EXCLUDED.compare_at_price_paise,
    stock_quantity = EXCLUDED.stock_quantity,
    is_active = EXCLUDED.is_active;

-- 7. Collection Products Link
INSERT INTO public.collection_products (collection_id, product_id, sort_order) VALUES
('c0110000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 1),
('c0110000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000004', 2),
('c0110000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002', 1)
ON CONFLICT (collection_id, product_id) DO NOTHING;

-- 8. Coupons
INSERT INTO public.coupons (code, discount_type, discount_value, min_order_paise, max_discount_paise, usage_limit, per_customer_limit, is_active) VALUES
('ATELIER10', 'percentage', 10, 500000, 200000, 500, 1, true),
('WELCOME2026', 'fixed', 150000, 1000000, NULL, 200, 1, true),
('VIPFESTIVE', 'percentage', 15, 1500000, 500000, 100, 1, true)
ON CONFLICT (code) DO NOTHING;

-- 9. Homepage Sections
INSERT INTO public.homepage_sections (section_key, title, subtitle, content, is_visible, sort_order) VALUES
('hero_banner', 'Autumn Nocturne & Pure Silks', 'Hand-tailored in limited batches for discerning wardrobes.', '{"cta_text": "Explore Collection", "cta_link": "/collections/autumn-nocturne", "image_url": "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2000&q=85"}'::jsonb, true, 1),
('curated_categories', 'Shop by Silhouette', 'Distinctive forms cut from sustainable natural textiles.', '{}'::jsonb, true, 2),
('brand_editorial', 'The Heritage of Fine Pleating', 'Every seam reflects centuries of Indian artisan expertise merged with contemporary architectural minimalism.', '{"image_url": "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=1400&q=80"}'::jsonb, true, 3)
ON CONFLICT (section_key) DO UPDATE SET 
    title = EXCLUDED.title,
    subtitle = EXCLUDED.subtitle,
    content = EXCLUDED.content,
    is_visible = EXCLUDED.is_visible;

-- ==============================================================================
-- 7. DEFAULT ADMIN USER ROLE INITIALIZATION
-- ==============================================================================
-- If an auth user with phone 9788394119 already exists, grant admin role
DO $$
DECLARE
    v_admin_id UUID;
BEGIN
    SELECT id INTO v_admin_id
    FROM auth.users
    WHERE phone LIKE '%9788394119%'
    LIMIT 1;

    IF v_admin_id IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (v_admin_id, 'admin')
        ON CONFLICT (user_id, role) DO UPDATE SET role = 'admin';

        INSERT INTO public.profiles (id, full_name, phone)
        VALUES (v_admin_id, 'Studio Administrator', '+91 97883 94119')
        ON CONFLICT (id) DO UPDATE SET full_name = 'Studio Administrator';
    END IF;
END $$;
