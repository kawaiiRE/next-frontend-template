import { describe, expect, it } from 'vitest';
import { buildContentSecurityPolicy } from '../src/lib/csp';
import { isTokenActive, readTokenClaims, shouldRefreshToken } from '../src/lib/jwt';
import { fakeToken } from './support/tokens';

describe('token claims', () => {
  it('reads id and expiry without verifying', () => {
    const token = fakeToken({ id: 'abc', expiresInSeconds: 60 });
    expect(readTokenClaims(token)?.id).toBe('abc');
    expect(isTokenActive(token)).toBe(true);
    expect(isTokenActive(fakeToken({ expiresInSeconds: -1 }))).toBe(false);
  });

  it('rejects malformed tokens', () => {
    for (const value of ['', 'a.b', 'a.!!!.c', 'x.eyJmb28iOjF9.y', null, undefined]) {
      expect(readTokenClaims(value)).toBeNull();
    }
  });

  it('refreshes only close to expiry', () => {
    expect(shouldRefreshToken(fakeToken({ expiresInSeconds: 7 * 24 * 3600 }))).toBe(false);
    expect(shouldRefreshToken(fakeToken({ expiresInSeconds: 3600 }))).toBe(true);
    expect(shouldRefreshToken(fakeToken({ expiresInSeconds: -10 }))).toBe(false);
  });
});

describe('content security policy', () => {
  it('requires the nonce for scripts and blocks framing and plugins', () => {
    const policy = buildContentSecurityPolicy({
      nonce: 'abc',
      isDevelopment: false,
      upgradeInsecureRequests: true,
    });
    expect(policy).toContain("script-src 'self' 'nonce-abc' 'strict-dynamic'");
    expect(policy).not.toContain('unsafe-eval');
    expect(policy).toContain("frame-ancestors 'none'");
    expect(policy).toContain("object-src 'none'");
    expect(policy).toContain('upgrade-insecure-requests');
  });

  it('allows eval only in development', () => {
    expect(
      buildContentSecurityPolicy({
        nonce: 'n',
        isDevelopment: true,
        upgradeInsecureRequests: false,
      }),
    ).toContain("'unsafe-eval'");
  });
});
