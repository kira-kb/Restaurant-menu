'use client';

import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp, Receipt } from 'lucide-react';
import ReceiptModal, { ReceiptData } from '@/components/receipt/ReceiptModal';
import { Button } from '@/components/ui/Button';

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
  const [orders] = useState<OrderHistoryRecord[]>(initialOrders);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Receipt Modal State
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

  const filtered = orders.filter((o) => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchNumber = o.orderNumber.toLowerCase().includes(q);
      const matchTable = o.tableNumber.toLowerCase().includes(q);
      const matchItem = o.items.some((i) => i.productName.toLowerCase().includes(q));
      if (!matchNumber && !matchTable && !matchItem) return false;
    }
    return true;
  });

  const formatStatus = (s: string) => {
    switch (s) {
      case 'PENDING':
        return 'Pending';
      case 'PREPARING':
        return 'Preparing';
      case 'COMPLETED':
        return 'Completed';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#1E1A17] border border-[#2E2824] rounded-2xl p-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9E958C]" />
          <input
            type="text"
            placeholder="Search order number, table, or drink..."
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
          <option value="all">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="PREPARING">Preparing</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-[#1E1A17] border border-[#2E2824] rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#241F1C] text-[#9E958C] border-b border-[#2E2824]">
              <tr>
                <th className="px-4 py-3 font-medium">Order number</th>
                <th className="px-4 py-3 font-medium">Table</th>
                <th className="px-4 py-3 font-medium">Items summary</th>
                <th className="px-4 py-3 font-medium">Order status</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Time</th>
                <th className="px-4 py-3 font-medium text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2E2824]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-[#9E958C]">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((order) => {
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
                          Table {order.tableNumber}
                        </td>
                        <td className="px-4 py-3 text-[#9E958C] max-w-xs truncate">
                          {order.items
                            .map((i) => `${i.quantity}× ${i.productName}`)
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
                            {order.paymentStatus === 'PAID' ? 'Paid' : 'Unpaid'}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-[#F5F0EB]">
                          {order.total.toFixed(2)} {order.currency}
                        </td>
                        <td className="px-4 py-3 text-[#9E958C]">
                          {new Date(order.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
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
                                          name: i.productName,
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
                                    View consolidated receipt
                                  </Button>
                                </div>
                              )}

                              {/* Order Items Breakdown */}
                              <div>
                                <h4 className="text-[11px] font-medium text-[#9E958C] mb-2">
                                  Items snapshot at order time
                                </h4>
                                <div className="bg-[#1E1A17] border border-[#2E2824] rounded-xl divide-y divide-[#2E2824] text-xs">
                                  {order.items.map((i) => (
                                    <div
                                      key={i.id}
                                      className="px-3 py-2.5 flex items-center justify-between"
                                    >
                                      <div>
                                        <span className="font-medium text-[#F5F0EB]">
                                          {i.quantity}× {i.productName}
                                        </span>
                                        <span className="text-[#9E958C] text-[11px] ml-2">
                                          (@{i.unitPrice.toFixed(2)})
                                        </span>
                                        {i.notes && (
                                          <p className="text-[11px] text-[#9E958C] italic">
                                            Note: {i.notes}
                                          </p>
                                        )}
                                      </div>
                                      <span className="font-medium text-[#F5F0EB]">
                                        {i.lineTotal.toFixed(2)} {order.currency}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Order Status History Audit Trail */}
                              {order.statusHistory.length > 0 && (
                                <div>
                                  <h4 className="text-[11px] font-medium text-[#9E958C] mb-2">
                                    Status transition audit trail
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
                                          {new Date(h.createdAt).toLocaleString()}
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
