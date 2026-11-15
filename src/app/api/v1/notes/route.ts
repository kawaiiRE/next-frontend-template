import { createNoteInputSchema, notesQuerySchema } from '@/contracts/note';
import { parseInput } from '@/server/http/errors';
import { readJsonBody } from '@/server/http/request';
import { authedRoute, jsonResponse } from '@/server/http/route';
import { createNote, listNotes } from '@/server/services/notes';

export const GET = authedRoute({}, async (request, auth) => {
  const params = Object.fromEntries(request.nextUrl.searchParams);
  return jsonResponse(await listNotes(auth, parseInput(notesQuerySchema, params)));
});

export const POST = authedRoute({}, async (request, auth) => {
  const input = parseInput(createNoteInputSchema, await readJsonBody(request));
  return jsonResponse(await createNote(auth, input), 201);
});
