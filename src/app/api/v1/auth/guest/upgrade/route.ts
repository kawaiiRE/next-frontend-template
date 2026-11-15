import { registerInputSchema, type WebRegisterResponse } from '@/contracts/auth';
import { parseInput } from '@/server/http/errors';
import { readJsonBody } from '@/server/http/request';
import { authedRoute, jsonResponse } from '@/server/http/route';
import { upgradeGuestSession } from '@/server/services/auth';
import { clearSessionCookie, setSessionCookie } from '@/server/session-cookie';

/**
 * Browser guest upgrade, same body and response shape as web registration. `200 authenticated`
 * replaces the session cookie; `202 verification_required` ends the (now invalid) guest session.
 */
export const POST = authedRoute({ rateLimit: 'guestUpgrade' }, async (request, auth) => {
  const input = parseInput(registerInputSchema, await readJsonBody(request));
  const result = await upgradeGuestSession(auth.token, input);

  const body: WebRegisterResponse = { status: result.status, user: result.user };
  const response = jsonResponse(body, result.status === 'authenticated' ? 200 : 202);
  if (auth.via === 'cookie') {
    if (result.status === 'authenticated') setSessionCookie(response, result.token);
    else clearSessionCookie(response);
  }
  return response;
});
