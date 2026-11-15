'use client';

import { useCallback, useState } from 'react';
import { GUEST_BANNER_COOKIE, GUEST_BANNER_DISMISSED } from '@/constants/preferences';
import { writePreferenceCookie } from '@/lib/client-cookies';

/** Dismissal lasts for the browser session (a session cookie the server also reads, so no flash). */
export function useGuestBanner(initiallyDismissed: boolean) {
  const [dismissed, setDismissed] = useState(initiallyDismissed);

  const dismiss = useCallback(() => {
    setDismissed(true);
    writePreferenceCookie(GUEST_BANNER_COOKIE, GUEST_BANNER_DISMISSED);
  }, []);

  return { dismissed, dismiss };
}
