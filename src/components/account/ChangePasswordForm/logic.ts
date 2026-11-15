'use client';

import { useCallback } from 'react';
import { changePasswordInputSchema, type ChangePasswordInput } from '@/contracts/auth';
import { useApiForm } from '@/hooks/use-api-form';
import { loginPathWithNext } from '@/lib/navigation';
import { changePassword } from '@/services/account';

/**
 * A password change revokes every session, so the user signs in again. A full page load leaves the
 * authenticated tree behind without racing its refresh.
 */
export function useChangePasswordForm() {
  const onSubmit = useCallback(async (values: ChangePasswordInput) => {
    const result = await changePassword(values);
    if (!result.success) return result.error;
    window.location.assign(loginPathWithNext(null, 'password-changed'));
    return null;
  }, []);

  return useApiForm({ schema: changePasswordInputSchema, onSubmit });
}
