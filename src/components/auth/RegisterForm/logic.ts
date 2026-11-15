'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { registerInputSchema, type RegisterInput } from '@/contracts/auth';
import { APP_ROUTES } from '@/constants/routes';
import { useApiForm } from '@/hooks/use-api-form';
import { register } from '@/services/auth';

export function useRegisterForm() {
  const router = useRouter();
  const [verificationEmail, setVerificationEmail] = useState<string | null>(null);

  const onSubmit = useCallback(
    async (values: RegisterInput) => {
      const result = await register(values);
      if (!result.success) return result.error;

      if (result.data.status === 'verification_required') {
        setVerificationEmail(result.data.user.email);
        return null;
      }
      router.replace(APP_ROUTES.dashboard);
      router.refresh();
      return null;
    },
    [router],
  );

  return { ...useApiForm({ schema: registerInputSchema, onSubmit }), verificationEmail };
}
