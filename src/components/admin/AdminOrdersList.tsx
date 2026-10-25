'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  ChevronDown,
  ChevronUp,
  Receipt,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import ReceiptModal, { ReceiptData } from '@/components/receipt/ReceiptModal';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/lib/i18n/context';

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  notes?: string | null;
}

interface OrderHistoryRecord {
  id: string;
  orderNumber: string;
  sessionId?: string | null;
  tableNumber: string;
  status: string;
  paymentStatus: string;
  subtotal: number;
  total: number;
  currency: string;
  notes?: string | null;
  createdAt: string;
  items: OrderItem[];
  payments: Array<{
    id: string;
    amount: number;
    method: string;
    reference?: string | null;
    recordedByName: string;
  }>;
  statusHistory: Array<{
    id: string;
    fromStatus?: string | null;
    toStatus: string;
    note?: string | null;
    changedByName?: string | null;
    createdAt: string;
  }>;
}

export default function AdminOrdersList({
  initialOrders,
}: {
  initialOrders: OrderHistoryRecord[];
}) {
  const { dict, language, formatCurrency, translateMenuItem } = useLanguage();

  const [orders] = useState<OrderHistoryRecord[]>(initialOrders);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Receipt Modal State
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

  // Filter orders
  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchNumber = o.orderNumber.toLowerCase().includes(q);
        const matchTable = o.tableNumber.toLowerCase().includes(q);
        const matchItem = o.items.some((i) => {
          const localized = translateMenuItem(i.productName, null);
          return (
            i.productName.toLowerCase().includes(q) ||
            localized.name.toLowerCase().includes(q)
          );
        });
        if (!matchNumber && !matchTable && !matchItem) return false;
      }
      return true;
    });
  }, [orders, statusFilter, search, translateMenuItem]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, pageSize]);

  // Pagination Math
  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedOrders = filtered.slice(startIndex, endIndex);

  const formatStatus = (s: string) => {
    switch (s) {
      case 'PENDING':
        return dict.filterStatusPending;
      case 'PREPARING':
        return dict.filterStatusPreparing;
      case 'READY':
        return dict.stepReady;
      case 'COMPLETED':
        return dict.filterStatusCompleted;
      case 'CANCELLED':
        return dict.filterStatusCancelled;
      default:
        return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
    }
  };

  const showingEntriesText = dict.showingEntries
    .replace('{from}', totalItems === 0 ? '0' : String(startIndex + 1))
    .replace('{to}', String(endIndex))
    .replace('{total}', String(totalItems));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-medium text-[#F5F0EB]">
          {dict.ordersPageTitle}
        </h1>
        <p className="text-xs text-[#9E958C]">
          {dict.ordersPageSubtitle}
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#1E1A17] border border-[#2E2824] rounded-2xl p-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9E958C]" />
          <input
            type="text"
            placeholder={dict.searchOrdersPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#141210] border border-[#2E2824] text-[#F5F0EB] placeholder:text-[#9E958C]/50 text-xs rounded-xl pl-9 pr-3 py-2 focus:outline-hidden focus:border-[#10B981]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#141210] border border-[#2E2824] text-[#F5F0EB] rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-[#10B981]"
        >
          <option value="all">{dict.allStatuses}</option>
          <option value="PENDING">{dict.filterStatusPending}</option>
          <option value="PREPARING">{dict.filterStatusPreparing}</option>
          <option value="COMPLETED">{dict.filterStatusCompleted}</option>
          <option value="CANCELLED">{dict.filterStatusCancelled}</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-[#1E1A17] border border-[#2E2824] rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#241F1C] text-[#9E958C] border-b border-[#2E2824]">
              <tr>
                <th className="px-4 py-3 font-medium">{dict.thOrderNumber}</th>
                <th className="px-4 py-3 font-medium">{dict.thTable}</th>
                <th className="px-4 py-3 font-medium">{dict.thItemsSummary}</th>
                <th className="px-4 py-3 font-medium">{dict.thStatus}</th>
                <th className="px-4 py-3 font-medium">{dict.thPayment}</th>
                <th className="px-4 py-3 font-medium">{dict.thTotal}</th>
                <th className="px-4 py-3 font-medium">{dict.thTime}</th>
                <th className="px-4 py-3 font-medium text-right">{dict.thDetails}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2E2824]">
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-[#9E958C]">
                    {dict.noOrdersFound}
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => {
                  const isExpanded = expandedId === order.id;

                  return (
                    <React.Fragment key={order.id}>
                      <tr
                        onClick={() => setExpandedId(isExpanded ? null : order.id)}
                        className="hover:bg-[#241F1C]/40 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-3 font-mono font-medium text-[#F5F0EB]">
                          {order.orderNumber}
                        </td>
                        <td className="px-4 py-3 font-medium text-[#10B981]">
                          {dict.table} {order.tableNumber}
                        </td>
                        <td className="px-4 py-3 text-[#9E958C] max-w-xs truncate">
                          {order.items
                            .map(
                              (i) =>
                                `${i.quantity}× ${
                                  translateMenuItem(i.productName, null).name
                                }`
                            )
                            .join(', ')}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[11px] font-medium bg-[#241F1C] text-[#F5F0EB] border border-[#2E2824] px-2 py-0.5 rounded-md">
                            {formatStatus(order.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${
                              order.paymentStatus === 'PAID'
                                ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40'
                                : 'bg-amber-950/40 text-amber-400 border border-amber-800/40'
                            }`}
                          >
                            {order.paymentStatus === 'PAID'
                              ? dict.orderPaid
                              : dict.orderUnpaid}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-[#F5F0EB]">
                          {order.total.toFixed(2)} {formatCurrency(order.currency)}
                        </td>
                        <td className="px-4 py-3 text-[#9E958C]">
                          {new Date(order.createdAt).toLocaleTimeString(
                            language === 'am' ? 'am-ET' : 'en-US',
                            {
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            className="p-1.5 rounded-lg text-[#9E958C] hover:text-[#F5F0EB] hover:bg-[#2E2824] transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Order Audit Details */}
                      {isExpanded && (
                        <tr className="bg-[#241F1C]/50">
                          <td colSpan={8} className="p-4 border-y border-[#2E2824]">
                            <div className="space-y-4 max-w-3xl">
                              {/* Order Actions */}
                              {order.sessionId && (
                                <div className="flex justify-end">
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    icon={<Receipt className="w-3.5 h-3.5" />}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setReceiptData({
                                        orderNumber: order.orderNumber,
                                        tableNumber: order.tableNumber,
                                        createdAt: order.createdAt,
                                        items: order.items.map((i) => ({
                                          name: translateMenuItem(i.productName, null).name,
                                          quantity: i.quantity,
                                          unitPrice: i.unitPrice,
                                          lineTotal: i.lineTotal,
                                        })),
                                        subtotal: order.subtotal,
                                        total: order.total,
                                        currency: order.currency,
                                        paymentStatus: order.paymentStatus,
                                        cafeName: 'Barch Coffee',
                                      });
                                    }}
                                  >
                                    {dict.viewConsolidatedReceipt}
                                  </Button>
                                </div>
                              )}

                              {/* Order Items Breakdown */}
                              <div>
                                <h4 className="text-[11px] font-medium text-[#9E958C] mb-2">
                                  {dict.itemsSnapshotAtOrder}
                                </h4>
                                <div className="bg-[#1E1A17] border border-[#2E2824] rounded-xl divide-y divide-[#2E2824] text-xs">
                                  {order.items.map((i) => {
                                    const localizedItem = translateMenuItem(i.productName, null);
                                    return (
                                      <div
                                        key={i.id}
                                        className="px-3 py-2.5 flex items-center justify-between"
                                      >
                                        <div>
                                          <span className="font-medium text-[#F5F0EB]">
                                            {i.quantity}× {localizedItem.name}
                                          </span>
                                          <span className="text-[#9E958C] text-[11px] ml-2">
                                            (@{i.unitPrice.toFixed(2)} {formatCurrency(order.currency)})
                                          </span>
                                          {i.notes && (
                                            <p className="text-[11px] text-[#9E958C] italic">
                                              {dict.noteLabel} {i.notes}
                                            </p>
                                          )}
                                        </div>
                                        <span className="font-medium text-[#F5F0EB]">
                                          {i.lineTotal.toFixed(2)} {formatCurrency(order.currency)}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Order Status History Audit Trail */}
                              {order.statusHistory.length > 0 && (
                                <div>
                                  <h4 className="text-[11px] font-medium text-[#9E958C] mb-2">
                                    {dict.statusAuditTrail}
                                  </h4>
                                  <div className="bg-[#1E1A17] border border-[#2E2824] rounded-xl p-3 text-xs space-y-2">
                                    {order.statusHistory.map((h) => (
                                      <div
                                        key={h.id}
                                        className="flex items-center justify-between text-[11px]"
                                      >
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium text-[#F5F0EB]">
                                            {h.fromStatus ? `${formatStatus(h.fromStatus)} → ` : ''}
                                            {formatStatus(h.toStatus)}
                                          </span>
                                          {h.note && (
                                            <span className="text-[#9E958C]">
                                              ({h.note})
                                            </span>
                                          )}
                                        </div>
                                        <span className="text-[#9E958C]">
                                          {new Date(h.createdAt).toLocaleString(
                                            language === 'am' ? 'am-ET' : 'en-US'
                                          )}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalItems > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-[#241F1C] border-t border-[#2E2824] text-xs text-[#9E958C]">
            <div className="flex items-center gap-4">
              <span>{showingEntriesText}</span>
              <div className="flex items-center gap-1.5">
                <label htmlFor="pageSizeSelect" className="text-[11px] text-[#9E958C]">
                  {dict.perPage}
                </label>
                <select
                  id="pageSizeSelect"
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="bg-[#1E1A17] border border-[#2E2824] text-[#F5F0EB] rounded-lg px-2 py-1 text-xs focus:outline-hidden focus:border-[#10B981]"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safeCurrentPage <= 1}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#2E2824] bg-[#1E1A17] hover:bg-[#2E2824] text-[#F5F0EB] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>{dict.previousPage}</span>
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, idx) => idx + 1)
                  .filter((page) => {
                    if (totalPages <= 7) return true;
                    if (page === 1 || page === totalPages) return true;
                    if (Math.abs(page - safeCurrentPage) <= 1) return true;
                    return false;
                  })
                  .map((page, index, array) => {
                    const prev = array[index - 1];
                    const isGap = prev && page - prev > 1;

                    return (
                      <React.Fragment key={page}>
                        {isGap && <span className="px-1 text-[#9E958C]">...</span>}
                        <button
                          type="button"
                          onClick={() => setCurrentPage(page)}
                          className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                            safeCurrentPage === page
                              ? 'bg-[#10B981] text-[#141210] font-semibold'
                              : 'bg-[#1E1A17] text-[#9E958C] hover:text-[#F5F0EB] hover:bg-[#2E2824] border border-[#2E2824]'
                          }`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    );
                  })}
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safeCurrentPage >= totalPages}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#2E2824] bg-[#1E1A17] hover:bg-[#2E2824] text-[#F5F0EB] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <span>{dict.nextPage}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Consolidated Receipt Modal */}
      {receiptData && (
        <ReceiptModal
          data={receiptData}
          onClose={() => setReceiptData(null)}
        />
      )}
    </div>
  );
}
