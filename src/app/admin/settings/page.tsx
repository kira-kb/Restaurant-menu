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

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-medium text-[#F5F0EB]">Cafe settings</h1>
        <p className="text-xs text-[#9E958C]">
          Configure shop name, location details, currency, and printed receipt footer.
        </p>
      </div>

      <AdminSettingsForm initialSettings={settings} />
    </div>
  );
}
