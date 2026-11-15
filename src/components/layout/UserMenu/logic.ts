'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';
import { toast } from '@/components/ui/Toaster';
import { APP_ROUTES } from '@/constants/routes';
import { useApiError } from '@/hooks/use-api-error';
import { logout } from '@/services/auth';

/**
 * Signing out of a guest session is confirmed first: a guest has no credentials, so the session
 * cannot be resumed afterwards.
 */
export function useSignOut(isGuest: boolean) {
  const router = useRouter();
  const t = useTranslations('userMenu');
  const { messageFor } = useApiError();
  const [pending, setPending] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const signOut = useCallback(async () => {
    setPending(true);
    const result = await logout();
    setPending(false);

    if (!result.success) {
      toast.error(messageFor(result.error.code));
      return false;
    }
    toast.success(t('signedOut'));
    router.replace(APP_ROUTES.home);
    router.refresh();
    return true;
  }, [messageFor, router, t]);

  const requestSignOut = useCallback(() => {
    if (isGuest) setConfirmOpen(true);
    else void signOut();
  }, [isGuest, signOut]);

  return { requestSignOut, signOut, pending, confirmOpen, setConfirmOpen };
}
