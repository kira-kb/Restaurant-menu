'use server';

import {
  createStaffMember as createStaffMemberInternal,
  updateStaffMember as updateStaffMemberInternal,
  changeStaffPassword as changeStaffPasswordInternal,
} from '@/lib/staff';

export async function createStaffMember(formData: FormData) {
  return createStaffMemberInternal(formData);
}

export async function updateStaffMember(formData: FormData) {
  return updateStaffMemberInternal(formData);
}

export async function changeStaffPassword(formData: FormData) {
  return changeStaffPasswordInternal(formData);
}
