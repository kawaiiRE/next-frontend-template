'use client';

import { useCallback, useState } from 'react';
import { z } from 'zod';
import { newPasswordSchema } from '@/contracts/auth';
import { useApiForm } from '@/hooks/use-api-form';
import { confirmPasswordReset } from '@/services/auth';

const resetFormSchema = z.object({ password: newPasswordSchema });

export function useResetPasswordForm(token: string) {
  const [done, setDone] = useState(false);

  const onSubmit = useCallback(
    async (values: z.infer<typeof resetFormSchema>) => {
      const result = await confirmPasswordReset({ token, password: values.password });
      if (!result.success) return result.error;
      setDone(true);
      return null;
    },
    [token],
  );

  return { ...useApiForm({ schema: resetFormSchema, onSubmit }), done };
}
