'use client';

import { useCallback, useState } from 'react';
import { passwordResetRequestSchema, type PasswordResetRequestInput } from '@/contracts/auth';
import { useApiForm } from '@/hooks/use-api-form';
import { requestPasswordReset } from '@/services/auth';

export function useForgotPasswordForm() {
  const [sentTo, setSentTo] = useState<string | null>(null);

  const onSubmit = useCallback(async (values: PasswordResetRequestInput) => {
    const result = await requestPasswordReset(values.email);
    if (!result.success) return result.error;
    setSentTo(values.email);
    return null;
  }, []);

  return { ...useApiForm({ schema: passwordResetRequestSchema, onSubmit }), sentTo };
}
