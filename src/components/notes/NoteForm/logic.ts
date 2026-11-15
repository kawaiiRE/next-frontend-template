'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useCallback } from 'react';
import { toast } from '@/components/ui/Toaster';
import { createNoteInputSchema, type CreateNoteInput } from '@/contracts/note';
import { APP_ROUTES } from '@/constants/routes';
import { useApiForm } from '@/hooks/use-api-form';
import { createNote, updateNote } from '@/services/notes';

export function useNoteForm(noteId: string | null) {
  const router = useRouter();
  const t = useTranslations('notes.toasts');

  const onSubmit = useCallback(
    async (values: CreateNoteInput) => {
      const result = noteId ? await updateNote(noteId, values) : await createNote(values);
      if (!result.success) return result.error;

      toast.success(noteId ? t('saved') : t('created'));
      router.push(APP_ROUTES.note(result.data.id));
      router.refresh();
      return null;
    },
    [noteId, router, t],
  );

  return useApiForm({ schema: createNoteInputSchema, onSubmit });
}
