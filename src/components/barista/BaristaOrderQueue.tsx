'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Coffee,
  CheckCircle,
  Clock,
  Printer,
  DollarSign,
  AlertCircle,
  RefreshCw,
  Search,
  Check,
  Loader2,
  Lock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import ReceiptModal, { ReceiptData } from '@/components/receipt/ReceiptModal';
import { OrderStatus } from '@prisma/client';

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  notes?: string | null;
}

interface OrderData {
  id: string;
  orderNumber: string;
  tableId: string;
  tableNumber: string;
  tableDisplayName: string | null;
  sessionId: string;
  sessionStatus?: string;
  status: OrderStatus;
  paymentStatus: string;
  total: number;
  currency: string;
  notes?: string | null;
  createdAt: string;
  items: OrderItem[];
  sessionPaid: number;
}

interface BaristaOrderQueueProps {
  initialOrders: OrderData[];
  cafeName: string;
  currency: string;
  address?: string;
  phone?: string;
  receiptHeader?: string;
  receiptFooter?: string;
}

export default function BaristaOrderQueue({
  initialOrders,
  cafeName,
  currency,
  address,
  phone,
  receiptHeader,
  receiptFooter,
}: BaristaOrderQueueProps) {
  const [orders, setOrders] = useState<OrderData[]>(initialOrders);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('active');
  const [tableFilter, setTableFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Per-order action loading states: maps orderId -> 'accept' | 'complete' | 'payment' | 'close'
  const [loadingActions, setLoadingActions] = useState<Record<string, string>>({});
  const [actionError, setActionError] = useState<{ orderId: string; message: string } | null>(null);

  // Modals state
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

  // Polling logic to fetch fresh orders
  const fetchOrders = useCallback(async () => {
    if (document.hidden) return;
    try {
      const res = await fetch('/api/barista/orders');
      if (res.ok) {
        const data = await res.json();
        if (data.orders) {
          setOrders(data.orders);
        }
      }
    } catch (err) {
      console.error('Polling error:', err);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(fetchOrders, 4000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchOrders();
    setIsRefreshing(false);
  };

  // Helper to set action loading state for a specific order
  const setOrderActionLoading = (orderId: string, actionName: string | null) => {
    setLoadingActions((prev) => {
      if (!actionName) {
        const next = { ...prev };
        delete next[orderId];
        return next;
      }
      return { ...prev, [orderId]: actionName };
    });
  };

  // 1. ACTION: Accept Order (transitions PENDING -> PREPARING)
  const handleAcceptOrder = async (order: OrderData) => {
    if (loadingActions[order.id]) return;
    setOrderActionLoading(order.id, 'accept');
    setActionError(null);

    try {
      const res = await fetch(`/api/barista/orders/${order.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: OrderStatus.PREPARING }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to accept order.');
      }

      await fetchOrders();
    } catch (err: unknown) {
      setActionError({
        orderId: order.id,
        message: err instanceof Error ? err.message : 'Failed to accept order',
      });
    } finally {
      setOrderActionLoading(order.id, null);
    }
  };

  // 2. ACTION: Complete Order (transitions to COMPLETED - does not auto-mark paid)
  const handleCompleteOrder = async (order: OrderData) => {
    if (loadingActions[order.id]) return;
    setOrderActionLoading(order.id, 'complete');
    setActionError(null);

    try {
      const res = await fetch(`/api/barista/orders/${order.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: OrderStatus.COMPLETED }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to complete order.');
      }

      await fetchOrders();
    } catch (err: unknown) {
      setActionError({
        orderId: order.id,
        message: err instanceof Error ? err.message : 'Failed to complete order',
      });
    } finally {
      setOrderActionLoading(order.id, null);
    }
  };

  // 3. ACTION: Payment Received (records full payment in DB)
  const handlePaymentReceived = async (order: OrderData) => {
    if (loadingActions[order.id] || order.sessionStatus === 'CLOSED') return;
    setOrderActionLoading(order.id, 'payment');
    setActionError(null);

    try {
      const outstanding = Math.max(0, order.total - (order.sessionPaid || 0));
      if (outstanding <= 0 && order.paymentStatus === 'PAID') {
        // Already settled, no payment needed
        await fetchOrders();
        return;
      }
      const amountToPay = outstanding > 0 ? outstanding : order.total;

      const res = await fetch('/api/barista/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: order.sessionId,
          orderId: order.id,
          amount: amountToPay,
          method: 'CASH',
          notes: 'Cash payment received at counter',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        if (data.error?.includes('already closed') || data.error?.includes('already been recorded')) {
          setOrders((prev) =>
            prev.map((o) =>
              o.sessionId === order.sessionId
                ? { ...o, sessionStatus: 'CLOSED', paymentStatus: 'PAID' }
                : o
            )
          );
          await fetchOrders();
          return;
        }
        throw new Error(data.error || 'Failed to record payment.');
      }

      await fetchOrders();
    } catch (err: unknown) {
      setActionError({
        orderId: order.id,
        message: err instanceof Error ? err.message : 'Failed to record payment',
      });
    } finally {
      setOrderActionLoading(order.id, null);
    }
  };

  // Close Table Session (allowed when payment is received and orders completed)
  const handleCloseSession = async (order: OrderData) => {
    if (loadingActions[order.id] || order.sessionStatus === 'CLOSED') return;
    setOrderActionLoading(order.id, 'close');
    setActionError(null);

    try {
      const res = await fetch(`/api/barista/sessions/${order.sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        if (data.error?.includes('already closed')) {
          setOrders((prev) =>
            prev.map((o) =>
              o.sessionId === order.sessionId ? { ...o, sessionStatus: 'CLOSED' } : o
            )
          );
          await fetchOrders();
          return;
        }
        throw new Error(data.error || 'Failed to close table session.');
      }

      await fetchOrders();
    } catch (err: unknown) {
      setActionError({
        orderId: order.id,
        message: err instanceof Error ? err.message : 'Failed to close table session',
      });
    } finally {
      setOrderActionLoading(order.id, null);
    }
  };

  // Open Consolidated Receipt
  const handlePrintReceipt = (order: OrderData) => {
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
      subtotal: order.total,
      total: order.total,
      currency: order.currency || currency || 'ETB',
      paymentStatus: order.paymentStatus,
      cafeName,
      address,
      phone,
      receiptHeader,
      receiptFooter,
    });
  };

  // Table numbers for filter
  const tableNumbers = useMemo(() => {
    const set = new Set<string>();
    orders.forEach((o) => set.add(o.tableNumber));
    return Array.from(set).sort();
  }, [orders]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter === 'active') {
        if (o.sessionStatus === 'CLOSED' || o.status === 'CANCELLED') return false;
      } else if (statusFilter !== 'all' && o.status !== statusFilter) {
        return false;
      }

      if (tableFilter !== 'all' && o.tableNumber !== tableFilter) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNumber = o.orderNumber.toLowerCase().includes(q);
        const matchTable = o.tableNumber.toLowerCase().includes(q);
        const matchItem = o.items.some((i) => i.productName.toLowerCase().includes(q));
        if (!matchNumber && !matchTable && !matchItem) return false;
      }

      return true;
    });
  }, [orders, statusFilter, tableFilter, searchQuery]);

  // Live counts for queue visibility
  const tabCounts = useMemo(() => {
    return {
      active: orders.filter((o) => o.sessionStatus !== 'CLOSED' && o.status !== 'CANCELLED').length,
      PENDING: orders.filter((o) => o.status === 'PENDING' && o.sessionStatus !== 'CLOSED').length,
      PREPARING: orders.filter(
        (o) =>
          (o.status === 'PREPARING' || o.status === 'CONFIRMED' || o.status === 'READY') &&
          o.sessionStatus !== 'CLOSED'
      ).length,
      COMPLETED: orders.filter((o) => o.status === 'COMPLETED').length,
      all: orders.length,
    };
  }, [orders]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedOrders = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, safePage, pageSize]);

  return (
    <div className="space-y-5">
      {/* Top Filter & Toolbar */}
      <div className="bg-[#1E1A17] border border-[#2E2824] rounded-2xl p-4 space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="inline-flex rounded-xl border border-[#2E2824] bg-[#241F1C] p-1 overflow-x-auto scrollbar-none">
            {[
              { id: 'active', label: 'Active queue' },
              { id: 'PENDING', label: 'New' },
              { id: 'PREPARING', label: 'Preparing' },
              { id: 'COMPLETED', label: 'Completed' },
              { id: 'all', label: 'All orders' },
            ].map((tab) => {
              const count = tabCounts[tab.id as keyof typeof tabCounts];
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setStatusFilter(tab.id);
                    setCurrentPage(1);
                  }}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                    statusFilter === tab.id
                      ? 'bg-[#10B981] text-[#141210] font-semibold shadow-xs'
                      : 'text-[#9E958C] hover:text-[#F5F0EB]'
                  }`}
                >
                  <span>{tab.label}</span>
                  {count > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold leading-none ${
                        statusFilter === tab.id
                          ? 'bg-[#141210]/20 text-[#141210]'
                          : 'bg-[#1E1A17] text-[#9E958C] border border-[#2E2824]'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Table Selector & Refresh */}
          <div className="flex items-center gap-2">
            <select
              value={tableFilter}
              onChange={(e) => {
                setTableFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[#241F1C] border border-[#2E2824] text-[#F5F0EB] rounded-xl px-3 py-1.5 text-xs focus:outline-hidden focus:border-[#10B981] cursor-pointer"
            >
              <option value="all">All tables</option>
              {tableNumbers.map((num) => (
                <option key={num} value={num} className="bg-[#1E1A17]">
                  Table {num}
                </option>
              ))}
            </select>

            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="p-2 border border-[#2E2824] hover:bg-[#2A2420] text-[#9E958C] hover:text-[#F5F0EB] rounded-xl transition-colors flex items-center justify-center cursor-pointer disabled:opacity-50"
              title="Refresh order queue"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7E756C]" />
          <input
            type="text"
            placeholder="Search order number, table, or item name..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-[#241F1C] border border-[#2E2824] text-[#F5F0EB] placeholder-[#7E756C] text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-hidden focus:border-[#10B981] transition-colors"
          />
        </div>
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="bg-[#1E1A17] border border-[#2E2824] rounded-2xl p-12 text-center space-y-2">
          <Coffee className="w-8 h-8 text-[#7E756C] mx-auto opacity-50" />
          <h3 className="text-sm font-medium text-[#F5F0EB]">No orders in queue</h3>
          <p className="text-xs text-[#9E958C]">
            New customer table submissions will appear automatically.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedOrders.map((order) => {
            const isClosed = order.sessionStatus === 'CLOSED';
            const isPending = !isClosed && order.status === 'PENDING';
            const isPreparing =
              !isClosed &&
              (order.status === 'PREPARING' ||
                order.status === 'CONFIRMED' ||
                order.status === 'READY');
            const isCompleted = order.status === 'COMPLETED';
            const isPaid =
              order.paymentStatus === 'PAID' ||
              order.total - (order.sessionPaid || 0) <= 0;
            const currentAction = loadingActions[order.id];

            return (
              <div
                key={order.id}
                className={`bg-[#1E1A17] border rounded-2xl p-4 flex flex-col justify-between space-y-4 shadow-xs transition-colors ${
                  isClosed
                    ? 'border-[#2E2824] opacity-80'
                    : isPending
                    ? 'border-[#E06D53]/60 ring-1 ring-[#E06D53]/30'
                    : isPreparing
                    ? 'border-[#10B981]/50 ring-1 ring-[#10B981]/20'
                    : 'border-[#2E2824]'
                }`}
              >
                {/* Header */}
                <div className="space-y-2 border-b border-[#2E2824] pb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#F5F0EB] bg-[#241F1C] border border-[#2E2824] px-3 py-1 rounded-xl">
                      Table {order.tableNumber}
                      {order.tableDisplayName ? ` (${order.tableDisplayName})` : ''}
                    </span>

                    <span
                      className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${
                        isClosed
                          ? 'bg-neutral-800/40 text-[#9E958C] border-[#2E2824]'
                          : isPending
                          ? 'bg-[#E06D53]/15 text-[#E06D53] border-[#E06D53]/30'
                          : isPreparing
                          ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                          : isCompleted
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : 'bg-[#2A2420] text-[#9E958C] border-[#2E2824]'
                      }`}
                    >
                      {isClosed
                        ? 'Session closed'
                        : isPending
                        ? 'New order'
                        : isPreparing
                        ? 'Preparing'
                        : isCompleted
                        ? 'Completed'
                        : order.status.toLowerCase()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#9E958C]">
                    <span className="font-mono text-[11px] text-[#7E756C]">
                      {order.orderNumber}
                    </span>
                    <span className="flex items-center gap-1 text-[11px]">
                      <Clock className="w-3 h-3 text-[#10B981]" />
                      {new Date(order.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                {/* Items List (Consolidated) */}
                <div className="space-y-2 flex-1">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="text-xs flex items-start justify-between gap-2"
                    >
                      <div className="space-y-0.5">
                        <span className="font-medium text-[#F5F0EB]">
                          <span className="font-bold text-[#10B981]">{item.quantity}×</span>{' '}
                          {item.productName}
                        </span>
                        {item.notes && (
                          <p className="text-[11px] text-[#9E958C] italic">
                            &ldquo;{item.notes}&rdquo;
                          </p>
                        )}
                      </div>
                      <span className="text-[#9E958C] whitespace-nowrap text-[11px]">
                        {item.lineTotal.toFixed(2)}
                      </span>
                    </div>
                  ))}

                  {order.notes && (
                    <div className="p-2.5 bg-[#241F1C] rounded-xl text-[11px] text-[#F5F0EB] border border-[#2E2824] mt-2">
                      <span className="text-[#9E958C] font-medium">Order note:</span>{' '}
                      {order.notes}
                    </div>
                  )}

                  {actionError?.orderId === order.id && (
                    <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-[11px] text-red-400 flex items-start gap-1.5 mt-2">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{actionError.message}</span>
                    </div>
                  )}
                </div>

                {/* Financial Footer */}
                <div className="pt-2 border-t border-[#2E2824] flex items-center justify-between text-xs">
                  <span className="text-[#9E958C]">Total:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#F5F0EB]">
                      {order.total.toFixed(2)} {order.currency}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${
                        isClosed
                          ? 'bg-neutral-800/40 text-[#9E958C] border-[#2E2824]'
                          : isPaid
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : 'bg-[#E06D53]/15 text-[#E06D53] border-[#E06D53]/30'
                      }`}
                    >
                      {isClosed ? 'Closed' : isPaid ? 'Paid' : 'Unpaid'}
                    </span>
                  </div>
                </div>

                {/* PRIMARY BARISTA ACTIONS (Only 3 Core Actions) */}
                <div className="pt-1 space-y-2">
                  {/* Action 1: Accept Order (when PENDING) */}
                  {isPending && (
                    <button
                      type="button"
                      onClick={() => handleAcceptOrder(order)}
                      disabled={Boolean(currentAction)}
                      className="w-full bg-[#10B981] hover:bg-[#059669] disabled:opacity-50 text-[#141210] text-xs font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      {currentAction === 'accept' ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Accepting...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Accept order</span>
                        </>
                      )}
                    </button>
                  )}

                  {/* Action 2: Complete Order (when PREPARING / in progress) */}
                  {isPreparing && (
                    <button
                      type="button"
                      onClick={() => handleCompleteOrder(order)}
                      disabled={Boolean(currentAction)}
                      className="w-full bg-[#241F1C] hover:bg-[#2A2420] border border-[#2E2824] hover:border-[#10B981] text-[#F5F0EB] text-xs font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {currentAction === 'complete' ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Completing...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-3.5 h-3.5 text-[#10B981]" />
                          <span>Complete order</span>
                        </>
                      )}
                    </button>
                  )}

                  {/* Action 3: Payment Received & Close Session Controls */}
                  <div className="grid grid-cols-2 gap-2">
                    {/* If session is already closed */}
                    {isClosed ? (
                      <div className="bg-[#241F1C] border border-[#2E2824] text-[#9E958C] text-xs font-medium py-2 rounded-xl flex items-center justify-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-[#10B981]" />
                        <span>Closed</span>
                      </div>
                    ) : !isPaid ? (
                      /* Payment Received Button */
                      <button
                        type="button"
                        onClick={() => handlePaymentReceived(order)}
                        disabled={Boolean(currentAction)}
                        className="bg-[#241F1C] hover:bg-[#2A2420] border border-[#2E2824] hover:border-[#E06D53] text-[#F5F0EB] text-xs font-medium py-2 rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                        title="Record full payment received"
                      >
                        {currentAction === 'payment' ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Recording...</span>
                          </>
                        ) : (
                          <>
                            <DollarSign className="w-3.5 h-3.5 text-[#E06D53]" />
                            <span>Payment received</span>
                          </>
                        )}
                      </button>
                    ) : (
                      /* Close Table Session (when Completed & Paid) */
                      <button
                        type="button"
                        onClick={() => handleCloseSession(order)}
                        disabled={Boolean(currentAction) || !isCompleted}
                        className={`text-xs font-semibold py-2 rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 ${
                          isCompleted
                            ? 'bg-[#10B981] hover:bg-[#059669] text-[#141210]'
                            : 'bg-[#241F1C] text-[#7E756C] border border-[#2E2824]'
                        }`}
                        title={
                          isCompleted
                            ? 'Close session and free table for next customers'
                            : 'Order must be completed before session closure'
                        }
                      >
                        {currentAction === 'close' ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Closing...</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3.5 h-3.5" />
                            <span>Close session</span>
                          </>
                        )}
                      </button>
                    )}

                    {/* Consolidated Receipt Button */}
                    <button
                      type="button"
                      onClick={() => handlePrintReceipt(order)}
                      className="text-xs text-[#9E958C] hover:text-[#F5F0EB] border border-[#2E2824] hover:bg-[#241F1C] py-2 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Receipt</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {filteredOrders.length > pageSize && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#2E2824] text-xs text-[#9E958C]">
          <div>
            Showing{' '}
            <span className="font-semibold text-[#F5F0EB]">
              {(safePage - 1) * pageSize + 1}
            </span>{' '}
            to{' '}
            <span className="font-semibold text-[#F5F0EB]">
              {Math.min(safePage * pageSize, filteredOrders.length)}
            </span>{' '}
            of{' '}
            <span className="font-semibold text-[#F5F0EB]">
              {filteredOrders.length}
            </span>{' '}
            orders
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-xl border border-[#2E2824] bg-[#241F1C] hover:bg-[#2A2420] text-[#F5F0EB] disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-7 h-7 rounded-xl text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                    safePage === pageNum
                      ? 'bg-[#10B981] text-[#141210]'
                      : 'bg-[#241F1C] border border-[#2E2824] text-[#9E958C] hover:text-[#F5F0EB] hover:bg-[#2A2420]'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>

            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-xl border border-[#2E2824] bg-[#241F1C] hover:bg-[#2A2420] text-[#F5F0EB] disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-1 cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Consolidated Receipt Modal */}
      {receiptData && (
        <ReceiptModal data={receiptData} onClose={() => setReceiptData(null)} />
      )}
    </div>
  );
}
