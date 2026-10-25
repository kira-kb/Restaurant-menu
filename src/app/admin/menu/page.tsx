import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import { getPublicShopSettings } from '@/lib/menu';
import AdminMenuManager from '@/components/admin/AdminMenuManager';

export const metadata: Metadata = {
  title: 'Menu Management | Admin Dashboard',
  description: 'Manage specialty coffees, prices, and availability.',
};

export const dynamic = 'force-dynamic';

export default async function AdminMenuPage() {
  const [items, categories, addons, settings] = await Promise.all([
    prisma.menuItem.findMany({
      where: { isArchived: false },
      orderBy: [{ category: { displayOrder: 'asc' } }, { name: 'asc' }],
      include: {
        category: { select: { id: true, name: true } },
        addons: { select: { addonId: true } },
        recommendations: { select: { recommendedItemId: true } },
      },
    }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      select: { id: true, name: true },
    }),
    prisma.menuAddon.findMany({
      where: { isArchived: false },
      orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        nameAm: true,
        nameEn: true,
        price: true,
        icon: true,
        isAvailable: true,
      },
    }),
    getPublicShopSettings(),
  ]);

  const formattedItems = items.map((i) => ({
    id: i.id,
    name: i.name,
    nameAm: i.nameAm,
    nameEn: i.nameEn,
    description: i.description,
    descriptionAm: i.descriptionAm,
    descriptionEn: i.descriptionEn,
    price: Number(i.price),
    imageUrl: i.imageUrl,
    isAvailable: i.isAvailable,
    categoryId: i.categoryId,
    category: i.category,
    addonIds: i.addons.map((a) => a.addonId),
    recommendedItemIds: i.recommendations.map((r) => r.recommendedItemId),
  }));

  const formattedAddons = addons.map((a) => ({
    id: a.id,
    name: a.name,
    nameAm: a.nameAm,
    nameEn: a.nameEn,
    price: Number(a.price),
    icon: a.icon,
    isAvailable: a.isAvailable,
  }));

  return (
    <AdminMenuManager
      initialItems={formattedItems}
      categories={categories}
      availableAddons={formattedAddons}
      currency={settings.currency}
    />
  );
}
