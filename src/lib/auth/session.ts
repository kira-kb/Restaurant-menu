import { cookies } from 'next/headers';
import crypto from 'node:crypto';
import prisma from '@/lib/prisma';
import { Role } from '@prisma/client';

export const SESSION_COOKIE_NAME = 'barch_session_token';
const SESSION_DURATION_DAYS = 7;

function hashToken(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
}

/**
 * Creates a new server-side session for an authenticated user
 */
export async function createSession(userId: string): Promise<string> {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(rawToken);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);

  await prisma.authSession.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, rawToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  });

  return rawToken;
}

/**
 * Retrieves the currently authenticated safe user from the session cookie
 */
export async function getSessionUser(): Promise<SafeUser | null> {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get(SESSION_COOKIE_NAME);

    if (!tokenCookie || !tokenCookie.value) {
      return null;
    }

    const tokenHash = hashToken(tokenCookie.value);

    const session = await prisma.authSession.findUnique({
      where: { tokenHash },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
          },
        },
      },
    });

    if (!session) {
      return null;
    }

    // Check expiration
    if (new Date() > session.expiresAt) {
      await prisma.authSession.delete({ where: { id: session.id } }).catch(() => {});
      return null;
    }

    // Check if user is still active
    if (!session.user.isActive) {
      await prisma.authSession.delete({ where: { id: session.id } }).catch(() => {});
      return null;
    }

    // Update lastUsedAt asynchronously (sliding window)
    prisma.authSession
      .update({
        where: { id: session.id },
        data: { lastUsedAt: new Date() },
      })
      .catch(() => {});

    return session.user;
  } catch (error) {
    if (error && typeof error === 'object' && 'digest' in error && (error as { digest: string }).digest === 'DYNAMIC_SERVER_USAGE') {
      throw error;
    }
    console.error('Error fetching session user:', error);
    return null;
  }
}

/**
 * Destroys the current user session and removes the cookie
 */
export async function destroySession(): Promise<void> {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get(SESSION_COOKIE_NAME);

    if (tokenCookie && tokenCookie.value) {
      const tokenHash = hashToken(tokenCookie.value);
      await prisma.authSession.deleteMany({ where: { tokenHash } }).catch(() => {});
    }

    cookieStore.delete(SESSION_COOKIE_NAME);
  } catch (error) {
    console.error('Error destroying session:', error);
  }
}

/**
 * Invalidates all active sessions for a given user (e.g. after password change)
 */
export async function invalidateAllUserSessions(userId: string): Promise<void> {
  await prisma.authSession.deleteMany({
    where: { userId },
  });
}

/**
 * Enforces authentication. Throws or redirects if unauthenticated.
 */
export async function requireUser(): Promise<SafeUser> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('UNAUTHORIZED');
  }
  return user;
}

/**
 * Enforces role authorization (e.g., ADMIN only or ADMIN/BARISTA)
 */
export async function requireRole(allowedRoles: Role[]): Promise<SafeUser> {
  const user = await requireUser();
  if (!allowedRoles.includes(user.role)) {
    throw new Error('FORBIDDEN');
  }
  return user;
}
