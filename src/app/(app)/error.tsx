'use client';

import { useTranslations } from 'next-intl';
import { ButtonLink } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import { APP_ROUTES } from '@/constants/routes';

interface AppErrorProps {
  error: Error & { digest?: string };
  retry: () => void;
}

/** Errors inside the authenticated area keep the shell (sidebar, topbar) usable. */
export default function AppError({ retry }: AppErrorProps) {
  const t = useTranslations('errorPage');

  return (
    <ErrorState
      headingLevel="h1"
      title={t('title')}
      description={t('description')}
      retryLabel={t('retry')}
      onRetry={retry}
      action={
        <ButtonLink href={APP_ROUTES.dashboard} variant="ghost">
          {t('home')}
        </ButtonLink>
      }
    />
  );
}
