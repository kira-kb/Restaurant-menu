import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/auth/session';
import { Role } from '@prisma/client';

export type AuditEventType = 'ORDER_STATUS' | 'PAYMENT' | 'SESSION_CLOSED';

export interface AuditEvent {
  id: string;
  type: AuditEventType;
  actionTitle: string;
  timestamp: string;
  staffId: string;
  staffName: string;
  staffRole: string;
  orderNumber?: string | null;
  tableNumber?: string | null;
  amount?: number | null;
  currency?: string | null;
  paymentMethod?: string | null;
  notes?: string | null;
  fromStatus?: string | null;
  toStatus?: string | null;
}

export interface BaristaDailySummary {
  staffId: string;
  staffName: string;
  staffRole: string;
  ordersAccepted: number;
  ordersCompleted: number;
  paymentsCount: number;
  paymentsTotal: number;
  sessionsClosed: number;
  firstActive: string;
  lastActive: string;
}

export interface TodaysAuditData {
  totalEvents: number;
  ordersAccepted: number;
  ordersCompleted: number;
  paymentsTotal: number;
  paymentsCount: number;
  sessionsClosed: number;
  activeStaff: BaristaDailySummary[];
  events: AuditEvent[];
}

export interface AuditFilterOptions {
  staffId?: string;
  type?: string;
  search?: string;
  dateRange?: 'today' | 'yesterday' | '7days' | '30days' | 'all';
}

/**
 * Returns today's beginning timestamp (00:00:00 local)
 */
function getStartOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Returns start of yesterday (00:00:00) and end of yesterday
 */
function getYesterdayRange(): { start: Date; end: Date } {
  const start = new Date();
  start.setDate(start.getDate() - 1);
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setDate(end.getDate() - 1);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

/**
 * Formats a friendly title for status changes
 */
function formatStatusAction(toStatus: string): string {
  switch (toStatus) {
    case 'PREPARING':
      return 'Order accepted & brewing';
    case 'READY':
      return 'Order ready at counter';
    case 'COMPLETED':
      return 'Order completed';
    case 'CANCELLED':
      return 'Order cancelled';
    case 'CONFIRMED':
      return 'Order confirmed';
    default:
      return `Status: ${toStatus.toLowerCase()}`;
  }
}

/**
 * Fetches all staff members for audit filters
 */
export async function getAuditStaffList() {
  await requireRole([Role.ADMIN]);
  return prisma.user.findMany({
    where: { isActive: true },
    select: { id: true, name: true, role: true, email: true },
    orderBy: { name: 'asc' },
  });
}

/**
 * Fetches comprehensive Barista audit for today
 */
export async function getTodaysBaristaAudit(): Promise<TodaysAuditData> {
  await requireRole([Role.ADMIN]);
  const startOfDay = getStartOfToday();

  // 1. Fetch Order Status Changes today
  const statusChanges = await prisma.orderStatusHistory.findMany({
    where: { createdAt: { gte: startOfDay } },
    orderBy: { createdAt: 'desc' },
    include: {
      changedBy: { select: { id: true, name: true, role: true } },
      order: {
        select: {
          orderNumber: true,
          table: { select: { tableNumber: true } },
        },
      },
    },
  });

  // 2. Fetch Payments recorded today
  const payments = await prisma.payment.findMany({
    where: { createdAt: { gte: startOfDay } },
    orderBy: { createdAt: 'desc' },
    include: {
      recordedBy: { select: { id: true, name: true, role: true } },
      session: {
        select: {
          table: { select: { tableNumber: true } },
        },
      },
      order: {
        select: { orderNumber: true, currency: true },
      },
    },
  });

  // 3. Fetch Table Sessions closed today
  const closedSessions = await prisma.tableSession.findMany({
    where: {
      status: 'CLOSED',
      closedAt: { gte: startOfDay },
    },
    orderBy: { closedAt: 'desc' },
    include: {
      closedBy: { select: { id: true, name: true, role: true } },
      table: { select: { tableNumber: true } },
      order: { select: { orderNumber: true, total: true, currency: true } },
    },
  });

  // Assemble unified audit events
  const events: AuditEvent[] = [];

  for (const sc of statusChanges) {
    events.push({
      id: `status-${sc.id}`,
      type: 'ORDER_STATUS',
      actionTitle: formatStatusAction(sc.toStatus),
      timestamp: sc.createdAt.toISOString(),
      staffId: sc.changedBy?.id || 'system',
      staffName: sc.changedBy?.name || 'Customer / System',
      staffRole: sc.changedBy?.role || 'SYSTEM',
      orderNumber: sc.order.orderNumber,
      tableNumber: sc.order.table.tableNumber,
      fromStatus: sc.fromStatus,
      toStatus: sc.toStatus,
      notes: sc.note,
    });
  }

  for (const p of payments) {
    events.push({
      id: `payment-${p.id}`,
      type: 'PAYMENT',
      actionTitle: `Payment recorded (${p.method})`,
      timestamp: p.createdAt.toISOString(),
      staffId: p.recordedBy.id,
      staffName: p.recordedBy.name,
      staffRole: p.recordedBy.role,
      orderNumber: p.order?.orderNumber || null,
      tableNumber: p.session.table.tableNumber,
      amount: Number(p.amount),
      currency: p.order?.currency || 'ETB',
      paymentMethod: p.method,
      notes: p.notes || (p.reference ? `Ref: ${p.reference}` : 'Full counter payment received'),
    });
  }

  for (const cs of closedSessions) {
    if (!cs.closedAt) continue;
    events.push({
      id: `session-${cs.id}`,
      type: 'SESSION_CLOSED',
      actionTitle: 'Table session closed',
      timestamp: cs.closedAt.toISOString(),
      staffId: cs.closedBy?.id || 'system',
      staffName: cs.closedBy?.name || 'Staff',
      staffRole: cs.closedBy?.role || 'BARISTA',
      orderNumber: cs.order?.orderNumber || null,
      tableNumber: cs.table.tableNumber,
      amount: cs.order ? Number(cs.order.total) : null,
      currency: cs.order?.currency || 'ETB',
      notes: cs.notes || 'Table session reconciled and freed',
    });
  }

  // Sort chronological descending (latest action first)
  events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Aggregate stats
  let ordersAccepted = 0;
  let ordersCompleted = 0;
  let paymentsTotal = 0;
  const paymentsCount = payments.length;
  const sessionsClosed = closedSessions.length;

  const staffMap: Record<string, BaristaDailySummary> = {};

  for (const e of events) {
    if (e.staffId && e.staffId !== 'system') {
      if (!staffMap[e.staffId]) {
        staffMap[e.staffId] = {
          staffId: e.staffId,
          staffName: e.staffName,
          staffRole: e.staffRole,
          ordersAccepted: 0,
          ordersCompleted: 0,
          paymentsCount: 0,
          paymentsTotal: 0,
          sessionsClosed: 0,
          firstActive: e.timestamp,
          lastActive: e.timestamp,
        };
      }

      const summary = staffMap[e.staffId];
      if (new Date(e.timestamp) > new Date(summary.lastActive)) {
        summary.lastActive = e.timestamp;
      }
      if (new Date(e.timestamp) < new Date(summary.firstActive)) {
        summary.firstActive = e.timestamp;
      }

      if (e.type === 'ORDER_STATUS') {
        if (e.toStatus === 'PREPARING' || e.toStatus === 'CONFIRMED') {
          summary.ordersAccepted += 1;
        } else if (e.toStatus === 'COMPLETED') {
          summary.ordersCompleted += 1;
        }
      } else if (e.type === 'PAYMENT') {
        summary.paymentsCount += 1;
        summary.paymentsTotal += e.amount || 0;
      } else if (e.type === 'SESSION_CLOSED') {
        summary.sessionsClosed += 1;
      }
    }

    if (e.type === 'ORDER_STATUS') {
      if (e.toStatus === 'PREPARING' || e.toStatus === 'CONFIRMED') ordersAccepted += 1;
      if (e.toStatus === 'COMPLETED') ordersCompleted += 1;
    } else if (e.type === 'PAYMENT') {
      paymentsTotal += e.amount || 0;
    }
  }

  return {
    totalEvents: events.length,
    ordersAccepted,
    ordersCompleted,
    paymentsTotal,
    paymentsCount,
    sessionsClosed,
    activeStaff: Object.values(staffMap).sort((a, b) => b.ordersCompleted - a.ordersCompleted),
    events,
  };
}

/**
 * Fetches all historical audit events with optional date / staff filtering
 */
export async function getHistoricalAuditEvents(options: AuditFilterOptions = {}) {
  await requireRole([Role.ADMIN]);

  let dateFilter: { gte?: Date; lte?: Date } | undefined = undefined;

  if (options.dateRange === 'today') {
    dateFilter = { gte: getStartOfToday() };
  } else if (options.dateRange === 'yesterday') {
    const { start, end } = getYesterdayRange();
    dateFilter = { gte: start, lte: end };
  } else if (options.dateRange === '7days') {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    dateFilter = { gte: d };
  } else if (options.dateRange === '30days') {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    dateFilter = { gte: d };
  }

  // 1. Query OrderStatusHistory
  const statusChanges = await prisma.orderStatusHistory.findMany({
    where: {
      ...(dateFilter ? { createdAt: dateFilter } : {}),
      ...(options.staffId ? { changedById: options.staffId } : {}),
    },
    take: 300,
    orderBy: { createdAt: 'desc' },
    include: {
      changedBy: { select: { id: true, name: true, role: true } },
      order: {
        select: {
          orderNumber: true,
          table: { select: { tableNumber: true } },
        },
      },
    },
  });

  // 2. Query Payments
  const payments = await prisma.payment.findMany({
    where: {
      ...(dateFilter ? { createdAt: dateFilter } : {}),
      ...(options.staffId ? { recordedById: options.staffId } : {}),
    },
    take: 300,
    orderBy: { createdAt: 'desc' },
    include: {
      recordedBy: { select: { id: true, name: true, role: true } },
      session: {
        select: {
          table: { select: { tableNumber: true } },
        },
      },
      order: {
        select: { orderNumber: true, currency: true },
      },
    },
  });

  // 3. Query Closed Table Sessions
  const closedSessions = await prisma.tableSession.findMany({
    where: {
      status: 'CLOSED',
      ...(dateFilter ? { closedAt: dateFilter } : { closedAt: { not: null } }),
      ...(options.staffId ? { closedById: options.staffId } : {}),
    },
    take: 300,
    orderBy: { closedAt: 'desc' },
    include: {
      closedBy: { select: { id: true, name: true, role: true } },
      table: { select: { tableNumber: true } },
      order: { select: { orderNumber: true, total: true, currency: true } },
    },
  });

  const events: AuditEvent[] = [];

  for (const sc of statusChanges) {
    events.push({
      id: `status-${sc.id}`,
      type: 'ORDER_STATUS',
      actionTitle: formatStatusAction(sc.toStatus),
      timestamp: sc.createdAt.toISOString(),
      staffId: sc.changedBy?.id || 'system',
      staffName: sc.changedBy?.name || 'Customer / System',
      staffRole: sc.changedBy?.role || 'SYSTEM',
      orderNumber: sc.order.orderNumber,
      tableNumber: sc.order.table.tableNumber,
      fromStatus: sc.fromStatus,
      toStatus: sc.toStatus,
      notes: sc.note,
    });
  }

  for (const p of payments) {
    events.push({
      id: `payment-${p.id}`,
      type: 'PAYMENT',
      actionTitle: `Payment recorded (${p.method})`,
      timestamp: p.createdAt.toISOString(),
      staffId: p.recordedBy.id,
      staffName: p.recordedBy.name,
      staffRole: p.recordedBy.role,
      orderNumber: p.order?.orderNumber || null,
      tableNumber: p.session.table.tableNumber,
      amount: Number(p.amount),
      currency: p.order?.currency || 'ETB',
      paymentMethod: p.method,
      notes: p.notes || (p.reference ? `Ref: ${p.reference}` : 'Counter payment'),
    });
  }

  for (const cs of closedSessions) {
    if (!cs.closedAt) continue;
    events.push({
      id: `session-${cs.id}`,
      type: 'SESSION_CLOSED',
      actionTitle: 'Table session closed',
      timestamp: cs.closedAt.toISOString(),
      staffId: cs.closedBy?.id || 'system',
      staffName: cs.closedBy?.name || 'Staff',
      staffRole: cs.closedBy?.role || 'BARISTA',
      orderNumber: cs.order?.orderNumber || null,
      tableNumber: cs.table.tableNumber,
      amount: cs.order ? Number(cs.order.total) : null,
      currency: cs.order?.currency || 'ETB',
      notes: cs.notes || 'Table session closed and released',
    });
  }

  // Sort chronological descending
  events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return events;
}
