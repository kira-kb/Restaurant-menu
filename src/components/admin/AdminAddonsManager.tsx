'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Check,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import {
  createAddonAction,
  updateAddonAction,
  toggleAddonAvailabilityAction,
  archiveAddonAction,
} from '@/lib/actions/menu';
import { useLanguage } from '@/lib/i18n/context';

export interface AddonRecord {
  id: string;
  name: string;
  nameAm?: string | null;
  nameEn?: string | null;
  price: number;
  icon?: string | null;
  displayOrder: number;
  isAvailable: boolean;
  menuItemCount: number;
  createdAt: string;
  updatedAt: string;
}

const EMOJI_PRESETS = ['🥛', '☕', '🌿', '🍦', '🍃', '✨', '🍯', '🍫', '🥜', '🥥', '🧊', '🧂'];

export default function AdminAddonsManager({
  initialAddons,
  currency,
}: {
  initialAddons: AddonRecord[];
  currency: string;
}) {
  const { dict, language, formatCurrency } = useLanguage();
  const [addons, setAddons] = useState<AddonRecord[]>(initialAddons);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddon, setEditingAddon] = useState<AddonRecord | null>(null);
  const [selectedEmoji, setSelectedEmoji] = useState('🥛');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Per-item loading states
  const [toggleLoading, setToggleLoading] = useState<Record<string, boolean>>({});
  const [deleteLoading, setDeleteLoading] = useState<Record<string, boolean>>({});

  const filteredAddons = addons.filter((a) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.name.toLowerCase().includes(q) ||
      (a.nameAm && a.nameAm.toLowerCase().includes(q)) ||
      (a.nameEn && a.nameEn.toLowerCase().includes(q))
    );
  });

  const openCreateModal = () => {
    setEditingAddon(null);
    setSelectedEmoji('🥛');
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (addon: AddonRecord) => {
    setEditingAddon(addon);
    setSelectedEmoji(addon.icon || '🥛');
    setFormError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingAddon(null);
    setFormError(null);
  };

  const handleToggle = async (addon: AddonRecord) => {
    setToggleLoading((prev) => ({ ...prev, [addon.id]: true }));
    try {
      const updated = await toggleAddonAvailabilityAction(addon.id);
      setAddons((prev) =>
        prev.map((item) =>
          item.id === addon.id
            ? { ...item, isAvailable: updated.isAvailable }
            : item
        )
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to toggle availability');
    } finally {
      setToggleLoading((prev) => ({ ...prev, [addon.id]: false }));
    }
  };

  const handleDelete = async (addon: AddonRecord) => {
    if (!confirm(dict.deleteAddonConfirm)) return;

    setDeleteLoading((prev) => ({ ...prev, [addon.id]: true }));
    try {
      await archiveAddonAction(addon.id);
      setAddons((prev) => prev.filter((item) => item.id !== addon.id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to archive add-on');
    } finally {
      setDeleteLoading((prev) => ({ ...prev, [addon.id]: false }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    const formData = new FormData(e.currentTarget);
    formData.set('icon', selectedEmoji);

    try {
      if (editingAddon) {
        const updated = await updateAddonAction(editingAddon.id, formData);
        setAddons((prev) =>
          prev.map((item) =>
            item.id === editingAddon.id
              ? {
                  ...item,
                  name: updated.name,
                  nameAm: updated.nameAm,
                  nameEn: updated.nameEn,
                  price: updated.price,
                  icon: updated.icon,
                  displayOrder: updated.displayOrder,
                  isAvailable: updated.isAvailable,
                }
              : item
          )
        );
      } else {
        const created = await createAddonAction(formData);
        const newRecord: AddonRecord = {
          id: created.id,
          name: created.name,
          nameAm: created.nameAm,
          nameEn: created.nameEn,
          price: created.price,
          icon: created.icon,
          displayOrder: created.displayOrder,
          isAvailable: created.isAvailable,
          menuItemCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setAddons((prev) => [...prev, newRecord]);
      }
      closeModal();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to save add-on');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#F5F0EB] tracking-tight">
            {dict.addonsPageTitle}
          </h1>
          <p className="text-xs sm:text-sm text-[#9E958C] mt-1">
            {dict.addonsPageSubtitle}
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#10B981] text-[#141210] font-semibold text-xs sm:text-sm hover:bg-[#059669] transition-all shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{dict.addNewAddon}</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7E756C]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={dict.searchAddonsPlaceholder}
          className="w-full pl-10 pr-4 py-2 bg-[#1E1A17] border border-[#2E2824] rounded-xl text-xs sm:text-sm text-[#F5F0EB] placeholder-[#7E756C] focus:outline-hidden focus:border-[#10B981] transition-colors"
        />
      </div>

      {/* Addons Table */}
      <div className="bg-[#1E1A17] border border-[#2E2824] rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-[#2E2824] bg-[#241F1C]/70 text-[#9E958C] uppercase tracking-wider text-[11px] font-semibold">
                <th className="py-3 px-4 w-12 text-center">{dict.thIcon}</th>
                <th className="py-3 px-4">{dict.thAddonName}</th>
                <th className="py-3 px-4">{dict.thExtraPrice}</th>
                <th className="py-3 px-4">{dict.thAppliedToItems}</th>
                <th className="py-3 px-4">{dict.thStatus}</th>
                <th className="py-3 px-4 text-right">{dict.thActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2E2824] text-[#F5F0EB]">
              {filteredAddons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#7E756C]">
                    <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p>{dict.noAddonsFound}</p>
                  </td>
                </tr>
              ) : (
                filteredAddons.map((addon) => {
                  const localizedName =
                    language === 'am'
                      ? addon.nameAm || addon.name
                      : addon.nameEn || addon.name;
                  const isToggling = toggleLoading[addon.id] || false;
                  const isDeleting = deleteLoading[addon.id] || false;

                  return (
                    <tr
                      key={addon.id}
                      className="hover:bg-[#241F1C]/50 transition-colors"
                    >
                      <td className="py-3 px-4 text-center text-xl">
                        {addon.icon || '☕'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-[#F5F0EB]">
                          {localizedName}
                        </div>
                        <div className="text-[11px] text-[#7E756C]">
                          {addon.nameEn && addon.nameAm ? (
                            <span>
                              {addon.nameEn} • {addon.nameAm}
                            </span>
                          ) : (
                            addon.name
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-medium">
                        {addon.price > 0 ? (
                          <span className="text-[#E06D53]">
                            +{addon.price.toFixed(2)} {formatCurrency(currency)}
                          </span>
                        ) : (
                          <span className="text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded-full text-[11px]">
                            {dict.freeAddon}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[#9E958C]">
                        {addon.menuItemCount} {dict.thItems.toLowerCase()}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggle(addon)}
                          disabled={isToggling}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border cursor-pointer transition-colors ${
                            addon.isAvailable
                              ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30 hover:bg-[#10B981]/20'
                              : 'bg-[#E06D53]/10 text-[#E06D53] border-[#E06D53]/30 hover:bg-[#E06D53]/20'
                          }`}
                        >
                          {isToggling ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                addon.isAvailable ? 'bg-[#10B981]' : 'bg-[#E06D53]'
                              }`}
                            />
                          )}
                          <span>
                            {addon.isAvailable ? dict.inStock : dict.soldOut}
                          </span>
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(addon)}
                            className="p-1.5 rounded-lg text-[#9E958C] hover:text-[#F5F0EB] hover:bg-[#241F1C] transition-colors cursor-pointer"
                            title={dict.editProduct}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(addon)}
                            disabled={isDeleting}
                            className="p-1.5 rounded-lg text-[#9E958C] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors cursor-pointer"
                            title={dict.archiveProduct}
                          >
                            {isDeleting ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
          <div className="bg-[#1E1A17] border border-[#2E2824] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl my-8">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#2E2824] bg-[#241F1C]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#10B981]" />
                <h2 className="text-base sm:text-lg font-bold text-[#F5F0EB]">
                  {editingAddon
                    ? dict.editAddonModalTitle
                    : dict.createAddonModalTitle}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="p-1 rounded-lg text-[#9E958C] hover:text-[#F5F0EB] hover:bg-[#2E2824] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-950/40 border border-red-800/50 rounded-xl flex items-center gap-2 text-xs text-red-200">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Icon / Emoji Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#F5F0EB] block">
                  {dict.addonIconLabel}
                </label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {EMOJI_PRESETS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setSelectedEmoji(emoji)}
                      className={`w-9 h-9 rounded-xl border text-lg flex items-center justify-center cursor-pointer transition-all ${
                        selectedEmoji === emoji
                          ? 'bg-[#10B981]/20 border-[#10B981] scale-105'
                          : 'bg-[#241F1C] border-[#2E2824] hover:border-[#3D342E]'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* English Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#F5F0EB] block">
                  {dict.addonNameEnLabel}{' '}
                  <span className="text-[#10B981]">*</span>
                </label>
                <input
                  type="text"
                  name="nameEn"
                  required
                  defaultValue={editingAddon?.nameEn || editingAddon?.name || ''}
                  placeholder="e.g. Oat Milk, Extra Shot"
                  className="w-full bg-[#241F1C] border border-[#2E2824] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-[#F5F0EB] focus:outline-hidden focus:border-[#10B981]"
                />
              </div>

              {/* Amharic Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#F5F0EB] block">
                  {dict.addonNameAmLabel}
                </label>
                <input
                  type="text"
                  name="nameAm"
                  defaultValue={editingAddon?.nameAm || ''}
                  placeholder="ለምሳሌ የአጃ ወተት፣ ተጨማሪ ሾት"
                  className="w-full bg-[#241F1C] border border-[#2E2824] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-[#F5F0EB] focus:outline-hidden focus:border-[#10B981]"
                />
              </div>

              {/* Hidden primary name fallback */}
              <input
                type="hidden"
                name="name"
                defaultValue={editingAddon?.name || 'Custom Add-on'}
              />

              {/* Extra Price */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#F5F0EB] block">
                    {dict.addonPriceLabel}
                  </label>
                  <input
                    type="number"
                    name="price"
                    step="0.5"
                    min="0"
                    defaultValue={editingAddon ? editingAddon.price : 0}
                    placeholder="0.00"
                    className="w-full bg-[#241F1C] border border-[#2E2824] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-[#F5F0EB] focus:outline-hidden focus:border-[#10B981]"
                  />
                  <p className="text-[10px] text-[#7E756C]">0 = {dict.freeAddon}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#F5F0EB] block">
                    {dict.displayOrderField}
                  </label>
                  <input
                    type="number"
                    name="displayOrder"
                    defaultValue={editingAddon ? editingAddon.displayOrder : 0}
                    className="w-full bg-[#241F1C] border border-[#2E2824] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-[#F5F0EB] focus:outline-hidden focus:border-[#10B981]"
                  />
                </div>
              </div>

              {/* Available Toggle */}
              <div className="pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isAvailable"
                    defaultChecked={
                      editingAddon ? editingAddon.isAvailable : true
                    }
                    className="w-4 h-4 rounded-sm bg-[#241F1C] border-[#2E2824] text-[#10B981] focus:ring-[#10B981]"
                  />
                  <span className="text-xs text-[#F5F0EB]">
                    {dict.addonAvailableLabel}
                  </span>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#2E2824]">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl border border-[#2E2824] text-xs font-medium text-[#9E958C] hover:text-[#F5F0EB] hover:bg-[#241F1C] cursor-pointer"
                >
                  {dict.cancelBtn}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#10B981] text-[#141210] font-semibold text-xs hover:bg-[#059669] transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>{dict.saveProduct}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
