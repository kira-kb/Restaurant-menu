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
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-medium text-[#F5F0EB]">Staff accounts</h1>
        <p className="text-xs text-[#9E958C]">
          Manage barista staff accounts, grant access, or update passwords.
        </p>
      </div>

      <AdminStaffManager
        initialStaff={staff}
        currentUserId={currentUser?.id || ''}
      />
    </div>
  );
}
