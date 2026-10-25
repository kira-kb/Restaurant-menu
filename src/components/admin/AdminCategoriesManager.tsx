'use client';

import React, { useState } from 'react';
import { Plus, Edit2, X, AlertCircle, Loader2 } from 'lucide-react';
import {
  createCategoryAction,
  updateCategoryAction,
  toggleCategoryStatusAction,
} from '@/lib/actions/menu';
import { useLanguage } from '@/lib/i18n/context';

interface CategoryRecord {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  displayOrder: number;
  isActive: boolean;
  _count: {
    menuItems: number;
  };
}

export default function AdminCategoriesManager({
  initialCategories,
}: {
  initialCategories: CategoryRecord[];
}) {
  const { dict, translateCategory } = useLanguage();

  const [categories, setCategories] = useState<CategoryRecord[]>(initialCategories);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryRecord | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (cat: CategoryRecord) => {
    setEditingCategory(cat);
    setFormError(null);
    setModalOpen(true);
  };

  const handleToggleStatus = async (id: string) => {
    if (togglingId) return;
    setTogglingId(id);
    try {
      const updated = await toggleCategoryStatusAction(id);
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isActive: updated.isActive } : c))
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update category status');
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
      if (editingCategory) {
        const updated = await updateCategoryAction(editingCategory.id, formData);
        setCategories((prev) =>
          prev.map((c) =>
            c.id === editingCategory.id
              ? {
                  ...c,
                  name: updated.name,
                  slug: updated.slug,
                  description: updated.description,
                  displayOrder: updated.displayOrder,
                  isActive: updated.isActive,
                }
              : c
          )
        );
      } else {
        const created = await createCategoryAction(formData);
        setCategories((prev) => [
          ...prev,
          {
            id: created.id,
            name: created.name,
            slug: created.slug,
            description: created.description,
            displayOrder: created.displayOrder,
            isActive: created.isActive,
            _count: { menuItems: 0 },
          },
        ]);
      }
      setModalOpen(false);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-[#F5F0EB]">
          {dict.categoriesPageTitle}
        </h1>
        <p className="text-xs text-[#9E958C]">
          {dict.categoriesPageSubtitle}
        </p>
      </div>

      <div className="flex items-center justify-between bg-[#1E1A17] border border-[#2E2824] rounded-2xl p-4 shadow-xs">
        <div>
          <h2 className="text-sm font-semibold text-[#F5F0EB]">
            {dict.categoriesPageTitle}
          </h2>
          <p className="text-xs text-[#9E958C]">
            {dict.categoriesPageSubtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 bg-[#10B981] hover:bg-[#059669] text-[#141210] text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>{dict.addCategoryBtn}</span>
        </button>
      </div>

      <div className="bg-[#1E1A17] border border-[#2E2824] rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#241F1C] text-[#9E958C] border-b border-[#2E2824]">
              <tr>
                <th className="px-4 py-3 font-medium">{dict.thOrder}</th>
                <th className="px-4 py-3 font-medium">{dict.thCategoryName}</th>
                <th className="px-4 py-3 font-medium">{dict.thSlug}</th>
                <th className="px-4 py-3 font-medium">{dict.thActiveProducts}</th>
                <th className="px-4 py-3 font-medium">{dict.thStatus}</th>
                <th className="px-4 py-3 font-medium text-right">{dict.thActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#24201D]">
              {categories.map((cat) => {
                const isToggling = togglingId === cat.id;
                const localized = translateCategory(cat.slug, cat.name, cat.description);

                return (
                  <tr key={cat.id} className="hover:bg-[#241F1C]/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-[#9E958C]">
                      {cat.displayOrder}
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-0.5">
                        <span className="font-medium text-[#F5F0EB] block">
                          {localized.name}
                        </span>
                        {localized.description && (
                          <span className="text-[11px] text-[#9E958C] block max-w-sm truncate">
                            {localized.description}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-[#7E756C]">{cat.slug}</td>
                    <td className="px-4 py-3 font-medium text-[#F5F0EB]">
                      {cat._count.menuItems} items
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(cat.id)}
                        disabled={isToggling}
                        className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50 ${
                          cat.isActive
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-[#241F1C] text-[#7E756C] border border-[#2E2824]'
                        }`}
                      >
                        {isToggling ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : null}
                        <span>{cat.isActive ? dict.statusActive : dict.statusInactive}</span>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => openEditModal(cat)}
                        className="p-1.5 text-[#9E958C] hover:text-[#F5F0EB] rounded-xl hover:bg-[#241F1C] transition-colors cursor-pointer"
                        title={dict.editCategory}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-[#1E1A17] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-[#2E2824]">
            <div className="px-5 py-4 bg-[#241F1C] border-b border-[#2E2824] flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#F5F0EB]">
                {editingCategory ? dict.editCategoryModalTitle : dict.createCategoryModalTitle}
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
                  {dict.categoryNameField}
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={editingCategory?.name || ''}
                  placeholder="e.g. Cold Brews & Iced"
                  className="w-full bg-[#241F1C] border border-[#2E2824] rounded-xl px-3 py-2 text-xs text-[#F5F0EB] placeholder-[#7E756C] focus:outline-hidden focus:border-[#10B981] transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-[#F5F0EB] block">
                  {dict.categorySlugField}
                </label>
                <input
                  type="text"
                  name="slug"
                  required
                  defaultValue={editingCategory?.slug || ''}
                  placeholder="cold-brews-iced"
                  className="w-full bg-[#241F1C] border border-[#2E2824] rounded-xl px-3 py-2 text-xs text-[#F5F0EB] placeholder-[#7E756C] focus:outline-hidden focus:border-[#10B981] transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-[#F5F0EB] block">
                  {dict.displayOrderField}
                </label>
                <input
                  type="number"
                  name="displayOrder"
                  min="0"
                  defaultValue={editingCategory?.displayOrder || 0}
                  className="w-full bg-[#241F1C] border border-[#2E2824] rounded-xl px-3 py-2 text-xs text-[#F5F0EB] placeholder-[#7E756C] focus:outline-hidden focus:border-[#10B981] transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-[#F5F0EB] block">
                  {dict.descriptionField}
                </label>
                <textarea
                  name="description"
                  rows={2}
                  defaultValue={editingCategory?.description || ''}
                  placeholder="Short description of items in this category..."
                  className="w-full bg-[#241F1C] border border-[#2E2824] rounded-xl px-3 py-2 text-xs text-[#F5F0EB] placeholder-[#7E756C] focus:outline-hidden focus:border-[#10B981] transition-colors"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  defaultChecked={editingCategory ? editingCategory.isActive : true}
                  className="rounded border-[#2E2824] text-[#10B981] focus:ring-[#10B981] bg-[#241F1C]"
                />
                <label htmlFor="isActive" className="text-xs text-[#F5F0EB] cursor-pointer">
                  {dict.categoryActiveCheckbox}
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
                      <span>{dict.savingCategory}</span>
                    </>
                  ) : (
                    <span>{dict.saveCategory}</span>
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
