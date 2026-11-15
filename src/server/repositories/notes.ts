import 'server-only';
import type { CreateNoteInput, NotesQuery, UpdateNoteInput } from '@/contracts/note';
import {
  pocketBaseListSchema,
  pocketBaseNoteSchema,
  type PocketBaseNote,
} from '@/contracts/pocketbase';
import { parseUpstream } from '@/server/http/errors';
import { createPocketBaseClient } from '@/server/pocketbase';

const NOTES = 'notes';
const notesListSchema = pocketBaseListSchema(pocketBaseNoteSchema);
export type PocketBaseNotesList = ReturnType<typeof notesListSchema.parse>;

/** Ownership is scoped in the query and enforced again by the collection rules. */
export async function listNotes(
  token: string,
  ownerId: string,
  query: NotesQuery,
): Promise<PocketBaseNotesList> {
  const client = createPocketBaseClient(token);
  const filter = query.search
    ? client.filter('owner = {:owner} && archived = {:archived} && (title ~ {:q} || body ~ {:q})', {
        owner: ownerId,
        archived: query.archived,
        q: query.search,
      })
    : client.filter('owner = {:owner} && archived = {:archived}', {
        owner: ownerId,
        archived: query.archived,
      });

  const list = await client.collection(NOTES).getList(query.page, query.perPage, {
    filter,
    sort: '-updated,-id',
  });
  return parseUpstream(notesListSchema, list);
}

export async function countNotes(token: string, ownerId: string, archived: boolean) {
  const client = createPocketBaseClient(token);
  const list = await client.collection(NOTES).getList(1, 1, {
    filter: client.filter('owner = {:owner} && archived = {:archived}', {
      owner: ownerId,
      archived,
    }),
    fields: 'id',
  });
  return Math.max(0, list.totalItems);
}

export async function getNote(token: string, id: string): Promise<PocketBaseNote> {
  const record = await createPocketBaseClient(token).collection(NOTES).getOne(id);
  return parseUpstream(pocketBaseNoteSchema, record);
}

export async function createNote(
  token: string,
  ownerId: string,
  input: CreateNoteInput,
): Promise<PocketBaseNote> {
  const record = await createPocketBaseClient(token)
    .collection(NOTES)
    .create({ owner: ownerId, title: input.title, body: input.body, archived: false });
  return parseUpstream(pocketBaseNoteSchema, record);
}

export async function updateNote(
  token: string,
  id: string,
  input: UpdateNoteInput,
): Promise<PocketBaseNote> {
  const body: Record<string, string | boolean> = {};
  if (input.title !== undefined) body.title = input.title;
  if (input.body !== undefined) body.body = input.body;
  if (input.archived !== undefined) body.archived = input.archived;

  const record = await createPocketBaseClient(token).collection(NOTES).update(id, body);
  return parseUpstream(pocketBaseNoteSchema, record);
}

export async function deleteNote(token: string, id: string): Promise<void> {
  await createPocketBaseClient(token).collection(NOTES).delete(id);
}
