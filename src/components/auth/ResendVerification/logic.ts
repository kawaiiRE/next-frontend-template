'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';
import { toast } from '@/components/ui/Toaster';
import { useApiError } from '@/hooks/use-api-error';
import { requestVerification } from '@/services/auth';

export function useResendVerification(email: string) {
  const t = useTranslations('auth.verify');
  const { messageFor } = useApiError();
  const [pending, setPending] = useState(false);

  const resend = useCallback(async () => {
    setPending(true);
    const result = await requestVerification(email);
    setPending(false);
    if (result.success) toast.success(t('resent', { email }));
    else toast.error(messageFor(result.error.code));
  }, [email, messageFor, t]);

  return { resend, pending };
}
