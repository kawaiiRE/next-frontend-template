'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useCallback, useState, useTransition } from 'react';
import { toast } from '@/components/ui/Toaster';
import { APP_ROUTES } from '@/constants/routes';
import { useApiError } from '@/hooks/use-api-error';
import { deleteNote, updateNote } from '@/services/notes';
import type { ApiError } from '@/services/api';

interface NoteRef {
  id: string;
  archived: boolean;
}

/**
 * Archive/restore and delete for a note. Server data is the source of truth: after a mutation the
 * route is refreshed instead of patching local copies.
 */
export function useNoteActions(note: NoteRef, options: { redirectAfterDelete?: boolean } = {}) {
  const router = useRouter();
  const t = useTranslations('notes.toasts');
  const { messageFor, handleSessionExpiry } = useApiError();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [archiving, startArchive] = useTransition();

  const showError = useCallback(
    (error: ApiError) => {
      if (!handleSessionExpiry(error)) toast.error(messageFor(error.code));
    },
    [handleSessionExpiry, messageFor],
  );

  const toggleArchive = useCallback(() => {
    startArchive(async () => {
      const result = await updateNote(note.id, { archived: !note.archived });
      if (!result.success) {
        showError(result.error);
        return;
      }
      toast.success(result.data.archived ? t('archived') : t('unarchived'));
      router.refresh();
    });
  }, [note.archived, note.id, router, showError, t]);

  const confirmDelete = useCallback(async () => {
    const result = await deleteNote(note.id);
    if (!result.success) {
      showError(result.error);
      return false;
    }
    toast.success(t('deleted'));
    if (options.redirectAfterDelete) router.replace(APP_ROUTES.notes);
    router.refresh();
    return true;
  }, [note.id, options.redirectAfterDelete, router, showError, t]);

  return { toggleArchive, archiving, deleteOpen, setDeleteOpen, confirmDelete };
}
