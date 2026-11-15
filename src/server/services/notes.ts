import 'server-only';
import { ClientResponseError } from 'pocketbase';
import {
  recordIdSchema,
  type CreateNoteInput,
  type Note,
  type NotesPage,
  type NotesQuery,
  type UpdateNoteInput,
} from '@/contracts/note';
import { presentNote, presentNotesPage } from '@/presenters/note';
import { ApiFailure, fieldErrorsFromPocketBase } from '@/server/http/errors';
import * as notesRepository from '@/server/repositories/notes';
import type { AuthContext } from '@/server/services/account';

function assertNoteId(id: string) {
  if (!recordIdSchema.safeParse(id).success) throw new ApiFailure('NOT_FOUND');
}

/** Foreign or missing notes are indistinguishable: both are `NOT_FOUND`. */
function mapNoteError(error: unknown): never {
  if (error instanceof ClientResponseError) {
    if (error.status === 404 || error.status === 403) throw new ApiFailure('NOT_FOUND');
    if (error.status === 401) throw new ApiFailure('UNAUTHENTICATED');
    if (error.status === 400)
      throw new ApiFailure('INVALID_INPUT', fieldErrorsFromPocketBase(error));
  }
  throw error;
}

export async function listNotes(auth: AuthContext, query: NotesQuery): Promise<NotesPage> {
  try {
    return presentNotesPage(await notesRepository.listNotes(auth.token, auth.userId, query));
  } catch (error) {
    mapNoteError(error);
  }
}

export async function getNote(auth: AuthContext, id: string): Promise<Note> {
  assertNoteId(id);
  try {
    return presentNote(await notesRepository.getNote(auth.token, id));
  } catch (error) {
    mapNoteError(error);
  }
}

export async function createNote(auth: AuthContext, input: CreateNoteInput): Promise<Note> {
  try {
    return presentNote(await notesRepository.createNote(auth.token, auth.userId, input));
  } catch (error) {
    mapNoteError(error);
  }
}

export async function updateNote(
  auth: AuthContext,
  id: string,
  input: UpdateNoteInput,
): Promise<Note> {
  assertNoteId(id);
  try {
    return presentNote(await notesRepository.updateNote(auth.token, id, input));
  } catch (error) {
    mapNoteError(error);
  }
}

export async function deleteNote(auth: AuthContext, id: string): Promise<void> {
  assertNoteId(id);
  try {
    await notesRepository.deleteNote(auth.token, id);
  } catch (error) {
    mapNoteError(error);
  }
}

export interface DashboardSummary {
  activeCount: number;
  archivedCount: number;
  totalCount: number;
  recent: Note[];
}

export async function getDashboardSummary(auth: AuthContext): Promise<DashboardSummary> {
  try {
    const [activeCount, archivedCount, recent] = await Promise.all([
      notesRepository.countNotes(auth.token, auth.userId, false),
      notesRepository.countNotes(auth.token, auth.userId, true),
      notesRepository.listNotes(auth.token, auth.userId, {
        page: 1,
        perPage: 5,
        search: '',
        archived: false,
      }),
    ]);
    return {
      activeCount,
      archivedCount,
      totalCount: activeCount + archivedCount,
      recent: recent.items.map(presentNote),
    };
  } catch (error) {
    mapNoteError(error);
  }
}
