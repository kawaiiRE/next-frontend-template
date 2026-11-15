import 'server-only';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import type { Note } from '@/contracts/note';
import { ApiFailure } from '@/server/http/errors';
import { getNote } from '@/server/services/notes';
import { requireSession } from '@/server/session';

/** Loads a note for a page (deduplicated per request); missing or foreign notes render 404. */
export const loadNoteForPage = cache(async (id: string): Promise<Note> => {
  const { auth } = await requireSession();
  try {
    return await getNote(auth, id);
  } catch (error) {
    if (error instanceof ApiFailure && error.code === 'NOT_FOUND') notFound();
    throw error;
  }
});
