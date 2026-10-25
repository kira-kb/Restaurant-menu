'use client';

import React, { useState } from 'react';
import QRCode from 'qrcode';
import {
  Plus,
  QrCode,
  Edit2,
  Printer,
  Download,
  X,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';
import {
  createTableAction,
  updateTableAction,
  toggleTableStatusAction,
} from '@/lib/actions/tables';
import { useLanguage } from '@/lib/i18n/context';

interface TableRecord {
  id: string;
  tableNumber: string;
  displayName: string | null;
  isActive: boolean;
  createdAt: Date;
  totalOrdersHistorical: number;
  activeSession: {
    id: string;
    openedAt: Date;
    activeOrdersCount: number;
    activeOrders: Array<{
      id: string;
      orderNumber: string;
      status: string;
      total: number;
    }>;
  } | null;
}

/**
 * Generates a high-resolution QR code with the table identifier embedded in the center.
 * Uses Reed-Solomon Error Correction Level H (30% recovery tolerance) so the QR code
 * remains instantly scannable by phone cameras while displaying clear table branding.
 */
async function generateQrWithCenterLabel(
  targetUrl: string,
  label: string,
  includeCenterLabel: boolean
): Promise<string> {
  const canvas = await QRCode.toCanvas(targetUrl, {
    margin: 2,
    scale: 10,
    errorCorrectionLevel: 'H',
    color: {
      dark: '#141210',
      light: '#FFFFFF',
    },
  });

  if (!includeCenterLabel || !label) {
    return canvas.toDataURL('image/png');
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas.toDataURL('image/png');

  const width = canvas.width;
  const height = canvas.height;
  const cx = width / 2;
  const cy = height / 2;

  // Maximum allowed badge width: 28% of canvas to stay safely under 30% Level-H redundancy limit
  const maxBadgeWidth = Math.floor(width * 0.28);
  const maxBadgeHeight = Math.floor(height * 0.16);

  // Determine optimal font size based on text length
  let fontSize = Math.floor(height * 0.055); // ~22px for 400px canvas
  ctx.font = `bold ${fontSize}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  let textWidth = ctx.measureText(label).width;

  // Scale down font if text is too wide
  while (textWidth > maxBadgeWidth - 20 && fontSize > 10) {
    fontSize -= 1;
    ctx.font = `bold ${fontSize}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    textWidth = ctx.measureText(label).width;
  }

  const badgeWidth = Math.min(Math.max(textWidth + 18, 56), maxBadgeWidth);
  const badgeHeight = Math.min(Math.max(fontSize + 12, 28), maxBadgeHeight);
  const badgeRadius = Math.min(8, badgeHeight / 2);

  const x = cx - badgeWidth / 2;
  const y = cy - badgeHeight / 2;

  ctx.save();

  // Draw background pill/badge
  ctx.beginPath();
  if ('roundRect' in ctx && typeof (ctx as unknown as { roundRect: (...args: unknown[]) => void }).roundRect === 'function') {
    (ctx as unknown as { roundRect: (x: number, y: number, w: number, h: number, r: number) => void }).roundRect(
      x,
      y,
      badgeWidth,
      badgeHeight,
      badgeRadius
    );
  } else {
    ctx.rect(x, y, badgeWidth, badgeHeight);
  }

  // Soft shadow for depth & clean visual separation from QR modules
  ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 2;

  ctx.fillStyle = '#FFFFFF';
  ctx.fill();

  // Crisp border matching QR dark tone
  ctx.shadowColor = 'transparent';
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#141210';
  ctx.stroke();

  // Draw table label text
  ctx.fillStyle = '#141210';
  ctx.font = `bold ${fontSize}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, cx, cy + 1);

  ctx.restore();

  return canvas.toDataURL('image/png');
}

export default function AdminTablesManager({
  initialTables,
  baseUrl,
  cafeName,
}: {
  initialTables: TableRecord[];
  baseUrl: string;
  cafeName: string;
}) {
  const { dict } = useLanguage();
  const [tables, setTables] = useState<TableRecord[]>(initialTables);

  // Table form modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<TableRecord | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // QR Modal
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedTableForQr, setSelectedTableForQr] = useState<TableRecord | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [qrTargetUrl, setQrTargetUrl] = useState<string>('');
  const [includeCenterBadge, setIncludeCenterBadge] = useState<boolean>(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [loadingQrId, setLoadingQrId] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const openCreateModal = () => {
    setEditingTable(null);
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (table: TableRecord) => {
    setEditingTable(table);
    setFormError(null);
    setModalOpen(true);
  };

  const openQrModal = async (table: TableRecord, withBadge = includeCenterBadge) => {
    if (loadingQrId) return;
    setLoadingQrId(table.id);
    setSelectedTableForQr(table);
    const hostOrigin =
      typeof window !== 'undefined' && window.location.origin
        ? window.location.origin
        : baseUrl;
    const targetUrl = `${hostOrigin}/menu?table=${encodeURIComponent(table.id)}`;
    setQrTargetUrl(targetUrl);
    setCopiedLink(false);
    try {
      const dataUrl = await generateQrWithCenterLabel(
        targetUrl,
        table.tableNumber,
        withBadge
      );
      setQrDataUrl(dataUrl);
      setQrModalOpen(true);
    } catch (err) {
      console.error('Failed to generate QR:', err);
    } finally {
      setLoadingQrId(null);
    }
  };

  const handleToggleBadge = async (enabled: boolean) => {
    setIncludeCenterBadge(enabled);
    if (selectedTableForQr && qrTargetUrl) {
      try {
        const dataUrl = await generateQrWithCenterLabel(
          qrTargetUrl,
          selectedTableForQr.tableNumber,
          enabled
        );
        setQrDataUrl(dataUrl);
      } catch (err) {
        console.error('Failed to update QR badge:', err);
      }
    }
  };

  const handleToggleStatus = async (id: string) => {
    if (togglingId) return;
    setTogglingId(id);
    try {
      const updated = await toggleTableStatusAction(id);
      setTables((prev) =>
        prev.map((t) => (t.id === id ? { ...t, isActive: updated.isActive } : t))
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update table status');
    } finally {
      setTogglingId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setFormError(null);

    const formData = new FormData(e.currentTarget);

    try {
      if (editingTable) {
        const updated = await updateTableAction(editingTable.id, formData);
        setTables((prev) =>
          prev.map((t) =>
            t.id === editingTable.id
              ? {
                  ...t,
                  tableNumber: updated.tableNumber,
                  displayName: updated.displayName,
                  isActive: updated.isActive,
                }
              : t
          )
        );
      } else {
        const created = await createTableAction(formData);
        setTables((prev) => [
          ...prev,
          {
            id: created.id,
            tableNumber: created.tableNumber,
            displayName: created.displayName,
            isActive: created.isActive,
            createdAt: new Date(),
            totalOrdersHistorical: 0,
            activeSession: null,
          },
        ]);
      }
      setModalOpen(false);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to save table');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl || !selectedTableForQr || isDownloading) return;
    setIsDownloading(true);
    try {
      const link = document.createElement('a');
      link.download = `table-${selectedTableForQr.tableNumber}-qr.png`;
      link.href = qrDataUrl;
      link.click();
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-[#F5F0EB]">
          {dict.tablesPageTitle}
        </h1>
        <p className="text-xs text-[#9E958C]">
          {dict.tablesPageSubtitle}
        </p>
      </div>

      {/* Header bar */}
      <div className="flex items-center justify-between bg-[#1E1A17] border border-[#2E2824] rounded-2xl p-4 shadow-xs">
        <div>
          <h2 className="text-sm font-semibold text-[#F5F0EB]">{dict.tablesPageTitle}</h2>
          <p className="text-xs text-[#9E958C]">
            {dict.tablesPageSubtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 bg-[#10B981] hover:bg-[#059669] text-[#141210] text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>{dict.addTableBtn}</span>
        </button>
      </div>

      {/* Tables List */}
      <div className="bg-[#1E1A17] border border-[#2E2824] rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#241F1C] text-[#9E958C] border-b border-[#2E2824]">
              <tr>
                <th className="px-4 py-3 font-medium">{dict.thTableNumber}</th>
                <th className="px-4 py-3 font-medium">{dict.thDisplayName}</th>
                <th className="px-4 py-3 font-medium">{dict.thActiveSession}</th>
                <th className="px-4 py-3 font-medium">{dict.thStatus}</th>
                <th className="px-4 py-3 font-medium text-right">{dict.thActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#24201D]">
              {tables.map((table) => {
                const hasActiveVisit = Boolean(table.activeSession);
                const isToggling = togglingId === table.id;
                const isLoadingQr = loadingQrId === table.id;

                return (
                  <tr key={table.id} className="hover:bg-[#241F1C]/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-semibold text-sm text-[#F5F0EB] block">
                        {dict.table} {table.tableNumber}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#9E958C]">
                      {table.displayName || <span className="text-[#7E756C] italic">None</span>}
                    </td>
                    <td className="px-4 py-3">
                      {hasActiveVisit ? (
                        <span className="inline-flex items-center gap-1 bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] px-2.5 py-0.5 rounded-full font-medium">
                          {dict.sessionActive}
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#7E756C]">{dict.noActiveSession}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(table.id)}
                        disabled={isToggling}
                        className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50 ${
                          table.isActive
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-[#241F1C] text-[#7E756C] border border-[#2E2824]'
                        }`}
                      >
                        {isToggling ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : null}
                        <span>{table.isActive ? dict.statusActive : dict.statusInactive}</span>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openQrModal(table)}
                          disabled={isLoadingQr}
                          className="inline-flex items-center gap-1 text-[11px] bg-[#241F1C] hover:bg-[#2A2420] text-[#F5F0EB] border border-[#2E2824] px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {isLoadingQr ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <QrCode className="w-3.5 h-3.5 text-[#10B981]" />
                          )}
                          <span>{dict.thQrCode}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(table)}
                          className="p-1.5 text-[#9E958C] hover:text-[#F5F0EB] rounded-xl hover:bg-[#241F1C] transition-colors cursor-pointer"
                          title="Edit table"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-[#1E1A17] w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-[#2E2824]">
            <div className="px-5 py-4 bg-[#241F1C] border-b border-[#2E2824] flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#F5F0EB]">
                {editingTable ? dict.editTableModalTitle : dict.createTableModalTitle}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-xl text-[#9E958C] hover:text-[#F5F0EB] hover:bg-[#2A2420] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="mx-5 mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#F5F0EB] block">
                  {dict.tableNumberField}
                </label>
                <input
                  type="text"
                  name="tableNumber"
                  required
                  defaultValue={editingTable?.tableNumber || ''}
                  placeholder="e.g. T-07 or Table 7"
                  className="w-full bg-[#241F1C] border border-[#2E2824] rounded-xl px-3 py-2 text-xs text-[#F5F0EB] placeholder-[#7E756C] focus:outline-hidden focus:border-[#10B981] transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-[#F5F0EB] block">
                  {dict.tableDisplayNameField}
                </label>
                <input
                  type="text"
                  name="displayName"
                  defaultValue={editingTable?.displayName || ''}
                  placeholder="e.g. Upstairs Mezzanine, 4 seats"
                  className="w-full bg-[#241F1C] border border-[#2E2824] rounded-xl px-3 py-2 text-xs text-[#F5F0EB] placeholder-[#7E756C] focus:outline-hidden focus:border-[#10B981] transition-colors"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  defaultChecked={editingTable ? editingTable.isActive : true}
                  className="rounded border-[#2E2824] text-[#10B981] focus:ring-[#10B981] bg-[#241F1C]"
                />
                <label htmlFor="isActive" className="text-xs text-[#F5F0EB] cursor-pointer">
                  {dict.availableForOrdering}
                </label>
              </div>

              <div className="pt-3 border-t border-[#2E2824] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3.5 py-2 border border-[#2E2824] hover:bg-[#241F1C] text-[#9E958C] hover:text-[#F5F0EB] rounded-xl text-xs transition-colors cursor-pointer"
                >
                  {dict.cancelBtn}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#10B981] hover:bg-[#059669] disabled:opacity-50 text-[#141210] px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{dict.savingTable}</span>
                    </>
                  ) : (
                    <span>{dict.saveTable}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Preview & Print Modal */}
      {qrModalOpen && selectedTableForQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-[#1E1A17] w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-[#2E2824]">
            <div className="px-5 py-4 bg-[#241F1C] border-b border-[#2E2824] flex items-center justify-between no-print">
              <div>
                <h3 className="text-sm font-semibold text-[#F5F0EB]">
                  Table QR code
                </h3>
                <p className="text-xs text-[#9E958C]">
                  Table {selectedTableForQr.tableNumber}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setQrModalOpen(false)}
                className="p-1.5 rounded-xl text-[#9E958C] hover:text-[#F5F0EB] hover:bg-[#2A2420] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 flex flex-col items-center space-y-4">
              <div
                id="qr-print-tent"
                className="bg-white p-5 rounded-2xl border-2 border-[#2E2824] flex flex-col items-center space-y-3 text-center shadow-md max-w-xs"
              >
                <div className="space-y-0.5">
                  <span className="text-[11px] font-bold text-gray-500 tracking-wider">
                    {cafeName}
                  </span>
                  <h4 className="text-xl font-bold text-black leading-tight">
                    Table {selectedTableForQr.tableNumber}
                  </h4>
                </div>

                {qrDataUrl && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={qrDataUrl}
                    alt={`QR Code for Table ${selectedTableForQr.tableNumber}`}
                    className="w-48 h-48 border border-gray-100 rounded-lg"
                  />
                )}

                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-black block">
                    Scan with phone camera to order
                  </span>
                  <span className="text-[10px] text-gray-500 block">
                    Browse menu • Select table • Place order
                  </span>
                </div>
              </div>

              {/* Center table badge toggle */}
              <label className="flex items-center gap-2 text-xs text-[#9E958C] hover:text-[#F5F0EB] cursor-pointer no-print select-none">
                <input
                  type="checkbox"
                  checked={includeCenterBadge}
                  onChange={(e) => handleToggleBadge(e.target.checked)}
                  className="rounded border-[#2E2824] text-[#10B981] focus:ring-[#10B981] bg-[#241F1C]"
                />
                <span>Display table number in center of QR code</span>
              </label>

              {/* Target URL Preview & Copy */}
              <div className="w-full bg-[#141210] border border-[#2E2824] rounded-xl p-3 space-y-1.5 no-print">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#9E958C]">Target URL</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (qrTargetUrl) {
                          navigator.clipboard.writeText(qrTargetUrl);
                          setCopiedLink(true);
                          setTimeout(() => setCopiedLink(false), 2000);
                        }
                      }}
                      className="inline-flex items-center gap-1 text-[#10B981] hover:underline cursor-pointer"
                    >
                      {copiedLink ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy link</span>
                        </>
                      )}
                    </button>
                    <a
                      href={qrTargetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#9E958C] hover:text-[#F5F0EB] transition-colors"
                      title="Open menu for this table in a new tab"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Open tab</span>
                    </a>
                  </div>
                </div>
                <div className="text-[11px] font-mono text-[#F5F0EB] truncate select-all bg-[#1E1A17] px-2 py-1 rounded-md border border-[#2E2824]">
                  {qrTargetUrl}
                </div>
              </div>

              <div className="w-full flex items-center justify-center gap-2 pt-1 no-print">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#241F1C] hover:bg-[#2A2420] text-[#F5F0EB] border border-[#2E2824] text-xs font-medium py-2 rounded-xl transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>{dict.printTentCard}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadQr}
                  disabled={isDownloading}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#10B981] hover:bg-[#059669] disabled:opacity-50 text-[#141210] text-xs font-semibold py-2 rounded-xl transition-colors cursor-pointer"
                >
                  {isDownloading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>{dict.downloadQrPng}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
