import prisma from '@/lib/prisma';
import AdminDashboardClient from '@/components/admin/AdminDashboardClient';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const [activeOrders, pendingCount, preparingCount, activeTablesCount, rawRecentOrders] =
    await Promise.all([
      prisma.order.count({
        where: { status: { in: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'] } },
      }),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.count({ where: { status: 'PREPARING' } }),
      prisma.tableSession.count({ where: { status: 'ACTIVE' } }),
      prisma.order.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: {
          table: { select: { tableNumber: true } },
          items: { select: { quantity: true, productName: true } },
        },
      }),
    ]);

  const recentOrders = rawRecentOrders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    total: Number(order.total),
    currency: order.currency,
    status: order.status,
    createdAt: order.createdAt.toISOString(),
    table: {
      tableNumber: order.table.tableNumber,
    },
    items: order.items.map((item) => ({
      quantity: item.quantity,
      productName: item.productName,
    })),
  }));

  return (
    <AdminDashboardClient
      stats={{
        activeOrders,
        pendingCount,
        preparingCount,
        activeTablesCount,
      }}
      recentOrders={recentOrders}
    />
  );
}
