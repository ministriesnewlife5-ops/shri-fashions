import { NextRequest, NextResponse } from 'next/server';
import { verifyRazorpaySignature } from '@/lib/payments/razorpay';
import { recordPaymentSuccess } from '@/lib/services/orders';

export async function POST(req: NextRequest) {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = await req.json();

    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json(
        { success: false, error: 'Missing required signature verification fields' },
        { status: 400 }
      );
    }

    // Verify cryptographic signature
    const isValid = verifyRazorpaySignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Cryptographic signature verification failed' },
        { status: 400 }
      );
    }

    // Transition order state to confirmed and payment to captured
    await recordPaymentSuccess(orderId, {
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
    });

    return NextResponse.json({
      success: true,
      message: 'Payment verified and captured successfully',
    });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Payment verification failed' },
      { status: 500 }
    );
  }
}
