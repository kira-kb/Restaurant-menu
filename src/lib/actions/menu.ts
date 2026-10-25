'use server';

import {
  createCategoryAction as createCategoryInternal,
  updateCategoryAction as updateCategoryInternal,
  toggleCategoryStatusAction as toggleCategoryStatusInternal,
  createMenuItemAction as createMenuItemInternal,
  updateMenuItemAction as updateMenuItemInternal,
  toggleMenuItemAvailabilityAction as toggleMenuItemAvailabilityInternal,
  archiveMenuItemAction as archiveMenuItemInternal,
  updateMenuItemImageLinkAction as updateMenuItemImageLinkInternal,
  createAddonAction as createAddonInternal,
  updateAddonAction as updateAddonInternal,
  toggleAddonAvailabilityAction as toggleAddonAvailabilityInternal,
  archiveAddonAction as archiveAddonInternal,
} from '@/lib/menu';

export async function createCategoryAction(formData: FormData) {
  return createCategoryInternal(formData);
}

export async function updateCategoryAction(id: string, formData: FormData) {
  return updateCategoryInternal(id, formData);
}

export async function toggleCategoryStatusAction(id: string) {
  return toggleCategoryStatusInternal(id);
}

export async function createMenuItemAction(formData: FormData) {
  return createMenuItemInternal(formData);
}

export async function updateMenuItemAction(id: string, formData: FormData) {
  return updateMenuItemInternal(id, formData);
}

export async function toggleMenuItemAvailabilityAction(id: string) {
  return toggleMenuItemAvailabilityInternal(id);
}

export async function archiveMenuItemAction(id: string) {
  return archiveMenuItemInternal(id);
}

export async function updateMenuItemImageLinkAction(id: string, imageUrl: string | null) {
  return updateMenuItemImageLinkInternal(id, imageUrl);
}

export async function createAddonAction(formData: FormData) {
  return createAddonInternal(formData);
}

export async function updateAddonAction(id: string, formData: FormData) {
  return updateAddonInternal(id, formData);
}

export async function toggleAddonAvailabilityAction(id: string) {
  return toggleAddonAvailabilityInternal(id);
}

export async function archiveAddonAction(id: string) {
  return archiveAddonInternal(id);
}
