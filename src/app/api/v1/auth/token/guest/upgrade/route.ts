import { registerInputSchema, type TokenRegisterResponse } from '@/contracts/auth';
import { ApiFailure, parseInput } from '@/server/http/errors';
import { readBearerToken, readJsonBody } from '@/server/http/request';
import { apiRoute, jsonResponse } from '@/server/http/route';
import { toSession, upgradeGuestSession } from '@/server/services/auth';

/**
 * Native guest upgrade (bearer only, so a cookie session never receives a token in a body). Same
 * shape as `/auth/token/register`: `200 authenticated` with a new `Session`, or
 * `202 verification_required` with the user (the guest token is no longer valid).
 */
export const POST = apiRoute({ rateLimit: 'guestUpgrade' }, async (request) => {
  const token = readBearerToken(request);
  if (!token) throw new ApiFailure('UNAUTHENTICATED');
  const input = parseInput(registerInputSchema, await readJsonBody(request));
  const result = await upgradeGuestSession(token, input);

  const body: TokenRegisterResponse =
    result.status === 'authenticated'
      ? { status: 'authenticated', session: toSession(result) }
      : { status: 'verification_required', user: result.user };
  return jsonResponse(body, result.status === 'authenticated' ? 200 : 202);
});
