import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.titles');
  return { title: t('forgotPassword') };
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
