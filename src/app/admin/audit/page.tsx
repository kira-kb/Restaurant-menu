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
    <AdminAuditManager
      todaysData={todaysData}
      historicalEvents={historicalEvents}
      staffList={staffList}
      currency={settings.currency}
    />
  );
}
