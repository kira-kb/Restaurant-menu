import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import AdminCategoriesManager from '@/components/admin/AdminCategoriesManager';

export const metadata: Metadata = {
  title: 'Category Management | Admin Dashboard',
  description: 'Manage menu categories and presentation order.',
};

export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { displayOrder: 'asc' },
    include: {
      _count: {
        select: { menuItems: { where: { isArchived: false } } },
      },
    },
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-[#F5F0EB]">Menu categories</h1>
        <p className="text-xs text-[#9E958C]">
          Manage and organize categories shown on the customer digital menu.
        </p>
      </div>

      <AdminCategoriesManager initialCategories={categories} />
    </div>
  );
}
