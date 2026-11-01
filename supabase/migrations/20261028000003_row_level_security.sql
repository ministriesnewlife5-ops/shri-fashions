-- Migration: 20261028000003_row_level_security.sql
-- Description: Row Level Security (RLS) policies for all 32 tables

-- Enable RLS on all 32 tables
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

-- 1. PROFILES
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Staff/Admin can view all profiles"
    ON public.profiles FOR SELECT
    USING (public.is_admin_or_staff());

-- 2. USER ROLES
CREATE POLICY "Users can read their own role"
    ON public.user_roles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins have full access to user_roles"
    ON public.user_roles FOR ALL
    USING (public.is_admin());

-- 3. ADDRESSES
CREATE POLICY "Users can manage their own addresses"
    ON public.addresses FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Staff/Admin can view all addresses"
    ON public.addresses FOR SELECT
    USING (public.is_admin_or_staff());

-- 4. CATEGORIES
CREATE POLICY "Public can view active categories"
    ON public.categories FOR SELECT
    USING (is_active = true);

CREATE POLICY "Staff/Admin full access to categories"
    ON public.categories FOR ALL
    USING (public.is_admin_or_staff());

-- 5. PRODUCTS
CREATE POLICY "Public can view active products"
    ON public.products FOR SELECT
    USING (status = 'active');

CREATE POLICY "Staff/Admin full access to products"
    ON public.products FOR ALL
    USING (public.is_admin_or_staff());

-- 6. PRODUCT IMAGES
CREATE POLICY "Public can view images of active products"
    ON public.product_images FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.products p
        WHERE p.id = product_id AND (p.status = 'active' OR public.is_admin_or_staff())
    ));

CREATE POLICY "Staff/Admin full access to product images"
    ON public.product_images FOR ALL
    USING (public.is_admin_or_staff());

-- 7. PRODUCT VARIANTS
CREATE POLICY "Public can view active variants of active products"
    ON public.product_variants FOR SELECT
    USING (
        is_active = true AND EXISTS (
            SELECT 1 FROM public.products p
            WHERE p.id = product_id AND (p.status = 'active' OR public.is_admin_or_staff())
        )
    );

CREATE POLICY "Staff/Admin full access to variants"
    ON public.product_variants FOR ALL
    USING (public.is_admin_or_staff());

-- 8. COLLECTIONS
CREATE POLICY "Public can view published collections"
    ON public.collections FOR SELECT
    USING (is_published = true);

CREATE POLICY "Staff/Admin full access to collections"
    ON public.collections FOR ALL
    USING (public.is_admin_or_staff());

-- 9. COLLECTION PRODUCTS
CREATE POLICY "Public can view collection products"
    ON public.collection_products FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.collections c
        WHERE c.id = collection_id AND (c.is_published = true OR public.is_admin_or_staff())
    ));

CREATE POLICY "Staff/Admin full access to collection products"
    ON public.collection_products FOR ALL
    USING (public.is_admin_or_staff());

-- 10. INVENTORY MOVEMENTS
CREATE POLICY "Only staff and admins can view inventory movements"
    ON public.inventory_movements FOR SELECT
    USING (public.is_admin_or_staff());

CREATE POLICY "Staff and admin can record inventory movements"
    ON public.inventory_movements FOR INSERT
    WITH CHECK (public.is_admin_or_staff());

-- 11. INVENTORY RESERVATIONS
CREATE POLICY "Staff and admin can view reservations"
    ON public.inventory_reservations FOR SELECT
    USING (public.is_admin_or_staff());

-- 12. CARTS
CREATE POLICY "Users can manage their own carts"
    ON public.carts FOR ALL
    USING (auth.uid() = user_id OR user_id IS NULL);

-- 13. CART ITEMS
CREATE POLICY "Users can manage items in their carts"
    ON public.cart_items FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.carts c
        WHERE c.id = cart_id AND (c.user_id = auth.uid() OR c.user_id IS NULL)
    ));

-- 14. WISHLISTS
CREATE POLICY "Users can manage their own wishlist"
    ON public.wishlists FOR ALL
    USING (auth.uid() = user_id);

-- 15. COUPONS
CREATE POLICY "Public can view active coupons"
    ON public.coupons FOR SELECT
    USING (is_active = true AND start_date <= timezone('utc'::text, now()));

CREATE POLICY "Staff/Admin full access to coupons"
    ON public.coupons FOR ALL
    USING (public.is_admin_or_staff());

-- 16. COUPON REDEMPTIONS
CREATE POLICY "Users can view their own redemptions"
    ON public.coupon_redemptions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Staff/Admin view all redemptions"
    ON public.coupon_redemptions FOR SELECT
    USING (public.is_admin_or_staff());

-- 17. ORDERS
CREATE POLICY "Customers can view their own orders"
    ON public.orders FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Staff/Admin full access to orders"
    ON public.orders FOR ALL
    USING (public.is_admin_or_staff());

-- 18. ORDER ITEMS
CREATE POLICY "Customers can view items of their own orders"
    ON public.order_items FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.orders o
        WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.is_admin_or_staff())
    ));

CREATE POLICY "Staff/Admin full access to order items"
    ON public.order_items FOR ALL
    USING (public.is_admin_or_staff());

-- 19. ORDER ADDRESSES
CREATE POLICY "Customers can view addresses of their own orders"
    ON public.order_addresses FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.orders o
        WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.is_admin_or_staff())
    ));

CREATE POLICY "Staff/Admin full access to order addresses"
    ON public.order_addresses FOR ALL
    USING (public.is_admin_or_staff());

-- 20. ORDER STATUS HISTORY
CREATE POLICY "Customers can view status history of their own orders"
    ON public.order_status_history FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.orders o
        WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.is_admin_or_staff())
    ));

CREATE POLICY "Staff/Admin full access to order status history"
    ON public.order_status_history FOR ALL
    USING (public.is_admin_or_staff());

-- 21. SHIPMENTS
CREATE POLICY "Customers can view shipments of their own orders"
    ON public.shipments FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.orders o
        WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.is_admin_or_staff())
    ));

CREATE POLICY "Staff/Admin full access to shipments"
    ON public.shipments FOR ALL
    USING (public.is_admin_or_staff());

-- 22. SHIPMENT EVENTS
CREATE POLICY "Customers can view shipment events of their own shipments"
    ON public.shipment_events FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.shipments s
        JOIN public.orders o ON o.id = s.order_id
        WHERE s.id = shipment_id AND (o.user_id = auth.uid() OR public.is_admin_or_staff())
    ));

CREATE POLICY "Staff/Admin full access to shipment events"
    ON public.shipment_events FOR ALL
    USING (public.is_admin_or_staff());

-- 23. PAYMENTS
CREATE POLICY "Customers can view payment status of their own orders"
    ON public.payments FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.orders o
        WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.is_admin_or_staff())
    ));

CREATE POLICY "Staff/Admin full access to payments"
    ON public.payments FOR ALL
    USING (public.is_admin_or_staff());

-- 24. WEBHOOK EVENTS
CREATE POLICY "Only staff/admins can view webhook events"
    ON public.webhook_events FOR SELECT
    USING (public.is_admin_or_staff());

-- 25. REFUNDS
CREATE POLICY "Customers can view refunds on their own orders"
    ON public.refunds FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.orders o
        WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.is_admin_or_staff())
    ));

CREATE POLICY "Staff/Admin full access to refunds"
    ON public.refunds FOR ALL
    USING (public.is_admin_or_staff());

-- 26. RETURN REQUESTS
CREATE POLICY "Customers can view and submit their own return requests"
    ON public.return_requests FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Staff/Admin full access to return requests"
    ON public.return_requests FOR ALL
    USING (public.is_admin_or_staff());

-- 27. RETURN ITEMS
CREATE POLICY "Customers can view items of their return requests"
    ON public.return_items FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.return_requests r
        WHERE r.id = return_request_id AND (r.user_id = auth.uid() OR public.is_admin_or_staff())
    ));

CREATE POLICY "Staff/Admin full access to return items"
    ON public.return_items FOR ALL
    USING (public.is_admin_or_staff());

-- 28. REVIEWS
CREATE POLICY "Public can view approved reviews"
    ON public.reviews FOR SELECT
    USING (status = 'approved');

CREATE POLICY "Authenticated users can submit reviews"
    ON public.reviews FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff/Admin full access to reviews"
    ON public.reviews FOR ALL
    USING (public.is_admin_or_staff());

-- 29. NEWSLETTER SUBSCRIPTIONS
CREATE POLICY "Public can insert newsletter subscriptions"
    ON public.newsletter_subscriptions FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Staff/Admin can view newsletter subscriptions"
    ON public.newsletter_subscriptions FOR SELECT
    USING (public.is_admin_or_staff());

-- 30. STORE SETTINGS
CREATE POLICY "Public can view non-secret store settings"
    ON public.store_settings FOR SELECT
    USING (key IN ('store_name', 'currency', 'free_shipping_threshold_paise', 'cod_enabled', 'tax_percentage', 'announcement_bar'));

CREATE POLICY "Admin full access to store settings"
    ON public.store_settings FOR ALL
    USING (public.is_admin());

-- 31. HOMEPAGE SECTIONS
CREATE POLICY "Public can view visible homepage sections"
    ON public.homepage_sections FOR SELECT
    USING (is_visible = true);

CREATE POLICY "Staff/Admin full access to homepage sections"
    ON public.homepage_sections FOR ALL
    USING (public.is_admin_or_staff());

-- 32. AUDIT LOGS
CREATE POLICY "Only admins can view audit logs"
    ON public.audit_logs FOR SELECT
    USING (public.is_admin());
