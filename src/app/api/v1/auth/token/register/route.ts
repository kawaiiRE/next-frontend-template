import { registerInputSchema, type TokenRegisterResponse } from '@/contracts/auth';
import { parseInput } from '@/server/http/errors';
import { readJsonBody } from '@/server/http/request';
import { apiRoute, jsonResponse } from '@/server/http/route';
import { requestLocale } from '@/server/preferences';
import { register, toSession } from '@/server/services/auth';

export const POST = apiRoute({ rateLimit: 'register' }, async (request) => {
  const input = parseInput(registerInputSchema, await readJsonBody(request));
  const result = await register({ ...input, locale: input.locale ?? requestLocale(request) });

  const body: TokenRegisterResponse =
    result.status === 'authenticated'
      ? { status: 'authenticated', session: toSession(result) }
      : { status: 'verification_required', user: result.user };
  return jsonResponse(body, 201);
});
