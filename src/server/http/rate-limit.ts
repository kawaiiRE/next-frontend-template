import 'server-only';

export interface RateLimitRule {
  limit: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

/**
 * Fixed-window, in-memory limiter. State lives in this process only: with several instances each
 * one enforces its own budget. Put a shared limiter (reverse proxy or Redis) in front for that case.
 */
export class FixedWindowRateLimiter {
  private readonly windows = new Map<string, { count: number; resetAt: number }>();

  constructor(
    private readonly rule: RateLimitRule,
    private readonly now: () => number = Date.now,
    private readonly maxKeys = 10_000,
  ) {}

  consume(key: string): RateLimitResult {
    const now = this.now();
    let window = this.windows.get(key);

    if (!window || window.resetAt <= now) {
      if (!window && this.windows.size >= this.maxKeys) this.prune(now);
      window = { count: 0, resetAt: now + this.rule.windowMs };
      this.windows.set(key, window);
    }

    window.count += 1;
    const allowed = window.count <= this.rule.limit;
    return {
      allowed,
      remaining: Math.max(0, this.rule.limit - window.count),
      retryAfterSeconds: allowed ? 0 : Math.max(1, Math.ceil((window.resetAt - now) / 1000)),
    };
  }

  private prune(now: number) {
    for (const [key, window] of this.windows) {
      if (window.resetAt <= now) this.windows.delete(key);
    }
    // Still full: drop the oldest entries (Map preserves insertion order).
    while (this.windows.size >= this.maxKeys) {
      const oldest = this.windows.keys().next().value;
      if (oldest === undefined) break;
      this.windows.delete(oldest);
    }
  }
}

const MINUTE = 60_000;

export const RATE_LIMIT_RULES = {
  login: { limit: 10, windowMs: 5 * MINUTE },
  register: { limit: 5, windowMs: 60 * MINUTE },
  passwordReset: { limit: 5, windowMs: 15 * MINUTE },
  passwordResetConfirm: { limit: 10, windowMs: 15 * MINUTE },
  verifyEmail: { limit: 10, windowMs: 15 * MINUTE },
  verificationRequest: { limit: 5, windowMs: 15 * MINUTE },
  guest: { limit: 10, windowMs: 60 * MINUTE },
  guestUpgrade: { limit: 10, windowMs: 15 * MINUTE },
  refresh: { limit: 30, windowMs: 5 * MINUTE },
  passwordChange: { limit: 5, windowMs: 15 * MINUTE },
} as const satisfies Record<string, RateLimitRule>;

export type RateLimitPolicy = keyof typeof RATE_LIMIT_RULES;

const limiters = new Map<RateLimitPolicy, FixedWindowRateLimiter>();

export function rateLimiterFor(policy: RateLimitPolicy): FixedWindowRateLimiter {
  let limiter = limiters.get(policy);
  if (!limiter) {
    limiter = new FixedWindowRateLimiter(RATE_LIMIT_RULES[policy]);
    limiters.set(policy, limiter);
  }
  return limiter;
}
