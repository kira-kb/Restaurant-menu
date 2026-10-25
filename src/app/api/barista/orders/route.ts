import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth/session';
import { Role } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const user = await getSessionUser();
  if (!user || (user.role !== Role.BARISTA && user.role !== Role.ADMIN)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch recent orders (all pending/confirmed/preparing/ready, plus completed/cancelled from last 24h)
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

  const formatted = orders.map((o) => {
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

  return NextResponse.json({
    orders: formatted,
    timestamp: new Date().toISOString(),
  });
}
