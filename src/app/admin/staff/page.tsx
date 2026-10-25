import { Metadata } from 'next';
import { getStaffList } from '@/lib/staff';
import { getSessionUser } from '@/lib/auth/session';
import AdminStaffManager from '@/components/admin/AdminStaffManager';

export const metadata: Metadata = {
  title: 'Staff Management | Admin Dashboard',
  description: 'Manage barista accounts, credentials, and access roles.',
};

export const dynamic = 'force-dynamic';

export default async function AdminStaffPage() {
  const [staff, currentUser] = await Promise.all([
    getStaffList(),
    getSessionUser(),
  ]);

  return (
    <AdminStaffManager
      initialStaff={staff}
      currentUserId={currentUser?.id || ''}
    />
  );
}
