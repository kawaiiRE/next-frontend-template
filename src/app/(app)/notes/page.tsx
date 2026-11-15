import { Plus } from 'lucide-react';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { LoadError } from '@/components/feedback/LoadError';
import { NotesList } from '@/components/notes/NotesList';
import { NotesToolbar } from '@/components/notes/NotesToolbar';
import { ButtonLink } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { APP_ROUTES } from '@/constants/routes';
import { NOTES_DEFAULT_PER_PAGE, parseNotesSearchParams, type NotesQuery } from '@/contracts/note';
import { presentNotesPageView } from '@/presenters/note';
import { listNotes } from '@/server/services/notes';
import { requireSession } from '@/server/session';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.titles');
  return { title: t('notes') };
}

function notesHref(query: Partial<NotesQuery>) {
  const params = new URLSearchParams();
  if (query.search) params.set('search', query.search);
  if (query.archived) params.set('archived', 'true');
  if (query.page && query.page > 1) params.set('page', String(query.page));
  if (query.perPage && query.perPage !== NOTES_DEFAULT_PER_PAGE)
    params.set('perPage', String(query.perPage));
  const search = params.toString();
  return search ? `${APP_ROUTES.notes}?${search}` : APP_ROUTES.notes;
}

export default async function NotesPage({ searchParams }: PageProps<'/notes'>) {
  const [{ auth }, params, t] = await Promise.all([
    requireSession(),
    searchParams,
    getTranslations('notes'),
  ]);
  const query = parseNotesSearchParams(params);
  const page = await listNotes(auth, query).then(presentNotesPageView, () => null);

  return (
    <>
      <PageHeader
        title={t('title')}
        description={t('subtitle')}
        actions={
          <ButtonLink href={APP_ROUTES.newNote} iconStart={<Plus aria-hidden="true" />}>
            {t('new')}
          </ButtonLink>
        }
      />
      <NotesToolbar search={query.search} archived={query.archived} />
      {page ? (
        <NotesList
          page={page}
          search={query.search}
          archived={query.archived}
          hrefForPage={(pageNumber) => notesHref({ ...query, page: pageNumber })}
          clearSearchHref={notesHref({ ...query, search: '', page: 1 })}
        />
      ) : (
        <LoadError title={t('loadErrorTitle')} description={t('loadErrorDescription')} />
      )}
    </>
  );
}
