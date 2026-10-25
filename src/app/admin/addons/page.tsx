import { Metadata } from 'next';
import { getAdminAddons, getPublicShopSettings } from '@/lib/menu';
import AdminAddonsManager from '@/components/admin/AdminAddonsManager';

export const metadata: Metadata = {
  title: 'Specialty Add-ons & Customizations | Admin Dashboard',
  description: 'Manage customizable milk alternatives, extra shots, syrups, and add-ons.',
};

export const dynamic = 'force-dynamic';

export default async function AdminAddonsPage() {
  const [addons, settings] = await Promise.all([
    getAdminAddons(),
    getPublicShopSettings(),
  ]);

  return <AdminAddonsManager initialAddons={addons} currency={settings.currency} />;
}
