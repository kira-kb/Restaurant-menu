import { Prisma, PaymentStatus, SessionStatus, Role } from '@prisma/client';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/auth/session';
import { PaymentRecordSchema } from '@/lib/validations';

/**
 * Calculates authoritative financial breakdown for a table session
 */
export async function getSessionFinancialSummary(sessionId: string) {
  const session = await prisma.tableSession.findUniqueOrThrow({
    where: { id: sessionId },
    include: {
      table: true,
      order: {
        select: {
          id: true,
          orderNumber: true,
          status: true,
          total: true,
          paymentStatus: true,
        },
      },
      payments: {
        where: { status: 'SUCCESS' },
        select: {
          id: true,
          amount: true,
          method: true,
          reference: true,
          createdAt: true,
          recordedBy: { select: { name: true } },
        },
      },
    },
  });

  const activeOrder =
    session.order && session.order.status !== 'CANCELLED' ? session.order : null;

  const totalBilled = activeOrder ? activeOrder.total : new Prisma.Decimal(0);

  const totalPaid = session.payments.reduce(
    (acc, curr) => acc.add(curr.amount),
    new Prisma.Decimal(0)
  );

  const balanceDue = totalBilled.sub(totalPaid);

  const ordersList = activeOrder
    ? [
        {
          id: activeOrder.id,
          orderNumber: activeOrder.orderNumber,
          status: activeOrder.status,
          total: Number(activeOrder.total),
          paymentStatus: activeOrder.paymentStatus,
        },
      ]
    : [];

  return {
    sessionId: session.id,
    tableId: session.tableId,
    tableNumber: session.table.tableNumber,
    status: session.status,
    totalBilled: Number(totalBilled),
    totalPaid: Number(totalPaid),
    balanceDue: Math.max(0, Number(balanceDue)),
    isFullyPaid: balanceDue.lessThanOrEqualTo(0),
    ordersCount: ordersList.length,
    orders: ordersList,
    payments: session.payments.map((p) => ({
      id: p.id,
      amount: Number(p.amount),
      method: p.method,
      reference: p.reference,
      createdAt: p.createdAt,
      recordedByName: p.recordedBy.name,
    })),
  };
}

/**
 * Calculates simplified session balance metrics
 */
export async function calculateSessionBalance(sessionId: string) {
  const summary = await getSessionFinancialSummary(sessionId);
  return {
    totalOrderAmount: summary.totalBilled,
    totalPaid: summary.totalPaid,
    outstandingBalance: summary.balanceDue,
    paymentStatus:
      summary.balanceDue <= 0
        ? 'PAID'
        : summary.totalPaid > 0
          ? 'PARTIALLY_PAID'
          : 'UNPAID',
  };
}

/**
 * Records a payment against a table session or its consolidated order
 */
export async function recordPayment(
  data: unknown,
  staffUser?: { id: string; name: string }
) {
  const staff = staffUser || (await requireRole([Role.BARISTA, Role.ADMIN]));
  const validated = PaymentRecordSchema.parse(data);

  return prisma.$transaction(async (tx) => {
    const session = await tx.tableSession.findUniqueOrThrow({
      where: { id: validated.sessionId },
      include: {
        order: true,
        payments: { where: { status: 'SUCCESS' } },
      },
    });

    if (session.status === SessionStatus.CLOSED) {
      throw new Error('Cannot record payments on an already closed table session.');
    }

    // Prevent accidental duplicate payments if already paid in full
    const currentPaid = session.payments.reduce(
      (acc, curr) => acc.add(curr.amount),
      new Prisma.Decimal(0)
    );
    const totalOrderAmount = session.order ? session.order.total : new Prisma.Decimal(0);
    if (totalOrderAmount.greaterThan(0) && currentPaid.greaterThanOrEqualTo(totalOrderAmount)) {
      throw new Error('Payment has already been recorded in full for this table session.');
    }

    const paymentAmount = new Prisma.Decimal(validated.amount);

    // Record payment
    const payment = await tx.payment.create({
      data: {
        sessionId: session.id,
        orderId: session.order?.id || validated.orderId || null,
        amount: paymentAmount,
        method: validated.method,
        reference: validated.reference?.trim() || null,
        notes: validated.notes?.trim() || null,
        recordedById: staff.id,
      },
    });

    // Re-calculate session totals and update order payment status
    const updatedPayments = [...session.payments, payment];
    const totalPaid = updatedPayments.reduce(
      (acc, curr) => acc.add(curr.amount),
      new Prisma.Decimal(0)
    );

    if (session.order && session.order.status !== 'CANCELLED') {
      let newStatus: PaymentStatus = PaymentStatus.UNPAID;
      if (totalPaid.greaterThanOrEqualTo(session.order.total)) {
        newStatus = PaymentStatus.PAID;
      } else if (totalPaid.greaterThan(0)) {
        newStatus = PaymentStatus.PARTIALLY_PAID;
      }

      await tx.order.update({
        where: { id: session.order.id },
        data: { paymentStatus: newStatus },
      });
    }

    return payment;
  });
}

/**
 * Checks if a table session can be safely closed without throwing
 */
export async function canCloseTableSession(
  sessionId: string
): Promise<{ allowed: boolean; reason?: string }> {
  const session = await prisma.tableSession.findUnique({
    where: { id: sessionId },
    include: {
      order: true,
      payments: { where: { status: 'SUCCESS' } },
    },
  });

  if (!session) {
    return { allowed: false, reason: 'Session not found' };
  }

  if (session.status === SessionStatus.CLOSED) {
    return { allowed: false, reason: 'This session is already closed.' };
  }

  if (
    session.order &&
    session.order.status !== 'COMPLETED' &&
    session.order.status !== 'CANCELLED'
  ) {
    return {
      allowed: false,
      reason: `Cannot close session: The order (${session.order.orderNumber}) is still active. Please complete it first.`,
    };
  }

  const totalBilled =
    session.order && session.order.status === 'COMPLETED'
      ? session.order.total
      : new Prisma.Decimal(0);

  const totalPaid = session.payments.reduce(
    (acc, curr) => acc.add(curr.amount),
    new Prisma.Decimal(0)
  );

  const balanceDue = totalBilled.sub(totalPaid);
  if (balanceDue.greaterThan(0)) {
    return {
      allowed: false,
      reason: `Cannot close session: Outstanding unpaid balance of ${balanceDue.toFixed(2)} ETB.`,
    };
  }

  return { allowed: true };
}

/**
 * Validates requirements and closes a table session
 */
export async function closeTableSession(
  sessionId: string,
  notes?: string,
  staffUser?: { id: string; name: string }
) {
  const staff = staffUser || (await requireRole([Role.BARISTA, Role.ADMIN]));

  return prisma.$transaction(async (tx) => {
    const session = await tx.tableSession.findUniqueOrThrow({
      where: { id: sessionId },
      include: {
        table: true,
        order: true,
        payments: { where: { status: 'SUCCESS' } },
      },
    });

    if (session.status === SessionStatus.CLOSED) {
      return session;
    }

    // 1. Verify consolidated order is not in progress
    if (
      session.order &&
      session.order.status !== 'COMPLETED' &&
      session.order.status !== 'CANCELLED'
    ) {
      throw new Error(
        `Cannot close session: Order ${session.order.orderNumber} is still active (${session.order.status}). Please complete it first.`
      );
    }

    // 2. Verify all billed orders are paid
    const totalBilled =
      session.order && session.order.status === 'COMPLETED'
        ? session.order.total
        : new Prisma.Decimal(0);

    const totalPaid = session.payments.reduce(
      (acc, curr) => acc.add(curr.amount),
      new Prisma.Decimal(0)
    );

    const balanceDue = totalBilled.sub(totalPaid);
    if (balanceDue.greaterThan(0)) {
      throw new Error(
        `Cannot close session: Outstanding unpaid balance of ${balanceDue.toFixed(2)} ETB. Please record full payment before closing the session.`
      );
    }

    // 3. Close the session
    const closed = await tx.tableSession.update({
      where: { id: sessionId },
      data: {
        status: SessionStatus.CLOSED,
        closedAt: new Date(),
        closedById: staff.id,
        notes: notes?.trim() || null,
      },
    });

    // 4. Ensure consolidated order payment status is marked PAID
    if (session.order && session.order.paymentStatus !== PaymentStatus.PAID) {
      await tx.order.update({
        where: { id: session.order.id },
        data: { paymentStatus: PaymentStatus.PAID },
      });
    }

    return closed;
  });
}
