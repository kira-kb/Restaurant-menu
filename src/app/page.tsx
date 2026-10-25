import prisma from '@/lib/prisma';
import { getPublicShopSettings } from '@/lib/menu';
import HomeClient from '@/components/home/HomeClient';

export const revalidate = 3600;

export default async function HomePage() {
  const settings = await getPublicShopSettings();
  const tables = await prisma.cafeTable.findMany({
    where: { isActive: true },
    orderBy: { tableNumber: 'asc' },
    select: { id: true, tableNumber: true, displayName: true },
  });

  return (
    <HomeClient
      settings={{
        cafeName: settings.cafeName,
        tagline: settings.tagline,
        address: settings.address,
        phone: settings.phone,
      }}
      tables={tables}
    />
  );
}
