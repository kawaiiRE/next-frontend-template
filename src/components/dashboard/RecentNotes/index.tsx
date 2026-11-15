import { ArrowRight, FileText, Plus } from 'lucide-react';
import Link from 'next/link';
import { useFormatter, useTranslations } from 'next-intl';
import { ButtonLink } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { APP_ROUTES } from '@/constants/routes';
import type { NoteViewModel } from '@/presenters/note';
import styles from './styles.module.scss';

export function RecentNotes({ notes }: { notes: NoteViewModel[] }) {
  const t = useTranslations('dashboard');
  const notesT = useTranslations('notes');
  const format = useFormatter();

  return (
    <Card padded={false}>
      <div className={styles.recent__header}>
        <CardHeader
          title={t('recentTitle')}
          actions={
            notes.length > 0 ? (
              <ButtonLink
                href={APP_ROUTES.notes}
                variant="ghost"
                size="sm"
                iconEnd={<ArrowRight className={styles.recent__arrow} aria-hidden="true" />}
              >
                {t('viewAll')}
              </ButtonLink>
            ) : null
          }
        />
      </div>
      {notes.length === 0 ? (
        <EmptyState
          compact
          headingLevel="h3"
          icon={<FileText />}
          title={t('emptyTitle')}
          description={t('emptyDescription')}
          action={
            <ButtonLink href={APP_ROUTES.newNote} iconStart={<Plus aria-hidden="true" />}>
              {notesT('new')}
            </ButtonLink>
          }
        />
      ) : (
        <ul className={styles.recent__list}>
          {notes.map((note) => (
            <li key={note.id}>
              <Link className={styles.recent__item} href={APP_ROUTES.note(note.id)}>
                <span className={styles.recent__icon} aria-hidden="true">
                  <FileText />
                </span>
                <span className={styles.recent__text}>
                  <span className={styles.recent__title} dir="auto">
                    {note.title || notesT('untitled')}
                  </span>
                  <span className={styles.recent__excerpt} dir="auto">
                    {note.excerpt || notesT('noContent')}
                  </span>
                </span>
                <time className={styles.recent__time} dateTime={note.updatedAt}>
                  {format.relativeTime(new Date(note.updatedAt))}
                </time>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
