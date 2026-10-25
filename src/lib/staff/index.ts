import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/auth/session';
import { hashPassword } from '@/lib/auth/password';
import { invalidateAllUserSessions } from '@/lib/auth/session';
import { Role } from '@prisma/client';
import {
  StaffCreateSchema,
  StaffPasswordChangeSchema,
  StaffUpdateSchema,
} from '@/lib/validations';

/**
 * Retrieves all staff members (excluding password hashes)
 */
export async function getStaffList() {
  await requireRole([Role.ADMIN]);

  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          paymentsRecorded: true,
          closedTableSessions: true,
        },
      },
    },
    orderBy: [{ role: 'asc' }, { name: 'asc' }],
  });
}

/**
 * Creates a new staff member (e.g. Barista or additional Admin)
 */
export async function createStaffMember(formData: FormData) {
  await requireRole([Role.ADMIN]);

  const raw = {
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    role: formData.get('role'),
  };

  const validated = StaffCreateSchema.parse(raw);

  const existing = await prisma.user.findUnique({
    where: { email: validated.email },
  });

  if (existing) {
    throw new Error(`An account with email "${validated.email}" already exists.`);
  }

  const passwordHash = await hashPassword(validated.password);

  const user = await prisma.user.create({
    data: {
      name: validated.name,
      email: validated.email,
      passwordHash,
      role: validated.role,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  return user;
}

/**
 * Updates staff member details (name, active status, role)
 */
export async function updateStaffMember(formData: FormData) {
  await requireRole([Role.ADMIN]);

  const raw = {
    userId: formData.get('userId'),
    name: formData.get('name'),
    isActive: formData.get('isActive') === 'true' || formData.get('isActive') === 'on',
    role: formData.get('role') as Role,
  };

  const validated = StaffUpdateSchema.parse(raw);

  // Safeguard: Do not deactivate or demote the last active admin
  if (!validated.isActive || validated.role !== Role.ADMIN) {
    const activeAdminCount = await prisma.user.count({
      where: {
        role: Role.ADMIN,
        isActive: true,
      },
    });

    const targetUser = await prisma.user.findUniqueOrThrow({
      where: { id: validated.userId },
      select: { role: true, isActive: true },
    });

    if (
      targetUser.role === Role.ADMIN &&
      targetUser.isActive &&
      activeAdminCount <= 1
    ) {
      throw new Error(
        'Cannot deactivate or change the role of the last active administrator.'
      );
    }
  }

  const updated = await prisma.user.update({
    where: { id: validated.userId },
    data: {
      name: validated.name,
      isActive: validated.isActive,
      role: validated.role,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      updatedAt: true,
    },
  });

  // If user was deactivated, invalidate all their sessions immediately
  if (!validated.isActive) {
    await invalidateAllUserSessions(validated.userId);
  }

  return updated;
}

/**
 * Changes a staff member's password and invalidates active sessions
 */
export async function changeStaffPassword(formData: FormData) {
  await requireRole([Role.ADMIN]);

  const raw = {
    userId: formData.get('userId'),
    newPassword: formData.get('newPassword'),
  };

  const validated = StaffPasswordChangeSchema.parse(raw);

  const passwordHash = await hashPassword(validated.newPassword);

  await prisma.user.update({
    where: { id: validated.userId },
    data: { passwordHash },
  });

  // Invalidate all active sessions for this user so they must log in with new password
  await invalidateAllUserSessions(validated.userId);

  return { success: true };
}
