import { cookies, headers } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';
import { LOCALE_COOKIE, resolveLocale, type Locale } from '@/i18n/config';
import { formats } from '@/i18n/formats';

const loaders = {
  en: () => import('@/messages/en.json'),
  ar: () => import('@/messages/ar.json'),
} satisfies Record<Locale, () => Promise<{ default: unknown }>>;

export default getRequestConfig(async () => {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
  const locale = resolveLocale(
    cookieStore.get(LOCALE_COOKIE)?.value,
    headerStore.get('accept-language'),
  );

  return {
    locale,
    messages: (await loaders[locale]()).default,
    formats,
    timeZone: 'UTC',
    // A shared `now` keeps relative times identical between server render and hydration.
    now: new Date(),
  };
});
