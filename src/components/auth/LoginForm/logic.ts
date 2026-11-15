'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { loginInputSchema, type LoginInput } from '@/contracts/auth';
import { APP_ROUTES } from '@/constants/routes';
import { useApiForm } from '@/hooks/use-api-form';
import { safeNextPath } from '@/lib/navigation';
import { login } from '@/services/auth';

export function useLoginForm(next: string | null) {
  const router = useRouter();
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  const onSubmit = useCallback(
    async (values: LoginInput) => {
      const result = await login(values);
      if (!result.success) {
        setUnverifiedEmail(result.error.code === 'EMAIL_NOT_VERIFIED' ? values.email : null);
        return result.error;
      }
      router.replace(safeNextPath(next) ?? APP_ROUTES.dashboard);
      router.refresh();
      return null;
    },
    [next, router],
  );

  const form = useApiForm({ schema: loginInputSchema, onSubmit });
  return {
    ...form,
    /** Set while the last attempt failed because the email is not verified yet. */
    unverifiedEmail: form.formErrorCode === 'EMAIL_NOT_VERIFIED' ? unverifiedEmail : null,
  };
}
