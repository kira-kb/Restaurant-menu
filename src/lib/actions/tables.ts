'use server';

import {
  createTableAction as createTableInternal,
  updateTableAction as updateTableInternal,
  toggleTableStatusAction as toggleTableStatusInternal,
} from '@/lib/tables';

export async function createTableAction(formData: FormData) {
  return createTableInternal(formData);
}

export async function updateTableAction(id: string, formData: FormData) {
  return updateTableInternal(id, formData);
}

export async function toggleTableStatusAction(id: string) {
  return toggleTableStatusInternal(id);
}
