'use client';

import { useLocale } from 'next-intl';
import { useCallback, useTransition } from 'react';
import type { Locale } from '@/i18n/config';
import { setLocalePreference } from '@/server/actions/preferences';

/** Switches locale through a Server Action; the route re-renders with the new language. */
export function useLocaleSwitch() {
  const locale = useLocale();
  const [pending, startTransition] = useTransition();

  const switchLocale = useCallback(
    (next: Locale) => {
      if (next === locale) return;
      document.documentElement.setAttribute('data-theme-switching', '');
      startTransition(async () => {
        await setLocalePreference(next);
        document.documentElement.removeAttribute('data-theme-switching');
      });
    },
    [locale],
  );

  return { locale, pending, switchLocale };
}
