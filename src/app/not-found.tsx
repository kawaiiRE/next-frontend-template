import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { NotFoundView } from '@/components/feedback/NotFoundView';
import { getSessionAuth } from '@/server/session';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.titles');
  return { title: t('notFound') };
}

export default async function NotFound() {
  const auth = await getSessionAuth();
  return <NotFoundView signedIn={auth !== null} />;
}
