'use client';

import React, { useState } from 'react';
import { Printer, X, Loader2 } from 'lucide-react';

export interface ReceiptItem {
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface ReceiptData {
  orderNumber: string;
  tableNumber: string;
  createdAt: string;
  items: ReceiptItem[];
  subtotal: number;
  total: number;
  currency: string;
  paymentStatus: string;
  paymentMethod?: string;
  cafeName: string;
  address?: string;
  phone?: string;
  receiptHeader?: string;
  receiptFooter?: string;
}

export default function ReceiptModal({
  data,
  onClose,
}: {
  data: ReceiptData;
  onClose: () => void;
}) {
  const [paperWidth, setPaperWidth] = useState<'80mm' | '58mm'>('80mm');
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 150);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="bg-[#1E1A17] border border-[#2E2824] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Controls (Hidden in Print) */}
        <div className="px-4 py-3 bg-[#241F1C] border-b border-[#2E2824] flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#9E958C]">Format:</span>
            <div className="inline-flex rounded-xl border border-[#2E2824] bg-[#1E1A17] p-0.5">
              <button
                type="button"
                onClick={() => setPaperWidth('80mm')}
                className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  paperWidth === '80mm'
                    ? 'bg-[#10B981] text-[#141210] font-semibold'
                    : 'text-[#9E958C] hover:text-[#F5F0EB]'
                }`}
              >
                80 mm
              </button>
              <button
                type="button"
                onClick={() => setPaperWidth('58mm')}
                className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  paperWidth === '58mm'
                    ? 'bg-[#10B981] text-[#141210] font-semibold'
                    : 'text-[#9E958C] hover:text-[#F5F0EB]'
                }`}
              >
                58 mm
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              disabled={isPrinting}
              className="inline-flex items-center gap-1.5 bg-[#10B981] hover:bg-[#059669] disabled:opacity-50 text-[#141210] text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
            >
              {isPrinting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Printer className="w-3.5 h-3.5" />
              )}
              <span>{isPrinting ? 'Printing...' : 'Print'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-[#9E958C] hover:text-[#F5F0EB] border border-[#2E2824] hover:bg-[#2A2420] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Thermal Receipt Content Container */}
        <div className="p-6 overflow-y-auto bg-[#141210] flex justify-center">
          <div
            id="receipt-print-area"
            style={{ width: paperWidth === '58mm' ? '54mm' : '76mm' }}
            className="text-[#000000] bg-white p-4 rounded-lg shadow-md font-mono text-[12px] leading-tight space-y-3 mx-auto"
          >
            {/* Header */}
            <div className="text-center space-y-1 border-b border-dashed border-[#000000] pb-2">
              <p className="font-bold text-[14px] tracking-wide">
                {data.cafeName}
              </p>
              {data.address && <p className="text-[10px]">{data.address}</p>}
              {data.phone && <p className="text-[10px]">{data.phone}</p>}
              {data.receiptHeader && (
                <p className="text-[10px] italic pt-1">{data.receiptHeader}</p>
              )}
            </div>

            {/* Order Metadata */}
            <div className="space-y-0.5 border-b border-dashed border-[#000000] pb-2 text-[11px]">
              <div className="flex justify-between">
                <span>Order:</span>
                <span className="font-bold">{data.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Table:</span>
                <span className="font-bold">Table {data.tableNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{new Date(data.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Time:</span>
                <span>{new Date(data.createdAt).toLocaleTimeString()}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span>Payment:</span>
                <span className="font-bold">{data.paymentStatus}</span>
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-1 border-b border-dashed border-[#000000] pb-2">
              <div className="flex justify-between font-bold text-[11px] pb-1 border-b border-dotted border-gray-400">
                <span className="w-3/5">Item</span>
                <span className="w-1/5 text-center">Qty</span>
                <span className="w-1/5 text-right">Total</span>
              </div>

              {data.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-[11px] py-0.5">
                  <span className="w-3/5 truncate">{item.name}</span>
                  <span className="w-1/5 text-center">{item.quantity}</span>
                  <span className="w-1/5 text-right font-medium">
                    {item.lineTotal.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Financial Totals */}
            <div className="space-y-1 border-b border-dashed border-[#000000] pb-2 text-[11px]">
              <div className="flex justify-between font-bold text-[13px] pt-1">
                <span>Total:</span>
                <span>
                  {data.total.toFixed(2)} {data.currency}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center space-y-1 pt-1 text-[10px]">
              {data.receiptFooter && <p>{data.receiptFooter}</p>}
              <p className="text-[9px] text-gray-700">Thank you for dining with us</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
