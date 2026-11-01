-- Migration: 20261028000004_seed_data.sql
-- Description: Seed data for categories, products, variants, collections, coupons, settings, and homepage sections

-- Store settings
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

-- Categories
INSERT INTO public.categories (id, name, slug, description, image_url, sort_order) VALUES
('c1000000-0000-0000-0000-000000000001', 'Sculptural Dresses', 'dresses', 'Architectural tailoring rendered in breathable organic silks and linens.', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1200&q=80', 1),
('c1000000-0000-0000-0000-000000000002', 'Silk & Linen Co-ords', 'co-ords', 'Effortless monochrome matching sets designed for seamless day-to-night transitions.', 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=80', 2),
('c1000000-0000-0000-0000-000000000003', 'Handcrafted Tunics & Kurtas', 'tunics-kurtas', 'Contemporary interpretations of heritage drapery and fine pleating.', 'https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?auto=format&fit=crop&w=1200&q=80', 3),
('c1000000-0000-0000-0000-000000000004', 'Evening & Occasion Wear', 'evening-wear', 'Refined gala gowns and decadent raw silk ensembles for celebratory evenings.', 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1200&q=80', 4)
ON CONFLICT (slug) DO NOTHING;

-- Collections
INSERT INTO public.collections (id, name, slug, description, banner_image, sort_order) VALUES
('c0110000-0000-0000-0000-000000000001', 'Autumn Nocturne 2026', 'autumn-nocturne', 'Deep earthy tones, charcoal silhouettes, and midnight silk jacquards.', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80', 1),
('c0110000-0000-0000-0000-000000000002', 'Pure European Linen', 'pure-linen', 'Unbleached natural flax linen tailored for hot climates with effortless grace.', 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=1600&q=80', 2)
ON CONFLICT (slug) DO NOTHING;

-- Products
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
    'mira-midnight-velvet-evening-gown',
    'A statuesque column gown crafted from plush micro-velvet in deep midnight charcoal. Detailed with subtle ruched shoulders and an open low-draped cowl back.',
    'Silk-rayon micro-velvet with stretch satin lining',
    'Form-skimming column silhouette. Model wears size S.',
    'Specialist dry clean only. Do not iron; use vertical steam from reverse side.',
    'active',
    true,
    'Mira Midnight Velvet Evening Gown | SHRÎ Atelier',
    'Sculptural midnight velvet evening gown designed for special galas and soirées.'
),
(
    'a1000000-0000-0000-0000-000000000005',
    'c1000000-0000-0000-0000-000000000001',
    'Avani Tiered Organic Cotton Midi',
    'avani-tiered-organic-cotton-midi',
    'Airy midi dress featuring intricate pin-tuck pleating across the bodice and tiered volume through the skirt. Hidden pockets seamlessly integrated into side seams.',
    '100% GOTS Certified Organic Cotton Voile',
    'Relaxed fit through waist and hips. True to size.',
    'Machine wash cold inside out. Hang dry.',
    'active',
    false,
    'Avani Tiered Organic Cotton Midi | SHRÎ Atelier',
    'Breathable tiered organic cotton midi dress with pin-tuck detailing.'
),
(
    'a1000000-0000-0000-0000-000000000006',
    'c1000000-0000-0000-0000-000000000002',
    'Sia Raw Silk Blazer & Trouser Suite',
    'sia-raw-silk-blazer-trouser-suite',
    'Unstructured single-breasted blazer and tailored straight-leg trousers cut from wild Matka raw silk. Retains the natural slub texture and organic handle of non-degummed silk.',
    '100% Handloom Matka Raw Silk',
    'Tailored modern silhouette with dropped shoulders for effortless elegance.',
    'Dry clean only.',
    'active',
    false,
    'Sia Raw Silk Blazer & Trouser Suite | SHRÎ Atelier',
    'Handloom Matka raw silk two-piece suit set in warm stone.'
)
ON CONFLICT (slug) DO NOTHING;

-- Product Images
INSERT INTO public.product_images (product_id, storage_path, alt_text, sort_order) VALUES
('a1000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1000&q=80', 'The Vayu Pleated Silk Maxi Dress in Champagne front view', 1),
('a1000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80', 'The Vayu Pleated Silk Maxi Dress detail movement', 2),
('a1000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1000&q=80', 'Kashvi Linen Belted Co-ord Set in Ivory Cream', 1),
('a1000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=80', 'Kashvi Linen Co-ord texture and belt detail', 2),
('a1000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?auto=format&fit=crop&w=1000&q=80', 'Ananya Chanderi Silk Tunic editorial portrait', 1),
('a1000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1000&q=80', 'Mira Midnight Velvet Evening Gown front view', 1),
('a1000000-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1000&q=80', 'Avani Tiered Organic Cotton Midi in terracotta cream', 1),
('a1000000-0000-0000-0000-000000000006', 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1000&q=80', 'Sia Raw Silk Blazer & Trouser Suite in warm beige', 1);

-- Product Variants
-- Product 1: Vayu Pleated Silk Maxi Dress (Sizes S, M, L in Champagne and Midnight Black)
INSERT INTO public.product_variants (id, product_id, sku, size, color_name, color_hex, price_paise, compare_at_price_paise, stock_quantity) VALUES
('f1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'VAYU-SLK-CMP-S', 'S', 'Champagne Gold', '#D4AF37', 899000, 1099000, 12),
('f1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'VAYU-SLK-CMP-M', 'M', 'Champagne Gold', '#D4AF37', 899000, 1099000, 18),
('f1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'VAYU-SLK-CMP-L', 'L', 'Champagne Gold', '#D4AF37', 899000, 1099000, 8),
('f1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 'VAYU-SLK-BLK-S', 'S', 'Midnight Charcoal', '#1C1A18', 899000, 1099000, 10),
('f1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000001', 'VAYU-SLK-BLK-M', 'M', 'Midnight Charcoal', '#1C1A18', 899000, 1099000, 14),
('f1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000001', 'VAYU-SLK-BLK-L', 'L', 'Midnight Charcoal', '#1C1A18', 899000, 1099000, 6)
ON CONFLICT (sku) DO NOTHING;

-- Product 2: Kashvi Linen Belted Co-ord Set (Sizes XS, S, M, L in Natural Ivory and Olive Clay)
INSERT INTO public.product_variants (id, product_id, sku, size, color_name, color_hex, price_paise, compare_at_price_paise, stock_quantity) VALUES
('f1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000002', 'KSHV-LIN-IVR-XS', 'XS', 'Natural Ivory', '#FDFBF7', 649000, 799000, 8),
('f1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000002', 'KSHV-LIN-IVR-S', 'S', 'Natural Ivory', '#FDFBF7', 649000, 799000, 15),
('f1000000-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000002', 'KSHV-LIN-IVR-M', 'M', 'Natural Ivory', '#FDFBF7', 649000, 799000, 16),
('f1000000-0000-0000-0000-000000000010', 'a1000000-0000-0000-0000-000000000002', 'KSHV-LIN-IVR-L', 'L', 'Natural Ivory', '#FDFBF7', 649000, 799000, 7),
('f1000000-0000-0000-0000-000000000011', 'a1000000-0000-0000-0000-000000000002', 'KSHV-LIN-OLV-S', 'S', 'Olive Clay', '#556B2F', 649000, 799000, 10),
('f1000000-0000-0000-0000-000000000012', 'a1000000-0000-0000-0000-000000000002', 'KSHV-LIN-OLV-M', 'M', 'Olive Clay', '#556B2F', 649000, 799000, 12)
ON CONFLICT (sku) DO NOTHING;

-- Product 3: Ananya Chanderi Silk Tunic (Sizes S, M, L)
INSERT INTO public.product_variants (id, product_id, sku, size, color_name, color_hex, price_paise, compare_at_price_paise, stock_quantity) VALUES
('f1000000-0000-0000-0000-000000000013', 'a1000000-0000-0000-0000-000000000003', 'ANNY-CHN-GLD-S', 'S', 'Gilded Chanderi', '#E6C687', 529000, 649000, 14),
('f1000000-0000-0000-0000-000000000014', 'a1000000-0000-0000-0000-000000000003', 'ANNY-CHN-GLD-M', 'M', 'Gilded Chanderi', '#E6C687', 529000, 649000, 18),
('f1000000-0000-0000-0000-000000000015', 'a1000000-0000-0000-0000-000000000003', 'ANNY-CHN-GLD-L', 'L', 'Gilded Chanderi', '#E6C687', 529000, 649000, 9)
ON CONFLICT (sku) DO NOTHING;

-- Product 4: Mira Midnight Velvet Evening Gown
INSERT INTO public.product_variants (id, product_id, sku, size, color_name, color_hex, price_paise, compare_at_price_paise, stock_quantity) VALUES
('f1000000-0000-0000-0000-000000000016', 'a1000000-0000-0000-0000-000000000004', 'MIRA-VLV-BLK-XS', 'XS', 'Midnight Obsidian', '#0A0A0A', 1199000, 1499000, 5),
('f1000000-0000-0000-0000-000000000017', 'a1000000-0000-0000-0000-000000000004', 'MIRA-VLV-BLK-S', 'S', 'Midnight Obsidian', '#0A0A0A', 1199000, 1499000, 10),
('f1000000-0000-0000-0000-000000000018', 'a1000000-0000-0000-0000-000000000004', 'MIRA-VLV-BLK-M', 'M', 'Midnight Obsidian', '#0A0A0A', 1199000, 1499000, 11),
('f1000000-0000-0000-0000-000000000019', 'a1000000-0000-0000-0000-000000000004', 'MIRA-VLV-BLK-L', 'L', 'Midnight Obsidian', '#0A0A0A', 1199000, 1499000, 4)
ON CONFLICT (sku) DO NOTHING;

-- Product 5: Avani Tiered Organic Cotton Midi
INSERT INTO public.product_variants (id, product_id, sku, size, color_name, color_hex, price_paise, compare_at_price_paise, stock_quantity) VALUES
('f1000000-0000-0000-0000-000000000020', 'a1000000-0000-0000-0000-000000000005', 'AVNI-CTN-TER-S', 'S', 'Terracotta Cream', '#C48A73', 449000, 549000, 15),
('f1000000-0000-0000-0000-000000000021', 'a1000000-0000-0000-0000-000000000005', 'AVNI-CTN-TER-M', 'M', 'Terracotta Cream', '#C48A73', 449000, 549000, 20),
('f1000000-0000-0000-0000-000000000022', 'a1000000-0000-0000-0000-000000000005', 'AVNI-CTN-TER-L', 'L', 'Terracotta Cream', '#C48A73', 449000, 549000, 12)
ON CONFLICT (sku) DO NOTHING;

-- Product 6: Sia Raw Silk Blazer Suite
INSERT INTO public.product_variants (id, product_id, sku, size, color_name, color_hex, price_paise, compare_at_price_paise, stock_quantity) VALUES
('f1000000-0000-0000-0000-000000000023', 'a1000000-0000-0000-0000-000000000006', 'SIA-MTK-SND-S', 'S', 'Warm Sand', '#D9CDB8', 1249000, 1499000, 8),
('f1000000-0000-0000-0000-000000000024', 'a1000000-0000-0000-0000-000000000006', 'SIA-MTK-SND-M', 'M', 'Warm Sand', '#D9CDB8', 1249000, 1499000, 10),
('f1000000-0000-0000-0000-000000000025', 'a1000000-0000-0000-0000-000000000006', 'SIA-MTK-SND-L', 'L', 'Warm Sand', '#D9CDB8', 1249000, 1499000, 5)
ON CONFLICT (sku) DO NOTHING;

-- Collection Products
INSERT INTO public.collection_products (collection_id, product_id, sort_order) VALUES
('c0110000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 1),
('c0110000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000004', 2),
('c0110000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000006', 3),
('c0110000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002', 1),
('c0110000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000005', 2)
ON CONFLICT DO NOTHING;

-- Coupons
INSERT INTO public.coupons (code, discount_type, discount_value, min_order_paise, max_discount_paise, usage_limit, per_customer_limit) VALUES
('WELCOME10', 'percentage', 10, 200000, 100000, 500, 1),
('ATELIER500', 'fixed', 50000, 350000, NULL, 200, 1)
ON CONFLICT (code) DO NOTHING;

-- Homepage sections
INSERT INTO public.homepage_sections (section_key, title, subtitle, content, is_visible, sort_order) VALUES
(
    'hero_banner',
    'Autumn / Festive Nocturne',
    'A study in quiet luxury, architectural drapery, and pure artisanal silks.',
    '{"cta_text": "Explore New Arrivals", "cta_link": "/shop", "secondary_cta_text": "View Lookbook", "secondary_cta_link": "/collections/autumn-nocturne", "image_url": "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2000&q=85"}'::jsonb,
    true,
    1
),
(
    'promotional_banner',
    'The Mindful Atelier Standard',
    'Every garment is produced in strictly limited quantities in our studio to eliminate deadstock and honor mindful craftsmanship.',
    '{"badge": "Zero Deadstock Initiative", "link_text": "Read Our Craft Story", "link_url": "/about"}'::jsonb,
    true,
    2
)
ON CONFLICT (section_key) DO NOTHING;
