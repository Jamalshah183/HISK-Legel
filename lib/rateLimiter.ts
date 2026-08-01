interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  lockoutMs: number;
  minIntervalMs?: number;
}

interface AttemptRecord {
  attempts: number[];
  lockedUntil: number | null;
  lastAttemptAt: number | null;
}

const records: Record<string, AttemptRecord> = {};

export function checkRateLimit(
  key: string,
  config: RateLimitConfig = { maxAttempts: 5, windowMs: 60000, lockoutMs: 60000, minIntervalMs: 2000 }
): { allowed: boolean; message?: string; retryAfterSec?: number } {
  const now = Date.now();
  if (!records[key]) {
    records[key] = { attempts: [], lockedUntil: null, lastAttemptAt: null };
  }
  const record = records[key];

  // Check if currently locked out
  if (record.lockedUntil && now < record.lockedUntil) {
    const remainingSec = Math.ceil((record.lockedUntil - now) / 1000);
    return {
      allowed: false,
      message: `Too many attempts. Please wait ${remainingSec} second${remainingSec > 1 ? 's' : ''} before trying again.`,
      retryAfterSec: remainingSec
    };
  }

  // Clear lock if expired
  if (record.lockedUntil && now >= record.lockedUntil) {
    record.lockedUntil = null;
    record.attempts = [];
  }

  // Check min interval between requests
  if (config.minIntervalMs && record.lastAttemptAt) {
    const timeSinceLast = now - record.lastAttemptAt;
    if (timeSinceLast < config.minIntervalMs) {
      const remainingSec = Math.ceil((config.minIntervalMs - timeSinceLast) / 1000);
      return {
        allowed: false,
        message: `Please wait ${remainingSec} second${remainingSec > 1 ? 's' : ''} before trying again.`,
        retryAfterSec: remainingSec
      };
    }
  }

  // Filter out attempts outside the time window
  record.attempts = record.attempts.filter((ts) => now - ts < config.windowMs);

  if (record.attempts.length >= config.maxAttempts) {
    record.lockedUntil = now + config.lockoutMs;
    const remainingSec = Math.ceil(config.lockoutMs / 1000);
    return {
      allowed: false,
      message: `Too many sign-in attempts. Account access temporarily paused. Please wait ${remainingSec} seconds.`,
      retryAfterSec: remainingSec
    };
  }

  return { allowed: true };
}

export function recordAttempt(key: string): void {
  const now = Date.now();
  if (!records[key]) {
    records[key] = { attempts: [], lockedUntil: null, lastAttemptAt: null };
  }
  records[key].attempts.push(now);
  records[key].lastAttemptAt = now;
}

export function resetRateLimit(key: string): void {
  delete records[key];
}
