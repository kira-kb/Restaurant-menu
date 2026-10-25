import { Prisma, OrderStatus, SessionStatus, Role, PaymentStatus } from '@prisma/client';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/auth/session';
import { OrderSubmissionSchema } from '@/lib/validations';

/**
 * Valid order status transitions map
 */
export const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: [OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.CANCELLED],
  CONFIRMED: [OrderStatus.PREPARING, OrderStatus.COMPLETED, OrderStatus.CANCELLED],
  PREPARING: [OrderStatus.READY, OrderStatus.COMPLETED, OrderStatus.CANCELLED],
  READY: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
  COMPLETED: [OrderStatus.PENDING, OrderStatus.CANCELLED],
  CANCELLED: [],
};

/**
 * Generates a human-friendly unique order number: BC-YYYYMMDD-XXXX
 */
function generateOrderNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = Math.floor(1000 + Math.random() * 9000).toString();
  return `BC-${dateStr}-${randomPart}`;
}

/**
 * Transactional order creation & consolidation for public customers.
 * Each active table session has exactly ONE consolidated order.
 * If customer submits additional items, they are merged into the existing order.
 */
export async function createCustomerOrder(data: unknown) {
  const validated = OrderSubmissionSchema.parse(data);

  // 1. Check idempotency if key provided
  if (validated.idempotencyKey) {
    const existingOrder = await prisma.order.findUnique({
      where: { idempotencyKey: validated.idempotencyKey },
      include: {
        table: true,
        items: true,
      },
    });
    if (existingOrder) {
      return {
        orderId: existingOrder.id,
        orderNumber: existingOrder.orderNumber,
        tableNumber: existingOrder.table.tableNumber,
        total: Number(existingOrder.total),
        currency: existingOrder.currency,
        status: existingOrder.status,
      };
    }
  }

  // 2. Execute transactional creation or consolidation with automatic retry
  const maxRetries = 5;
  let attempt = 0;

  while (true) {
    try {
      attempt++;
      const resultingOrder = await prisma.$transaction(
    async (tx) => {
      // A. Verify table exists and is active
      const table = await tx.cafeTable.findUnique({
        where: { id: validated.tableId },
      });

      if (!table || !table.isActive) {
        throw new Error('The selected table is currently not available for orders.');
      }

      // B. Find or create an active TableSession with its single consolidated order
      let activeSession = await tx.tableSession.findFirst({
        where: {
          tableId: table.id,
          status: SessionStatus.ACTIVE,
        },
        include: {
          order: {
            include: { items: true },
          },
        },
      });

      if (!activeSession) {
        try {
          activeSession = await tx.tableSession.create({
            data: {
              tableId: table.id,
              status: SessionStatus.ACTIVE,
            },
            include: {
              order: {
                include: { items: true },
              },
            },
          });
        } catch (error) {
          activeSession = await tx.tableSession.findFirst({
            where: {
              tableId: table.id,
              status: SessionStatus.ACTIVE,
            },
            include: {
              order: {
                include: { items: true },
              },
            },
          });

          if (!activeSession) {
            throw error;
          }
        }
      }

      // C. Authoritatively fetch current products from the database
      const itemIds = validated.items.map((i) => i.menuItemId);
      const menuProducts = await tx.menuItem.findMany({
        where: {
          id: { in: itemIds },
          isArchived: false,
        },
      });

      const productMap = new Map(menuProducts.map((p) => [p.id, p]));

      // Verify all products exist and are available
      for (const submittedItem of validated.items) {
        const product = productMap.get(submittedItem.menuItemId);

        if (!product) {
          throw new Error('One of the items in your order is no longer available.');
        }

        if (!product.isAvailable) {
          throw new Error(`"${product.name}" is currently sold out.`);
        }
      }

      // D. If the active session ALREADY has a consolidated order, ADD to it!
      if (activeSession.order) {
        const existingOrder = activeSession.order;

        for (const submittedItem of validated.items) {
          const product = productMap.get(submittedItem.menuItemId)!;
          const itemNotes = submittedItem.notes?.trim() || null;

          // Check if an existing line matches: same menuItemId, same notes, same unitPrice
          const matchingLine = existingOrder.items.find(
            (line) =>
              line.menuItemId === product.id &&
              (line.notes || null) === itemNotes &&
              Number(line.unitPrice) === Number(product.price)
          );

          if (matchingLine) {
            // Update quantity on existing line item
            const newQty = matchingLine.quantity + submittedItem.quantity;
            const newLineTotal = matchingLine.unitPrice.mul(newQty);
            await tx.orderItem.update({
              where: { id: matchingLine.id },
              data: {
                quantity: newQty,
                lineTotal: newLineTotal,
              },
            });
          } else {
            // Create new line item
            await tx.orderItem.create({
              data: {
                orderId: existingOrder.id,
                menuItemId: product.id,
                productName: product.name,
                unitPrice: product.price,
                quantity: submittedItem.quantity,
                lineTotal: product.price.mul(submittedItem.quantity),
                notes: itemNotes,
              },
            });
          }
        }

        // Recalculate total authoritatively from all items in DB
        const allItems = await tx.orderItem.findMany({
          where: { orderId: existingOrder.id },
        });

        const newTotal = allItems.reduce(
          (acc, item) => acc.add(item.lineTotal),
          new Prisma.Decimal(0)
        );

        const updatedNotes = [existingOrder.notes, validated.notes?.trim()]
          .filter(Boolean)
          .join(' | ');

        // If order was COMPLETED, reset to PENDING so barista sees additional items to prepare
        const nextStatus =
          existingOrder.status === OrderStatus.COMPLETED
            ? OrderStatus.PENDING
            : existingOrder.status;

        const updatedOrder = await tx.order.update({
          where: { id: existingOrder.id },
          data: {
            subtotal: newTotal,
            total: newTotal,
            notes: updatedNotes || null,
            status: nextStatus,
            paymentStatus: PaymentStatus.UNPAID, // Adding items requires payment
            statusHistory: {
              create: {
                toStatus: nextStatus,
                note: `Added ${validated.items.length} item(s) to consolidated order`,
              },
            },
          },
          include: {
            table: true,
            items: true,
          },
        });

        return updatedOrder;
      }

      // E. Otherwise, create the INITIAL consolidated order for this session
      let calculatedTotal = new Prisma.Decimal(0);
      const orderItemsToCreate = [];

      for (const submittedItem of validated.items) {
        const product = productMap.get(submittedItem.menuItemId)!;
        const quantity = submittedItem.quantity;
        const unitPrice = product.price; // authoritative DB price
        const lineTotal = unitPrice.mul(quantity);
        calculatedTotal = calculatedTotal.add(lineTotal);

        orderItemsToCreate.push({
          menuItemId: product.id,
          productName: product.name, // snapshot
          unitPrice: unitPrice, // snapshot
          quantity,
          lineTotal, // snapshot
          notes: submittedItem.notes?.trim() || null,
        });
      }

      // Generate unique order number (with retry on collision)
      let orderNumber = generateOrderNumber();
      let collisionCheck = await tx.order.findUnique({ where: { orderNumber } });
      while (collisionCheck) {
        orderNumber = generateOrderNumber();
        collisionCheck = await tx.order.findUnique({ where: { orderNumber } });
      }

      const order = await tx.order.create({
        data: {
          orderNumber,
          tableId: table.id,
          sessionId: activeSession.id,
          status: OrderStatus.PENDING,
          notes: validated.notes?.trim() || null,
          subtotal: calculatedTotal,
          total: calculatedTotal,
          currency: 'ETB',
          idempotencyKey: validated.idempotencyKey || null,
          items: {
            create: orderItemsToCreate,
          },
          statusHistory: {
            create: {
              toStatus: OrderStatus.PENDING,
              note: 'Order placed by customer',
            },
          },
        },
        include: {
          table: true,
          items: true,
        },
      });

      return order;
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      timeout: 15000,
    }
  );

      return {
        orderId: resultingOrder.id,
        orderNumber: resultingOrder.orderNumber,
        tableNumber: resultingOrder.table.tableNumber,
        total: Number(resultingOrder.total),
        currency: resultingOrder.currency,
        status: resultingOrder.status,
        items: resultingOrder.items.map((i) => ({
          name: i.productName,
          quantity: i.quantity,
          lineTotal: Number(i.lineTotal),
        })),
      };
    } catch (error: unknown) {
      const isRetryable =
        error &&
        typeof error === 'object' &&
        'code' in error &&
        (error.code === 'P2034' || error.code === '40001');

      if (isRetryable && attempt < maxRetries) {
        await new Promise((resolve) =>
          setTimeout(resolve, 60 * attempt + Math.floor(Math.random() * 60))
        );
        continue;
      }
      throw error;
    }
  }
}

/**
 * Updates an order's status with server-side lifecycle verification
 */
export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  note?: string,
  staffUser?: { id: string; name: string }
) {
  const staff = staffUser || (await requireRole([Role.BARISTA, Role.ADMIN]));

  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUniqueOrThrow({
      where: { id: orderId },
      include: { table: true },
    });

    const allowedNextStatuses = VALID_TRANSITIONS[order.status];
    if (!allowedNextStatuses.includes(newStatus)) {
      throw new Error(
        `Invalid status change: Cannot transition order ${order.orderNumber} from "${order.status}" to "${newStatus}".`
      );
    }

    const updated = await tx.order.update({
      where: { id: orderId },
      data: {
        status: newStatus,
        statusHistory: {
          create: {
            fromStatus: order.status,
            toStatus: newStatus,
            changedById: staff.id,
            note: note || `Status updated to ${newStatus} by ${staff.name}`,
          },
        },
      },
    });

    return updated;
  });
}

/**
 * Retrieves an order's live status for customer confirmation page
 */
export async function getPublicOrderStatus(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      table: { select: { tableNumber: true, displayName: true } },
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
      statusHistory: {
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { toStatus: true, createdAt: true, note: true },
      },
    },
  });

  if (!order) return null;

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    tableNumber: order.table.tableNumber,
    tableDisplayName: order.table.displayName,
    status: order.status,
    paymentStatus: order.paymentStatus,
    total: Number(order.total),
    currency: order.currency,
    createdAt: order.createdAt,
    items: order.items.map((i) => ({
      id: i.id,
      productName: i.productName,
      quantity: i.quantity,
      unitPrice: Number(i.unitPrice),
      lineTotal: Number(i.lineTotal),
      notes: i.notes,
    })),
    history: order.statusHistory,
  };
}
