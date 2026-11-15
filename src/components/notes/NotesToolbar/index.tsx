'use client';

import { Archive, NotebookPen, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Spinner } from '@/components/ui/Spinner';
import { TextField } from '@/components/ui/TextField';
import { NOTES_SEARCH_MAX_LENGTH } from '@/contracts/note';
import { useNotesToolbar } from './logic';
import styles from './styles.module.scss';

interface NotesToolbarProps {
  search: string;
  archived: boolean;
}

export function NotesToolbar({
  search: initialSearch,
  archived: initialArchived,
}: NotesToolbarProps) {
  const t = useTranslations('notes');
  const { search, onSearchChange, submitSearch, archived, setArchived, pending } = useNotesToolbar(
    initialSearch,
    initialArchived,
  );

  return (
    <div className={styles.toolbar}>
      <form
        className={styles.toolbar__search}
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          submitSearch();
        }}
      >
        <TextField
          label={t('searchLabel')}
          hideLabel
          name="search"
          type="search"
          inputMode="search"
          enterKeyHint="search"
          autoComplete="off"
          placeholder={t('searchPlaceholder')}
          maxLength={NOTES_SEARCH_MAX_LENGTH}
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          iconStart={<Search />}
          endAdornment={
            pending ? (
              <span className={styles.toolbar__spinner}>
                <Spinner size="sm" />
              </span>
            ) : undefined
          }
        />
      </form>
      <SegmentedControl
        legend={t('filterLabel')}
        hideLegend
        value={archived ? 'archived' : 'active'}
        onValueChange={(value) => setArchived(value === 'archived')}
        options={[
          { value: 'active', label: t('filterActive'), icon: <NotebookPen aria-hidden="true" /> },
          { value: 'archived', label: t('filterArchived'), icon: <Archive aria-hidden="true" /> },
        ]}
      />
    </div>
  );
}
