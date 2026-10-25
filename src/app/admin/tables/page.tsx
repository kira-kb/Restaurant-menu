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
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-[#F5F0EB]">Tables & QR codes</h1>
        <p className="text-xs text-[#9E958C]">
          Manage cafe dining tables, inspect active visits, and print QR ordering tents.
        </p>
      </div>

      <AdminTablesManager
        initialTables={tables}
        baseUrl={baseUrl}
        cafeName={settings.cafeName}
      />
    </div>
  );
}
