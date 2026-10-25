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

  return <AdminCategoriesManager initialCategories={categories} />;
}
