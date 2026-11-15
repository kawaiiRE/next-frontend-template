'use client';

import { Archive, ArchiveRestore, Ellipsis, Pencil, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button, ButtonLink } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { DropdownMenu } from '@/components/ui/DropdownMenu';
import { IconButton } from '@/components/ui/IconButton';
import { APP_ROUTES } from '@/constants/routes';
import { useNoteActions } from './logic';
import styles from './styles.module.scss';

interface NoteActionsProps {
  note: { id: string; title: string; archived: boolean };
  /** `menu` for list cards, `bar` for the detail page header. */
  variant: 'menu' | 'bar';
}

export function NoteActions({ note, variant }: NoteActionsProps) {
  const t = useTranslations('notes');
  const a11y = useTranslations('a11y');
  const { toggleArchive, archiving, deleteOpen, setDeleteOpen, confirmDelete } = useNoteActions(
    note,
    {
      redirectAfterDelete: variant === 'bar',
    },
  );
  const title = note.title || t('untitled');

  const dialog = (
    <ConfirmDialog
      open={deleteOpen}
      onOpenChange={setDeleteOpen}
      title={t('delete.title')}
      description={t('delete.description', { title })}
      confirmLabel={t('delete.confirm')}
      onConfirm={confirmDelete}
    />
  );

  if (variant === 'bar') {
    return (
      <div className={styles.bar}>
        <ButtonLink
          href={APP_ROUTES.editNote(note.id)}
          variant="secondary"
          iconStart={<Pencil aria-hidden="true" />}
        >
          {t('actions.edit')}
        </ButtonLink>
        <Button
          variant="secondary"
          loading={archiving}
          iconStart={
            note.archived ? <ArchiveRestore aria-hidden="true" /> : <Archive aria-hidden="true" />
          }
          onClick={toggleArchive}
        >
          {note.archived ? t('actions.unarchive') : t('actions.archive')}
        </Button>
        <Button
          variant="ghost"
          className={styles.bar__delete}
          iconStart={<Trash2 aria-hidden="true" />}
          onClick={() => setDeleteOpen(true)}
        >
          {t('actions.delete')}
        </Button>
        {dialog}
      </div>
    );
  }

  return (
    <>
      <DropdownMenu
        trigger={
          <IconButton
            label={a11y('moreActions', { title })}
            icon={<Ellipsis aria-hidden="true" />}
            size="sm"
            tooltip={false}
            disabled={archiving}
          />
        }
        entries={[
          {
            type: 'link',
            key: 'edit',
            label: t('actions.edit'),
            href: APP_ROUTES.editNote(note.id),
            icon: <Pencil aria-hidden="true" />,
          },
          {
            type: 'item',
            key: 'archive',
            label: note.archived ? t('actions.unarchive') : t('actions.archive'),
            icon: note.archived ? (
              <ArchiveRestore aria-hidden="true" />
            ) : (
              <Archive aria-hidden="true" />
            ),
            onSelect: toggleArchive,
          },
          { type: 'separator', key: 'separator' },
          {
            type: 'item',
            key: 'delete',
            label: t('actions.delete'),
            icon: <Trash2 aria-hidden="true" />,
            tone: 'danger',
            onSelect: () => setDeleteOpen(true),
          },
        ]}
      />
      {dialog}
    </>
  );
}
