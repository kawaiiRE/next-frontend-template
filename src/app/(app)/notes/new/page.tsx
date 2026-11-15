import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { NoteForm } from '@/components/notes/NoteForm';
import { PageHeader } from '@/components/ui/PageHeader';
import { APP_ROUTES } from '@/constants/routes';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.titles');
  return { title: t('newNote') };
}

export default async function NewNotePage() {
  const t = await getTranslations('notes');

  return (
    <>
      <PageHeader
        back={{ href: APP_ROUTES.notes, label: t('detail.back') }}
        title={t('form.createTitle')}
        description={t('form.createSubtitle')}
      />
      <NoteForm cancelHref={APP_ROUTES.notes} />
    </>
  );
}
