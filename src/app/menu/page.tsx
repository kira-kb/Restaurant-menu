import { Metadata } from 'next';
import { fetchPublicMenuData, getPublicShopSettings } from '@/lib/menu';
import { getActivePublicTables, resolveTableForCustomer } from '@/lib/tables';
import MenuClient from '@/components/menu/MenuClient';

export const metadata: Metadata = {
  title: 'Menu & Ordering | Barch Coffee',
  description: 'Specialty coffee, pour-overs, and bakery items available for table ordering.',
};

export const dynamic = 'force-dynamic';

export default async function MenuPage(props: {
  searchParams: Promise<{ table?: string }>;
}) {
  const searchParams = await props.searchParams;
  const tableQuery = searchParams.table;

  const [categories, tables, settings] = await Promise.all([
    fetchPublicMenuData(),
    getActivePublicTables(),
    getPublicShopSettings(),
  ]);

  let resolvedTable = null;
  if (tableQuery) {
    resolvedTable = await resolveTableForCustomer(tableQuery);
  }

  return (
    <MenuClient
      categories={categories}
      tables={tables}
      initialTable={resolvedTable}
      currency={settings.currency}
      cafeName={settings.cafeName}
    />
  );
}
