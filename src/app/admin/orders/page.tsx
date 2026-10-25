import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import AdminOrdersList from '@/components/admin/AdminOrdersList';

export const metadata: Metadata = {
  title: 'Order History | Admin Dashboard',
  description: 'Inspect historical and active customer orders and audit logs.',
};

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    take: 200,
    orderBy: { createdAt: 'desc' },
    include: {
      table: { select: { tableNumber: true } },
      items: true,
      payments: {
        include: {
          recordedBy: { select: { name: true } },
        },
      },
      statusHistory: {
        orderBy: { createdAt: 'asc' },
        include: {
          changedBy: { select: { name: true } },
        },
      },
    },
  });

  const formattedOrders = orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    sessionId: o.sessionId,
    tableNumber: o.table.tableNumber,
    status: o.status,
    paymentStatus: o.paymentStatus,
    subtotal: Number(o.subtotal),
    total: Number(o.total),
    currency: o.currency,
    notes: o.notes,
    createdAt: o.createdAt.toISOString(),
    items: o.items.map((i) => ({
      id: i.id,
      productName: i.productName,
      quantity: i.quantity,
      unitPrice: Number(i.unitPrice),
      lineTotal: Number(i.lineTotal),
      notes: i.notes,
    })),
    payments: o.payments.map((p) => ({
      id: p.id,
      amount: Number(p.amount),
      method: p.method,
      reference: p.reference,
      recordedByName: p.recordedBy.name,
    })),
    statusHistory: o.statusHistory.map((h) => ({
      id: h.id,
      fromStatus: h.fromStatus,
      toStatus: h.toStatus,
      note: h.note,
      changedByName: h.changedBy?.name || null,
      createdAt: h.createdAt.toISOString(),
    })),
  }));

  return <AdminOrdersList initialOrders={formattedOrders} />;
}
