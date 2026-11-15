'use client';

import { CircleAlert, CircleCheck, MailCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { AuthCard } from '@/components/auth/AuthCard';
import { ButtonLink } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { APP_ROUTES } from '@/constants/routes';
import { useVerifyEmail } from './logic';
import styles from './styles.module.scss';

export function VerifyEmail({ token }: { token: string }) {
  const t = useTranslations('auth.verify');
  const state = useVerifyEmail(token);

  if (state === 'verifying') {
    return (
      <AuthCard icon={<MailCheck />} title={t('title')}>
        <p className={styles.status} role="status">
          <Spinner size="sm" />
          {t('verifying')}
        </p>
      </AuthCard>
    );
  }

  const success = state === 'success';
  return (
    <AuthCard
      icon={success ? <CircleCheck /> : <CircleAlert />}
      title={success ? t('successTitle') : t('failureTitle')}
      subtitle={
        <span role="status">{success ? t('successDescription') : t('failureDescription')}</span>
      }
    >
      <ButtonLink href={success ? APP_ROUTES.dashboard : APP_ROUTES.login} size="lg" fullWidth>
        {t('continue')}
      </ButtonLink>
    </AuthCard>
  );
}
