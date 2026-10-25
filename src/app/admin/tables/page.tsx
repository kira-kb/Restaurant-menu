import { Metadata } from 'next';
import { getAdminTables } from '@/lib/tables';
import { getPublicShopSettings } from '@/lib/menu';
import AdminTablesManager from '@/components/admin/AdminTablesManager';

export const metadata: Metadata = {
  title: 'Table Management & QR Codes | Admin Dashboard',
  description: 'Manage tables, generate QR codes, and monitor active table visits.',
};

export const dynamic = 'force-dynamic';

export default async function AdminTablesPage() {
  const [tables, settings] = await Promise.all([
    getAdminTables(),
    getPublicShopSettings(),
  ]);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return (
    <AdminTablesManager
      initialTables={tables}
      baseUrl={baseUrl}
      cafeName={settings.cafeName}
    />
  );
}
