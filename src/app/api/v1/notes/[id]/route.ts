import { updateNoteInputSchema } from '@/contracts/note';
import { parseInput } from '@/server/http/errors';
import { readJsonBody } from '@/server/http/request';
import { authedRoute, emptyResponse, jsonResponse } from '@/server/http/route';
import { deleteNote, getNote, updateNote } from '@/server/services/notes';

type Context = RouteContext<'/api/v1/notes/[id]'>;

export const GET = authedRoute<Context>({}, async (_request, auth, context) => {
  const { id } = await context.params;
  return jsonResponse(await getNote(auth, id));
});

export const PATCH = authedRoute<Context>({}, async (request, auth, context) => {
  const { id } = await context.params;
  const input = parseInput(updateNoteInputSchema, await readJsonBody(request));
  return jsonResponse(await updateNote(auth, id, input));
});

export const DELETE = authedRoute<Context>({}, async (_request, auth, context) => {
  const { id } = await context.params;
  await deleteNote(auth, id);
  return emptyResponse();
});
