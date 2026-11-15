import { CircleAlert } from 'lucide-react';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { AuthCard } from '@/components/auth/AuthCard';
import { VerifyEmail } from '@/components/auth/VerifyEmail';
import { ButtonLink } from '@/components/ui/Button';
import { APP_ROUTES } from '@/constants/routes';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.titles');
  return { title: t('verifyEmail'), referrer: 'no-referrer' };
}

export default async function VerifyEmailPage({ searchParams }: PageProps<'/verify-email'>) {
  const [{ token }, t] = await Promise.all([searchParams, getTranslations('auth.verify')]);

  if (typeof token !== 'string' || token.length === 0) {
    return (
      <AuthCard icon={<CircleAlert />} title={t('title')} subtitle={t('missingToken')}>
        <ButtonLink href={APP_ROUTES.login} size="lg" fullWidth>
          {t('continue')}
        </ButtonLink>
      </AuthCard>
    );
  }

  return <VerifyEmail token={token} />;
}
