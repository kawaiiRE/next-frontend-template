import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ProfileForm } from '@/components/account/ProfileForm';
import { PageHeader } from '@/components/ui/PageHeader';
import { presentUserView } from '@/presenters/user';
import { requireSession } from '@/server/session';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.titles');
  return { title: t('profile') };
}

export default async function ProfilePage() {
  const [{ user }, t, guest] = await Promise.all([
    requireSession(),
    getTranslations('profile'),
    getTranslations('guest'),
  ]);

  return (
    <>
      <PageHeader title={t('title')} description={t('subtitle')} />
      <ProfileForm user={presentUserView(user, guest('displayName'))} />
    </>
  );
}
