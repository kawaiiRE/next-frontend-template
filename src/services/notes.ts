import { noteSchema, type CreateNoteInput, type UpdateNoteInput } from '@/contracts/note';
import { API_ROUTES } from '@/constants/routes';
import { presentNoteView, type NoteViewModel } from '@/presenters/note';
import { expectEmpty, request, type ApiResult } from '@/services/api';

const parseNote = (value: unknown): NoteViewModel => presentNoteView(noteSchema.parse(value));

export function createNote(input: CreateNoteInput): Promise<ApiResult<NoteViewModel>> {
  return request(API_ROUTES.notes, parseNote, { method: 'POST', body: input });
}

export function updateNote(id: string, input: UpdateNoteInput): Promise<ApiResult<NoteViewModel>> {
  return request(API_ROUTES.note(id), parseNote, { method: 'PATCH', body: input });
}

export function deleteNote(id: string): Promise<ApiResult<void>> {
  return request(API_ROUTES.note(id), expectEmpty, { method: 'DELETE' });
}
