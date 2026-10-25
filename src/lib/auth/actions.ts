'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { verifyPassword } from './password';
import { createSession, destroySession } from './session';
import { checkRateLimit, recordFailedAttempt, resetRateLimit } from './rate-limiter';

const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
});

export type LoginState = {
  error?: string;
  success?: boolean;
  redirectTo?: string;
};

export async function loginAction(
  _prevState: LoginState | null,
  formData: FormData
): Promise<LoginState> {
  const emailInput = formData.get('email');
  const passwordInput = formData.get('password');

  const parsed = LoginSchema.safeParse({
    email: emailInput,
    password: passwordInput,
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message || 'Invalid form submission',
    };
  }

  const { email, password } = parsed.data;
  const rateLimitKey = `login:${email}`;

  const rateCheck = checkRateLimit(rateLimitKey);
  if (!rateCheck.allowed) {
    return {
      error: `Too many failed login attempts. Please wait ${rateCheck.waitSeconds} seconds before trying again.`,
    };
  }

  // Lookup user
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      passwordHash: true,
      role: true,
      isActive: true,
    },
  });

  if (!user) {
    recordFailedAttempt(rateLimitKey);
    return {
      error: 'Invalid email or password.',
    };
  }

  if (!user.isActive) {
    return {
      error: 'This account has been deactivated. Please contact an administrator.',
    };
  }

  const isValidPassword = await verifyPassword(password, user.passwordHash);
  if (!isValidPassword) {
    recordFailedAttempt(rateLimitKey);
    return {
      error: 'Invalid email or password.',
    };
  }

  // Success - clear rate limiter and create session
  resetRateLimit(rateLimitKey);
  await createSession(user.id);

  const destination = user.role === 'ADMIN' ? '/admin' : '/barista/orders';
  redirect(destination);
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect('/login');
}
