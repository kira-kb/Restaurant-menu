'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle,
  Check,
  ChevronRight,
  AlertTriangle,
  ArrowLeft,
} from 'lucide-react';
import { OrderStatus } from '@prisma/client';
import { LanguageProvider, useLanguage } from '@/lib/i18n/context';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  notes?: string | null;
}

interface OrderDetails {
  id: string;
  orderNumber: string;
  tableNumber: string;
  tableDisplayName: string | null;
  status: OrderStatus;
  paymentStatus: string;
  total: number;
  currency: string;
  createdAt: string;
  items: OrderItem[];
  history: Array<{ toStatus: string; createdAt: string; note: string | null }>;
}

function OrderStatusTrackerContent({
  initialOrder,
}: {
  initialOrder: OrderDetails;
}) {
  const [order, setOrder] = useState<OrderDetails>(initialOrder);
  const { dict, formatCurrency, translateMenuItem } = useLanguage();
  const activeCurrency = formatCurrency(order.currency);

  // Poll for real-time status updates every 4 seconds
  useEffect(() => {
    const poll = async () => {
      if (document.hidden) return;
      if (order.status === 'COMPLETED' || order.status === 'CANCELLED') return;

      try {
        const res = await fetch(`/api/orders/${order.id}/status`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.order) {
            setOrder(data.order);
          }
        }
      } catch {
        // Silently retry next interval
      }
    };

    const intervalId = setInterval(poll, 4000);
    return () => clearInterval(intervalId);
  }, [order.id, order.status]);

  // Status step progression with translations
  const steps: { key: OrderStatus; label: string; desc: string }[] = [
    { key: 'PENDING', label: dict.stepPlaced, desc: dict.stepPlacedDesc },
    { key: 'CONFIRMED', label: dict.stepConfirmed, desc: dict.stepConfirmedDesc },
    { key: 'PREPARING', label: dict.stepPreparing, desc: dict.stepPreparingDesc },
    { key: 'READY', label: dict.stepReady, desc: dict.stepReadyDesc },
    { key: 'COMPLETED', label: dict.stepServed, desc: dict.stepServedDesc },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === order.status);

  return (
    <div className="max-w-md mx-auto w-full px-4 py-6 sm:py-8 space-y-6 text-[#F5F0EB]">
      {/* Top Navigation & Language Bar */}
      <header className="flex items-center justify-between pb-2">
        <Link
          href={`/menu?table=${order.tableNumber}`}
          className="inline-flex items-center gap-1.5 text-xs text-[#9E958C] hover:text-[#F5F0EB] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{dict.orderMoreItems}</span>
        </Link>
        <LanguageSwitcher showIcon={false} />
      </header>

      {/* Top Confirmation Header */}
      <div className="text-center space-y-2 border-b border-[#2E2824] pb-6">
        <div className="w-14 h-14 bg-[#1E1A17] border border-[#2E2824] text-[#10B981] rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-[#10B981]/10">
          <CheckCircle className="w-7 h-7 text-[#10B981]" />
        </div>
        <h1 className="text-xl font-bold text-[#F5F0EB]">{dict.orderConfirmedTitle}</h1>
        <p className="text-xs text-[#9E958C]">
          {dict.orderConfirmedDesc}
        </p>
      </div>

      {/* Order Meta Card */}
      <div className="bg-[#1E1A17] border border-[#2E2824] rounded-2xl p-4 space-y-3 shadow-md">
        <div className="flex items-center justify-between text-xs pb-3 border-b border-[#2A2420]">
          <span className="text-[#9E958C]">{dict.orderNumber}</span>
          <span className="font-mono font-bold text-[#10B981]">
            {order.orderNumber}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs pb-3 border-b border-[#2A2420]">
          <span className="text-[#9E958C]">{dict.table}</span>
          <span className="font-semibold text-[#F5F0EB]">
            {dict.table} {order.tableNumber} {order.tableDisplayName ? `(${order.tableDisplayName})` : ''}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#9E958C]">{dict.payment}</span>
          <span className="font-medium text-[#10B981] bg-[#10B981]/15 px-2.5 py-0.5 rounded-full">
            {order.paymentStatus === 'PAID' ? dict.paid : dict.payAtTable}
          </span>
        </div>
      </div>

      {/* Lifecycle Progress */}
      {order.status === 'CANCELLED' ? (
        <div className="bg-red-900/30 border border-red-700/50 rounded-2xl p-4 text-center space-y-1">
          <AlertTriangle className="w-5 h-5 text-red-400 mx-auto" />
          <p className="text-sm font-semibold text-red-200">{dict.orderCancelled}</p>
          <p className="text-xs text-red-300">
            {dict.orderCancelledDesc}
          </p>
        </div>
      ) : (
        <div className="bg-[#1E1A17] border border-[#2E2824] rounded-2xl p-4 space-y-4 shadow-md">
          <h2 className="text-xs font-medium text-[#9E958C]">
            {dict.prepStatus}
          </h2>

          <div className="space-y-4 relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#2E2824]">
            {steps.map((step, idx) => {
              const isPast = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div key={step.key} className="relative">
                  <div
                    className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                      isPast
                        ? 'bg-[#10B981] text-[#141210]'
                        : isCurrent
                        ? 'bg-[#10B981] ring-4 ring-[#10B981]/25'
                        : 'bg-[#2A2420] border border-[#38312C]'
                    }`}
                  >
                    {isPast && <Check className="w-2.5 h-2.5" />}
                  </div>

                  <div className="space-y-0.5">
                    <p
                      className={`text-xs font-semibold ${
                        isCurrent
                          ? 'text-[#10B981]'
                          : isPast
                          ? 'text-[#F5F0EB]'
                          : 'text-[#7E756C]'
                      }`}
                    >
                      {step.label}
                    </p>
                    <p className="text-[11px] text-[#9E958C]">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Items Summary */}
      <div className="bg-[#1E1A17] border border-[#2E2824] rounded-2xl p-4 space-y-3 shadow-md">
        <h2 className="text-xs font-medium text-[#9E958C]">
          {dict.itemsOrdered}
        </h2>

        <div className="divide-y divide-[#2A2420]">
          {order.items.map((item) => {
            const localizedItem = translateMenuItem(item.productName, null);

            return (
              <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <span className="font-semibold text-[#F5F0EB]">
                    {item.quantity}× {localizedItem.name}
                  </span>
                  {item.notes && (
                    <p className="text-[11px] text-[#10B981] font-medium">
                      + {item.notes}
                    </p>
                  )}
                </div>
                <span className="font-bold text-[#E06D53]">
                  {item.lineTotal.toFixed(2)} {activeCurrency}
                </span>
              </div>
            );
          })}
        </div>

        <div className="border-t border-[#2A2420] pt-3 flex items-center justify-between text-sm">
          <span className="text-[#9E958C]">{dict.totalAmount}</span>
          <span className="font-bold text-[#F5F0EB]">
            {order.total.toFixed(2)} {activeCurrency}
          </span>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="text-center pt-2">
        <Link
          href={`/menu?table=${order.tableNumber}`}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#141210] bg-[#10B981] hover:bg-[#059669] px-5 py-2.5 rounded-xl transition-all shadow-md shadow-[#10B981]/20 cursor-pointer"
        >
          <span>{dict.orderMoreItems}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

export default function OrderStatusTracker({
  initialOrder,
}: {
  initialOrder: OrderDetails;
}) {
  return (
    <LanguageProvider defaultLanguage="am" storageKey="barch_menu_lang">
      <OrderStatusTrackerContent initialOrder={initialOrder} />
    </LanguageProvider>
  );
}
