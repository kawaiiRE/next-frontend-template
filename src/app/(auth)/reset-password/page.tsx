import { CircleAlert } from 'lucide-react';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { AuthCard } from '@/components/auth/AuthCard';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { ButtonLink } from '@/components/ui/Button';
import { APP_ROUTES } from '@/constants/routes';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.titles');
  return { title: t('resetPassword'), referrer: 'no-referrer' };
}

export default async function ResetPasswordPage({ searchParams }: PageProps<'/reset-password'>) {
  const [{ token }, t] = await Promise.all([searchParams, getTranslations('auth.reset')]);

  if (typeof token !== 'string' || token.length === 0) {
    return (
      <AuthCard icon={<CircleAlert />} title={t('title')} subtitle={t('missingToken')}>
        <ButtonLink href={APP_ROUTES.forgotPassword} size="lg" fullWidth>
          {t('requestNew')}
        </ButtonLink>
      </AuthCard>
    );
  }

  return <ResetPasswordForm token={token} />;
}
