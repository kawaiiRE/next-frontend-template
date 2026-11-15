'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useCallback } from 'react';
import { z } from 'zod';
import { toast } from '@/components/ui/Toaster';
import { nameSchema } from '@/contracts/user';
import { useApiForm } from '@/hooks/use-api-form';
import { updateProfile } from '@/services/account';

const profileFormSchema = z.object({ name: nameSchema });

export function useProfileForm() {
  const router = useRouter();
  const t = useTranslations('profile');

  const onSubmit = useCallback(
    async (values: z.infer<typeof profileFormSchema>) => {
      const result = await updateProfile(values);
      if (!result.success) return result.error;
      toast.success(t('saved'));
      router.refresh();
      return null;
    },
    [router, t],
  );

  return useApiForm({ schema: profileFormSchema, onSubmit });
}
