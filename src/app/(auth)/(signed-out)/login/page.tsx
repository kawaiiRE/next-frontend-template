import type { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { AuthCard } from '@/components/auth/AuthCard';
import { GuestOption } from '@/components/auth/GuestOption';
import { LoginForm } from '@/components/auth/LoginForm';
import {
  APP_ROUTES,
  LOGIN_NOTICE_PARAM,
  LOGIN_NOTICES,
  NEXT_PARAM,
  type LoginNotice,
} from '@/constants/routes';
import { safeNextPath } from '@/lib/navigation';
import { getAppConfigOrFallback } from '@/server/services/config';

const NOTICE_MESSAGES = {
  'password-changed': 'passwordChanged',
  'account-deleted': 'accountDeleted',
  'session-expired': 'sessionExpired',
  'verification-sent': 'verificationSent',
} as const satisfies Record<LoginNotice, string>;

const SUCCESS_NOTICES: ReadonlySet<LoginNotice> = new Set(['password-changed', 'account-deleted']);

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.titles');
  return { title: t('login') };
}

export default async function LoginPage({ searchParams }: PageProps<'/login'>) {
  const [params, t, config] = await Promise.all([
    searchParams,
    getTranslations('auth.login'),
    getAppConfigOrFallback(),
  ]);
  const next = safeNextPath(typeof params[NEXT_PARAM] === 'string' ? params[NEXT_PARAM] : null);
  const noticeKey = LOGIN_NOTICES.find((value) => value === params[LOGIN_NOTICE_PARAM]);
  const notice = noticeKey
    ? {
        tone: SUCCESS_NOTICES.has(noticeKey) ? ('success' as const) : ('info' as const),
        message: t(NOTICE_MESSAGES[noticeKey]),
      }
    : null;

  return (
    <AuthCard
      title={t('title')}
      subtitle={t('subtitle')}
      footer={
        config.features.registration ? (
          <p>
            {t('noAccount')} <Link href={APP_ROUTES.register}>{t('createAccount')}</Link>
          </p>
        ) : null
      }
    >
      <LoginForm next={next} notice={notice} />
      {config.features.guest ? <GuestOption /> : null}
    </AuthCard>
  );
}
