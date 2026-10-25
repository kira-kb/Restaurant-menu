import Link from 'next/link';
import prisma from '@/lib/prisma';
import { ArrowRight, Coffee } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const [activeOrders, pendingCount, preparingCount, activeTablesCount, recentOrders] =
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-[#F5F0EB]">Cafe operations</h1>
        <p className="text-xs text-[#9E958C]">
          Live summary of active orders, table sessions, and recent customer submissions.
        </p>
      </div>

      {/* Operations Overview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#1E1A17] border border-[#2E2824] rounded-2xl p-4 space-y-1">
          <span className="text-[11px] font-medium text-[#9E958C] block">
            Orders in queue
          </span>
          <span className="text-2xl font-semibold text-[#F5F0EB] block">
            {activeOrders}
          </span>
        </div>

        <div className="bg-[#1E1A17] border border-[#2E2824] rounded-2xl p-4 space-y-1">
          <span className="text-[11px] font-medium text-[#9E958C] block">
            Awaiting acceptance
          </span>
          <span className="text-2xl font-semibold text-[#E06D53] block">
            {pendingCount}
          </span>
        </div>

        <div className="bg-[#1E1A17] border border-[#2E2824] rounded-2xl p-4 space-y-1">
          <span className="text-[11px] font-medium text-[#9E958C] block">
            Currently brewing
          </span>
          <span className="text-2xl font-semibold text-amber-400 block">
            {preparingCount}
          </span>
        </div>

        <div className="bg-[#1E1A17] border border-[#2E2824] rounded-2xl p-4 space-y-1">
          <span className="text-[11px] font-medium text-[#9E958C] block">
            Active table sessions
          </span>
          <span className="text-2xl font-semibold text-[#10B981] block">
            {activeTablesCount}
          </span>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Link
          href="/barista/orders"
          className="bg-[#1E1A17] border border-[#2E2824] hover:border-[#4A3F38] rounded-2xl p-4 flex items-center justify-between transition-colors group"
        >
          <div className="space-y-1">
            <span className="text-xs font-semibold text-[#F5F0EB] block">
              Barista counter
            </span>
            <span className="text-[11px] text-[#9E958C] block">
              Manage live incoming queue & prepare drinks
            </span>
          </div>
          <ArrowRight className="w-4 h-4 text-[#7E756C] group-hover:text-[#10B981] transition-colors" />
        </Link>

        <Link
          href="/admin/audit"
          className="bg-[#1E1A17] border border-[#2E2824] hover:border-[#4A3F38] rounded-2xl p-4 flex items-center justify-between transition-colors group"
        >
          <div className="space-y-1">
            <span className="text-xs font-semibold text-[#F5F0EB] block">
              Barista audit
            </span>
            <span className="text-[11px] text-[#9E958C] block">
              Today&apos;s shift logs & paginated history
            </span>
          </div>
          <ArrowRight className="w-4 h-4 text-[#7E756C] group-hover:text-[#10B981] transition-colors" />
        </Link>

        <Link
          href="/admin/tables"
          className="bg-[#1E1A17] border border-[#2E2824] hover:border-[#4A3F38] rounded-2xl p-4 flex items-center justify-between transition-colors group"
        >
          <div className="space-y-1">
            <span className="text-xs font-semibold text-[#F5F0EB] block">
              Tables & QR codes
            </span>
            <span className="text-[11px] text-[#9E958C] block">
              Generate QR ordering codes and monitor tables
            </span>
          </div>
          <ArrowRight className="w-4 h-4 text-[#7E756C] group-hover:text-[#10B981] transition-colors" />
        </Link>

        <Link
          href="/admin/menu"
          className="bg-[#1E1A17] border border-[#2E2824] hover:border-[#4A3F38] rounded-2xl p-4 flex items-center justify-between transition-colors group"
        >
          <div className="space-y-1">
            <span className="text-xs font-semibold text-[#F5F0EB] block">
              Menu management
            </span>
            <span className="text-[11px] text-[#9E958C] block">
              Set seasonal roasts, prices, and photo links
            </span>
          </div>
          <ArrowRight className="w-4 h-4 text-[#7E756C] group-hover:text-[#10B981] transition-colors" />
        </Link>
      </div>

      {/* Recent Orders Stream */}
      <div className="bg-[#1E1A17] border border-[#2E2824] rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-[#2E2824] flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[#F5F0EB]">Recent orders</h2>
            <p className="text-[11px] text-[#9E958C]">
              Latest orders received across cafe tables
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs text-[#10B981] hover:underline flex items-center gap-1 font-medium"
          >
            <span>View all orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#9E958C] space-y-1">
            <Coffee className="w-6 h-6 text-[#7E756C] mx-auto opacity-40" />
            <p>No recent orders found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#241F1C] text-[#9E958C] border-b border-[#2E2824]">
                <tr>
                  <th className="px-4 py-3 font-medium">Order number</th>
                  <th className="px-4 py-3 font-medium">Table</th>
                  <th className="px-4 py-3 font-medium">Items</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#24201D]">
                {recentOrders.map((order) => {
                  const itemsSummary = order.items
                    .map((i) => `${i.quantity}× ${i.productName}`)
                    .join(', ');

                  return (
                    <tr key={order.id} className="hover:bg-[#241F1C]/50 transition-colors">
                      <td className="px-4 py-3 font-mono font-medium text-[#F5F0EB]">
                        {order.orderNumber}
                      </td>
                      <td className="px-4 py-3 font-medium text-[#10B981]">
                        Table {order.table.tableNumber}
                      </td>
                      <td className="px-4 py-3 text-[#9E958C] max-w-xs truncate">
                        {itemsSummary}
                      </td>
                      <td className="px-4 py-3 font-semibold text-[#E06D53]">
                        {Number(order.total).toFixed(2)} {order.currency}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${
                            order.status === 'COMPLETED'
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : order.status === 'PENDING'
                              ? 'bg-[#E06D53]/15 text-[#E06D53] border-[#E06D53]/30'
                              : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                          }`}
                        >
                          {order.status.toLowerCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-[11px] text-[#7E756C]">
                        {new Date(order.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
