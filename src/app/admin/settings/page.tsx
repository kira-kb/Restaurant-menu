import { Metadata } from 'next';
import { getPublicShopSettings } from '@/lib/menu';
import AdminSettingsForm from '@/components/admin/AdminSettingsForm';

export const metadata: Metadata = {
  title: 'Cafe Settings | Admin Dashboard',
  description: 'Manage shop details, currency, and receipt templates.',
};

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const settings = await getPublicShopSettings();

  return <AdminSettingsForm initialSettings={settings} />;
}
