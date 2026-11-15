'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useCallback } from 'react';
import { toast } from '@/components/ui/Toaster';
import { registerInputSchema, type RegisterInput } from '@/contracts/auth';
import { useApiForm } from '@/hooks/use-api-form';
import { loginPathWithNext } from '@/lib/navigation';
import { upgradeGuest } from '@/services/auth';

/** Upgrading keeps the guest's notes; the gateway replaces the session cookie. */
export function useGuestUpgradeForm(onUpgraded?: () => void) {
  const router = useRouter();
  const t = useTranslations('guest');

  const onSubmit = useCallback(
    async (values: RegisterInput) => {
      const result = await upgradeGuest(values);
      if (!result.success) return result.error;
      onUpgraded?.();
      if (result.data.status === 'verification_required') {
        window.location.assign(loginPathWithNext(null, 'verification-sent'));
        return null;
      }
      toast.success(t('upgraded'));
      router.refresh();
      return null;
    },
    [onUpgraded, router, t],
  );

  return useApiForm({ schema: registerInputSchema, onSubmit });
}
