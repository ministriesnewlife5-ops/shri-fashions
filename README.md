# SHRÎ Atelier — Premium Women's Fashion E-Commerce Platform

A production-oriented, single-brand women's luxury fashion e-commerce application built for high-end tailoring, pure natural textiles (Mulberry silk, Normandy flax linen, handloom Chanderi), and in-house studio inventory management.

---

## 1. Architectural Highlights

- **Framework:** Next.js 16 (App Router) with React 19 and TypeScript in strict mode.
- **Styling & Design System:** Tailwind CSS v4 with bespoke luxury typography tokens (`Playfair Display` serif headers and `Plus Jakarta Sans` body), warm ivory (`#FDFBF7`), cream, and subtle gold accents.
- **Database & Auth:** Supabase PostgreSQL with 32 versioned tables, Row Level Security (RLS) policies, atomic stock reservation/deduction functions, and audit logs.
- **Online Payments:** Razorpay integration for UPI, Credit/Debit cards, and Netbanking with server-side HMAC-SHA256 cryptographic verification and idempotent webhook processing.
- **Offline Fulfillment:** Cash on Delivery (COD) workflow with customizable handling fees and pending-to-collected state transitions.
- **Logistics & Dispatch:** Shipping provider abstraction (ready for Shiprocket or manual studio dispatch).
- **Quality Assurance:** Vitest unit test suite (pricing engine, coupon limits, state transitions, Razorpay signature verification) and Playwright end-to-end tests.

---

## 2. Supabase PostgreSQL Architecture (32 Tables)

All SQL migrations reside in `supabase/migrations/`:

1. `20261028000001_initial_schema.sql`: Core 32 relational tables with foreign keys, checks, and indexes:
   - **Identity & Addresses:** `profiles`, `user_roles`, `addresses`
   - **Catalogue:** `categories`, `products`, `product_images`, `product_variants`, `collections`, `collection_products`
   - **Inventory:** `inventory_movements`, `inventory_reservations`
   - **Shopping:** `carts`, `cart_items`, `wishlists`
   - **Promotions:** `coupons`, `coupon_redemptions`
   - **Orders & Fulfillment:** `orders`, `order_items` (immutable purchase snapshots), `order_addresses`, `order_status_history`, `shipments`, `shipment_events`
   - **Payments & Auditing:** `payments`, `webhook_events` (idempotency key), `refunds`
   - **Customer Care & Engagement:** `return_requests`, `return_items`, `reviews`, `newsletter_subscriptions`
   - **Admin & Configuration:** `store_settings`, `homepage_sections`, `audit_logs`
2. `20261028000002_stored_procedures.sql`: Stored procedures for atomic transactions:
   - `reserve_stock_for_checkout()`: Locks variant rows with `FOR UPDATE` and reserves stock.
   - `release_expired_reservations()`: Releases unpurchased reservation holds.
   - `confirm_order_and_deduct_stock()`: Decrements stock and records an immutable inventory movement audit log.
   - `cancel_order_and_restore_stock()`: Safely restores stock once upon cancellation.
   - `check_coupon_validity()`: Enforces coupon date, usage caps, and minimum order requirements atomically.
3. `20261028000003_row_level_security.sql`: RLS policies enforcing public read restrictions, customer tenant isolation, and staff/admin privileged mutations.
4. `20261028000004_seed_data.sql`: Seed data containing authentic categories, pure silk and linen products with sizes XS to XL, collections, coupons (`WELCOME10`, `ATELIER500`), and store configuration.

---

## 3. Storefront Routes

- `/` — Editorial fashion campaign hero, New Arrivals, Shop by Silhouette, Best Sellers, Brand Craft Story, and Approved Client Chronicles.
- `/shop` — Comprehensive catalogue with dynamic URL filter state (Category, Size, Palette, Price range, In-stock filter, and Sorting).
- `/collections/[slug]` — Capsule collections showcase (e.g., Autumn Nocturne 2026, Pure European Linen).
- `/products/[slug]` — Rich PDP featuring size selectors, color swatches, real-time variant stock indicators, image zoom gallery, dimension chart modal, fabric/care tabs, Add to Bag, Buy Now, and Google JSON-LD Structured Data.
- `/search` — Live catalogue search.
- `/cart` — Full shopping bag with quantity controls, free shipping tracker progress bar, and promo code redemption.
- `/checkout` — Dual-mode checkout (Guest & Authenticated), Indian address validation (pincodes, states, 10-digit mobile), Razorpay payment execution, and COD.
- `/order-confirmation/[orderNumber]` — Detailed customer receipt and timeline.
- `/account` — Customer account suite (`/account/orders`, `/account/addresses`, `/account/wishlist`, `/account/returns`).
- `/about`, `/contact`, `/shipping-policy`, `/return-policy`, `/privacy-policy`, `/terms`, `/faq` — Brand and customer policy pages.

---

## 4. Admin Console Routes (`/admin`)

- `/admin` — KPI Metrics: Collected qualifying revenue, COD in fulfillment, Average Order Value (AOV), Pending dispatch counts, low-stock warnings, and recent order stream.
- `/admin/products` & `/admin/products/new` — Garment and variant management with SKU assignment, pricing, compare-at price, stock levels, and publication status.
- `/admin/inventory` — Controlled inventory adjustments with mandatory reason logging and movement audit trail.
- `/admin/orders` & `/admin/orders/[id]` — Order inspection, status transitions (Pending -> Confirmed -> Processing -> Shipped -> Delivered / Cancelled), and packing slip printing.
- `/admin/categories` & `/admin/collections` — Taxonomy and seasonal drop managers.
- `/admin/payments` — Payment ledger and reconciliation status.
- `/admin/returns` — Return requests review, restock approval, and refund tracking.
- `/admin/customers` — Privacy-conscious client directory and lifetime order values.
- `/admin/coupons` — Promotional codes with percentage or flat discounts, date boundaries, and usage caps.
- `/admin/content` — Homepage hero banner, announcement bar, and promotional banner management.
- `/admin/reports` — Channel revenue breakdown (Online vs COD) and order distribution.
- `/admin/settings` — Free shipping threshold, standard shipping fee, COD availability, and apparel GST settings.
- `/admin/audit-logs` — Immutable audit trail of administrative modifications.

---

## 5. Local Setup & Installation

### Prerequisites
- Node.js 20+
- npm or pnpm

### Steps

1. Clone or open the repository:
   ```bash
   cd shri
   npm install
   ```

2. Configure environment variables:
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   *(The application includes a development fallback layer with full seed data and simulated payment verification, allowing immediate evaluation even prior to configuring live Supabase/Razorpay keys).*

3. Run migrations on your Supabase instance:
   Execute the migration SQL scripts in `supabase/migrations/` in numerical order via the Supabase Dashboard SQL Editor or via the Supabase CLI:
   ```bash
   npx supabase db push
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the storefront.

5. Test User Roles:
   Use the **Role Selector** in the storefront header sub-bar to toggle between:
   - **Guest / Customer** (browse, cart, checkout)
   - **Admin / Staff** (direct access to `/admin` dashboard console)

---

## 6. Running Automated Tests

Run Vitest unit tests:
```bash
npm test
```

Run Playwright end-to-end tests:
```bash
npm run test:e2e
```

---

## 7. Launch & External Dependencies Checklist

| Component | Provider | Status | Action Required Prior to Live Launch |
| :--- | :--- | :--- | :--- |
| **Database & Auth** | Supabase | Prepared | Link production project and apply migrations in `supabase/migrations/` |
| **Payment Gateway** | Razorpay | Prepared (Test Mode active) | Supply live `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in production environment |
| **Webhooks** | Razorpay | Prepared | Set webhook destination URL to `https://<your-domain>/api/webhooks/razorpay` |
| **Courier Logistics** | Shiprocket | Prepared | Configure `SHIPROCKET_EMAIL` and `SHIPROCKET_PASSWORD` or utilize the manual packing workflow in `/admin/orders` |
| **Transactional Email** | Resend / Sendgrid | Prepared | Provide `EMAIL_PROVIDER_API_KEY` to enable customer delivery updates |
"# shri-fashions" 
