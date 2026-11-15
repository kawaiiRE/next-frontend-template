import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { NoteForm } from '@/components/notes/NoteForm';
import { PageHeader } from '@/components/ui/PageHeader';
import { APP_ROUTES } from '@/constants/routes';
import { loadNoteForPage } from '@/server/services/note-page';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.titles');
  return { title: t('editNote') };
}

export default async function EditNotePage({ params }: PageProps<'/notes/[id]/edit'>) {
  const [{ id }, t] = await Promise.all([params, getTranslations('notes')]);
  const note = await loadNoteForPage(id);

  return (
    <>
      <PageHeader
        back={{ href: APP_ROUTES.note(note.id), label: note.title || t('untitled') }}
        title={t('form.editTitle')}
        description={t('form.editSubtitle')}
      />
      <NoteForm
        note={{ id: note.id, title: note.title, body: note.body }}
        cancelHref={APP_ROUTES.note(note.id)}
      />
    </>
  );
}
