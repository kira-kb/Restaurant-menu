'use client';

import React, { useState } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Archive,
  X,
  AlertCircle,
  Coffee,
  ExternalLink,
  LayoutGrid,
  List,
  Link2,
  Check,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';
import {
  createMenuItemAction,
  updateMenuItemAction,
  updateMenuItemImageLinkAction,
  toggleMenuItemAvailabilityAction,
  archiveMenuItemAction,
} from '@/lib/actions/menu';
import { useLanguage } from '@/lib/i18n/context';

interface CategoryOption {
  id: string;
  name: string;
}

interface MenuItemRecord {
  id: string;
  name: string;
  nameAm?: string | null;
  nameEn?: string | null;
  description: string | null;
  descriptionAm?: string | null;
  descriptionEn?: string | null;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean;
  categoryId: string;
  category: { id: string; name: string };
}

const SAMPLE_IMAGE_LINKS = [
  {
    name: 'Pour-Over',
    url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Artisan Latte',
    url: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Espresso',
    url: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Iced Cold Brew',
    url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Bakery Pastry',
    url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80',
  },
];

export default function AdminMenuManager({
  initialItems,
  categories,
  currency,
}: {
  initialItems: MenuItemRecord[];
  categories: CategoryOption[];
  currency: string;
}) {
  const { dict, formatCurrency, translateMenuItem } = useLanguage();
  const [items, setItems] = useState<MenuItemRecord[]>(initialItems);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Full Product Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItemRecord | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dedicated Quick Image Link Modal State
  const [linkModalItem, setLinkModalItem] = useState<MenuItemRecord | null>(null);
  const [quickLinkUrl, setQuickLinkUrl] = useState('');
  const [isSavingLink, setIsSavingLink] = useState(false);
  const [linkModalError, setLinkModalError] = useState<string | null>(null);

  // Per-item loading states
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [archivingId, setArchivingId] = useState<string | null>(null);

  // Filtered items
  const filtered = items.filter((item) => {
    if (selectedCategory !== 'all' && item.categoryId !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        (item.nameAm && item.nameAm.toLowerCase().includes(q)) ||
        (item.nameEn && item.nameEn.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        (item.descriptionAm && item.descriptionAm.toLowerCase().includes(q)) ||
        (item.descriptionEn && item.descriptionEn.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const openCreateModal = () => {
    setEditingItem(null);
    setImageUrlInput('');
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (item: MenuItemRecord) => {
    setEditingItem(item);
    setImageUrlInput(item.imageUrl || '');
    setFormError(null);
    setModalOpen(true);
  };

  // Open Quick Image Link Editor
  const openQuickLinkModal = (item: MenuItemRecord) => {
    setLinkModalItem(item);
    setQuickLinkUrl(item.imageUrl || '');
    setLinkModalError(null);
  };

  const handleSaveQuickImageLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkModalItem || isSavingLink) return;

    setIsSavingLink(true);
    setLinkModalError(null);

    try {
      const updated = await updateMenuItemImageLinkAction(linkModalItem.id, quickLinkUrl.trim() || null);
      setItems((prev) =>
        prev.map((i) =>
          i.id === linkModalItem.id ? { ...i, imageUrl: updated.imageUrl } : i
        )
      );
      setLinkModalItem(null);
    } catch (err: unknown) {
      setLinkModalError(err instanceof Error ? err.message : 'Failed to update image link');
    } finally {
      setIsSavingLink(false);
    }
  };

  const handleToggleAvailability = async (id: string) => {
    if (togglingId) return;
    setTogglingId(id);
    try {
      const updated = await toggleMenuItemAvailabilityAction(id);
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, isAvailable: updated.isAvailable } : i))
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to toggle availability');
    } finally {
      setTogglingId(null);
    }
  };

  const handleArchive = async (id: string, name: string) => {
    if (archivingId) return;
    if (
      !confirm(
        `Are you sure you want to archive "${name}"? It will no longer appear on the menu, but historical orders will be preserved.`
      )
    ) {
      return;
    }

    setArchivingId(id);
    try {
      await archiveMenuItemAction(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to archive product');
    } finally {
      setArchivingId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setFormError(null);

    const formData = new FormData(e.currentTarget);

    try {
      if (editingItem) {
        const updated = await updateMenuItemAction(editingItem.id, formData);
        const cat = categories.find((c) => c.id === updated.categoryId);
        setItems((prev) =>
          prev.map((i) =>
            i.id === editingItem.id
              ? {
                  ...i,
                  name: updated.name,
                  nameAm: updated.nameAm,
                  nameEn: updated.nameEn,
                  description: updated.description,
                  descriptionAm: updated.descriptionAm,
                  descriptionEn: updated.descriptionEn,
                  price: Number(updated.price),
                  categoryId: updated.categoryId,
                  imageUrl: updated.imageUrl,
                  category: { id: updated.categoryId, name: cat?.name || '' },
                  isAvailable: updated.isAvailable,
                }
              : i
          )
        );
      } else {
        const created = await createMenuItemAction(formData);
        const cat = categories.find((c) => c.id === created.categoryId);
        setItems((prev) => [
          {
            id: created.id,
            name: created.name,
            nameAm: created.nameAm,
            nameEn: created.nameEn,
            description: created.description,
            descriptionAm: created.descriptionAm,
            descriptionEn: created.descriptionEn,
            price: Number(created.price),
            imageUrl: created.imageUrl,
            isAvailable: created.isAvailable,
            categoryId: created.categoryId,
            category: { id: created.categoryId, name: cat?.name || '' },
          },
          ...prev,
        ]);
      }
      setModalOpen(false);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to save menu product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-[#F5F0EB]">
          {dict.menuPageTitle}
        </h1>
        <p className="text-xs text-[#9E958C]">
          {dict.menuPageSubtitle}
        </p>
      </div>

      {/* Action & Filter Header */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#1E1A17] border border-[#2E2824] rounded-2xl p-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7E756C]" />
            <input
              type="text"
              placeholder={dict.searchProductsPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#241F1C] border border-[#2E2824] text-[#F5F0EB] placeholder-[#7E756C] text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-hidden focus:border-[#10B981] transition-colors"
            />
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#241F1C] border border-[#2E2824] text-[#F5F0EB] rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-[#10B981] cursor-pointer"
          >
            <option value="all" className="bg-[#1E1A17]">{dict.allCategoriesFilter} ({items.length})</option>
            {categories.map((c) => {
              const count = items.filter((i) => i.categoryId === c.id).length;
              return (
                <option key={c.id} value={c.id} className="bg-[#1E1A17]">
                  {c.name} ({count})
                </option>
              );
            })}
          </select>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 bg-[#241F1C] border border-[#2E2824] p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-[#10B981] text-[#141210] font-semibold shadow-xs'
                  : 'text-[#9E958C] hover:text-[#F5F0EB]'
              }`}
              title={dict.cardsView}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>{dict.cardsView}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-[#10B981] text-[#141210] font-semibold shadow-xs'
                  : 'text-[#9E958C] hover:text-[#F5F0EB]'
              }`}
              title={dict.tableView}
            >
              <List className="w-3.5 h-3.5" />
              <span>{dict.tableView}</span>
            </button>
          </div>
        </div>

        {/* Add Product Button */}
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-1.5 bg-[#10B981] hover:bg-[#059669] text-[#141210] text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors shrink-0 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{dict.addProductBtn}</span>
        </button>
      </div>

      {/* CARDS VIEW (Visual Cards with Prominent Photos) */}
      {viewMode === 'cards' && (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="bg-[#1E1A17] border border-[#2E2824] rounded-2xl p-12 text-center space-y-2">
              <Coffee className="w-8 h-8 text-[#7E756C] mx-auto opacity-50" />
              <p className="text-sm font-medium text-[#F5F0EB]">{dict.noProductsFound}</p>
              <p className="text-xs text-[#9E958C]">
                {dict.noItemsFoundDesc}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((item) => {
                const isItemToggling = togglingId === item.id;
                const isItemArchiving = archivingId === item.id;

                return (
                  <div
                    key={item.id}
                    className={`bg-[#1E1A17] border border-[#2E2824] rounded-2xl overflow-hidden shadow-xs hover:border-[#4A3F38] transition-all flex flex-col justify-between group ${
                      !item.isAvailable ? 'opacity-70' : ''
                    }`}
                  >
                    {/* Card Top: Image Banner with Direct Link Status */}
                    <div className="relative h-44 w-full bg-[#241F1C] overflow-hidden border-b border-[#2E2824]">
                      {item.imageUrl ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              const img = e.currentTarget;
                              if (!img.dataset.fallback) {
                                img.dataset.fallback = 'true';
                                img.src =
                                  'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80';
                              }
                            }}
                          />

                          {/* Top Overlay Badges */}
                          <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between gap-1 pointer-events-none">
                            <span className="bg-[#141210]/85 text-[#F5F0EB] backdrop-blur-xs text-[10px] font-medium px-2.5 py-0.5 rounded-full border border-white/10 shadow-xs">
                              {item.category.name}
                            </span>

                            <div className="flex items-center gap-1 pointer-events-auto">
                              <a
                                href={item.imageUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="w-6 h-6 rounded-full bg-[#141210]/85 text-[#9E958C] hover:text-[#10B981] flex items-center justify-center backdrop-blur-xs transition-colors shadow-xs"
                                title="Open image URL in new tab"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>

                          {/* Hover Overlay Button to Change Link */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                            <button
                              type="button"
                              onClick={() => openQuickLinkModal(item)}
                              className="bg-[#1E1A17] hover:bg-[#2A2420] text-[#F5F0EB] border border-[#2E2824] text-xs font-medium px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 transition-transform hover:scale-105 cursor-pointer"
                            >
                              <Link2 className="w-3.5 h-3.5 text-[#10B981]" />
                              <span>Change link</span>
                            </button>
                          </div>
                        </>
                      ) : (
                        /* Placeholder Prompt when No Image Link is Provided */
                        <button
                          type="button"
                          onClick={() => openQuickLinkModal(item)}
                          className="w-full h-full p-4 flex flex-col items-center justify-center gap-2 text-center text-[#7E756C] hover:text-[#F5F0EB] hover:bg-[#241F1C] transition-colors cursor-pointer"
                        >
                          <div className="w-10 h-10 rounded-xl bg-[#241F1C] border border-[#2E2824] flex items-center justify-center text-[#9E958C]">
                            <ImageIcon className="w-5 h-5 opacity-70" />
                          </div>
                          <div>
                            <span className="text-xs font-semibold block text-[#F5F0EB]">
                              + Provide image link
                            </span>
                            <span className="text-[10px] text-[#7E756C]">
                              Click to paste image URL
                            </span>
                          </div>
                        </button>
                      )}
                    </div>

                    {/* Card Body */}
                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-sm text-[#F5F0EB] leading-tight line-clamp-1">
                              {item.name}
                            </h3>
                            {(item.nameAm || item.nameEn) && (
                              <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-[#9E958C] truncate">
                                {item.nameAm && <span title="Amharic name">🇪🇹 {item.nameAm}</span>}
                                {item.nameAm && item.nameEn && <span>•</span>}
                                {item.nameEn && <span title="English name">🇬🇧 {item.nameEn}</span>}
                              </div>
                            )}
                          </div>
                          <span className="text-xs font-bold text-[#E06D53] whitespace-nowrap bg-[#241F1C] border border-[#2E2824] px-2 py-0.5 rounded-lg shrink-0">
                            {Number(item.price).toFixed(2)} {formatCurrency(currency)}
                          </span>
                        </div>

                        {item.description ? (
                          <p className="text-[11px] text-[#9E958C] line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        ) : (
                          <p className="text-[11px] text-[#7E756C] italic">No description provided</p>
                        )}
                        {(item.descriptionAm || item.descriptionEn) && (
                          <div className="text-[10px] text-[#7E756C] space-y-0.5 pt-0.5">
                            {item.descriptionAm && (
                              <p className="truncate"><span className="text-[#9E958C]">🇪🇹</span> {item.descriptionAm}</p>
                            )}
                            {item.descriptionEn && (
                              <p className="truncate"><span className="text-[#9E958C]">🇬🇧</span> {item.descriptionEn}</p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Stock Status & Actions */}
                      <div className="pt-2.5 border-t border-[#2E2824] space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-[#9E958C]">{dict.thStatus}:</span>
                          <button
                            type="button"
                            onClick={() => handleToggleAvailability(item.id)}
                            disabled={isItemToggling}
                            className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50 ${
                              item.isAvailable
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : 'bg-[#241F1C] text-[#7E756C] border border-[#2E2824]'
                            }`}
                          >
                            {isItemToggling ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : item.isAvailable ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : null}
                            <span>{item.isAvailable ? dict.inStock : dict.soldOut}</span>
                          </button>
                        </div>

                        <div className="flex items-center justify-between gap-1 pt-1">
                          <button
                            type="button"
                            onClick={() => openQuickLinkModal(item)}
                            className="flex-1 inline-flex items-center justify-center gap-1 bg-[#241F1C] hover:bg-[#2A2420] text-[#F5F0EB] border border-[#2E2824] text-[11px] font-medium py-1.5 px-2 rounded-xl transition-colors cursor-pointer"
                            title={dict.changeImageLink}
                          >
                            <Link2 className="w-3 h-3 text-[#10B981]" />
                            <span>{dict.changeImageLink}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            className="p-1.5 text-[#9E958C] hover:text-[#F5F0EB] rounded-xl hover:bg-[#241F1C] border border-transparent hover:border-[#2E2824] transition-colors cursor-pointer"
                            title={dict.editProduct}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleArchive(item.id, item.name)}
                            disabled={isItemArchiving}
                            className="p-1.5 text-[#7E756C] hover:text-red-400 rounded-xl hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-50"
                            title={dict.archiveProduct}
                          >
                            {isItemArchiving ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Archive className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TABLE VIEW (Compact Data Grid) */}
      {viewMode === 'table' && (
        <div className="bg-[#1E1A17] border border-[#2E2824] rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#241F1C] text-[#9E958C] border-b border-[#2E2824]">
                <tr>
                  <th className="px-4 py-3 font-medium w-16">Photo</th>
                  <th className="px-4 py-3 font-medium">{dict.productNameEn}</th>
                  <th className="px-4 py-3 font-medium">{dict.categoryLabel}</th>
                  <th className="px-4 py-3 font-medium">{dict.priceLabel}</th>
                  <th className="px-4 py-3 font-medium">{dict.thStatus}</th>
                  <th className="px-4 py-3 font-medium text-right">{dict.thActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#24201D]">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-[#7E756C]">
                      {dict.noProductsFound}
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => {
                    const isItemToggling = togglingId === item.id;
                    const isItemArchiving = archivingId === item.id;

                    return (
                      <tr key={item.id} className="hover:bg-[#241F1C]/50 transition-colors">
                        <td className="px-4 py-3">
                          {item.imageUrl ? (
                            <div className="relative group/thumb w-10 h-10">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-10 h-10 rounded-xl object-cover bg-[#241F1C] border border-[#2E2824]"
                                onError={(e) => {
                                  const img = e.currentTarget;
                                  if (!img.dataset.fallback) {
                                    img.dataset.fallback = 'true';
                                    img.src =
                                      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=200&q=80';
                                  }
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => openQuickLinkModal(item)}
                                className="absolute inset-0 bg-black/60 text-white rounded-xl opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                                title="Edit image link"
                              >
                                <Link2 className="w-3 h-3 text-[#10B981]" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => openQuickLinkModal(item)}
                              className="w-10 h-10 rounded-xl bg-[#241F1C] border border-dashed border-[#2E2824] hover:border-[#10B981] flex items-center justify-center text-[#7E756C] hover:text-[#10B981] transition-colors cursor-pointer"
                              title="Add image link"
                            >
                              <ImageIcon className="w-4 h-4 opacity-50" />
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-0.5">
                            <span className="font-medium text-[#F5F0EB] block">
                              {item.name}
                            </span>
                            {(item.nameAm || item.nameEn) && (
                              <div className="flex items-center gap-2 text-[10px] text-[#9E958C]">
                                {item.nameAm && <span>🇪🇹 {item.nameAm}</span>}
                                {item.nameAm && item.nameEn && <span>•</span>}
                                {item.nameEn && <span>🇬🇧 {item.nameEn}</span>}
                              </div>
                            )}
                            {item.description && (
                              <span className="text-[11px] text-[#9E958C] block max-w-md truncate">
                                {item.description}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="bg-[#241F1C] text-[#9E958C] border border-[#2E2824] text-[11px] px-2.5 py-0.5 rounded-full font-medium">
                            {item.category.name}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-[#E06D53]">
                          {Number(item.price).toFixed(2)} {formatCurrency(currency)}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => handleToggleAvailability(item.id)}
                            disabled={isItemToggling}
                            className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50 ${
                              item.isAvailable
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : 'bg-[#241F1C] text-[#7E756C] border border-[#2E2824]'
                            }`}
                          >
                            {isItemToggling ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : null}
                            <span>{item.isAvailable ? dict.inStock : dict.soldOut}</span>
                          </button>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => openQuickLinkModal(item)}
                              className="p-1.5 text-[#9E958C] hover:text-[#F5F0EB] rounded-xl hover:bg-[#241F1C] transition-colors cursor-pointer"
                              title={dict.changeImageLink}
                            >
                              <Link2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditModal(item)}
                              className="p-1.5 text-[#9E958C] hover:text-[#F5F0EB] rounded-xl hover:bg-[#241F1C] transition-colors cursor-pointer"
                              title={dict.editProduct}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleArchive(item.id, item.name)}
                              disabled={isItemArchiving}
                              className="p-1.5 text-[#7E756C] hover:text-red-400 rounded-xl hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-50"
                              title={dict.archiveProduct}
                            >
                              {isItemArchiving ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Archive className="w-3.5 h-3.5" />
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
      )}

      {/* DEDICATED QUICK IMAGE LINK MODAL */}
      {linkModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-[#1E1A17] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-[#2E2824]">
            <div className="px-5 py-4 bg-[#241F1C] border-b border-[#2E2824] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[#F5F0EB]">
                  Menu item image link
                </h3>
                <p className="text-[11px] text-[#9E958C]">
                  Set public image link for &quot;{linkModalItem.name}&quot;
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLinkModalItem(null)}
                className="p-1.5 rounded-xl text-[#9E958C] hover:text-[#F5F0EB] hover:bg-[#2A2420] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {linkModalError && (
              <div className="mx-5 mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{linkModalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveQuickImageLink} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#F5F0EB]">
                    Image web URL link
                  </label>
                  {quickLinkUrl && (
                    <a
                      href={quickLinkUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-[#10B981] hover:underline inline-flex items-center gap-1 font-medium"
                    >
                      <span>Test link in tab</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <input
                  type="url"
                  value={quickLinkUrl}
                  onChange={(e) => setQuickLinkUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full bg-[#241F1C] border border-[#2E2824] rounded-xl px-3.5 py-2.5 text-xs text-[#F5F0EB] placeholder-[#7E756C] focus:outline-hidden focus:border-[#10B981] transition-colors"
                />

                <p className="text-[11px] text-[#9E958C] leading-relaxed">
                  Provide a direct image URL (Unsplash, Cloudinary, Imgur, or website link).
                  The menu cards and detail views will instantly display this image.
                </p>
              </div>

              {/* Sample Quick Links */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-medium text-[#9E958C]">
                  Or pick a curated sample photo:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {SAMPLE_IMAGE_LINKS.map((sample) => (
                    <button
                      key={sample.name}
                      type="button"
                      onClick={() => setQuickLinkUrl(sample.url)}
                      className="text-[10px] bg-[#241F1C] hover:bg-[#2A2420] text-[#F5F0EB] border border-[#2E2824] px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      {sample.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Preview Box */}
              {quickLinkUrl ? (
                <div className="p-3 bg-[#241F1C] border border-[#2E2824] rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-[#F5F0EB]">
                      Live card preview:
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuickLinkUrl('')}
                      className="text-[11px] text-red-400 hover:underline cursor-pointer"
                    >
                      Clear link
                    </button>
                  </div>
                  <div className="w-full h-36 rounded-lg overflow-hidden border border-[#2E2824] bg-[#141210] relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={quickLinkUrl}
                      alt="Live preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                      onLoad={(e) => {
                        (e.target as HTMLElement).style.display = 'block';
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-[#241F1C] border border-dashed border-[#2E2824] rounded-xl text-center space-y-1">
                  <ImageIcon className="w-6 h-6 text-[#7E756C] mx-auto opacity-50" />
                  <p className="text-xs text-[#9E958C]">
                    No link provided yet. Paste a link or select a sample above.
                  </p>
                </div>
              )}

              <div className="pt-2 border-t border-[#2E2824] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setLinkModalItem(null)}
                  className="px-3.5 py-2 border border-[#2E2824] hover:bg-[#241F1C] text-[#9E958C] hover:text-[#F5F0EB] rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingLink}
                  className="bg-[#10B981] hover:bg-[#059669] disabled:opacity-50 text-[#141210] px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {isSavingLink ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving link...</span>
                    </>
                  ) : (
                    <span>Save image link</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL ADD / EDIT PRODUCT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-[#1E1A17] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-[#2E2824] max-h-[90vh]">
            <div className="px-5 py-4 bg-[#241F1C] border-b border-[#2E2824] flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#F5F0EB]">
                {editingItem ? dict.editProductModalTitle : dict.createProductModalTitle}
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

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5 overflow-y-auto">
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#F5F0EB] block">
                  Product name <span className="text-[#10B981] font-normal">(Primary / Fallback)</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={editingItem?.name || ''}
                  placeholder="e.g. Yirgacheffe Pour-Over"
                  className="w-full bg-[#241F1C] border border-[#2E2824] rounded-xl px-3 py-2 text-xs text-[#F5F0EB] placeholder-[#7E756C] focus:outline-hidden focus:border-[#10B981] transition-colors"
                />
              </div>

              {/* Optional Bilingual Names */}
              <div className="p-3 bg-[#241F1C] border border-[#2E2824] rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#F5F0EB]">
                    Bilingual Names <span className="text-[#9E958C] font-normal">(Optional)</span>
                  </span>
                  <span className="text-[10px] text-[#10B981]">
                    Amharic & English
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] text-[#9E958C] flex items-center gap-1">
                      <span>🇪🇹 Amharic name (አማርኛ)</span>
                    </label>
                    <input
                      type="text"
                      name="nameAm"
                      defaultValue={editingItem?.nameAm || ''}
                      placeholder="ለምሳሌ፡ ይርጋጨፌ ፑር ኦቨር"
                      className="w-full bg-[#1E1A17] border border-[#2E2824] rounded-lg px-2.5 py-1.5 text-xs text-[#F5F0EB] placeholder-[#7E756C] focus:outline-hidden focus:border-[#10B981] transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-[#9E958C] flex items-center gap-1">
                      <span>🇬🇧 English name</span>
                    </label>
                    <input
                      type="text"
                      name="nameEn"
                      defaultValue={editingItem?.nameEn || ''}
                      placeholder="e.g. Yirgacheffe Pour-Over"
                      className="w-full bg-[#1E1A17] border border-[#2E2824] rounded-lg px-2.5 py-1.5 text-xs text-[#F5F0EB] placeholder-[#7E756C] focus:outline-hidden focus:border-[#10B981] transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-[#F5F0EB] block">
                  Category
                </label>
                <select
                  name="categoryId"
                  required
                  defaultValue={editingItem?.categoryId || categories[0]?.id || ''}
                  className="w-full bg-[#241F1C] border border-[#2E2824] rounded-xl px-3 py-2 text-xs text-[#F5F0EB] focus:outline-hidden focus:border-[#10B981] transition-colors cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#1E1A17]">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-[#F5F0EB] block">
                  Price ({currency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="price"
                  required
                  defaultValue={editingItem ? Number(editingItem.price) : ''}
                  placeholder="180.00"
                  className="w-full bg-[#241F1C] border border-[#2E2824] rounded-xl px-3 py-2 text-xs text-[#F5F0EB] placeholder-[#7E756C] focus:outline-hidden focus:border-[#10B981] transition-colors"
                />
              </div>

              {/* Image Link Input with Live Preview */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-[#F5F0EB] block">
                    Image link (URL)
                  </label>
                  {imageUrlInput && (
                    <a
                      href={imageUrlInput}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-[#10B981] hover:underline inline-flex items-center gap-1 font-medium"
                    >
                      <span>Open link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <input
                  type="url"
                  name="imageUrl"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full bg-[#241F1C] border border-[#2E2824] rounded-xl px-3 py-2 text-xs text-[#F5F0EB] placeholder-[#7E756C] focus:outline-hidden focus:border-[#10B981] transition-colors"
                />
                <p className="text-[11px] text-[#9E958C]">
                  Paste a direct web image link. Direct file upload is disabled.
                </p>
                {imageUrlInput && (
                  <div className="flex items-center gap-3 p-2 bg-[#241F1C] border border-[#2E2824] rounded-xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageUrlInput}
                      alt="Preview"
                      className="w-12 h-12 rounded-lg object-cover border border-[#2E2824] bg-[#141210] shrink-0"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                      onLoad={(e) => {
                        (e.target as HTMLElement).style.display = 'block';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[11px] font-medium text-[#F5F0EB] block truncate">
                        Image link preview
                      </span>
                      <button
                        type="button"
                        onClick={() => setImageUrlInput('')}
                        className="text-[11px] text-red-400 hover:underline cursor-pointer"
                      >
                        Clear link
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-[#F5F0EB] block">
                  Description & tasting notes <span className="text-[#10B981] font-normal">(Primary / Fallback)</span>
                </label>
                <textarea
                  name="description"
                  rows={2}
                  defaultValue={editingItem?.description || ''}
                  placeholder="Floral notes, jasmine, bergamot finish..."
                  className="w-full bg-[#241F1C] border border-[#2E2824] rounded-xl px-3 py-2 text-xs text-[#F5F0EB] placeholder-[#7E756C] focus:outline-hidden focus:border-[#10B981] transition-colors"
                />
              </div>

              {/* Optional Bilingual Descriptions */}
              <div className="p-3 bg-[#241F1C] border border-[#2E2824] rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#F5F0EB]">
                    Bilingual Descriptions <span className="text-[#9E958C] font-normal">(Optional)</span>
                  </span>
                  <span className="text-[10px] text-[#10B981]">
                    Amharic & English
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <label className="text-[11px] text-[#9E958C] flex items-center gap-1">
                      <span>🇪🇹 Amharic description (የአማርኛ ማብራሪያ)</span>
                    </label>
                    <textarea
                      name="descriptionAm"
                      rows={2}
                      defaultValue={editingItem?.descriptionAm || ''}
                      placeholder="የአበባ መዓዛ ያለው፣ የጃስሚን ጣዕም..."
                      className="w-full bg-[#1E1A17] border border-[#2E2824] rounded-lg px-2.5 py-1.5 text-xs text-[#F5F0EB] placeholder-[#7E756C] focus:outline-hidden focus:border-[#10B981] transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-[#9E958C] flex items-center gap-1">
                      <span>🇬🇧 English description</span>
                    </label>
                    <textarea
                      name="descriptionEn"
                      rows={2}
                      defaultValue={editingItem?.descriptionEn || ''}
                      placeholder="Floral notes, sweet jasmine, and bergamot citrus finish..."
                      className="w-full bg-[#1E1A17] border border-[#2E2824] rounded-lg px-2.5 py-1.5 text-xs text-[#F5F0EB] placeholder-[#7E756C] focus:outline-hidden focus:border-[#10B981] transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isAvailable"
                  name="isAvailable"
                  defaultChecked={editingItem ? editingItem.isAvailable : true}
                  className="rounded border-[#2E2824] text-[#10B981] focus:ring-[#10B981] bg-[#241F1C]"
                />
                <label htmlFor="isAvailable" className="text-xs text-[#F5F0EB] cursor-pointer">
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
                  className="bg-[#10B981] hover:bg-[#059669] disabled:opacity-50 text-[#141210] px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{dict.savingProduct}</span>
                    </>
                  ) : (
                    <span>{dict.saveProduct}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
