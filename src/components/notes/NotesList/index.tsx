import { Archive, FileText, Plus, SearchX } from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';
import { NoteCard } from '@/components/notes/NoteCard';
import { ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { APP_ROUTES } from '@/constants/routes';
import type { NotesPageViewModel } from '@/presenters/note';
import styles from './styles.module.scss';

interface NotesListProps {
  page: NotesPageViewModel;
  search: string;
  archived: boolean;
  hrefForPage: (page: number) => string;
  clearSearchHref: string;
}

export function NotesList({
  page,
  search,
  archived,
  hrefForPage,
  clearSearchHref,
}: NotesListProps) {
  const t = useTranslations('notes');
  const format = useFormatter();

  if (page.items.length === 0) {
    if (search) {
      return (
        <EmptyState
          icon={<SearchX />}
          title={t('noResultsTitle')}
          description={t('noResultsDescription', { search })}
          action={
            <ButtonLink href={clearSearchHref} variant="secondary">
              {t('clearSearch')}
            </ButtonLink>
          }
        />
      );
    }
    return archived ? (
      <EmptyState
        icon={<Archive />}
        title={t('archivedEmptyTitle')}
        description={t('archivedEmptyDescription')}
      />
    ) : (
      <EmptyState
        icon={<FileText />}
        title={t('emptyTitle')}
        description={t('emptyDescription')}
        action={
          <ButtonLink href={APP_ROUTES.newNote} iconStart={<Plus aria-hidden="true" />}>
            {t('new')}
          </ButtonLink>
        }
      />
    );
  }

  return (
    <section aria-labelledby="notes-count">
      <p className={styles.list__count} id="notes-count" aria-live="polite">
        {t('count', { count: page.totalItems })}
        {page.totalPages > 1 ? (
          <span className={styles.list__pages}>
            {' · '}
            {format.number(page.page)} / {format.number(page.totalPages)}
          </span>
        ) : null}
      </p>
      <ul className={styles.list__grid}>
        {page.items.map((note) => (
          <li key={note.id} className={styles.list__item}>
            <NoteCard note={note} />
          </li>
        ))}
      </ul>
      <Pagination page={page.page} totalPages={page.totalPages} hrefFor={hrefForPage} />
    </section>
  );
}
