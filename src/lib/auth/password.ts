import { hash, verify } from '@node-rs/argon2';

/**
 * Securely hash a password using Argon2id with recommended parameters
 */
export async function hashPassword(plainText: string): Promise<string> {
  return hash(plainText, {
    memoryCost: 19456, // 19 MiB
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });
}

/**
 * Verify a plain text password against an Argon2id hash
 */
export async function verifyPassword(plainText: string, passwordHash: string): Promise<boolean> {
  try {
    return await verify(passwordHash, plainText);
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}
