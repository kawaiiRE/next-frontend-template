'use server';

import { cookies } from 'next/headers';
import { isLocale, LOCALE_COOKIE } from '@/i18n/config';
import { localeCookieOptions } from '@/server/preferences';
import { updateAccount } from '@/server/services/account';
import { getSessionAuth } from '@/server/session';

/**
 * Persists the interface language. Setting a cookie in a Server Action re-renders the current route,
 * so `<html lang dir>` and every message update in one round trip. Signed-in users also get the
 * choice saved to their account (best effort).
 */
export async function setLocalePreference(locale: unknown): Promise<void> {
  if (!isLocale(locale)) return;

  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, locale, localeCookieOptions());

  const auth = await getSessionAuth();
  if (!auth) return;
  try {
    await updateAccount(auth, { locale });
  } catch {
    // The cookie already applies the language; account sync can be retried from settings.
  }
}
