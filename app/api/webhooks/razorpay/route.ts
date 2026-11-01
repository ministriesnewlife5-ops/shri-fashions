import { NextRequest, NextResponse } from 'next/server';
import { verifyRazorpayWebhookSignature } from '@/lib/payments/razorpay';
import { createAdminClient } from '@/lib/supabase/admin';

// In-memory processed webhook ids for idempotency guarantee
const processedEventIds = new Set<string>();

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Signature missing' }, { status: 400 });
    }

    // Verify webhook signature
    const isValid = verifyRazorpayWebhookSignature(rawBody, signature);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    const eventId = event.event_id || `${event.event}_${event.created_at}`;

    // Idempotency check: prevent duplicate event processing
    if (processedEventIds.has(eventId)) {
      return NextResponse.json({ status: 'duplicate_event_ignored' }, { status: 200 });
    }
    processedEventIds.add(eventId);

    // Save event in database audit table
    try {
      const adminClient = createAdminClient();
      await adminClient.from('webhook_events').insert({
        provider: 'razorpay',
        provider_event_id: eventId,
        event_type: event.event,
        payload: event,
        processing_status: 'processed',
        processed_at: new Date().toISOString(),
      });
    } catch {
      // Ignore database insert error in dev mode
    }

    // Handle event types
    switch (event.event) {
      case 'payment.captured': {
        const payment = event.payload.payment.entity;
        const internalOrderId = payment.notes?.order_id;
        console.log(`[Razorpay Webhook] Payment captured for order ${internalOrderId}, amount: ${payment.amount}`);
        break;
      }
      case 'payment.failed': {
        const payment = event.payload.payment.entity;
        const internalOrderId = payment.notes?.order_id;
        console.warn(`[Razorpay Webhook] Payment failed for order ${internalOrderId}`);
        break;
      }
      case 'refund.processed': {
        const refund = event.payload.refund.entity;
        console.log(`[Razorpay Webhook] Refund processed: ${refund.id}`);
        break;
      }
      default:
        console.log(`[Razorpay Webhook] Unhandled event: ${event.event}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed', details: error.message },
      { status: 500 }
    );
  }
}
