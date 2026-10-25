"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Coffee,
  Search,
  Plus,
  Minus,
  Trash2,
  X,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Clock,
  ShoppingBag,
} from "lucide-react";
import { LanguageProvider, useLanguage } from "@/lib/i18n/context";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { ADDON_TRANSLATIONS } from "@/lib/i18n/translations";

export interface MenuItemAddonData {
  id: string;
  name: string;
  nameAm?: string | null;
  nameEn?: string | null;
  price: number;
  icon?: string | null;
}

export interface MenuItemData {
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
  addons?: MenuItemAddonData[];
  recommendations?: MenuItemData[];
}

export interface CategoryData {
  id: string;
  name: string;
  nameAm?: string | null;
  nameEn?: string | null;
  slug: string;
  description: string | null;
  descriptionAm?: string | null;
  descriptionEn?: string | null;
  displayOrder: number;
  items: MenuItemData[];
}

export interface TableOption {
  id: string;
  tableNumber: string;
  displayName: string | null;
}

interface CartItem {
  product: MenuItemData;
  quantity: number;
  notes?: string;
}

interface MenuClientProps {
  categories: CategoryData[];
  tables: TableOption[];
  initialTable: TableOption | null;
  currency: string;
  cafeName: string;
}

// Visual category thumbnail mapping for horizontal category cards
const CATEGORY_IMAGES: Record<string, string> = {
  "special-breakfasts":
    "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=200&q=80",
  "hot-drinks":
    "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=200&q=80",
  "hot-coffees":
    "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=200&q=80",
  "cold-brews-iced":
    "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=200&q=80",
  "signature-specialty":
    "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=200&q=80",
  "pastries-bakery":
    "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=200&q=80",
  "teas-refreshers":
    "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=200&q=80",
};

function MenuClientContent({
  categories,
  tables,
  initialTable,
  currency,
  cafeName,
}: MenuClientProps) {
  const router = useRouter();
  const {
    language,
    dict,
    formatCurrency,
    translateCategory,
    translateMenuItem,
  } = useLanguage();
  const activeCurrency = formatCurrency(currency);

  // State
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTableId, setSelectedTableId] = useState<string>(
    initialTable?.id || (tables.length > 0 ? tables[0].id : ""),
  );
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [orderNotes, setOrderNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Product Detail Bottom Sheet State
  const [detailProduct, setDetailProduct] = useState<MenuItemData | null>(null);
  const [detailQuantity, setDetailQuantity] = useState<number>(1);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [detailNotes, setDetailNotes] = useState<string>("");

  // Selected table object
  const currentTable = useMemo(() => {
    return tables.find((t) => t.id === selectedTableId) || null;
  }, [tables, selectedTableId]);

  // All products flat list (for recommendations)
  const allProducts = useMemo(() => {
    return categories.flatMap((c) => c.items);
  }, [categories]);

  // Recommendations: admin-selected recommendations with fallback
  const recommendedItems = useMemo(() => {
    if (!detailProduct) return allProducts.slice(0, 4);
    if (detailProduct.recommendations && detailProduct.recommendations.length > 0) {
      return detailProduct.recommendations;
    }
    return allProducts
      .filter(
        (p) =>
          p.id !== detailProduct.id &&
          p.categoryId !== detailProduct.categoryId,
      )
      .slice(0, 4);
  }, [allProducts, detailProduct]);

  // Open Product Detail Sheet
  const openProductDetail = (product: MenuItemData) => {
    if (!product.isAvailable) return;
    setDetailProduct(product);
    setDetailQuantity(1);
    setSelectedAddons([]);
    setDetailNotes("");
  };

  const closeProductDetail = () => {
    setDetailProduct(null);
  };

  const toggleAddon = (addonName: string) => {
    setSelectedAddons((prev) =>
      prev.includes(addonName)
        ? prev.filter((a) => a !== addonName)
        : [...prev, addonName],
    );
  };

  // Add item from detail modal
  const handleAddFromDetail = () => {
    if (!detailProduct || !detailProduct.isAvailable) return;

    // Localize addon names in notes according to current language
    const localizedAddonNotes = selectedAddons.map((addonName) => {
      const match = detailProduct.addons?.find((a) => a.name === addonName);
      if (match) {
        return language === "am"
          ? match.nameAm || match.name
          : match.nameEn || match.name;
      }
      return ADDON_TRANSLATIONS[addonName]?.[language] || addonName;
    });

    const compiledNotes = [localizedAddonNotes.join(", "), detailNotes.trim()]
      .filter(Boolean)
      .join(" • ");

    setCart((prev) => {
      const existing = prev.find(
        (item) =>
          item.product.id === detailProduct.id &&
          item.notes === (compiledNotes || undefined),
      );
      if (existing) {
        return prev.map((item) =>
          item === existing
            ? { ...item, quantity: item.quantity + detailQuantity }
            : item,
        );
      }
      return [
        ...prev,
        {
          product: detailProduct,
          quantity: detailQuantity,
          notes: compiledNotes || undefined,
        },
      ];
    });

    closeProductDetail();
  };

  // Direct quick add to cart
  const addToCartDirect = (product: MenuItemData, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!product.isAvailable) return;
    setCart((prev) => {
      const existing = prev.find(
        (item) => item.product.id === product.id && !item.notes,
      );
      if (existing) {
        return prev.map((item) =>
          item === existing ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (index: number, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item, idx) => {
          if (idx === index) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Cart totals
  const totalItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0,
  );

  // Filtered menu items with bilingual search support
  const filteredCategories = useMemo(() => {
    return categories
      .map((cat) => {
        if (selectedCategory !== "all" && cat.slug !== selectedCategory) {
          return null;
        }

        const localizedCat = translateCategory(
          cat.slug,
          cat.name,
          cat.description,
          cat.nameAm,
          cat.nameEn,
          cat.descriptionAm,
          cat.descriptionEn
        );

        const filteredItems = cat.items.filter((item) => {
          if (!searchQuery.trim()) return true;
          const q = searchQuery.toLowerCase();
          const localizedItem = translateMenuItem(
            item.name,
            item.description,
            item.nameAm,
            item.nameEn,
            item.descriptionAm,
            item.descriptionEn
          );
          return (
            item.name.toLowerCase().includes(q) ||
            (item.nameAm && item.nameAm.toLowerCase().includes(q)) ||
            (item.nameEn && item.nameEn.toLowerCase().includes(q)) ||
            localizedItem.name.toLowerCase().includes(q) ||
            (item.description && item.description.toLowerCase().includes(q)) ||
            (item.descriptionAm && item.descriptionAm.toLowerCase().includes(q)) ||
            (item.descriptionEn && item.descriptionEn.toLowerCase().includes(q)) ||
            (localizedItem.description &&
              localizedItem.description.toLowerCase().includes(q))
          );
        });

        if (filteredItems.length === 0) return null;

        return {
          ...cat,
          displayName: localizedCat.name,
          displayDescription: localizedCat.description,
          items: filteredItems,
        };
      })
      .filter(Boolean) as (CategoryData & {
      displayName: string;
      displayDescription: string | null;
    })[];
  }, [
    categories,
    selectedCategory,
    searchQuery,
    translateCategory,
    translateMenuItem,
  ]);

  // Order submission
  const handlePlaceOrder = async () => {
    if (!selectedTableId) {
      setSubmitError(dict.selectTableError);
      return;
    }

    if (cart.length === 0) {
      setSubmitError(dict.cartEmptyError);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const idempotencyKey = `order_${selectedTableId}_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 9)}`;

      const payload = {
        tableId: selectedTableId,
        items: cart.map((item) => ({
          menuItemId: item.product.id,
          quantity: item.quantity,
          notes: item.notes || null,
        })),
        notes: orderNotes.trim() || null,
        idempotencyKey,
      };

      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.error || "Failed to submit order. Please try again.",
        );
      }

      const orderId = data.orderId || data.order?.orderId || data.order?.id;
      if (!orderId) {
        throw new Error(
          data.error || "Order created, but failed to retrieve confirmation ID.",
        );
      }

      // Reset cart and notes on successful submission
      setCart([]);
      setOrderNotes("");
      setIsCartOpen(false);

      // Order created successfully, navigate to live order tracker
      router.push(`/menu/order/${orderId}`);
    } catch (err: unknown) {
      setSubmitError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#141210] text-[#F5F0EB] pb-32">
      {/* Top Header Bar */}
      <header className="bg-[#141210]/95 backdrop-blur-md border-b border-[#24201D] px-3.5 sm:px-4 py-3 sticky top-0 z-30">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[#10B981] shrink-0">
              {/* <div className="w-8 h-8 rounded-xl bg-[#1E1A17] border border-[#2E2824] flex items-center justify-center text-[#10B981] shrink-0"> */}
              <Coffee className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="font-semibold text-sm tracking-tight text-[#F5F0EB] block leading-none truncate">
                {cafeName}
              </span>
              {/* <span className="text-[10px] text-[#9E958C] truncate block">
                {dict.cafeSubtitle}
              </span> */}
            </div>
          </div>

          {/* Right Action Cluster: Language Switcher + Table Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <LanguageSwitcher showIcon={false} />

            {/* Table Selector Pill */}
            <div className="flex items-center gap-1 bg-[#1E1A17] border border-[#2E2824] rounded-full px-2.5 py-1 max-w-[200px]">
              <span className="text-[10px] text-[#9E958C] hidden xs:inline">
                {dict.tableSelector}
              </span>
              <select
                value={selectedTableId}
                onChange={(e) => setSelectedTableId(e.target.value)}
                className="bg-transparent text-[#10B981] font-semibold text-xs focus:outline-hidden cursor-pointer max-w-[170px]"
                aria-label={dict.table}
              >
                {tables.map((t) => (
                  <option
                    key={t.id}
                    value={t.id}
                    className="bg-[#1E1A17] text-[#F5F0EB]"
                  >
                    {dict.table} {t.tableNumber}{" "}
                    {t.displayName ? `(${t.displayName})` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 pt-4 space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7E756C]" />
          <input
            type="text"
            placeholder={dict.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1E1A17] border border-[#2E2824] text-[#F5F0EB] placeholder-[#7E756C] text-sm rounded-2xl pl-10 pr-10 py-3 focus:outline-hidden focus:border-[#10B981] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#7E756C] hover:text-[#F5F0EB]"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Visual Category Scroller */}
        <div className="space-y-2">
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
            {/* All Items Card */}
            <button
              onClick={() => setSelectedCategory("all")}
              className={`w-20 shrink-0 p-2.5 rounded-2xl flex flex-col items-center gap-1.5 transition-all text-center ${
                selectedCategory === "all"
                  ? "bg-[#10B981] text-[#141210] font-bold shadow-lg shadow-[#10B981]/20 scale-102"
                  : "bg-[#1E1A17] text-[#9E958C] border border-[#2E2824] hover:border-[#4A3F38]"
              }`}
            >
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center ${
                  selectedCategory === "all"
                    ? "bg-[#141210] text-[#10B981]"
                    : "bg-[#2A2420] text-[#DCCBB8]"
                }`}
              >
                <Coffee className="w-5 h-5" />
              </div>
              <span className="text-[11px] leading-tight font-medium truncate w-full">
                {dict.allRoasts}
              </span>
            </button>

            {/* Category Cards with Images */}
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.slug;
              const localizedCat = translateCategory(
                cat.slug,
                cat.name,
                cat.description,
                cat.nameAm,
                cat.nameEn,
                cat.descriptionAm,
                cat.descriptionEn
              );
              const imageUrl =
                CATEGORY_IMAGES[cat.slug] ||
                cat.items[0]?.imageUrl ||
                "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=200&q=80";

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`w-20 shrink-0 p-2.5 rounded-2xl flex flex-col items-center gap-1.5 transition-all text-center ${
                    isActive
                      ? "bg-[#10B981] text-[#141210] font-bold shadow-lg shadow-[#10B981]/20 scale-102"
                      : "bg-[#1E1A17] text-[#9E958C] border border-[#2E2824] hover:border-[#4A3F38]"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt={localizedCat.name}
                    className="w-11 h-11 rounded-full object-cover border border-black/10"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                  <span className="text-[11px] leading-tight font-medium truncate w-full">
                    {localizedCat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Menu Listings */}
        {filteredCategories.length === 0 ? (
          <div className="text-center py-16 space-y-3 bg-[#1E1A17] border border-[#2E2824] rounded-3xl p-6">
            <Coffee className="w-8 h-8 text-[#7E756C] mx-auto" />
            <p className="text-sm text-[#F5F0EB] font-medium">
              {dict.noItemsFound}
            </p>
            <p className="text-xs text-[#9E958C]">{dict.noItemsFoundDesc}</p>
          </div>
        ) : (
          filteredCategories.map((cat) => (
            <section key={cat.id} className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm sm:text-base font-semibold text-[#F5F0EB] tracking-tight">
                    {cat.displayName}
                  </h2>
                  {cat.displayDescription && (
                    <p className="text-xs text-[#9E958C] mt-0.5 line-clamp-1">
                      {cat.displayDescription}
                    </p>
                  )}
                </div>
              </div>

              {/* 2-Column Product Cards Grid */}
              <div className="grid grid-cols-2 gap-3.5 sm:gap-4">
                {cat.items.map((item) => {
                  const localizedItem = translateMenuItem(
                    item.name,
                    item.description,
                    item.nameAm,
                    item.nameEn,
                    item.descriptionAm,
                    item.descriptionEn
                  );

                  return (
                    <div
                      key={item.id}
                      onClick={() => openProductDetail(item)}
                      className={`bg-[#1E1A17] hover:bg-[#25201C] border border-[#2E2824] hover:border-[#4A3F38] rounded-3xl p-3.5 flex flex-col justify-between cursor-pointer transition-all duration-200 shadow-sm relative group overflow-hidden ${
                        !item.isAvailable
                          ? "opacity-50 pointer-events-none"
                          : ""
                      }`}
                    >
                      {/* Floating Hero Circular Photo */}
                      <div className="relative pt-2 pb-1">
                        {item.imageUrl ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={item.imageUrl}
                            alt={localizedItem.name}
                            loading="lazy"
                            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover mx-auto shadow-xl border-2 border-[#2E2824] group-hover:scale-105 transition-transform duration-200 bg-[#2A2420]"
                            onError={(e) => {
                              const img = e.currentTarget;
                              if (!img.dataset.fallback) {
                                img.dataset.fallback = "true";
                                img.src =
                                  "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80";
                              }
                            }}
                          />
                        ) : (
                          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#2A2420] border-2 border-[#2E2824] mx-auto flex items-center justify-center text-[#7E756C]">
                            <Coffee className="w-8 h-8 opacity-40" />
                          </div>
                        )}

                        {/* Direct quick add button overlay */}
                        {item.isAvailable && (
                          <button
                            type="button"
                            onClick={(e) => addToCartDirect(item, e)}
                            className="absolute top-0 right-0 w-7 h-7 rounded-full bg-[#e06d53] hover:bg-[#10B981] hover:text-[#141210] text-[#fff] flex items-center justify-center shadow-md transition-colors"
                            aria-label={`${dict.addToOrder} ${localizedItem.name}`}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Content */}
                      <div className="space-y-1 mt-2 text-center flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-xs sm:text-sm font-semibold text-[#F5F0EB] leading-tight line-clamp-1">
                            {localizedItem.name}
                          </h3>
                          {localizedItem.description && (
                            <p className="text-[11px] text-[#9E958C] line-clamp-2 mt-1 leading-relaxed">
                              {localizedItem.description}
                            </p>
                          )}
                        </div>

                        {/* Meta row: Time tag and Price */}
                        <div className="pt-3 mt-2 border-t border-[#2A2420] flex items-center justify-between">
                          <span className="inline-flex items-center gap-1 text-[10px] text-[#9E958C] bg-[#2A2420] px-2 py-0.5 rounded-full">
                            <Clock className="w-2.5 h-2.5 text-[#10B981]" />
                            <span>{dict.timeTag}</span>
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-[#E06D53]">
                            {item.price.toFixed(2)} {activeCurrency}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </main>

      {/* Floating Bottom Cart Bar */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 inset-x-4 max-w-xl mx-auto z-40">
          <div className="bg-[#1E1A17]/95 backdrop-blur-md border border-[#38312C] text-[#F5F0EB] shadow-2xl rounded-2xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl bg-[#2A2420] flex items-center justify-center text-[#10B981]">
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#10B981] text-[#141210] text-[10px] font-bold rounded-full flex items-center justify-center">
                  {totalItemCount}
                </span>
              </div>
              <div>
                <span className="text-xs text-[#9E958C] block">
                  {dict.subtotal}
                </span>
                <span className="text-sm font-bold text-[#F5F0EB]">
                  {cartSubtotal.toFixed(2)} {activeCurrency}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(true)}
              className="bg-[#10B981] hover:bg-[#059669] text-[#141210] font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-[#10B981]/20 cursor-pointer"
            >
              <span>{dict.viewOrder}</span>
            </button>
          </div>
        </div>
      )}

      {/* Product Detail Bottom Sheet */}
      {detailProduct && (() => {
        const localizedDetail = translateMenuItem(
          detailProduct.name,
          detailProduct.description,
          detailProduct.nameAm,
          detailProduct.nameEn,
          detailProduct.descriptionAm,
          detailProduct.descriptionEn
        );

        return (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-xs p-0 sm:p-4">
            <div className="bg-[#1E1A17] border-t sm:border border-[#2E2824] rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl relative animate-in slide-in-from-bottom duration-250">
              {/* Top Navigation */}
              <div className="p-4 flex items-center justify-between sticky top-0 bg-[#1E1A17]/95 backdrop-blur-xs z-10 border-b border-[#2E2824]">
                <button
                  onClick={closeProductDetail}
                  className="w-9 h-9 rounded-full bg-[#2A2420] text-[#F5F0EB] hover:bg-[#38302A] flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Back"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-semibold text-[#9E958C]">
                  {dict.detailsAndCustomization}
                </span>
                <div className="w-9" />
              </div>

              <div className="p-5 space-y-5 flex-1">
                {/* Floating Hero Circular Photo */}
                <div className="text-center pt-2">
                  {detailProduct.imageUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={detailProduct.imageUrl}
                      alt={localizedDetail.name}
                      className="w-40 h-40 sm:w-44 sm:h-44 rounded-full object-cover mx-auto shadow-2xl border-4 border-[#2E2824] bg-[#2A2420]"
                      onError={(e) => {
                        const img = e.currentTarget;
                        if (!img.dataset.fallback) {
                          img.dataset.fallback = "true";
                          img.src =
                            "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80";
                        }
                      }}
                    />
                  ) : (
                    <div className="w-40 h-40 rounded-full bg-[#2A2420] border-4 border-[#2E2824] mx-auto flex items-center justify-center text-[#7E756C]">
                      <Coffee className="w-12 h-12 opacity-40" />
                    </div>
                  )}
                </div>

                {/* Title & Price */}
                <div className="flex items-start justify-between gap-3 pt-2">
                  <div className="space-y-1">
                    <h2 className="text-base sm:text-lg font-bold text-[#F5F0EB] leading-tight">
                      {localizedDetail.name}
                    </h2>
                    <div className="flex items-center gap-1.5 text-xs text-[#10B981]">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{dict.brewedFresh}</span>
                    </div>
                  </div>
                  <span className="text-base sm:text-lg font-bold text-[#E06D53] whitespace-nowrap">
                    {detailProduct.price.toFixed(2)} {activeCurrency}
                  </span>
                </div>

                {/* Description */}
                {localizedDetail.description && (
                  <p className="text-xs text-[#9E958C] leading-relaxed bg-[#241F1C] p-3 rounded-2xl border border-[#2E2824]">
                    {localizedDetail.description}
                  </p>
                )}

                {/* Add-ons section */}
                {detailProduct.addons && detailProduct.addons.length > 0 && (
                  <div className="space-y-2.5">
                    <h3 className="text-xs font-medium text-[#F5F0EB]">
                      {dict.chooseAddons}
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                      {detailProduct.addons.map((addon) => {
                        const isSelected = selectedAddons.includes(addon.name);
                        const localizedAddonLabel =
                          language === "am"
                            ? addon.nameAm || addon.name
                            : addon.nameEn || addon.name;

                        return (
                          <button
                            key={addon.id}
                            type="button"
                            onClick={() => toggleAddon(addon.name)}
                            className={`p-2.5 rounded-2xl border flex flex-col items-center gap-1.5 transition-all text-center cursor-pointer ${
                              isSelected
                                ? "bg-[#10B981]/15 border-[#10B981] text-[#10B981]"
                                : "bg-[#241F1C] border-[#2E2824] text-[#9E958C] hover:border-[#3D342E]"
                            }`}
                          >
                            <span className="text-lg">{addon.icon || "☕"}</span>
                            <span className="text-[11px] font-medium leading-tight">
                              {localizedAddonLabel}
                            </span>
                            {addon.price > 0 && (
                              <span className="text-[10px] text-[#E06D53] font-mono">
                                +{addon.price} ETB
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* We recommend (Pairings section) */}
                <div className="space-y-2.5 pt-1">
                  <h3 className="text-xs font-medium text-[#F5F0EB]">
                    {dict.weRecommend}
                  </h3>
                  <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
                    {recommendedItems.map((rec) => {
                      const localizedRec = translateMenuItem(
                        rec.name,
                        rec.description,
                        rec.nameAm,
                        rec.nameEn,
                        rec.descriptionAm,
                        rec.descriptionEn
                      );

                    return (
                      <div
                        key={rec.id}
                        className="w-28 shrink-0 bg-[#241F1C] border border-[#2E2824] rounded-2xl p-2.5 flex flex-col items-center gap-1.5 relative group"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={
                            rec.imageUrl ||
                            "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=200&q=80"
                          }
                          alt={localizedRec.name}
                          className="w-12 h-12 rounded-full object-cover border border-[#2E2824]"
                          onError={(e) => {
                            const img = e.currentTarget;
                            if (!img.dataset.fallback) {
                              img.dataset.fallback = "true";
                              img.src =
                                "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=200&q=80";
                            }
                          }}
                        />
                        <span className="text-[11px] font-medium text-[#F5F0EB] text-center line-clamp-1 w-full">
                          {localizedRec.name}
                        </span>
                        <span className="text-[10px] font-bold text-[#E06D53]">
                          {rec.price.toFixed(2)} {activeCurrency}
                        </span>
                        <button
                          type="button"
                          onClick={() => addToCartDirect(rec)}
                          className="w-6 h-6 rounded-full bg-[#10B981] text-[#141210] flex items-center justify-center hover:bg-[#059669] transition-colors mt-0.5 cursor-pointer"
                          aria-label={`${dict.addToOrder} ${localizedRec.name}`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Special preparation note */}
              <div className="space-y-1 pt-1">
                <label className="text-xs font-semibold text-[#F5F0EB] block">
                  {dict.additionalNotes}
                </label>
                <input
                  type="text"
                  placeholder={dict.notesPlaceholder}
                  value={detailNotes}
                  onChange={(e) => setDetailNotes(e.target.value)}
                  className="w-full bg-[#241F1C] border border-[#2E2824] rounded-xl px-3 py-2 text-xs text-[#F5F0EB] placeholder-[#7E756C] focus:outline-hidden focus:border-[#10B981]"
                />
              </div>
            </div>

            {/* Bottom Sticky Action Bar */}
            <div className="p-4 bg-[#1E1A17] border-t border-[#2E2824] flex items-center gap-3 sticky bottom-0">
              {/* Stepper */}
              <div className="flex items-center gap-3 bg-[#2A2420] border border-[#38312C] rounded-2xl px-3 py-2">
                <button
                  type="button"
                  onClick={() => setDetailQuantity((q) => Math.max(1, q - 1))}
                  className="w-6 h-6 flex items-center justify-center text-[#9E958C] hover:text-[#F5F0EB] cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-sm font-bold text-[#F5F0EB] w-4 text-center">
                  {detailQuantity}
                </span>
                <button
                  type="button"
                  onClick={() => setDetailQuantity((q) => q + 1)}
                  className="w-6 h-6 flex items-center justify-center text-[#9E958C] hover:text-[#F5F0EB] cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Order / Add Button */}
              <button
                type="button"
                onClick={handleAddFromDetail}
                className="flex-1 bg-[#10B981] hover:bg-[#059669] text-[#141210] font-bold py-3 px-5 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#10B981]/25 transition-all cursor-pointer"
              >
                <span>{dict.addToOrder}</span>
                <span>•</span>
                <span>
                  {(detailProduct.price * detailQuantity).toFixed(2)}{" "}
                  {activeCurrency}
                </span>
              </button>
            </div>
          </div>
        </div>
      );
    })()}

      {/* Cart Drawer / Slide-Over Review */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-xs">
          <div className="bg-[#1E1A17] text-[#F5F0EB] w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-250">
            {/* Drawer Header */}
            <div className="px-5 py-4 border-b border-[#2E2824] flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-[#F5F0EB]">
                  {dict.yourOrderReview}
                </h3>
                <p className="text-xs text-[#10B981] font-medium">
                  {dict.table} {currentTable?.tableNumber || ""}
                </p>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-full bg-[#2A2420] text-[#9E958C] hover:text-[#F5F0EB] flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error Message */}
            {submitError && (
              <div className="mx-5 mt-4 p-3 bg-red-900/30 border border-red-700/50 rounded-xl text-xs text-red-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Drawer Items List */}
            <div className="p-5 overflow-y-auto space-y-3.5 flex-1">
              {cart.map((item, idx) => {
                const localizedCartItem = translateMenuItem(
                  item.product.name,
                  item.product.description,
                  item.product.nameAm,
                  item.product.nameEn,
                  item.product.descriptionAm,
                  item.product.descriptionEn
                );

                return (
                  <div
                    key={`${item.product.id}-${idx}`}
                    className="flex items-start justify-between border-b border-[#2A2420] pb-3 last:border-b-0"
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-2">
                      {item.product.imageUrl && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={item.product.imageUrl}
                          alt={localizedCartItem.name}
                          className="w-11 h-11 rounded-full object-cover border border-[#2E2824] shrink-0 bg-[#2A2420]"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      )}
                      <div className="space-y-0.5 min-w-0">
                        <h4 className="text-xs font-semibold text-[#F5F0EB] truncate">
                          {localizedCartItem.name}
                        </h4>
                        <p className="text-[11px] text-[#E06D53] font-bold">
                          {item.product.price.toFixed(2)} {activeCurrency}
                        </p>
                        {item.notes && (
                          <p className="text-[10px] text-[#10B981] font-medium truncate">
                            + {item.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center gap-1.5 bg-[#2A2420] border border-[#38312C] rounded-lg p-0.5">
                        <button
                          onClick={() => updateQuantity(idx, -1)}
                          className="w-5 h-5 flex items-center justify-center text-[#9E958C] hover:text-[#F5F0EB] cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-[#F5F0EB] w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(idx, 1)}
                          className="w-5 h-5 flex items-center justify-center text-[#9E958C] hover:text-[#F5F0EB] cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(idx)}
                        className="text-[#7E756C] hover:text-red-400 p-1 cursor-pointer"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Order Notes */}
              <div className="space-y-1 pt-2">
                <label className="text-xs font-medium text-[#F5F0EB] block">
                  {dict.tableInstructions}
                </label>
                <textarea
                  rows={2}
                  placeholder={dict.instructionsPlaceholder}
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full bg-[#241F1C] border border-[#2E2824] rounded-xl p-2.5 text-xs text-[#F5F0EB] placeholder-[#7E756C] focus:outline-hidden focus:border-[#10B981]"
                />
              </div>

              {/* Payment note */}
              <div className="bg-[#241F1C] border border-[#2E2824] rounded-2xl p-3 text-xs text-[#9E958C] flex items-center gap-2.5">
                <Coffee className="w-4 h-4 text-[#10B981] shrink-0" />
                <span>{dict.paymentNotice}</span>
              </div>
            </div>

            {/* Drawer Footer & Submit */}
            <div className="p-5 border-t border-[#2E2824] bg-[#1E1A17] space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#9E958C]">{dict.totalAmount}</span>
                <span className="text-base font-bold text-[#F5F0EB]">
                  {cartSubtotal.toFixed(2)} {activeCurrency}
                </span>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isSubmitting || cart.length === 0}
                className="w-full bg-[#10B981] hover:bg-[#059669] disabled:opacity-40 text-[#141210] text-sm font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-[#10B981]/25 transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <span>{dict.sendingOrder}</span>
                ) : (
                  <>
                    <span>{dict.confirmAndPlaceOrder}</span>
                    <CheckCircle className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MenuClient(props: MenuClientProps) {
  return (
    <LanguageProvider defaultLanguage="am" storageKey="barch_menu_lang">
      <MenuClientContent {...props} />
    </LanguageProvider>
  );
}
