import { Metadata } from 'next';
import { getPublicShopSettings } from '@/lib/menu';
import {
  getTodaysBaristaAudit,
  getHistoricalAuditEvents,
  getAuditStaffList,
} from '@/lib/audit';
import AdminAuditManager from '@/components/admin/AdminAuditManager';

export const metadata: Metadata = {
  title: 'Barista Operations Audit | Admin Dashboard',
  description: 'Audit barista order acceptance, counter payments, and closed table sessions for today and historical logs.',
};

export const dynamic = 'force-dynamic';

export default async function AdminAuditPage() {
  const [todaysData, historicalEvents, staffList, settings] = await Promise.all([
    getTodaysBaristaAudit(),
    getHistoricalAuditEvents(),
    getAuditStaffList(),
    getPublicShopSettings(),
  ]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-[#F5F0EB]">Barista audit & operations</h1>
        <p className="text-xs text-[#9E958C]">
          Inspect today&apos;s barista drink preparation, counter payments collected, and full paginated audit history.
        </p>
      </div>

      <AdminAuditManager
        todaysData={todaysData}
        historicalEvents={historicalEvents}
        staffList={staffList}
        currency={settings.currency}
      />
    </div>
  );
}
