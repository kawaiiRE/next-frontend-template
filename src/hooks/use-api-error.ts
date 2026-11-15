'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useCallback } from 'react';
import { APP_ROUTES, NEXT_PARAM } from '@/constants/routes';
import type { ApiError } from '@/services/api';

/**
 * Shared handling for failed browser requests: localized messages by `code`, and a rejected session
 * (`UNAUTHENTICATED`) sends the user to sign in again and back to the current page afterwards.
 */
export function useApiError() {
  const t = useTranslations('errors');
  const router = useRouter();
  const pathname = usePathname();

  const messageFor = useCallback(
    (code: string) => {
      const key = code as 'fallback';
      return t.has(key) ? t(key) : t('fallback');
    },
    [t],
  );

  /** Returns `true` when the error ended the session and navigation has started. */
  const handleSessionExpiry = useCallback(
    (error: ApiError) => {
      if (error.code !== 'UNAUTHENTICATED') return false;
      router.replace(`${APP_ROUTES.sessionExpired}?${NEXT_PARAM}=${encodeURIComponent(pathname)}`);
      return true;
    },
    [pathname, router],
  );

  return { messageFor, handleSessionExpiry };
}
