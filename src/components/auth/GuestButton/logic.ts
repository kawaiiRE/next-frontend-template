'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { toast } from '@/components/ui/Toaster';
import { APP_ROUTES } from '@/constants/routes';
import { useApiError } from '@/hooks/use-api-error';
import { startGuestSession } from '@/services/auth';

export function useGuestSession() {
  const router = useRouter();
  const { messageFor } = useApiError();
  const [pending, setPending] = useState(false);

  const start = useCallback(async () => {
    setPending(true);
    const result = await startGuestSession();
    if (!result.success) {
      setPending(false);
      toast.error(messageFor(result.error.code));
      return;
    }
    router.replace(APP_ROUTES.dashboard);
    router.refresh();
  }, [messageFor, router]);

  return { start, pending };
}
