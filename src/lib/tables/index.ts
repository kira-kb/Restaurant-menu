import { revalidatePath } from 'next/cache';
import QRCode from 'qrcode';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/auth/session';
import { Role, SessionStatus } from '@prisma/client';
import { TableInputSchema } from '@/lib/validations';

/**
 * Generates high-resolution PNG data URL for display and download
 */
export async function generateQrDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, {
    margin: 2,
    scale: 8,
    errorCorrectionLevel: 'H',
    color: {
      dark: '#292521', // Dark text coffee tone
      light: '#FAF7F2', // Warm cream background
    },
  });
}

/**
 * Generates crisp vector SVG representation for scalable printing
 */
export async function generateQrSvg(text: string): Promise<string> {
  return QRCode.toString(text, {
    type: 'svg',
    margin: 2,
    color: {
      dark: '#292521',
      light: '#FFFFFF',
    },
  });
}

/**
 * Builds standard customer QR menu destination URL
 */
export function generateTableQrUrl(tableId: string, baseUrl = ''): string {
  const cleanBase = baseUrl ? baseUrl.replace(/\/$/, '') : '';
  return `${cleanBase}/menu?table=${tableId}`;
}

/**
 * Resolves a table identifier (ID or tableNumber) for a public customer,
 * ensuring it exists and is currently active.
 */
export async function resolveTableForCustomer(identifier: string) {
  if (!identifier || typeof identifier !== 'string') {
    return null;
  }

  const table = await prisma.cafeTable.findFirst({
    where: {
      OR: [{ id: identifier }, { tableNumber: identifier }],
      isActive: true,
    },
    select: {
      id: true,
      tableNumber: true,
      displayName: true,
      isActive: true,
    },
  });

  return table;
}

/**
 * Returns active tables for customer manual selection
 */
export async function getActivePublicTables() {
  return prisma.cafeTable.findMany({
    where: { isActive: true },
    orderBy: { tableNumber: 'asc' },
    select: {
      id: true,
      tableNumber: true,
      displayName: true,
    },
  });
}

/* ========================================================================= */
/* ADMIN TABLE MANAGEMENT                                                    */
/* ========================================================================= */

export async function getAdminTables() {
  await requireRole([Role.ADMIN]);

  const tables = await prisma.cafeTable.findMany({
    orderBy: { tableNumber: 'asc' },
    include: {
      sessions: {
        where: { status: SessionStatus.ACTIVE },
        include: {
          order: {
            select: { id: true, orderNumber: true, status: true, total: true },
          },
        },
      },
      _count: {
        select: { orders: true },
      },
    },
  });

  return tables.map((t) => {
    const activeSession = t.sessions[0] || null;
    const activeOrder =
      activeSession?.order &&
      activeSession.order.status !== 'COMPLETED' &&
      activeSession.order.status !== 'CANCELLED'
        ? activeSession.order
        : null;

    return {
      id: t.id,
      tableNumber: t.tableNumber,
      displayName: t.displayName,
      isActive: t.isActive,
      createdAt: t.createdAt,
      totalOrdersHistorical: t._count.orders,
      activeSession: activeSession
        ? {
            id: activeSession.id,
            openedAt: activeSession.openedAt,
            activeOrdersCount: activeOrder ? 1 : 0,
            activeOrders: activeOrder
              ? [
                  {
                    id: activeOrder.id,
                    orderNumber: activeOrder.orderNumber,
                    status: activeOrder.status,
                    total: Number(activeOrder.total),
                  },
                ]
              : [],
          }
        : null,
    };
  });
}

export async function createTableAction(formData: FormData) {
  await requireRole([Role.ADMIN]);

  const rawData = {
    tableNumber: formData.get('tableNumber'),
    displayName: formData.get('displayName') || null,
    isActive: formData.get('isActive') === 'true' || formData.get('isActive') === 'on',
  };

  const validated = TableInputSchema.parse(rawData);

  // Check unique tableNumber
  const existing = await prisma.cafeTable.findUnique({
    where: { tableNumber: validated.tableNumber },
  });
  if (existing) {
    throw new Error(`A table with identifier "${validated.tableNumber}" already exists.`);
  }

  const table = await prisma.cafeTable.create({
    data: validated,
  });

  revalidatePath('/admin/tables');
  revalidatePath('/menu');

  return {
    id: table.id,
    tableNumber: table.tableNumber,
    displayName: table.displayName,
    isActive: table.isActive,
    createdAt: table.createdAt.toISOString(),
    updatedAt: table.updatedAt.toISOString(),
  };
}

export async function updateTableAction(id: string, formData: FormData) {
  await requireRole([Role.ADMIN]);

  const rawData = {
    tableNumber: formData.get('tableNumber'),
    displayName: formData.get('displayName') || null,
    isActive: formData.get('isActive') === 'true' || formData.get('isActive') === 'on',
  };

  const validated = TableInputSchema.parse(rawData);

  const conflict = await prisma.cafeTable.findFirst({
    where: { tableNumber: validated.tableNumber, NOT: { id } },
  });
  if (conflict) {
    throw new Error(`Another table already uses identifier "${validated.tableNumber}".`);
  }

  const updated = await prisma.cafeTable.update({
    where: { id },
    data: validated,
  });

  revalidatePath('/admin/tables');
  revalidatePath('/menu');

  return {
    id: updated.id,
    tableNumber: updated.tableNumber,
    displayName: updated.displayName,
    isActive: updated.isActive,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  };
}

export async function toggleTableStatusAction(id: string) {
  await requireRole([Role.ADMIN]);

  const table = await prisma.cafeTable.findUniqueOrThrow({ where: { id } });
  const updated = await prisma.cafeTable.update({
    where: { id },
    data: { isActive: !table.isActive },
  });

  revalidatePath('/admin/tables');
  revalidatePath('/menu');

  return {
    id: updated.id,
    tableNumber: updated.tableNumber,
    displayName: updated.displayName,
    isActive: updated.isActive,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  };
}
