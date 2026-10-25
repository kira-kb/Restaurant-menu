import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth/session';
import { getPublicShopSettings } from '@/lib/menu';
import { Role } from '@prisma/client';
import BaristaLayoutClient from '@/components/barista/BaristaLayoutClient';

export default async function BaristaLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();
  if (!user || (user.role !== Role.BARISTA && user.role !== Role.ADMIN)) {
    redirect('/login');
  }

  const settings = await getPublicShopSettings();

  return (
    <BaristaLayoutClient
      cafeName={settings.cafeName}
      user={{
        name: user.name,
        role: user.role,
      }}
    >
      {children}
    </BaristaLayoutClient>
  );
}
