import { describe, expect, it } from 'vitest';
import { FixedWindowRateLimiter } from '../src/server/http/rate-limit';

describe('FixedWindowRateLimiter', () => {
  it('allows up to the limit per key and reports Retry-After', () => {
    let now = 0;
    const limiter = new FixedWindowRateLimiter({ limit: 2, windowMs: 60_000 }, () => now);

    expect(limiter.consume('ip-a').allowed).toBe(true);
    expect(limiter.consume('ip-a')).toMatchObject({ allowed: true, remaining: 0 });
    expect(limiter.consume('ip-a')).toEqual({
      allowed: false,
      remaining: 0,
      retryAfterSeconds: 60,
    });
    expect(limiter.consume('ip-b').allowed).toBe(true);

    now = 30_000;
    expect(limiter.consume('ip-a').retryAfterSeconds).toBe(30);
  });

  it('resets after the window elapses', () => {
    let now = 0;
    const limiter = new FixedWindowRateLimiter({ limit: 1, windowMs: 1_000 }, () => now);
    limiter.consume('k');
    expect(limiter.consume('k').allowed).toBe(false);
    now = 1_000;
    expect(limiter.consume('k').allowed).toBe(true);
  });

  it('stays bounded in memory', () => {
    let now = 0;
    const limiter = new FixedWindowRateLimiter({ limit: 1, windowMs: 10_000 }, () => now, 3);
    for (const key of ['a', 'b', 'c', 'd', 'e']) limiter.consume(key);
    now = 1;
    // Oldest keys were evicted, so 'a' starts a fresh window.
    expect(limiter.consume('a').allowed).toBe(true);
  });
});
