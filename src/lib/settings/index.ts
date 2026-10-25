import { revalidateTag, revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/auth/session';
import { Role } from '@prisma/client';
import { ShopSettingsSchema } from '@/lib/validations';
import { SETTINGS_CACHE_TAG } from '@/lib/menu';

export async function updateShopSettingsAction(formData: FormData) {
  await requireRole([Role.ADMIN]);

  const raw = {
    cafeName: formData.get('cafeName'),
    tagline: formData.get('tagline') || null,
    address: formData.get('address') || null,
    phone: formData.get('phone') || null,
    currency: formData.get('currency') || 'ETB',
    receiptHeader: formData.get('receiptHeader') || null,
    receiptFooter: formData.get('receiptFooter') || null,
    taxRatePercent: formData.get('taxRatePercent') || 0,
  };

  const validated = ShopSettingsSchema.parse(raw);

  const updated = await prisma.shopSettings.upsert({
    where: { id: 'default' },
    update: validated,
    create: {
      id: 'default',
      ...validated,
    },
  });

  revalidateTag(SETTINGS_CACHE_TAG, 'default');
  revalidatePath('/menu');
  return {
    id: updated.id,
    cafeName: updated.cafeName,
    tagline: updated.tagline,
    address: updated.address,
    phone: updated.phone,
    currency: updated.currency,
    receiptHeader: updated.receiptHeader,
    receiptFooter: updated.receiptFooter,
    taxRatePercent: Number(updated.taxRatePercent),
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  };
}
