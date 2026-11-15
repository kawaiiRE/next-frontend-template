import 'server-only';
import type { NextRequest, NextResponse } from 'next/server';
import {
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE_SECONDS,
  resolveLocale,
  type Locale,
} from '@/i18n/config';
import { isSecureDeployment } from '@/server/environment';

export function localeCookieOptions() {
  return {
    httpOnly: false,
    secure: isSecureDeployment(),
    sameSite: 'lax' as const,
    path: '/',
    maxAge: LOCALE_COOKIE_MAX_AGE_SECONDS,
  };
}

/** Applies the account language to this browser after sign-in. */
export function setLocaleCookie(response: NextResponse, locale: Locale) {
  response.cookies.set(LOCALE_COOKIE, locale, localeCookieOptions());
}

/** Interface language of the caller: the locale cookie (web), then `Accept-Language` (native). */
export function requestLocale(request: NextRequest): Locale {
  return resolveLocale(
    request.cookies.get(LOCALE_COOKIE)?.value,
    request.headers.get('accept-language'),
  );
}
