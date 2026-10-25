'use client';

import React, { useState, useMemo } from 'react';
import {
  Coffee,
  CheckCircle,
  Clock,
  DollarSign,
  Search,
  Users,
  Calendar,
  Lock,
  ChevronLeft,
  ChevronRight,
  Filter,
  Shield,
  Activity,
} from 'lucide-react';
import { AuditEvent, TodaysAuditData } from '@/lib/audit';

interface StaffOption {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AdminAuditManagerProps {
  todaysData: TodaysAuditData;
  historicalEvents: AuditEvent[];
  staffList: StaffOption[];
  currency: string;
}

export default function AdminAuditManager({
  todaysData,
  historicalEvents,
  staffList,
  currency,
}: AdminAuditManagerProps) {
  // Main view tab: 'today' | 'history'
  const [activeTab, setActiveTab] = useState<'today' | 'history'>('today');

  // Today's view filter: filter today's stream by specific barista
  const [todayStaffFilter, setTodayStaffFilter] = useState<string>('all');
  const [todayPage, setTodayPage] = useState<number>(1);
  const todayPageSize = 12;

  // History view filters
  const [historySearch, setHistorySearch] = useState<string>('');
  const [historyStaffFilter, setHistoryStaffFilter] = useState<string>('all');
  const [historyTypeFilter, setHistoryTypeFilter] = useState<string>('all');
  const [historyDateFilter, setHistoryDateFilter] = useState<string>('all');
  const [historyPage, setHistoryPage] = useState<number>(1);
  const historyPageSize = 15;

  // Filtered events for Today
  const filteredTodayEvents = useMemo(() => {
    if (todayStaffFilter === 'all') return todaysData.events;
    return todaysData.events.filter((e) => e.staffId === todayStaffFilter);
  }, [todaysData.events, todayStaffFilter]);

  const todayTotalPages = Math.max(1, Math.ceil(filteredTodayEvents.length / todayPageSize));
  const safeTodayPage = Math.min(todayPage, todayTotalPages);
  const paginatedTodayEvents = useMemo(() => {
    const start = (safeTodayPage - 1) * todayPageSize;
    return filteredTodayEvents.slice(start, start + todayPageSize);
  }, [filteredTodayEvents, safeTodayPage, todayPageSize]);

  // Filtered events for History
  const filteredHistoryEvents = useMemo(() => {
    return historicalEvents.filter((e) => {
      // Staff filter
      if (historyStaffFilter !== 'all' && e.staffId !== historyStaffFilter) {
        return false;
      }

      // Action Type filter
      if (historyTypeFilter !== 'all' && e.type !== historyTypeFilter) {
        return false;
      }

      // Date preset filter
      if (historyDateFilter !== 'all') {
        const eventDate = new Date(e.timestamp);
        const now = new Date();

        if (historyDateFilter === 'today') {
          const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          if (eventDate < todayStart) return false;
        } else if (historyDateFilter === 'yesterday') {
          const yestStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
          const yestEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          if (eventDate < yestStart || eventDate >= yestEnd) return false;
        } else if (historyDateFilter === '7days') {
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (eventDate < sevenDaysAgo) return false;
        } else if (historyDateFilter === '30days') {
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (eventDate < thirtyDaysAgo) return false;
        }
      }

      // Search Query
      if (historySearch.trim()) {
        const q = historySearch.toLowerCase();
        const matchOrder = e.orderNumber?.toLowerCase().includes(q);
        const matchTable = e.tableNumber?.toLowerCase().includes(q);
        const matchStaff = e.staffName.toLowerCase().includes(q);
        const matchAction = e.actionTitle.toLowerCase().includes(q);
        const matchNotes = e.notes?.toLowerCase().includes(q);

        if (!matchOrder && !matchTable && !matchStaff && !matchAction && !matchNotes) {
          return false;
        }
      }

      return true;
    });
  }, [
    historicalEvents,
    historyStaffFilter,
    historyTypeFilter,
    historyDateFilter,
    historySearch,
  ]);

  const historyTotalPages = Math.max(1, Math.ceil(filteredHistoryEvents.length / historyPageSize));
  const safeHistoryPage = Math.min(historyPage, historyTotalPages);
  const paginatedHistoryEvents = useMemo(() => {
    const start = (safeHistoryPage - 1) * historyPageSize;
    return filteredHistoryEvents.slice(start, start + historyPageSize);
  }, [filteredHistoryEvents, safeHistoryPage, historyPageSize]);

  // Format type badges
  const renderActionBadge = (event: AuditEvent) => {
    if (event.type === 'PAYMENT') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
          <DollarSign className="w-3 h-3 text-emerald-400" />
          <span>Payment received</span>
        </span>
      );
    }
    if (event.type === 'SESSION_CLOSED') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-neutral-800/60 text-[#9E958C] border border-[#2E2824] px-2 py-0.5 rounded-full">
          <Lock className="w-3 h-3 text-[#9E958C]" />
          <span>Session closed</span>
        </span>
      );
    }
    if (event.toStatus === 'COMPLETED') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
          <CheckCircle className="w-3 h-3 text-emerald-400" />
          <span>Order completed</span>
        </span>
      );
    }
    if (event.toStatus === 'PREPARING' || event.toStatus === 'CONFIRMED') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-[#E06D53]/15 text-[#E06D53] border border-[#E06D53]/30 px-2 py-0.5 rounded-full">
          <Coffee className="w-3 h-3 text-[#E06D53]" />
          <span>Order accepted</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-[#241F1C] text-[#9E958C] border border-[#2E2824] px-2 py-0.5 rounded-full">
        <span>{event.actionTitle}</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Tab Switcher */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="inline-flex rounded-xl border border-[#2E2824] bg-[#1E1A17] p-1">
          <button
            type="button"
            onClick={() => setActiveTab('today')}
            className={`text-xs px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'today'
                ? 'bg-[#10B981] text-[#141210] font-semibold shadow-xs'
                : 'text-[#9E958C] hover:text-[#F5F0EB]'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Today&apos;s barista audit</span>
            {todaysData.totalEvents > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold leading-none ${
                  activeTab === 'today'
                    ? 'bg-[#141210]/20 text-[#141210]'
                    : 'bg-[#241F1C] text-[#9E958C] border border-[#2E2824]'
                }`}
              >
                {todaysData.totalEvents}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`text-xs px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'history'
                ? 'bg-[#10B981] text-[#141210] font-semibold shadow-xs'
                : 'text-[#9E958C] hover:text-[#F5F0EB]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Audit history</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold leading-none ${
                activeTab === 'history'
                  ? 'bg-[#141210]/20 text-[#141210]'
                  : 'bg-[#241F1C] text-[#9E958C] border border-[#2E2824]'
              }`}
            >
              {historicalEvents.length}
            </span>
          </button>
        </div>

        <div className="text-xs text-[#9E958C] flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-[#10B981]" />
          <span>
            {new Date().toLocaleDateString(undefined, {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* VIEW 1: TODAY'S BARISTA AUDIT */}
      {/* ============================================================== */}
      {activeTab === 'today' && (
        <div className="space-y-6">
          {/* Today's KPI Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-[#1E1A17] border border-[#2E2824] rounded-2xl p-4 space-y-1">
              <span className="text-[11px] font-medium text-[#9E958C] block">
                Total events today
              </span>
              <span className="text-2xl font-semibold text-[#F5F0EB] block">
                {todaysData.totalEvents}
              </span>
            </div>

            <div className="bg-[#1E1A17] border border-[#2E2824] rounded-2xl p-4 space-y-1">
              <span className="text-[11px] font-medium text-[#9E958C] block">
                Orders accepted
              </span>
              <span className="text-2xl font-semibold text-[#E06D53] block">
                {todaysData.ordersAccepted}
              </span>
            </div>

            <div className="bg-[#1E1A17] border border-[#2E2824] rounded-2xl p-4 space-y-1">
              <span className="text-[11px] font-medium text-[#9E958C] block">
                Orders completed
              </span>
              <span className="text-2xl font-semibold text-emerald-400 block">
                {todaysData.ordersCompleted}
              </span>
            </div>

            <div className="bg-[#1E1A17] border border-[#2E2824] rounded-2xl p-4 space-y-1">
              <span className="text-[11px] font-medium text-[#9E958C] block">
                Payments collected
              </span>
              <span className="text-2xl font-semibold text-[#F5F0EB] block">
                {todaysData.paymentsTotal.toFixed(0)}{' '}
                <span className="text-xs font-normal text-[#9E958C]">{currency}</span>
              </span>
              <span className="text-[10px] text-[#7E756C] block">
                {todaysData.paymentsCount} transactions
              </span>
            </div>

            <div className="bg-[#1E1A17] border border-[#2E2824] rounded-2xl p-4 space-y-1 col-span-2 sm:col-span-1">
              <span className="text-[11px] font-medium text-[#9E958C] block">
                Sessions closed
              </span>
              <span className="text-2xl font-semibold text-[#10B981] block">
                {todaysData.sessionsClosed}
              </span>
            </div>
          </div>

          {/* Barista Performance Summary Table */}
          <div className="bg-[#1E1A17] border border-[#2E2824] rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[#2E2824] flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-[#F5F0EB]">
                  Barista team performance today
                </h2>
                <p className="text-[11px] text-[#9E958C]">
                  Breakdown of individual coffee orders prepared, payments collected, and table sessions closed today.
                </p>
              </div>
              <span className="text-xs bg-[#241F1C] border border-[#2E2824] px-2.5 py-1 rounded-xl text-[#9E958C]">
                {todaysData.activeStaff.length} active staff
              </span>
            </div>

            {todaysData.activeStaff.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#9E958C] space-y-1">
                <Users className="w-6 h-6 text-[#7E756C] mx-auto opacity-40" />
                <p>No barista actions recorded yet today.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#241F1C] text-[#9E958C] border-b border-[#2E2824]">
                    <tr>
                      <th className="px-4 py-3 font-medium">Staff member</th>
                      <th className="px-4 py-3 font-medium text-center">Accepted</th>
                      <th className="px-4 py-3 font-medium text-center">Completed</th>
                      <th className="px-4 py-3 font-medium text-center">Sessions closed</th>
                      <th className="px-4 py-3 font-medium text-right">Payments collected</th>
                      <th className="px-4 py-3 font-medium text-right">Active hours</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#24201D]">
                    {todaysData.activeStaff.map((staff) => (
                      <tr key={staff.staffId} className="hover:bg-[#241F1C]/40 transition-colors">
                        <td className="px-4 py-3 font-medium text-[#F5F0EB]">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-[#241F1C] border border-[#2E2824] text-[#10B981] flex items-center justify-center font-bold text-xs">
                              {staff.staffName.charAt(0)}
                            </div>
                            <div>
                              <span>{staff.staffName}</span>
                              <span className="text-[10px] text-[#7E756C] block font-normal">
                                {staff.staffRole.toLowerCase()}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center text-[#E06D53] font-medium">
                          {staff.ordersAccepted}
                        </td>
                        <td className="px-4 py-3 text-center text-emerald-400 font-semibold">
                          {staff.ordersCompleted}
                        </td>
                        <td className="px-4 py-3 text-center text-[#9E958C]">
                          {staff.sessionsClosed}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-[#F5F0EB]">
                          {staff.paymentsTotal.toFixed(2)} {currency}{' '}
                          <span className="text-[10px] text-[#7E756C]">
                            ({staff.paymentsCount} tx)
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-[11px] text-[#9E958C]">
                          {new Date(staff.firstActive).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                          –{' '}
                          {new Date(staff.lastActive).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Today's Chronological Activity Stream (Paginated) */}
          <div className="bg-[#1E1A17] border border-[#2E2824] rounded-2xl overflow-hidden shadow-xs space-y-3 p-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-[#2E2824] pb-3">
              <div>
                <h2 className="text-sm font-semibold text-[#F5F0EB]">
                  Today&apos;s activity audit trail
                </h2>
                <p className="text-[11px] text-[#9E958C]">
                  Real-time log of every drink acceptance, order completion, payment receipt, and closure today.
                </p>
              </div>

              {/* Barista Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-[#7E756C]" />
                <select
                  value={todayStaffFilter}
                  onChange={(e) => {
                    setTodayStaffFilter(e.target.value);
                    setTodayPage(1);
                  }}
                  className="bg-[#241F1C] border border-[#2E2824] text-[#F5F0EB] text-xs rounded-xl px-3 py-1.5 focus:outline-hidden focus:border-[#10B981] cursor-pointer"
                >
                  <option value="all">All staff</option>
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id} className="bg-[#1E1A17]">
                      {s.name} ({s.role.toLowerCase()})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {filteredTodayEvents.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#9E958C]">
                No activity events match your filter for today.
              </div>
            ) : (
              <div className="divide-y divide-[#24201D]">
                {paginatedTodayEvents.map((event) => (
                  <div
                    key={event.id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-[#241F1C]/30 px-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-[#241F1C] border border-[#2E2824] text-[#10B981] flex items-center justify-center font-bold text-xs mt-0.5">
                        {event.staffName.charAt(0)}
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-[#F5F0EB]">
                            {event.staffName}
                          </span>
                          <span className="text-[10px] text-[#7E756C] border border-[#2E2824] px-1.5 py-0.2 rounded-md">
                            {event.staffRole.toLowerCase()}
                          </span>
                          {renderActionBadge(event)}
                        </div>
                        <p className="text-xs text-[#9E958C]">
                          {event.notes || event.actionTitle}
                        </p>
                      </div>
                    </div>

                    <div className="text-right sm:self-center shrink-0 pl-10 sm:pl-0">
                      <div className="text-xs font-medium text-[#F5F0EB]">
                        {event.tableNumber && <span>Table {event.tableNumber}</span>}
                        {event.orderNumber && (
                          <span className="font-mono text-[11px] text-[#9E958C] ml-1.5">
                            ({event.orderNumber})
                          </span>
                        )}
                        {event.amount !== undefined && event.amount !== null && (
                          <span className="font-semibold text-emerald-400 ml-2">
                            {event.amount.toFixed(2)} {event.currency || currency}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[#7E756C]">
                        {new Date(event.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination Controls for Today */}
            {filteredTodayEvents.length > todayPageSize && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#2E2824] text-xs text-[#9E958C]">
                <div>
                  Showing{' '}
                  <span className="font-semibold text-[#F5F0EB]">
                    {(safeTodayPage - 1) * todayPageSize + 1}
                  </span>{' '}
                  to{' '}
                  <span className="font-semibold text-[#F5F0EB]">
                    {Math.min(safeTodayPage * todayPageSize, filteredTodayEvents.length)}
                  </span>{' '}
                  of{' '}
                  <span className="font-semibold text-[#F5F0EB]">
                    {filteredTodayEvents.length}
                  </span>{' '}
                  events today
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={safeTodayPage <= 1}
                    onClick={() => setTodayPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded-xl border border-[#2E2824] bg-[#241F1C] hover:bg-[#2A2420] text-[#F5F0EB] disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Prev</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: todayTotalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setTodayPage(pageNum)}
                        className={`w-7 h-7 rounded-xl text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                          safeTodayPage === pageNum
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
                    disabled={safeTodayPage >= todayTotalPages}
                    onClick={() => setTodayPage((p) => Math.min(todayTotalPages, p + 1))}
                    className="px-3 py-1.5 rounded-xl border border-[#2E2824] bg-[#241F1C] hover:bg-[#2A2420] text-[#F5F0EB] disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW 2: AUDIT HISTORY (PAGINATED) */}
      {/* ============================================================== */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-[#1E1A17] border border-[#2E2824] rounded-2xl p-4 space-y-3 shadow-xs">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search input */}
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7E756C]" />
                <input
                  type="text"
                  placeholder="Search order #, table, staff, or notes..."
                  value={historySearch}
                  onChange={(e) => {
                    setHistorySearch(e.target.value);
                    setHistoryPage(1);
                  }}
                  className="w-full bg-[#241F1C] border border-[#2E2824] text-[#F5F0EB] placeholder-[#7E756C] text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-hidden focus:border-[#10B981] transition-colors"
                />
              </div>

              {/* Filter Selectors */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Staff Filter */}
                <select
                  value={historyStaffFilter}
                  onChange={(e) => {
                    setHistoryStaffFilter(e.target.value);
                    setHistoryPage(1);
                  }}
                  className="bg-[#241F1C] border border-[#2E2824] text-[#F5F0EB] text-xs rounded-xl px-3 py-2 focus:outline-hidden focus:border-[#10B981] cursor-pointer"
                >
                  <option value="all">All staff members</option>
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id} className="bg-[#1E1A17]">
                      {s.name}
                    </option>
                  ))}
                </select>

                {/* Action Type Filter */}
                <select
                  value={historyTypeFilter}
                  onChange={(e) => {
                    setHistoryTypeFilter(e.target.value);
                    setHistoryPage(1);
                  }}
                  className="bg-[#241F1C] border border-[#2E2824] text-[#F5F0EB] text-xs rounded-xl px-3 py-2 focus:outline-hidden focus:border-[#10B981] cursor-pointer"
                >
                  <option value="all">All action types</option>
                  <option value="ORDER_STATUS">Order status updates</option>
                  <option value="PAYMENT">Payments received</option>
                  <option value="SESSION_CLOSED">Table session closures</option>
                </select>

                {/* Date Preset Filter */}
                <select
                  value={historyDateFilter}
                  onChange={(e) => {
                    setHistoryDateFilter(e.target.value);
                    setHistoryPage(1);
                  }}
                  className="bg-[#241F1C] border border-[#2E2824] text-[#F5F0EB] text-xs rounded-xl px-3 py-2 focus:outline-hidden focus:border-[#10B981] cursor-pointer"
                >
                  <option value="all">All dates</option>
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="7days">Last 7 days</option>
                  <option value="30days">Last 30 days</option>
                </select>
              </div>
            </div>
          </div>

          {/* Historical Audit Table */}
          <div className="bg-[#1E1A17] border border-[#2E2824] rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#241F1C] text-[#9E958C] border-b border-[#2E2824]">
                  <tr>
                    <th className="px-4 py-3 font-medium">Timestamp</th>
                    <th className="px-4 py-3 font-medium">Staff member</th>
                    <th className="px-4 py-3 font-medium">Action</th>
                    <th className="px-4 py-3 font-medium">Target</th>
                    <th className="px-4 py-3 font-medium text-right">Amount</th>
                    <th className="px-4 py-3 font-medium">Audit note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#24201D]">
                  {filteredHistoryEvents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-[#9E958C]">
                        No historical audit records match your filters.
                      </td>
                    </tr>
                  ) : (
                    paginatedHistoryEvents.map((event) => (
                      <tr key={event.id} className="hover:bg-[#241F1C]/40 transition-colors">
                        <td className="px-4 py-3 text-[11px] text-[#9E958C] whitespace-nowrap">
                          {new Date(event.timestamp).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                          })}{' '}
                          <span className="text-[#7E756C]">
                            {new Date(event.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-[#F5F0EB] whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            {event.staffRole === 'ADMIN' ? (
                              <Shield className="w-3.5 h-3.5 text-[#10B981]" />
                            ) : (
                              <Coffee className="w-3.5 h-3.5 text-[#E06D53]" />
                            )}
                            <span>{event.staffName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {renderActionBadge(event)}
                        </td>
                        <td className="px-4 py-3 text-[#F5F0EB] whitespace-nowrap">
                          {event.tableNumber && (
                            <span className="font-medium text-[#10B981]">
                              Table {event.tableNumber}
                            </span>
                          )}
                          {event.orderNumber && (
                            <span className="font-mono text-[11px] text-[#9E958C] ml-1.5">
                              {event.orderNumber}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-medium whitespace-nowrap">
                          {event.amount !== undefined && event.amount !== null ? (
                            <span className="text-emerald-400 font-semibold">
                              {event.amount.toFixed(2)} {event.currency || currency}
                            </span>
                          ) : (
                            <span className="text-[#7E756C]">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-[#9E958C] max-w-sm truncate text-[11px]">
                          {event.notes || event.actionTitle}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls for History */}
            {filteredHistoryEvents.length > historyPageSize && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-[#2E2824] text-xs text-[#9E958C]">
                <div>
                  Showing{' '}
                  <span className="font-semibold text-[#F5F0EB]">
                    {(safeHistoryPage - 1) * historyPageSize + 1}
                  </span>{' '}
                  to{' '}
                  <span className="font-semibold text-[#F5F0EB]">
                    {Math.min(safeHistoryPage * historyPageSize, filteredHistoryEvents.length)}
                  </span>{' '}
                  of{' '}
                  <span className="font-semibold text-[#F5F0EB]">
                    {filteredHistoryEvents.length}
                  </span>{' '}
                  audit records
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={safeHistoryPage <= 1}
                    onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded-xl border border-[#2E2824] bg-[#241F1C] hover:bg-[#2A2420] text-[#F5F0EB] disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Prev</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: historyTotalPages }, (_, i) => i + 1)
                      .filter((pageNum) => {
                        // Keep visible page range within 2 of current page or first/last
                        return (
                          pageNum === 1 ||
                          pageNum === historyTotalPages ||
                          Math.abs(pageNum - safeHistoryPage) <= 2
                        );
                      })
                      .map((pageNum, idx, arr) => {
                        const prev = arr[idx - 1];
                        return (
                          <React.Fragment key={pageNum}>
                            {prev && pageNum - prev > 1 && (
                              <span className="text-[#7E756C] px-1">...</span>
                            )}
                            <button
                              type="button"
                              onClick={() => setHistoryPage(pageNum)}
                              className={`w-7 h-7 rounded-xl text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                                safeHistoryPage === pageNum
                                  ? 'bg-[#10B981] text-[#141210]'
                                  : 'bg-[#241F1C] border border-[#2E2824] text-[#9E958C] hover:text-[#F5F0EB] hover:bg-[#2A2420]'
                              }`}
                            >
                              {pageNum}
                            </button>
                          </React.Fragment>
                        );
                      })}
                  </div>

                  <button
                    type="button"
                    disabled={safeHistoryPage >= historyTotalPages}
                    onClick={() => setHistoryPage((p) => Math.min(historyTotalPages, p + 1))}
                    className="px-3 py-1.5 rounded-xl border border-[#2E2824] bg-[#241F1C] hover:bg-[#2A2420] text-[#F5F0EB] disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
