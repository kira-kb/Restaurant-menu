'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
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
} from 'lucide-react';

export interface MenuItemData {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean;
  categoryId: string;
}

export interface CategoryData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
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

// Visual category thumbnail mapping for the horizontal category cards
const CATEGORY_IMAGES: Record<string, string> = {
  'hot-coffees': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=200&q=80',
  'cold-brews-iced': 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=200&q=80',
  'signature-specialty': 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=200&q=80',
  'pastries-bakery': 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=200&q=80',
  'teas-refreshers': 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=200&q=80',
};

// Specialty Coffee Customization Add-ons
interface AddonOption {
  id: string;
  name: string;
  icon: string;
}

const AVAILABLE_ADDONS: AddonOption[] = [
  { id: 'oat-milk', name: 'Oat Milk', icon: '🥛' },
  { id: 'extra-shot', name: 'Extra Shot', icon: '☕' },
  { id: 'vanilla-syrup', name: 'Vanilla Bean', icon: '🌿' },
  { id: 'sweet-cream', name: 'Sweet Cream', icon: '🍦' },
  { id: 'no-sugar', name: 'No Sugar', icon: '🍃' },
  { id: 'cardamom-twist', name: 'Cardamom', icon: '✨' },
];

export default function MenuClient({
  categories,
  tables,
  initialTable,
  currency,
  cafeName,
}: MenuClientProps) {
  const router = useRouter();

  // State
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTableId, setSelectedTableId] = useState<string>(
    initialTable?.id || (tables.length > 0 ? tables[0].id : '')
  );
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Product Detail Bottom Sheet State (Right screen mockup)
  const [detailProduct, setDetailProduct] = useState<MenuItemData | null>(null);
  const [detailQuantity, setDetailQuantity] = useState<number>(1);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [detailNotes, setDetailNotes] = useState<string>('');

  // Selected table object
  const currentTable = useMemo(() => {
    return tables.find((t) => t.id === selectedTableId) || null;
  }, [tables, selectedTableId]);

  // All products flat list (for recommendations)
  const allProducts = useMemo(() => {
    return categories.flatMap((c) => c.items);
  }, [categories]);

  // Recommendations: 4 popular pairing items
  const recommendedItems = useMemo(() => {
    if (!detailProduct) return allProducts.slice(0, 4);
    return allProducts
      .filter((p) => p.id !== detailProduct.id && p.categoryId !== detailProduct.categoryId)
      .slice(0, 4);
  }, [allProducts, detailProduct]);

  // Open Product Detail Sheet
  const openProductDetail = (product: MenuItemData) => {
    if (!product.isAvailable) return;
    setDetailProduct(product);
    setDetailQuantity(1);
    setSelectedAddons([]);
    setDetailNotes('');
  };

  const closeProductDetail = () => {
    setDetailProduct(null);
  };

  const toggleAddon = (addonName: string) => {
    setSelectedAddons((prev) =>
      prev.includes(addonName) ? prev.filter((a) => a !== addonName) : [...prev, addonName]
    );
  };

  // Add item from detail modal
  const handleAddFromDetail = () => {
    if (!detailProduct || !detailProduct.isAvailable) return;

    const compiledNotes = [selectedAddons.join(', '), detailNotes.trim()]
      .filter(Boolean)
      .join(' • ');

    setCart((prev) => {
      const existing = prev.find(
        (item) => item.product.id === detailProduct.id && item.notes === (compiledNotes || undefined)
      );
      if (existing) {
        return prev.map((item) =>
          item === existing
            ? { ...item, quantity: item.quantity + detailQuantity }
            : item
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
      const existing = prev.find((item) => item.product.id === product.id && !item.notes);
      if (existing) {
        return prev.map((item) =>
          item === existing ? { ...item, quantity: item.quantity + 1 } : item
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
    0
  );

  // Filtered menu items
  const filteredCategories = useMemo(() => {
    return categories
      .map((cat) => {
        if (selectedCategory !== 'all' && cat.slug !== selectedCategory) {
          return null;
        }

        const filteredItems = cat.items.filter((item) => {
          if (!searchQuery.trim()) return true;
          const q = searchQuery.toLowerCase();
          return (
            item.name.toLowerCase().includes(q) ||
            (item.description && item.description.toLowerCase().includes(q))
          );
        });

        if (filteredItems.length === 0) return null;

        return {
          ...cat,
          items: filteredItems,
        };
      })
      .filter(Boolean) as CategoryData[];
  }, [categories, selectedCategory, searchQuery]);

  // Order submission
  const handlePlaceOrder = async () => {
    if (!selectedTableId) {
      setSubmitError('Please select a table to place your order.');
      return;
    }

    if (cart.length === 0) {
      setSubmitError('Your cart is empty.');
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

      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to place order.');
      }

      // Clear cart and redirect to order confirmation
      setCart([]);
      setIsCartOpen(false);
      router.push(`/menu/order/${data.order.orderId}`);
    } catch (err: unknown) {
      console.error('Order error:', err);
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#141210] text-[#F5F0EB] pb-32">
      {/* Top Header Bar */}
      <header className="bg-[#141210]/95 backdrop-blur-md border-b border-[#24201D] px-4 py-3 sticky top-0 z-30">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#1E1A17] border border-[#2E2824] flex items-center justify-center text-[#10B981]">
              <Coffee className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-sm tracking-tight text-[#F5F0EB] block leading-none">
                {cafeName}
              </span>
              <span className="text-[10px] text-[#9E958C]">Artisan Coffee & Roastery</span>
            </div>
          </div>

          {/* Table Selector Pill */}
          <div className="flex items-center gap-1.5 bg-[#1E1A17] border border-[#2E2824] rounded-full px-3 py-1">
            <span className="text-[11px] text-[#9E958C]">Table:</span>
            <select
              value={selectedTableId}
              onChange={(e) => setSelectedTableId(e.target.value)}
              className="bg-transparent text-[#10B981] font-semibold text-xs focus:outline-hidden cursor-pointer"
            >
              {tables.map((t) => (
                <option key={t.id} value={t.id} className="bg-[#1E1A17] text-[#F5F0EB]">
                  {t.tableNumber} {t.displayName ? `(${t.displayName})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 pt-4 space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7E756C]" />
          <input
            type="text"
            placeholder="Search coffee, drinks, or pastries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1E1A17] border border-[#2E2824] text-[#F5F0EB] placeholder-[#7E756C] text-sm rounded-2xl pl-10 pr-10 py-3 focus:outline-hidden focus:border-[#10B981] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#7E756C] hover:text-[#F5F0EB]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Visual Category Scroller (Matching Left Mockup Screen) */}
        <div className="space-y-2">
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
            {/* All Items Card */}
            <button
              onClick={() => setSelectedCategory('all')}
              className={`w-20 shrink-0 p-2.5 rounded-2xl flex flex-col items-center gap-1.5 transition-all text-center ${
                selectedCategory === 'all'
                  ? 'bg-[#10B981] text-[#141210] font-bold shadow-lg shadow-[#10B981]/20 scale-102'
                  : 'bg-[#1E1A17] text-[#9E958C] border border-[#2E2824] hover:border-[#4A3F38]'
              }`}
            >
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center ${
                  selectedCategory === 'all' ? 'bg-[#141210] text-[#10B981]' : 'bg-[#2A2420] text-[#DCCBB8]'
                }`}
              >
                <Coffee className="w-5 h-5" />
              </div>
              <span className="text-[11px] leading-tight font-medium truncate w-full">All Roasts</span>
            </button>

            {/* Category Cards with Images */}
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.slug;
              const imageUrl =
                CATEGORY_IMAGES[cat.slug] ||
                cat.items[0]?.imageUrl ||
                'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=200&q=80';

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`w-20 shrink-0 p-2.5 rounded-2xl flex flex-col items-center gap-1.5 transition-all text-center ${
                    isActive
                      ? 'bg-[#10B981] text-[#141210] font-bold shadow-lg shadow-[#10B981]/20 scale-102'
                      : 'bg-[#1E1A17] text-[#9E958C] border border-[#2E2824] hover:border-[#4A3F38]'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt={cat.name}
                    className="w-11 h-11 rounded-full object-cover border border-black/10"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <span className="text-[11px] leading-tight font-medium truncate w-full">
                    {cat.name}
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
            <p className="text-sm text-[#F5F0EB] font-medium">No coffee or items found</p>
            <p className="text-xs text-[#9E958C]">Try adjusting your search query or roaster category.</p>
          </div>
        ) : (
          filteredCategories.map((cat) => (
            <section key={cat.id} className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm sm:text-base font-semibold text-[#F5F0EB] tracking-tight">
                    {cat.name}
                  </h2>
                  {cat.description && (
                    <p className="text-xs text-[#9E958C] mt-0.5 line-clamp-1">{cat.description}</p>
                  )}
                </div>
              </div>

              {/* 2-Column Product Cards Grid (Matching Left Screen) */}
              <div className="grid grid-cols-2 gap-3.5 sm:gap-4">
                {cat.items.map((item) => {
                  return (
                    <div
                      key={item.id}
                      onClick={() => openProductDetail(item)}
                      className={`bg-[#1E1A17] hover:bg-[#25201C] border border-[#2E2824] hover:border-[#4A3F38] rounded-3xl p-3.5 flex flex-col justify-between cursor-pointer transition-all duration-200 shadow-sm relative group overflow-hidden ${
                        !item.isAvailable ? 'opacity-50 pointer-events-none' : ''
                      }`}
                    >
                      {/* Floating Hero Circular Photo */}
                      <div className="relative pt-2 pb-1">
                        {item.imageUrl ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            loading="lazy"
                            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover mx-auto shadow-xl border-2 border-[#2E2824] group-hover:scale-105 transition-transform duration-200 bg-[#2A2420]"
                            onError={(e) => {
                              const img = e.currentTarget;
                              if (!img.dataset.fallback) {
                                img.dataset.fallback = 'true';
                                img.src =
                                  'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80';
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
                            className="absolute top-0 right-0 w-7 h-7 rounded-full bg-[#2A2420] hover:bg-[#10B981] hover:text-[#141210] text-[#9E958C] flex items-center justify-center shadow-md transition-colors"
                            aria-label={`Add ${item.name} to order`}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Content */}
                      <div className="space-y-1 mt-2 text-center flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-xs sm:text-sm font-semibold text-[#F5F0EB] leading-tight line-clamp-1">
                            {item.name}
                          </h3>
                          {item.description && (
                            <p className="text-[11px] text-[#9E958C] line-clamp-2 mt-1 leading-relaxed">
                              {item.description}
                            </p>
                          )}
                        </div>

                        {/* Meta row: Time tag and Price */}
                        <div className="pt-3 mt-2 border-t border-[#2A2420] flex items-center justify-between">
                          <span className="inline-flex items-center gap-1 text-[10px] text-[#9E958C] bg-[#2A2420] px-2 py-0.5 rounded-full">
                            <Clock className="w-2.5 h-2.5 text-[#10B981]" />
                            <span>3–5m</span>
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-[#E06D53]">
                            {item.price.toFixed(2)} {currency}
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

      {/* Floating Bottom Cart Bar (When Cart Has Items) */}
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
                <span className="text-xs text-[#9E958C] block">Subtotal</span>
                <span className="text-sm font-bold text-[#F5F0EB]">
                  {cartSubtotal.toFixed(2)} {currency}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(true)}
              className="bg-[#10B981] hover:bg-[#059669] text-[#141210] font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-[#10B981]/20"
            >
              <span>View Order</span>
            </button>
          </div>
        </div>
      )}

      {/* Product Detail Bottom Sheet (Right Screen Mockup) */}
      {detailProduct && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-xs p-0 sm:p-4">
          <div className="bg-[#1E1A17] border-t sm:border border-[#2E2824] rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl relative animate-in slide-in-from-bottom duration-250">
            {/* Top Navigation */}
            <div className="p-4 flex items-center justify-between sticky top-0 bg-[#1E1A17]/95 backdrop-blur-xs z-10 border-b border-[#2E2824]">
              <button
                onClick={closeProductDetail}
                className="w-9 h-9 rounded-full bg-[#2A2420] text-[#F5F0EB] hover:bg-[#38302A] flex items-center justify-center transition-colors"
                aria-label="Back to menu"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold text-[#9E958C]">Details & Customization</span>
              <div className="w-9" />
            </div>

            <div className="p-5 space-y-5 flex-1">
              {/* Floating Hero Circular Photo */}
              <div className="text-center pt-2">
                {detailProduct.imageUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={detailProduct.imageUrl}
                    alt={detailProduct.name}
                    className="w-40 h-40 sm:w-44 sm:h-44 rounded-full object-cover mx-auto shadow-2xl border-4 border-[#2E2824] bg-[#2A2420]"
                    onError={(e) => {
                      const img = e.currentTarget;
                      if (!img.dataset.fallback) {
                        img.dataset.fallback = 'true';
                        img.src =
                          'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80';
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
                    {detailProduct.name}
                  </h2>
                  <div className="flex items-center gap-1.5 text-xs text-[#10B981]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Brewed fresh to order (approx. 3–5 min)</span>
                  </div>
                </div>
                <span className="text-base sm:text-lg font-bold text-[#E06D53] whitespace-nowrap">
                  {detailProduct.price.toFixed(2)} {currency}
                </span>
              </div>

              {/* Description & Tasting Notes */}
              {detailProduct.description && (
                <p className="text-xs text-[#9E958C] leading-relaxed bg-[#241F1C] p-3 rounded-2xl border border-[#2E2824]">
                  {detailProduct.description}
                </p>
              )}

              {/* Choose the ones you want to add (Add-ons section) */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-medium text-[#F5F0EB]">
                  Choose add-ons
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {AVAILABLE_ADDONS.map((addon) => {
                    const isSelected = selectedAddons.includes(addon.name);
                    return (
                      <button
                        key={addon.id}
                        type="button"
                        onClick={() => toggleAddon(addon.name)}
                        className={`p-2.5 rounded-2xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                          isSelected
                            ? 'bg-[#10B981]/15 border-[#10B981] text-[#10B981]'
                            : 'bg-[#241F1C] border-[#2E2824] text-[#9E958C] hover:border-[#3D342E]'
                        }`}
                      >
                        <span className="text-lg">{addon.icon}</span>
                        <span className="text-[11px] font-medium leading-tight">{addon.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* We recommend (Pairings section) */}
              <div className="space-y-2.5 pt-1">
                <h3 className="text-xs font-medium text-[#F5F0EB]">
                  We recommend
                </h3>
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
                  {recommendedItems.map((rec) => (
                    <div
                      key={rec.id}
                      className="w-28 shrink-0 bg-[#241F1C] border border-[#2E2824] rounded-2xl p-2.5 flex flex-col items-center gap-1.5 relative group"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={
                          rec.imageUrl ||
                          'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=200&q=80'
                        }
                        alt={rec.name}
                        className="w-12 h-12 rounded-full object-cover border border-[#2E2824]"
                        onError={(e) => {
                          const img = e.currentTarget;
                          if (!img.dataset.fallback) {
                            img.dataset.fallback = 'true';
                            img.src =
                              'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=200&q=80';
                          }
                        }}
                      />
                      <span className="text-[11px] font-medium text-[#F5F0EB] text-center line-clamp-1 w-full">
                        {rec.name}
                      </span>
                      <span className="text-[10px] font-bold text-[#E06D53]">
                        {rec.price.toFixed(2)} {currency}
                      </span>
                      <button
                        type="button"
                        onClick={() => addToCartDirect(rec)}
                        className="w-6 h-6 rounded-full bg-[#10B981] text-[#141210] flex items-center justify-center hover:bg-[#059669] transition-colors mt-0.5"
                        aria-label={`Add recommendation ${rec.name}`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Special preparation note */}
              <div className="space-y-1 pt-1">
                <label className="text-xs font-semibold text-[#F5F0EB] block">
                  Additional notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Extra hot, with ice on the side..."
                  value={detailNotes}
                  onChange={(e) => setDetailNotes(e.target.value)}
                  className="w-full bg-[#241F1C] border border-[#2E2824] rounded-xl px-3 py-2 text-xs text-[#F5F0EB] placeholder-[#7E756C] focus:outline-hidden focus:border-[#10B981]"
                />
              </div>
            </div>

            {/* Bottom Sticky Action Bar (Right Screen Mockup) */}
            <div className="p-4 bg-[#1E1A17] border-t border-[#2E2824] flex items-center gap-3 sticky bottom-0">
              {/* Stepper */}
              <div className="flex items-center gap-3 bg-[#2A2420] border border-[#38312C] rounded-2xl px-3 py-2">
                <button
                  type="button"
                  onClick={() => setDetailQuantity((q) => Math.max(1, q - 1))}
                  className="w-6 h-6 flex items-center justify-center text-[#9E958C] hover:text-[#F5F0EB]"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-sm font-bold text-[#F5F0EB] w-4 text-center">
                  {detailQuantity}
                </span>
                <button
                  type="button"
                  onClick={() => setDetailQuantity((q) => q + 1)}
                  className="w-6 h-6 flex items-center justify-center text-[#9E958C] hover:text-[#F5F0EB]"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Order / Add Button */}
              <button
                type="button"
                onClick={handleAddFromDetail}
                className="flex-1 bg-[#10B981] hover:bg-[#059669] text-[#141210] font-bold py-3 px-5 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#10B981]/25 transition-all"
              >
                <span>Add to Order</span>
                <span>•</span>
                <span>{(detailProduct.price * detailQuantity).toFixed(2)} {currency}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer / Slide-Over Review */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-xs">
          <div className="bg-[#1E1A17] text-[#F5F0EB] w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-250">
            {/* Drawer Header */}
            <div className="px-5 py-4 border-b border-[#2E2824] flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-[#F5F0EB]">Your Order Review</h3>
                <p className="text-xs text-[#10B981] font-medium">
                  Table {currentTable?.tableNumber || 'Selected table'}
                </p>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-full bg-[#2A2420] text-[#9E958C] hover:text-[#F5F0EB] flex items-center justify-center transition-colors"
                aria-label="Close cart"
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
              {cart.map((item, idx) => (
                <div
                  key={`${item.product.id}-${idx}`}
                  className="flex items-start justify-between border-b border-[#2A2420] pb-3 last:border-b-0"
                >
                  <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-2">
                    {item.product.imageUrl && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-11 h-11 rounded-full object-cover border border-[#2E2824] shrink-0 bg-[#2A2420]"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    )}
                    <div className="space-y-0.5 min-w-0">
                      <h4 className="text-xs font-semibold text-[#F5F0EB] truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-[11px] text-[#E06D53] font-bold">
                        {item.product.price.toFixed(2)} {currency}
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
                        className="w-5 h-5 flex items-center justify-center text-[#9E958C] hover:text-[#F5F0EB]"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-[#F5F0EB] w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(idx, 1)}
                        className="w-5 h-5 flex items-center justify-center text-[#9E958C] hover:text-[#F5F0EB]"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(idx)}
                      className="text-[#7E756C] hover:text-red-400 p-1"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Order Notes */}
              <div className="space-y-1 pt-2">
                <label className="text-xs font-medium text-[#F5F0EB] block">
                  Table instructions (optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Serve pour-over first, bring warm water..."
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full bg-[#241F1C] border border-[#2E2824] rounded-xl p-2.5 text-xs text-[#F5F0EB] placeholder-[#7E756C] focus:outline-hidden focus:border-[#10B981]"
                />
              </div>

              {/* Payment note */}
              <div className="bg-[#241F1C] border border-[#2E2824] rounded-2xl p-3 text-xs text-[#9E958C] flex items-center gap-2.5">
                <Coffee className="w-4 h-4 text-[#10B981] shrink-0" />
                <span>
                  No online payment gateway needed. Staff will collect payment (Cash / Other) at your table.
                </span>
              </div>
            </div>

            {/* Drawer Footer & Submit */}
            <div className="p-5 border-t border-[#2E2824] bg-[#1E1A17] space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#9E958C]">Total Amount</span>
                <span className="text-base font-bold text-[#F5F0EB]">
                  {cartSubtotal.toFixed(2)} {currency}
                </span>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isSubmitting || cart.length === 0}
                className="w-full bg-[#10B981] hover:bg-[#059669] disabled:opacity-40 text-[#141210] text-sm font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-[#10B981]/25 transition-all"
              >
                {isSubmitting ? (
                  <span>Sending order to barista...</span>
                ) : (
                  <>
                    <span>Confirm & Place Order</span>
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
