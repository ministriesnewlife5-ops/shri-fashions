import { describe, it, expect } from 'vitest';
import { CheckoutRequestSchema, AddressSchema } from '@/lib/validations/checkout';

describe('Checkout Validation Schema', () => {
  it('validates a valid Indian shipping address', () => {
    const validAddress = {
      fullName: 'Radhika Varma',
      phone: '9876543210',
      addressLine1: '402 Palm Grove Residences, Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038',
      country: 'India',
    };

    const result = AddressSchema.safeParse(validAddress);
    expect(result.success).toBe(true);
  });

  it('rejects invalid pincodes and invalid Indian mobile numbers', () => {
    const invalidAddress = {
      fullName: 'R',
      phone: '12345', // invalid phone
      addressLine1: 'Flat',
      city: '',
      state: '',
      pincode: '1234', // invalid length
    };

    const result = AddressSchema.safeParse(invalidAddress);
    expect(result.success).toBe(false);
    if (!result.success) {
      const formatted = result.error.format();
      expect(formatted.phone?._errors.length).toBeGreaterThan(0);
      expect(formatted.pincode?._errors.length).toBeGreaterThan(0);
    }
  });

  it('validates complete checkout request with items and COD payment method', () => {
    const validCheckout = {
      email: 'radhika@example.com',
      phone: '9876543210',
      shippingAddress: {
        fullName: 'Radhika Varma',
        phone: '9876543210',
        addressLine1: '402 Palm Grove Residences, Indiranagar',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560038',
        country: 'India',
      },
      useSameAddressForBilling: true,
      paymentMethod: 'cod' as const,
      items: [
        {
          variantId: 'f1000000-0000-0000-0000-000000000001',
          quantity: 2,
        },
      ],
      couponCode: 'WELCOME10',
    };

    const result = CheckoutRequestSchema.safeParse(validCheckout);
    expect(result.success).toBe(true);
  });

  it('rejects empty items array in checkout', () => {
    const emptyCartCheckout = {
      email: 'radhika@example.com',
      phone: '9876543210',
      shippingAddress: {
        fullName: 'Radhika Varma',
        phone: '9876543210',
        addressLine1: '402 Palm Grove Residences, Indiranagar',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560038',
        country: 'India',
      },
      paymentMethod: 'online_razorpay' as const,
      items: [],
    };

    const result = CheckoutRequestSchema.safeParse(emptyCartCheckout);
    expect(result.success).toBe(false);
  });
});
