/**
 * Comprehensive workflow verification script for Barch Coffee.
 * Tests core business logic, database transactions, table session lifecycle,
 * order creation, financial calculations, and security constraints.
 */
import { prisma } from '../src/lib/prisma';
import { verifyPassword } from '../src/lib/auth/password';
import { resolveTableForCustomer, generateTableQrUrl } from '../src/lib/tables';
import { createCustomerOrder, updateOrderStatus } from '../src/lib/orders';
import { calculateSessionBalance, recordPayment, canCloseTableSession, closeTableSession } from '../src/lib/payments';
import { fetchPublicMenuData } from '../src/lib/menu';
import { invalidateAllUserSessions } from '../src/lib/auth/session';

async function runTests() {
  console.log('--- Starting Barch Coffee Business Logic Verification ---\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, errorDetail?: unknown) {
    if (condition) {
      console.log(`  [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${testName}`, errorDetail || '');
      failed++;
    }
  }

  try {
    // 1. AUTHENTICATION & PASSWORD TESTS
    console.log('1. Testing Authentication & Password Hashing:');
    const adminUser = await prisma.user.findUnique({ where: { email: 'admin@barchcoffee.com' } });
    assert(adminUser !== null, 'Admin user exists in database');
    
    if (adminUser) {
      const validPass = await verifyPassword('BarchAdmin2026!Secure', adminUser.passwordHash);
      assert(validPass, 'Valid admin password successfully verified with Argon2id');

      const invalidPass = await verifyPassword('WrongPassword123!', adminUser.passwordHash);
      assert(!invalidPass, 'Invalid password correctly rejected');
    }

    // Test session invalidation
    if (adminUser) {
      // Create a test session
      const testTokenHash = 'test_token_hash_' + Date.now();
      await prisma.authSession.create({
        data: {
          tokenHash: testTokenHash,
          userId: adminUser.id,
          expiresAt: new Date(Date.now() + 86400000),
        },
      });
      await invalidateAllUserSessions(adminUser.id);
      const remainingSessions = await prisma.authSession.findMany({ where: { userId: adminUser.id } });
      assert(remainingSessions.length === 0, 'Password change invalidates all active user sessions');
    }

    // 2. TABLE RESOLUTION & QR URL TESTS
    console.log('\n2. Testing Table Management & QR URLs:');
    const table1 = await prisma.cafeTable.findUnique({ where: { tableNumber: 'T-01' } });
    assert(table1 !== null && table1.isActive, 'Active table T-01 exists in database');

    if (table1) {
      const qrUrl = generateTableQrUrl(table1.id, 'https://barchcoffee.com');
      assert(qrUrl === `https://barchcoffee.com/menu?table=${table1.id}`, 'QR URL generates with stable database ID');

      const resolvedById = await resolveTableForCustomer(table1.id);
      assert(resolvedById?.id === table1.id, 'Table resolves successfully by database ID');

      const resolvedByNum = await resolveTableForCustomer('T-01');
      assert(resolvedByNum?.id === table1.id, 'Table resolves successfully by table number');

      const resolvedNonExistent = await resolveTableForCustomer('NON-EXISTENT-ID');
      assert(resolvedNonExistent === null, 'Non-existent table returns null');
    }

    // 3. MENU INTEGRITY & AVAILABILITY TESTS
    console.log('\n3. Testing Menu & Pricing Integrity:');
    const menuData = await fetchPublicMenuData();
    assert(menuData.length > 0, 'Public menu returns categorized structure');
    
    // Find an active item
    const pourOver = await prisma.menuItem.findFirst({ where: { name: { contains: 'Pour-Over' } } });
    assert(pourOver !== null && pourOver.isAvailable, 'Yirgacheffe Pour-Over is active and available');

    // 4. TRANSACTIONAL ORDER CREATION TESTS
    console.log('\n4. Testing Order Creation & Integrity:');
    if (table1 && pourOver && adminUser) {
      // Ensure pristine table session for isolated test run
      await prisma.tableSession.updateMany({
        where: { tableId: table1.id, status: 'ACTIVE' },
        data: { status: 'CLOSED', closedAt: new Date() },
      });

      const idempotencyKey = `test-order-${Date.now()}`;
      
      // Order created on server
      const createdOrderResult = await createCustomerOrder({
        tableId: table1.id,
        items: [
          { menuItemId: pourOver.id, quantity: 2, notes: 'Hot, no sugar' },
        ],
        notes: 'Please serve quickly',
        idempotencyKey,
      });

      assert(createdOrderResult.orderNumber.startsWith('BC-'), 'Order assigned unique human-readable code: ' + createdOrderResult.orderNumber);
      assert(Boolean(createdOrderResult.items && createdOrderResult.items.length === 1), 'Order has 1 line item with quantity 2');
      assert(createdOrderResult.total === Number(pourOver.price) * 2, 'Total amount correctly calculated on server');
      assert(Boolean(createdOrderResult.items && createdOrderResult.items[0]?.name === pourOver.name), 'Product name snapshotted into order history');
      assert(createdOrderResult.status === 'PENDING', 'Initial order status is PENDING');

      // Query database record directly to verify snapshots
      const dbOrder = await prisma.order.findUniqueOrThrow({
        where: { id: createdOrderResult.orderId },
        include: { items: true },
      });
      assert(Number(dbOrder.items[0].unitPrice) === Number(pourOver.price), 'Order item snapshots original unit price in database');
      assert(dbOrder.sessionId !== null, 'Order is linked to active TableSession');

      // Test idempotency: submitting same idempotency key returns identical order without duplication
      const duplicateOrder = await createCustomerOrder({
        tableId: table1.id,
        items: [
          { menuItemId: pourOver.id, quantity: 2, notes: 'Hot, no sugar' },
        ],
        notes: 'Please serve quickly',
        idempotencyKey,
      });
      assert(duplicateOrder.orderId === createdOrderResult.orderId, 'Idempotency key prevents duplicate order creation');

      // 5. BARISTA ORDER LIFECYCLE TESTS
      console.log('\n5. Testing Barista Order Lifecycle Status Transitions:');
      const staffActor = { id: adminUser.id, name: adminUser.name };

      const orderConfirmed = await updateOrderStatus(dbOrder.id, 'CONFIRMED', undefined, staffActor);
      assert(orderConfirmed.status === 'CONFIRMED', 'Order status transitioned PENDING -> CONFIRMED');

      const orderPrep = await updateOrderStatus(dbOrder.id, 'PREPARING', undefined, staffActor);
      assert(orderPrep.status === 'PREPARING', 'Order status transitioned CONFIRMED -> PREPARING');

      const orderReady = await updateOrderStatus(dbOrder.id, 'READY', undefined, staffActor);
      assert(orderReady.status === 'READY', 'Order status transitioned PREPARING -> READY');

      // 6. PAYMENT RECORDING & TABLE SESSION CLOSURE
      console.log('\n6. Testing Table Session Financials & Closure:');
      const session = await prisma.tableSession.findUnique({
        where: { id: dbOrder.sessionId },
      });
      assert(session !== null && session.status === 'ACTIVE', 'Order is linked to active TableSession');

      if (session) {
        // Calculate balance before payment
        const balanceBefore = await calculateSessionBalance(session.id);
        const expectedTotal = Number(pourOver.price) * 2;
        assert(balanceBefore.totalOrderAmount === expectedTotal, 'Session total equals order amount');
        assert(balanceBefore.totalPaid === 0, 'Session initial paid amount is 0');
        assert(balanceBefore.outstandingBalance === expectedTotal, 'Outstanding balance equals total order amount');

        // Verify session cannot be closed while unpaid and uncompleted
        const closureCheckBefore = await canCloseTableSession(session.id);
        assert(!closureCheckBefore.allowed, 'Table session closure blocked when balance is unpaid');

        // Complete the order first
        await updateOrderStatus(dbOrder.id, 'COMPLETED', undefined, staffActor);

        // Still blocked due to unpaid balance
        const closureCheckUnpaid = await canCloseTableSession(session.id);
        assert(
          !closureCheckUnpaid.allowed && Boolean(closureCheckUnpaid.reason?.includes('Outstanding unpaid balance')),
          'Closure blocked with message: ' + closureCheckUnpaid.reason
        );

        // Record payment
        const payment = await recordPayment({
          sessionId: session.id,
          amount: expectedTotal,
          method: 'CASH',
          notes: 'Exact cash given by customer',
        }, staffActor);
        assert(payment.id !== undefined, 'Payment recorded successfully');

        // Recheck balance after payment
        const balanceAfter = await calculateSessionBalance(session.id);
        assert(balanceAfter.totalPaid === expectedTotal, 'Session total paid updated to ' + expectedTotal);
        assert(balanceAfter.outstandingBalance === 0, 'Outstanding balance is now 0 ETB');
        assert(balanceAfter.paymentStatus === 'PAID', 'Session payment status updated to PAID');

        // Now closure should be allowed
        const closureCheckAfter = await canCloseTableSession(session.id);
        assert(closureCheckAfter.allowed, 'Table session closure now allowed');

        // Close the session
        const closedSession = await closeTableSession(session.id, 'Session completed and paid', staffActor);
        assert(closedSession.status === 'CLOSED', 'Table session successfully transitioned to CLOSED');
        assert(closedSession.closedAt !== null, 'Table session has closedAt timestamp recorded');

        // Verify table is now ready for a new clean group
        const activeSessionsNow = await prisma.tableSession.findMany({
          where: { tableId: table1.id, status: 'ACTIVE' },
        });
        assert(activeSessionsNow.length === 0, 'Table has 0 active sessions after closure');
      }

      // 7. CONSOLIDATED TABLE SESSION & MERGING LINE ITEMS TESTS
      console.log('\n7. Testing Consolidated Table Session & Line Item Merging:');
      const table2 = await prisma.cafeTable.findFirst({ where: { tableNumber: 'T-02' } });
      const menuItems = await prisma.menuItem.findMany({ where: { isAvailable: true }, take: 3 });
      assert(table2 !== null && menuItems.length >= 2, 'Found Table T-02 and at least 2 active menu items');

      if (table2 && menuItems.length >= 2) {
        const itemA = menuItems[0];
        const itemB = menuItems[1];

        // Clean any active sessions on T-02
        await prisma.tableSession.updateMany({
          where: { tableId: table2.id, status: 'ACTIVE' },
          data: { status: 'CLOSED', closedAt: new Date() },
        });

        // Step 1: Initial customer order: 2x itemA with note "Extra hot"
        const initialOrder = await createCustomerOrder({
          tableId: table2.id,
          items: [{ menuItemId: itemA.id, quantity: 2, notes: 'Extra hot' }],
          notes: 'Session consolidated order test',
        });

        assert(initialOrder.orderId !== undefined, 'Initial customer order created');
        const sessionAfterInitial = await prisma.tableSession.findFirstOrThrow({
          where: { tableId: table2.id, status: 'ACTIVE' },
          include: { order: { include: { items: true } } },
        });
        assert(sessionAfterInitial.order !== null, 'Table session has exactly 1 consolidated order');
        assert(sessionAfterInitial.order?.items.length === 1, 'Consolidated order has 1 line item initially');
        assert(sessionAfterInitial.order?.items[0].quantity === 2, 'Line item has quantity 2');

        // Step 2: Later, customer adds 1x itemB
        const secondAddition = await createCustomerOrder({
          tableId: table2.id,
          items: [{ menuItemId: itemB.id, quantity: 1, notes: null }],
        });

        assert(
          secondAddition.orderId === initialOrder.orderId,
          'Additional items added to active session reuse same consolidated order ID'
        );

        const sessionAfterSecond = await prisma.tableSession.findFirstOrThrow({
          where: { tableId: table2.id, status: 'ACTIVE' },
          include: { order: { include: { items: true } } },
        });
        assert(sessionAfterSecond.order?.items.length === 2, 'Consolidated order now has 2 distinct line items');
        const expectedTotal2 = Number(itemA.price) * 2 + Number(itemB.price) * 1;
        assert(
          Number(sessionAfterSecond.order?.total) === expectedTotal2,
          `Consolidated total correctly recalculated: ${expectedTotal2} ETB`
        );

        // Step 3: Customer adds 1 more itemA with the SAME note "Extra hot"
        // MUST update quantity to 3 rather than creating a duplicate line item
        await createCustomerOrder({
          tableId: table2.id,
          items: [{ menuItemId: itemA.id, quantity: 1, notes: 'Extra hot' }],
        });

        const sessionAfterThird = await prisma.tableSession.findFirstOrThrow({
          where: { tableId: table2.id, status: 'ACTIVE' },
          include: { order: { include: { items: true } } },
        });
        assert(
          sessionAfterThird.order?.items.length === 2,
          'Existing line item quantity updated instead of creating duplicate line'
        );
        const itemALine = sessionAfterThird.order?.items.find((i: { productName: string; notes?: string | null; quantity: number }) => i.productName === itemA.name && i.notes === 'Extra hot');
        assert(itemALine?.quantity === 3, 'Line item quantity correctly incremented from 2 to 3');

        // Step 4: Customer adds 1 itemA with a DIFFERENT note "Iced with oat milk"
        // MUST create a distinct line item to preserve meaningful customization
        await createCustomerOrder({
          tableId: table2.id,
          items: [{ menuItemId: itemA.id, quantity: 1, notes: 'Iced with oat milk' }],
        });

        const sessionAfterFourth = await prisma.tableSession.findFirstOrThrow({
          where: { tableId: table2.id, status: 'ACTIVE' },
          include: { order: { include: { items: true } } },
        });
        assert(
          sessionAfterFourth.order?.items.length === 3,
          'Distinct line item created and preserved when notes/customizations differ'
        );

        // Step 5: Concurrent item additions
        console.log('\n8. Testing Concurrent Item Additions:');
        const [conc1, conc2] = await Promise.all([
          createCustomerOrder({
            tableId: table2.id,
            items: [{ menuItemId: itemB.id, quantity: 1, notes: 'Concurrent request 1' }],
          }),
          createCustomerOrder({
            tableId: table2.id,
            items: [{ menuItemId: itemB.id, quantity: 2, notes: 'Concurrent request 2' }],
          }),
        ]);

        assert(conc1.orderId === initialOrder.orderId && conc2.orderId === initialOrder.orderId, 'Both concurrent additions merged into same order');
        const sessionAfterConcurrent = await prisma.tableSession.findFirstOrThrow({
          where: { tableId: table2.id, status: 'ACTIVE' },
          include: { order: { include: { items: true } } },
        });
        const hasReq1 = sessionAfterConcurrent.order?.items.some((i: { notes?: string | null }) => i.notes === 'Concurrent request 1');
        const hasReq2 = sessionAfterConcurrent.order?.items.some((i: { notes?: string | null }) => i.notes === 'Concurrent request 2');
        assert(Boolean(hasReq1 && hasReq2), 'Neither concurrent item addition was overwritten');

        // Step 6: Barista 3-action workflow
        console.log('\n9. Testing Simplified Barista 3-Action Workflow:');
        const staffActor2 = { id: adminUser.id, name: adminUser.name };
        const orderId = initialOrder.orderId;

        // Action 1: Accept order (PENDING -> PREPARING)
        const accepted = await updateOrderStatus(orderId, 'PREPARING', undefined, staffActor2);
        assert(accepted.status === 'PREPARING', 'Action 1: Barista accepts order (transitioned to PREPARING)');

        // Action 2: Complete order (PREPARING -> COMPLETED)
        const completed = await updateOrderStatus(orderId, 'COMPLETED', undefined, staffActor2);
        assert(completed.status === 'COMPLETED', 'Action 2: Barista completes order (transitioned to COMPLETED)');
        assert(completed.paymentStatus !== 'PAID', 'Completing order does NOT automatically mark it as paid');

        // Verify closure blocked while unpaid
        const blockedClosure = await canCloseTableSession(sessionAfterConcurrent.id);
        assert(!blockedClosure.allowed, 'Table session cannot be closed while balance remains unpaid');

        // Action 3: Payment received
        const balanceToPay = await calculateSessionBalance(sessionAfterConcurrent.id);
        const paymentRecord = await recordPayment({
          sessionId: sessionAfterConcurrent.id,
          amount: balanceToPay.outstandingBalance,
          method: 'OTHER',
          notes: 'Customer paid via Telebirr',
        }, staffActor2);
        assert(paymentRecord.id !== undefined, 'Action 3: Payment received and recorded in database');

        const balancePaid = await calculateSessionBalance(sessionAfterConcurrent.id);
        assert(balancePaid.outstandingBalance === 0 && balancePaid.paymentStatus === 'PAID', 'Balance is 0 and status is PAID');

        // Test duplicate payment prevention
        let duplicatePrevented = false;
        try {
          await recordPayment({
            sessionId: sessionAfterConcurrent.id,
            amount: 50,
            method: 'CASH',
          }, staffActor2);
        } catch {
          duplicatePrevented = true;
        }
        assert(duplicatePrevented, 'Accidental duplicate payment recording is strictly prevented');

        // Close session
        const closed = await closeTableSession(sessionAfterConcurrent.id, 'Finished service', staffActor2);
        assert(closed.status === 'CLOSED', 'Table session successfully closed');

        // Step 7: Verify new session for next customer and historical preservation
        console.log('\n10. Testing Table Availability for New Group & Historical Preservation:');
        const newCustomerOrder = await createCustomerOrder({
          tableId: table2.id,
          items: [{ menuItemId: itemA.id, quantity: 1 }],
        });
        assert(newCustomerOrder.orderId !== initialOrder.orderId, 'New customer at same table gets a brand new consolidated order');

        // Historical closed session and orders remain intact
        const historicalSession = await prisma.tableSession.findUniqueOrThrow({
          where: { id: sessionAfterConcurrent.id },
          include: { order: { include: { items: true } }, payments: true },
        });
        assert(historicalSession.status === 'CLOSED', 'Historical session remains CLOSED');
        assert(historicalSession.order?.id === initialOrder.orderId, 'Historical order and items remain intact');
        assert(historicalSession.payments.length === 1, 'Historical payment record remains intact');

        // Clean up new customer test session
        await prisma.tableSession.updateMany({
          where: { tableId: table2.id, status: 'ACTIVE' },
          data: { status: 'CLOSED', closedAt: new Date() },
        });
      }
    }

    console.log(`\n========================================`);
    console.log(`Total tests: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
    console.log(`========================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal error during test run:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
