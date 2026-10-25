import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import { getPublicShopSettings } from '@/lib/menu';
import BaristaOrderQueue from '@/components/barista/BaristaOrderQueue';

export const metadata: Metadata = {
  title: 'Order Queue | Barista Dashboard',
  description: 'Incoming and preparing coffee orders for Barch Coffee barista counter.',
};

export const dynamic = 'force-dynamic';

export default async function BaristaOrdersPage() {
  const settings = await getPublicShopSettings();

  const since = new Date();
  since.setHours(since.getHours() - 24);

  const orders = await prisma.order.findMany({
    where: {
      OR: [
        { status: { in: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'] } },
        { createdAt: { gte: since } },
      ],
    },
    orderBy: { createdAt: 'desc' },
    include: {
      table: { select: { id: true, tableNumber: true, displayName: true } },
      items: {
        select: {
          id: true,
          productName: true,
          quantity: true,
          unitPrice: true,
          lineTotal: true,
          notes: true,
        },
      },
      session: {
        select: {
          id: true,
          status: true,
          payments: {
            where: { status: 'SUCCESS' },
            select: { amount: true },
          },
        },
      },
    },
  });

  const formattedOrders = orders.map((o) => {
    const sessionPaid = o.session.payments.reduce(
      (acc, p) => acc + Number(p.amount),
      0
    );

    return {
      id: o.id,
      orderNumber: o.orderNumber,
      tableId: o.table.id,
      tableNumber: o.table.tableNumber,
      tableDisplayName: o.table.displayName,
      sessionId: o.session.id,
      sessionStatus: o.session.status,
      status: o.status,
      paymentStatus: o.paymentStatus,
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
      sessionPaid,
    };
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-[#F5F0EB]">Counter order queue</h1>
          <p className="text-xs text-[#9E958C]">
            Real-time incoming orders, preparation status, and table sessions.
          </p>
        </div>
      </div>

      <BaristaOrderQueue
        initialOrders={formattedOrders}
        cafeName={settings.cafeName}
        currency={settings.currency}
        address={settings.address || undefined}
        phone={settings.phone || undefined}
        receiptHeader={settings.receiptHeader || undefined}
        receiptFooter={settings.receiptFooter || undefined}
      />
    </div>
  );
}
