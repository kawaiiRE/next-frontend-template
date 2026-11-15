import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { NoteDetail } from '@/components/notes/NoteDetail';
import { presentNoteView } from '@/presenters/note';
import { loadNoteForPage } from '@/server/services/note-page';

export async function generateMetadata({ params }: PageProps<'/notes/[id]'>): Promise<Metadata> {
  const [{ id }, t] = await Promise.all([params, getTranslations('metadata.titles')]);
  try {
    const note = await loadNoteForPage(id);
    return { title: note.title || t('note') };
  } catch {
    return { title: t('note') };
  }
}

export default async function NotePage({ params }: PageProps<'/notes/[id]'>) {
  const { id } = await params;
  const note = await loadNoteForPage(id);
  return <NoteDetail note={presentNoteView(note)} />;
}
