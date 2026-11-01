import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import { verifyRazorpaySignature } from '@/lib/payments/razorpay';

describe('Razorpay Signature Verification', () => {
  it('correctly validates HMAC-SHA256 signature when secret is configured', () => {
    const originalSecret = process.env.RAZORPAY_KEY_SECRET;
    const testSecret = 'mock_secret_key_1234567890';
    process.env.RAZORPAY_KEY_SECRET = testSecret;

    const razorpayOrderId = 'order_DA1234567890';
    const razorpayPaymentId = 'pay_DA9876543210';

    // Generate real HMAC-SHA256 signature
    const validSignature = crypto
      .createHmac('sha256', testSecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    const isValid = verifyRazorpaySignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature: validSignature,
    });

    expect(isValid).toBe(true);

    // Test altered / forged signature
    const isTamperedValid = verifyRazorpaySignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature: 'forged_fake_signature_abc123',
    });

    expect(isTamperedValid).toBe(false);

    // Restore env
    process.env.RAZORPAY_KEY_SECRET = originalSecret;
  });
});
