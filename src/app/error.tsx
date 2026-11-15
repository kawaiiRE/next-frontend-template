'use client';

import { useTranslations } from 'next-intl';
import { MAIN_CONTENT_ID } from '@/components/layout/SkipLink';
import { ButtonLink } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import { APP_ROUTES } from '@/constants/routes';

interface ErrorPageProps {
  error: Error & { digest?: string };
  retry: () => void;
}

/** Root error boundary (marketing and auth pages). Never shows the raw error message. */
export default function ErrorPage({ retry }: ErrorPageProps) {
  const t = useTranslations('errorPage');

  return (
    <main id={MAIN_CONTENT_ID} tabIndex={-1}>
      <ErrorState
        fullPage
        headingLevel="h1"
        title={t('title')}
        description={t('description')}
        retryLabel={t('retry')}
        onRetry={retry}
        action={
          <ButtonLink href={APP_ROUTES.home} variant="ghost">
            {t('home')}
          </ButtonLink>
        }
      />
    </main>
  );
}
