import { loginInputSchema } from '@/contracts/auth';
import { parseInput } from '@/server/http/errors';
import { readJsonBody } from '@/server/http/request';
import { apiRoute, jsonResponse } from '@/server/http/route';
import { setLocaleCookie } from '@/server/preferences';
import { login } from '@/server/services/auth';
import { setSessionCookie } from '@/server/session-cookie';

export const POST = apiRoute({ origin: 'required', rateLimit: 'login' }, async (request) => {
  const input = parseInput(loginInputSchema, await readJsonBody(request));
  const { token, user } = await login(input);

  const response = jsonResponse({ user });
  setSessionCookie(response, token);
  if (user.locale) setLocaleCookie(response, user.locale);
  return response;
});
