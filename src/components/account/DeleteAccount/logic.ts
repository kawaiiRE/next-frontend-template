'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';
import { toast } from '@/components/ui/Toaster';
import { APP_ROUTES } from '@/constants/routes';
import { useApiError } from '@/hooks/use-api-error';
import { loginPathWithNext } from '@/lib/navigation';
import { deleteAccount } from '@/services/account';

/** Deletes the account (for guests: ends the guest session); the backend cascades the notes. */
export function useDeleteAccount(isGuest: boolean) {
  const router = useRouter();
  const t = useTranslations('guest');
  const { messageFor, handleSessionExpiry } = useApiError();
  const [open, setOpen] = useState(false);

  const confirm = useCallback(async () => {
    const result = await deleteAccount();
    if (!result.success) {
      if (!handleSessionExpiry(result.error)) toast.error(messageFor(result.error.code));
      return false;
    }
    if (isGuest) {
      toast.success(t('ended'));
      router.replace(APP_ROUTES.home);
      router.refresh();
    } else {
      window.location.assign(loginPathWithNext(null, 'account-deleted'));
    }
    return true;
  }, [handleSessionExpiry, isGuest, messageFor, router, t]);

  return { open, setOpen, confirm };
}
