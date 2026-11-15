import { LockKeyhole } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { AuthCard } from '@/components/auth/AuthCard';
import { GuestOption } from '@/components/auth/GuestOption';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { Alert } from '@/components/ui/Alert';
import { ButtonLink } from '@/components/ui/Button';
import { APP_ROUTES } from '@/constants/routes';
import { getAppConfigOrFallback } from '@/server/services/config';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.titles');
  return { title: t('register') };
}

export default async function RegisterPage() {
  const [t, config] = await Promise.all([
    getTranslations('auth.register'),
    getAppConfigOrFallback(),
  ]);

  if (!config.features.registration) {
    return (
      <AuthCard
        icon={<LockKeyhole />}
        title={t('title')}
        footer={
          <ButtonLink href={APP_ROUTES.login} variant="secondary" size="lg" fullWidth>
            {t('signIn')}
          </ButtonLink>
        }
      >
        <Alert tone="info">{t('disabled')}</Alert>
      </AuthCard>
    );
  }

  return (
    <RegisterForm
      footer={
        <p>
          {t('haveAccount')} <Link href={APP_ROUTES.login}>{t('signIn')}</Link>
        </p>
      }
    >
      {config.features.guest ? <GuestOption /> : null}
    </RegisterForm>
  );
}
