import { notFound } from 'next/navigation';
import { getPublicOrderStatus } from '@/lib/orders';
import OrderStatusTracker from '@/components/menu/OrderStatusTracker';

export default async function CustomerOrderPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  if (!id || id === 'undefined') {
    notFound();
  }
  const order = await getPublicOrderStatus(id);

  if (!order) {
    notFound();
  }

  // Format dates to strings for client serialization
  const serializedOrder = {
    ...order,
    createdAt: order.createdAt.toISOString(),
    history: order.history.map((h) => ({
      ...h,
      createdAt: h.createdAt.toISOString(),
    })),
  };

  return (
    <div className="min-h-screen bg-[#141210]">
      <OrderStatusTracker initialOrder={serializedOrder} />
    </div>
  );
}
