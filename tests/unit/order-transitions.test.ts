import { describe, it, expect } from 'vitest';
import { OrderStatus } from '@/lib/types/database';

function canTransitionOrderStatus(current: OrderStatus, next: OrderStatus): boolean {
  const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered', 'returned'],
    delivered: ['returned'],
    cancelled: [],
    returned: [],
  };

  return allowedTransitions[current]?.includes(next) ?? false;
}

describe('Order State Machine', () => {
  it('allows valid forward progress from confirmed to processing and shipped', () => {
    expect(canTransitionOrderStatus('pending', 'confirmed')).toBe(true);
    expect(canTransitionOrderStatus('confirmed', 'processing')).toBe(true);
    expect(canTransitionOrderStatus('processing', 'shipped')).toBe(true);
    expect(canTransitionOrderStatus('shipped', 'delivered')).toBe(true);
  });

  it('allows cancellation before fulfillment', () => {
    expect(canTransitionOrderStatus('pending', 'cancelled')).toBe(true);
    expect(canTransitionOrderStatus('confirmed', 'cancelled')).toBe(true);
    expect(canTransitionOrderStatus('processing', 'cancelled')).toBe(true);
  });

  it('rejects cancellation once order is already delivered', () => {
    expect(canTransitionOrderStatus('delivered', 'cancelled')).toBe(false);
  });

  it('disallows any transitions from a cancelled order', () => {
    expect(canTransitionOrderStatus('cancelled', 'confirmed')).toBe(false);
    expect(canTransitionOrderStatus('cancelled', 'shipped')).toBe(false);
  });
});
