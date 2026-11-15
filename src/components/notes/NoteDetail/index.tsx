import { useFormatter, useTranslations } from 'next-intl';
import { NoteActions } from '@/components/notes/NoteActions';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { APP_ROUTES } from '@/constants/routes';
import type { NoteViewModel } from '@/presenters/note';
import styles from './styles.module.scss';

export function NoteDetail({ note }: { note: NoteViewModel }) {
  const t = useTranslations('notes');
  const format = useFormatter();
  const created = format.dateTime(new Date(note.createdAt), 'long');
  const updated = format.dateTime(new Date(note.updatedAt), 'withTime');

  return (
    <>
      <PageHeader
        back={{ href: APP_ROUTES.notes, label: t('detail.back') }}
        title={note.title || t('untitled')}
        meta={
          <>
            {note.archived ? <Badge tone="warning">{t('archivedBadge')}</Badge> : null}
            <time dateTime={note.createdAt}>{t('detail.createdOn', { date: created })}</time>
            {note.wasEdited ? (
              <time dateTime={note.updatedAt}>{t('detail.updatedOn', { date: updated })}</time>
            ) : null}
          </>
        }
        actions={
          <NoteActions
            note={{ id: note.id, title: note.title, archived: note.archived }}
            variant="bar"
          />
        }
      />
      <Card as="article">
        {note.body.trim() ? (
          <div className={styles.detail__body} dir="auto">
            {note.body}
          </div>
        ) : (
          <p className={styles.detail__empty}>{t('noContent')}</p>
        )}
      </Card>
    </>
  );
}
