'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useTransition } from 'react';
import { ErrorState } from '@/components/ui/ErrorState';

interface LoadErrorProps {
  title: string;
  description: string;
}

/** Inline error for server-loaded data; retry re-renders the route on the server. */
export function LoadError({ title, description }: LoadErrorProps) {
  const t = useTranslations('common');
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <ErrorState
      title={title}
      description={description}
      retryLabel={pending ? t('loading') : t('retry')}
      onRetry={() => startTransition(() => router.refresh())}
    />
  );
}
