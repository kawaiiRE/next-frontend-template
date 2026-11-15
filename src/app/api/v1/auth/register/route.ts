import { registerInputSchema, type WebRegisterResponse } from '@/contracts/auth';
import { parseInput } from '@/server/http/errors';
import { readJsonBody } from '@/server/http/request';
import { apiRoute, jsonResponse } from '@/server/http/route';
import { requestLocale } from '@/server/preferences';
import { register } from '@/server/services/auth';
import { setSessionCookie } from '@/server/session-cookie';

export const POST = apiRoute({ origin: 'required', rateLimit: 'register' }, async (request) => {
  const input = parseInput(registerInputSchema, await readJsonBody(request));
  const result = await register({ ...input, locale: input.locale ?? requestLocale(request) });

  const body: WebRegisterResponse = { status: result.status, user: result.user };
  const response = jsonResponse(body, 201);
  if (result.status === 'authenticated') setSessionCookie(response, result.token);
  return response;
});
