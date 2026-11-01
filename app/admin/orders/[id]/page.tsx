import React from 'react';
import { notFound } from 'next/navigation';
import { getAllOrders, getOrderByNumber } from '@/lib/services/orders';
import { OrderDetailView } from '@/components/admin/order-detail-view';

export const metadata = {
  title: 'Order Inspection | SHRÎ Admin',
};

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let order = await getOrderByNumber(id);
  if (!order) {
    const orders = await getAllOrders();
    order = orders.find((o) => o.id === id || o.order_number === id) || null;
  }

  if (!order) {
    notFound();
  }

  return <OrderDetailView initialOrder={order} />;
}
