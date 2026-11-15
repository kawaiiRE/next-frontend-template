import { changePasswordInputSchema } from '@/contracts/auth';
import { parseInput } from '@/server/http/errors';
import { readJsonBody } from '@/server/http/request';
import { authedRoute, emptyResponse } from '@/server/http/route';
import { changePassword } from '@/server/services/account';
import { clearSessionCookie } from '@/server/session-cookie';

/** Changing the password revokes every session; clients must sign in again. */
export const POST = authedRoute({ rateLimit: 'passwordChange' }, async (request, auth) => {
  await changePassword(auth, parseInput(changePasswordInputSchema, await readJsonBody(request)));
  const response = emptyResponse();
  if (auth.via === 'cookie') clearSessionCookie(response);
  return response;
});
