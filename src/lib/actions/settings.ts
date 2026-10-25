'use server';

import { updateShopSettingsAction as updateShopSettingsInternal } from '@/lib/settings';

export async function updateShopSettingsAction(formData: FormData) {
  return updateShopSettingsInternal(formData);
}
