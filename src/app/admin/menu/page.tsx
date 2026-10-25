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
  const [items, categories, settings] = await Promise.all([
    prisma.menuItem.findMany({
      where: { isArchived: false },
      orderBy: [{ category: { displayOrder: 'asc' } }, { name: 'asc' }],
      include: {
        category: { select: { id: true, name: true } },
      },
    }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      select: { id: true, name: true },
    }),
    getPublicShopSettings(),
  ]);

  const formattedItems = items.map((i) => ({
    id: i.id,
    name: i.name,
    description: i.description,
    price: Number(i.price),
    imageUrl: i.imageUrl,
    isAvailable: i.isAvailable,
    categoryId: i.categoryId,
    category: i.category,
  }));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-[#F5F0EB]">Menu management</h1>
        <p className="text-xs text-[#9E958C]">
          Add coffees, update seasonal roast prices, or toggle daily availability.
        </p>
      </div>

      <AdminMenuManager
        initialItems={formattedItems}
        categories={categories}
        currency={settings.currency}
      />
    </div>
  );
}
