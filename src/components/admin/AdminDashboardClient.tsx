'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Coffee } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';

export interface RecentOrderItem {
  quantity: number;
  productName: string;
}

export interface RecentOrderRecord {
  id: string;
  orderNumber: string;
  total: number;
  currency: string;
  status: string;
  createdAt: string;
  table: { tableNumber: string };
  items: RecentOrderItem[];
}

export interface AdminDashboardClientProps {
  stats: {
    activeOrders: number;
    pendingCount: number;
    preparingCount: number;
    activeTablesCount: number;
  };
  recentOrders: RecentOrderRecord[];
}

export default function AdminDashboardClient({
  stats,
  recentOrders,
}: AdminDashboardClientProps) {
  const { dict, formatCurrency, translateMenuItem } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-[#F5F0EB]">
          {dict.adminDashboardTitle}
        </h1>
        <p className="text-xs text-[#9E958C]">
          {dict.adminDashboardSubtitle}
        </p>
      </div>

      {/* Operations Overview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#1E1A17] border border-[#2E2824] rounded-2xl p-4 space-y-1">
          <span className="text-[11px] font-medium text-[#9E958C] block">
            {dict.ordersInQueue}
          </span>
          <span className="text-2xl font-semibold text-[#F5F0EB] block">
            {stats.activeOrders}
          </span>
        </div>

        <div className="bg-[#1E1A17] border border-[#2E2824] rounded-2xl p-4 space-y-1">
          <span className="text-[11px] font-medium text-[#9E958C] block">
            {dict.awaitingAcceptance}
          </span>
          <span className="text-2xl font-semibold text-[#E06D53] block">
            {stats.pendingCount}
          </span>
        </div>

        <div className="bg-[#1E1A17] border border-[#2E2824] rounded-2xl p-4 space-y-1">
          <span className="text-[11px] font-medium text-[#9E958C] block">
            {dict.currentlyBrewing}
          </span>
          <span className="text-2xl font-semibold text-amber-400 block">
            {stats.preparingCount}
          </span>
        </div>

        <div className="bg-[#1E1A17] border border-[#2E2824] rounded-2xl p-4 space-y-1">
          <span className="text-[11px] font-medium text-[#9E958C] block">
            {dict.activeTableSessions}
          </span>
          <span className="text-2xl font-semibold text-[#10B981] block">
            {stats.activeTablesCount}
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
              {dict.baristaCounter}
            </span>
            <span className="text-[11px] text-[#9E958C] block">
              {dict.baristaCounterDesc}
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
              {dict.adminAudit}
            </span>
            <span className="text-[11px] text-[#9E958C] block">
              {dict.baristaAuditDesc}
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
              {dict.adminTables}
            </span>
            <span className="text-[11px] text-[#9E958C] block">
              {dict.tablesAndQrDesc}
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
              {dict.menuManagementTitle}
            </span>
            <span className="text-[11px] text-[#9E958C] block">
              {dict.menuManagementDesc}
            </span>
          </div>
          <ArrowRight className="w-4 h-4 text-[#7E756C] group-hover:text-[#10B981] transition-colors" />
        </Link>
      </div>

      {/* Recent Orders Stream */}
      <div className="bg-[#1E1A17] border border-[#2E2824] rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-[#2E2824] flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[#F5F0EB]">
              {dict.recentOrdersTitle}
            </h2>
            <p className="text-[11px] text-[#9E958C]">
              {dict.recentOrdersSubtitle}
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs text-[#10B981] hover:underline flex items-center gap-1 font-medium"
          >
            <span>{dict.viewAllOrders}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#9E958C] space-y-1">
            <Coffee className="w-6 h-6 text-[#7E756C] mx-auto opacity-40" />
            <p>{dict.noRecentOrders}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#241F1C] text-[#9E958C] border-b border-[#2E2824]">
                <tr>
                  <th className="px-4 py-3 font-medium">{dict.thOrderNumber}</th>
                  <th className="px-4 py-3 font-medium">{dict.thTable}</th>
                  <th className="px-4 py-3 font-medium">{dict.thItems}</th>
                  <th className="px-4 py-3 font-medium">{dict.thTotal}</th>
                  <th className="px-4 py-3 font-medium">{dict.thStatus}</th>
                  <th className="px-4 py-3 font-medium text-right">{dict.thTime}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#24201D]">
                {recentOrders.map((order) => {
                  const itemsSummary = order.items
                    .map((i) => {
                      const localizedName = translateMenuItem(i.productName, null).name;
                      return `${i.quantity}× ${localizedName}`;
                    })
                    .join(', ');

                  const activeCurrency = formatCurrency(order.currency);

                  const statusLabel =
                    order.status === 'COMPLETED'
                      ? dict.completedFilter
                      : order.status === 'PENDING'
                      ? dict.pendingFilter
                      : order.status === 'PREPARING'
                      ? dict.preparingFilter
                      : order.status === 'READY'
                      ? dict.readyFilter
                      : order.status.toLowerCase();

                  return (
                    <tr key={order.id} className="hover:bg-[#241F1C]/50 transition-colors">
                      <td className="px-4 py-3 font-mono font-medium text-[#F5F0EB]">
                        {order.orderNumber}
                      </td>
                      <td className="px-4 py-3 font-medium text-[#10B981]">
                        {dict.table} {order.table.tableNumber}
                      </td>
                      <td className="px-4 py-3 text-[#9E958C] max-w-xs truncate">
                        {itemsSummary}
                      </td>
                      <td className="px-4 py-3 font-semibold text-[#E06D53]">
                        {Number(order.total).toFixed(2)} {activeCurrency}
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
                          {statusLabel}
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
