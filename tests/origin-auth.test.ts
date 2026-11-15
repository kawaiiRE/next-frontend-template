import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it } from 'vitest';
import { clientIpFromHeaders, isOriginAllowed, readBearerToken } from '../src/server/http/request';
import { resolveRequestAuth } from '../src/server/http/route';
import { setTestEnvironment, TEST_APP_ORIGIN } from './support/env';
import { fakeToken } from './support/tokens';

beforeEach(setTestEnvironment);

function request(method: string, headers: Record<string, string>) {
  return new NextRequest('http://localhost:3000/api/v1/notes', { method, headers });
}

describe('origin rule', () => {
  it('requires an exact match when an Origin is present', () => {
    expect(isOriginAllowed(TEST_APP_ORIGIN, TEST_APP_ORIGIN, 'if-present')).toBe(true);
    expect(
      isOriginAllowed('http://localhost:3000.evil.example', TEST_APP_ORIGIN, 'if-present'),
    ).toBe(false);
    expect(isOriginAllowed('null', TEST_APP_ORIGIN, 'if-present')).toBe(false);
  });

  it('allows a missing Origin only when not required', () => {
    expect(isOriginAllowed(null, TEST_APP_ORIGIN, 'if-present')).toBe(true);
    expect(isOriginAllowed(null, TEST_APP_ORIGIN, 'required')).toBe(false);
  });
});

describe('credential resolution', () => {
  const token = fakeToken({ id: 'user00000000001', expiresInSeconds: 3600 });

  it('honours cookie sessions for reads without an Origin', () => {
    expect(resolveRequestAuth(request('GET', { cookie: `session=${token}` }))).toMatchObject({
      via: 'cookie',
      userId: 'user00000000001',
    });
  });

  it('rejects cookie-authenticated mutations without a matching Origin', () => {
    expect(() => resolveRequestAuth(request('POST', { cookie: `session=${token}` }))).toThrow(
      expect.objectContaining({ code: 'FORBIDDEN_ORIGIN' }),
    );
    expect(() =>
      resolveRequestAuth(
        request('DELETE', { cookie: `session=${token}`, origin: 'https://evil.example' }),
      ),
    ).toThrow(expect.objectContaining({ code: 'FORBIDDEN_ORIGIN' }));
    expect(
      resolveRequestAuth(request('POST', { cookie: `session=${token}`, origin: TEST_APP_ORIGIN }))
        .via,
    ).toBe('cookie');
  });

  it('allows bearer mutations from native clients (no Origin) and prefers bearer over cookie', () => {
    const bearer = fakeToken({ id: 'mobileuser00001', expiresInSeconds: 3600 });
    expect(
      resolveRequestAuth(
        request('POST', { authorization: `Bearer ${bearer}`, cookie: `session=${token}` }),
      ),
    ).toMatchObject({ via: 'bearer', userId: 'mobileuser00001' });
  });

  it('rejects missing, malformed and expired credentials', () => {
    const cases: Record<string, string>[] = [
      {},
      { authorization: 'Basic abc' },
      { cookie: `session=${fakeToken({ expiresInSeconds: -5 })}` },
    ];
    for (const headers of cases) {
      expect(() => resolveRequestAuth(request('GET', headers))).toThrow(
        expect.objectContaining({ code: 'UNAUTHENTICATED' }),
      );
    }
  });
});

describe('header helpers', () => {
  it('reads bearer tokens strictly', () => {
    expect(
      readBearerToken(new Request('http://x', { headers: { authorization: 'Bearer a.b.c' } })),
    ).toBe('a.b.c');
    expect(
      readBearerToken(new Request('http://x', { headers: { authorization: 'Bearer a b' } })),
    ).toBeNull();
  });

  it('uses the proxy-appended (rightmost) forwarded address and validates it', () => {
    expect(clientIpFromHeaders(new Headers({ 'x-forwarded-for': '1.1.1.1, 203.0.113.9' }))).toBe(
      '203.0.113.9',
    );
    expect(
      clientIpFromHeaders(new Headers({ 'cf-connecting-ip': '2001:db8::1' }), 'cf-connecting-ip'),
    ).toBe('2001:db8::1');
    expect(clientIpFromHeaders(new Headers({ 'x-forwarded-for': '<script>' }))).toBeNull();
  });
});
