import 'server-only';
import type { NextResponse } from 'next/server';
import { tokenExpiresAt } from '@/lib/jwt';
import { isSecureDeployment } from '@/server/environment';

const SECURE_COOKIE_NAME = '__Host-session';
const LOCAL_COOKIE_NAME = 'session';

export interface SessionCookieSettings {
  name: string;
  secure: boolean;
}

/**
 * HTTPS deployments use the `__Host-` prefix, which browsers only accept for Secure, host-only,
 * `Path=/` cookies. Plain-HTTP local development uses an unprefixed, non-Secure cookie.
 */
export function sessionCookieSettings(): SessionCookieSettings {
  const secure = isSecureDeployment();
  return { name: secure ? SECURE_COOKIE_NAME : LOCAL_COOKIE_NAME, secure };
}

export function readSessionCookie(cookies: {
  get(name: string): { value: string } | undefined;
}): string | null {
  return cookies.get(sessionCookieSettings().name)?.value || null;
}

export function sessionCookieOptions(token: string) {
  const { secure } = sessionCookieSettings();
  const expiresAt = tokenExpiresAt(token);
  const maxAge = expiresAt
    ? Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000))
    : 60 * 60 * 24 * 7;

  return {
    httpOnly: true,
    secure,
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  };
}

export function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set(sessionCookieSettings().name, token, sessionCookieOptions(token));
}

export function clearSessionCookie(response: NextResponse) {
  const { name, secure } = sessionCookieSettings();
  response.cookies.set(name, '', {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}
