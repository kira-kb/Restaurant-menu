import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth/session';
import { Role } from '@prisma/client';
import AdminLayoutClient from '@/components/admin/AdminLayoutClient';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();
  if (!user || user.role !== Role.ADMIN) {
    redirect('/login');
  }

  return (
    <AdminLayoutClient
      user={{
        name: user.name,
        email: user.email,
      }}
    >
      {children}
    </AdminLayoutClient>
  );
}
