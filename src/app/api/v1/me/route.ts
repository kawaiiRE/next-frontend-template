import { updateProfileInputSchema } from '@/contracts/user';
import { parseInput } from '@/server/http/errors';
import { readJsonBody } from '@/server/http/request';
import { authedRoute, emptyResponse, jsonResponse } from '@/server/http/route';
import { setLocaleCookie } from '@/server/preferences';
import { deleteAccount, getAccount, updateAccount } from '@/server/services/account';
import { clearSessionCookie } from '@/server/session-cookie';

export const GET = authedRoute({}, async (_request, auth) => {
  return jsonResponse({ user: await getAccount(auth) });
});

export const PATCH = authedRoute({}, async (request, auth) => {
  const input = parseInput(updateProfileInputSchema, await readJsonBody(request));
  const user = await updateAccount(auth, input);

  const response = jsonResponse({ user });
  if (auth.via === 'cookie' && user.locale) setLocaleCookie(response, user.locale);
  return response;
});

export const DELETE = authedRoute({}, async (_request, auth) => {
  await deleteAccount(auth);
  const response = emptyResponse();
  if (auth.via === 'cookie') clearSessionCookie(response);
  return response;
});
