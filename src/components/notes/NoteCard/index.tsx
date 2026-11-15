import Link from 'next/link';
import { useFormatter, useTranslations } from 'next-intl';
import { NoteActions } from '@/components/notes/NoteActions';
import { Badge } from '@/components/ui/Badge';
import { APP_ROUTES } from '@/constants/routes';
import type { NoteViewModel } from '@/presenters/note';
import styles from './styles.module.scss';

export function NoteCard({ note }: { note: NoteViewModel }) {
  const t = useTranslations('notes');
  const format = useFormatter();
  const title = note.title || t('untitled');

  return (
    <article className={styles.card}>
      <div className={styles.card__head}>
        <h2 className={styles.card__title}>
          <Link
            className={styles.card__link}
            href={APP_ROUTES.note(note.id)}
            title={title}
            dir="auto"
          >
            {title}
          </Link>
        </h2>
        <div className={styles.card__menu}>
          <NoteActions
            note={{ id: note.id, title: note.title, archived: note.archived }}
            variant="menu"
          />
        </div>
      </div>
      <p
        className={note.excerpt ? styles.card__excerpt : styles.card__excerptEmpty}
        dir={note.excerpt ? 'auto' : undefined}
      >
        {note.excerpt || t('noContent')}
      </p>
      <footer className={styles.card__footer}>
        <time
          dateTime={note.updatedAt}
          title={format.dateTime(new Date(note.updatedAt), 'withTime')}
        >
          {t('updated', { time: format.relativeTime(new Date(note.updatedAt)) })}
        </time>
        {note.archived ? <Badge tone="warning">{t('archivedBadge')}</Badge> : null}
      </footer>
    </article>
  );
}
