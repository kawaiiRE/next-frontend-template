import { loginInputSchema, type Session } from '@/contracts/auth';
import { parseInput } from '@/server/http/errors';
import { readJsonBody } from '@/server/http/request';
import { apiRoute, jsonResponse } from '@/server/http/route';
import { login, toSession } from '@/server/services/auth';

/** Native clients: returns a bearer `Session` and never sets a cookie. */
export const POST = apiRoute({ rateLimit: 'login' }, async (request) => {
  const input = parseInput(loginInputSchema, await readJsonBody(request));
  const session: Session = toSession(await login(input));
  return jsonResponse(session);
});
