// TypeScript Definitions for SHRÎ Atelier Database Schema

export type UserRole = 'customer' | 'staff' | 'admin';
export type ProductStatus = 'draft' | 'active' | 'archived';
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
export type PaymentMethod = 'online_razorpay' | 'cod';
export type PaymentStatus = 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded' | 'partially_refunded';
export type ShippingStatus = 'manifested' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'rto' | 'cancelled';
export type DiscountType = 'percentage' | 'fixed';
export type ReturnStatus = 'requested' | 'approved' | 'rejected' | 'item_received' | 'inspected' | 'completed';
export type RefundMethod = 'gateway' | 'bank_transfer_cod' | 'store_credit';
export type RefundStatus = 'initiated' | 'processed' | 'failed';
export type ItemCondition = 'unopened' | 'like_new' | 'damaged' | 'unsellable';

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRoleRecord {
  id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  state: string;
  pincode: string;
  country: string;
  is_default_shipping: boolean;
  is_default_billing: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  parent_id?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Product {
  id: string;
  category_id?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  fabric?: string | null;
  fit?: string | null;
  care_instructions?: string | null;
  status: ProductStatus;
  seo_title?: string | null;
  seo_description?: string | null;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  category?: Category | null;
  images?: ProductImage[];
  variants?: ProductVariant[];
}

export interface ProductImage {
  id: string;
  product_id: string;
  storage_path: string;
  alt_text?: string | null;
  sort_order: number;
  color_variant?: string | null;
  created_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  size: string;
  color_name: string;
  color_hex?: string | null;
  price_paise: number;
  compare_at_price_paise?: number | null;
  stock_quantity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  banner_image?: string | null;
  is_published: boolean;
  sort_order: number;
  seo_title?: string | null;
  seo_description?: string | null;
  created_at: string;
  products?: Product[];
}

export interface InventoryMovement {
  id: string;
  variant_id: string;
  change_quantity: number;
  previous_stock: number;
  new_stock: number;
  movement_type: 'adjustment' | 'order_placed' | 'order_cancelled' | 'return_restocked' | 'reservation_expired';
  reason: string;
  reference_id?: string | null;
  created_by?: string | null;
  created_at: string;
  variant?: ProductVariant;
}

export interface InventoryReservation {
  id: string;
  order_id?: string | null;
  variant_id: string;
  quantity: number;
  status: 'reserved' | 'confirmed' | 'released' | 'expired';
  session_id?: string | null;
  expires_at: string;
  created_at: string;
}

export interface Cart {
  id: string;
  user_id?: string | null;
  session_id?: string | null;
  coupon_code?: string | null;
  created_at: string;
  updated_at: string;
  items?: CartItem[];
}

export interface CartItem {
  id: string;
  cart_id: string;
  variant_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  variant?: ProductVariant & { product?: Product };
}

export interface Wishlist {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: DiscountType;
  discount_value: number;
  min_order_paise: number;
  max_discount_paise?: number | null;
  start_date: string;
  end_date?: string | null;
  usage_limit?: number | null;
  per_customer_limit: number;
  used_count: number;
  is_active: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string | null;
  guest_email?: string | null;
  guest_phone?: string | null;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  currency: string;
  subtotal_paise: number;
  discount_paise: number;
  shipping_paise: number;
  tax_paise: number;
  total_paise: number;
  coupon_code?: string | null;
  notes?: string | null;
  admin_notes?: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  shipping_address?: OrderAddress;
  billing_address?: OrderAddress;
  payments?: Payment[];
  shipments?: Shipment[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  variant_id?: string | null;
  product_name: string;
  sku: string;
  size: string;
  color: string;
  unit_price_paise: number;
  quantity: number;
  line_total_paise: number;
  image_url?: string | null;
  created_at: string;
}

export interface OrderAddress {
  id: string;
  order_id: string;
  type: 'shipping' | 'billing';
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  state: string;
  pincode: string;
  country: string;
  created_at: string;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  from_status?: string | null;
  to_status: string;
  comment?: string | null;
  created_by?: string | null;
  created_at: string;
}

export interface Shipment {
  id: string;
  order_id: string;
  courier_name: string;
  tracking_number?: string | null;
  awb_code?: string | null;
  shipping_status: ShippingStatus;
  label_url?: string | null;
  manifest_url?: string | null;
  shipped_at?: string | null;
  delivered_at?: string | null;
  estimated_delivery?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShipmentEvent {
  id: string;
  shipment_id: string;
  status: string;
  location?: string | null;
  event_time: string;
  description?: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  order_id: string;
  provider: string;
  provider_order_id?: string | null;
  provider_payment_id?: string | null;
  provider_signature?: string | null;
  amount_paise: number;
  currency: string;
  status: 'created' | 'authorized' | 'captured' | 'failed' | 'refunded';
  error_code?: string | null;
  error_description?: string | null;
  verified_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface WebhookEvent {
  id: string;
  provider: string;
  provider_event_id: string;
  event_type: string;
  payload: Record<string, unknown>;
  processing_status: 'received' | 'processed' | 'failed' | 'ignored';
  error_message?: string | null;
  created_at: string;
  processed_at?: string | null;
}

export interface Refund {
  id: string;
  order_id: string;
  payment_id?: string | null;
  return_request_id?: string | null;
  amount_paise: number;
  currency: string;
  gateway_refund_id?: string | null;
  status: RefundStatus;
  refund_method: RefundMethod;
  reason: string;
  processed_by?: string | null;
  processed_at?: string | null;
  created_at: string;
}

export interface ReturnRequest {
  id: string;
  order_id: string;
  user_id?: string | null;
  request_number: string;
  reason: string;
  customer_comment?: string | null;
  status: ReturnStatus;
  inspection_notes?: string | null;
  approved_by?: string | null;
  created_at: string;
  updated_at: string;
  items?: ReturnItem[];
}

export interface ReturnItem {
  id: string;
  return_request_id: string;
  order_item_id: string;
  variant_id?: string | null;
  quantity: number;
  condition?: ItemCondition | null;
  restock_approved: boolean;
  restocked_at?: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id?: string | null;
  rating: number;
  title?: string | null;
  comment: string;
  author_name: string;
  is_verified_buyer: boolean;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface StoreSettings {
  store_name: string;
  currency: string;
  free_shipping_threshold_paise: number;
  standard_shipping_paise: number;
  cod_enabled: boolean;
  cod_fee_paise: number;
  tax_percentage: number;
  low_stock_threshold: number;
  announcement_bar?: {
    text: string;
    enabled: boolean;
  };
}

export interface HomepageSection {
  id: string;
  section_key: string;
  title?: string | null;
  subtitle?: string | null;
  content: Record<string, unknown>;
  is_visible: boolean;
  sort_order: number;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id?: string | null;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  old_values?: Record<string, unknown> | null;
  new_values?: Record<string, unknown> | null;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: string;
}
