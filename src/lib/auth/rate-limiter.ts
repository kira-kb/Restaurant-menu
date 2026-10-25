interface AttemptRecord {
  count: number;
  resetAt: number;
}

const attemptsMap = new Map<string, AttemptRecord>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes window

/**
 * Checks if an identifier (e.g. IP + email) has exceeded login rate limits
 */
export function checkRateLimit(key: string): { allowed: boolean; waitSeconds?: number } {
  const now = Date.now();
  const record = attemptsMap.get(key);

  if (!record || now > record.resetAt) {
    return { allowed: true };
  }

  if (record.count >= MAX_ATTEMPTS) {
    const waitSeconds = Math.ceil((record.resetAt - now) / 1000);
    return { allowed: false, waitSeconds };
  }

  return { allowed: true };
}

/**
 * Records a failed attempt for an identifier
 */
export function recordFailedAttempt(key: string): void {
  const now = Date.now();
  const record = attemptsMap.get(key);

  if (!record || now > record.resetAt) {
    attemptsMap.set(key, { count: 1, resetAt: now + WINDOW_MS });
  } else {
    record.count += 1;
  }

  // Periodic cleanup of expired entries
  if (attemptsMap.size > 1000) {
    for (const [k, v] of attemptsMap.entries()) {
      if (now > v.resetAt) {
        attemptsMap.delete(k);
      }
    }
  }
}

/**
 * Resets attempts on successful authentication
 */
export function resetRateLimit(key: string): void {
  attemptsMap.delete(key);
}
