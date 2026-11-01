import { z } from 'zod';

export const CheckoutItemSchema = z.object({
  variantId: z.string().min(1, 'Variant ID is required'),
  quantity: z.number().int().positive('Quantity must be greater than zero'),
});

export const AddressSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number'),
  addressLine1: z.string().min(5, 'Address line 1 must be at least 5 characters'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Please enter a valid 6-digit postal pincode'),
  country: z.string().default('India'),
});

export const CheckoutRequestSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number'),
  shippingAddress: AddressSchema,
  billingAddress: AddressSchema.optional(),
  useSameAddressForBilling: z.boolean().default(true),
  paymentMethod: z.enum(['online_razorpay', 'cod']),
  items: z.array(CheckoutItemSchema).min(1, 'At least one item is required in cart'),
  couponCode: z.string().optional().nullable(),
  orderNotes: z.string().max(500).optional(),
});

export type CheckoutRequest = z.infer<typeof CheckoutRequestSchema>;
export type AddressInput = z.infer<typeof AddressSchema>;
