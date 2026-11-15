import { passwordResetRequestSchema } from '@/contracts/auth';
import { parseInput } from '@/server/http/errors';
import { readJsonBody } from '@/server/http/request';
import { apiRoute, jsonResponse } from '@/server/http/route';
import { requestPasswordReset } from '@/server/services/auth';

/** Always 202 for valid input: the response never reveals whether the account exists. */
export const POST = apiRoute({ rateLimit: 'passwordReset' }, async (request) => {
  const { email } = parseInput(passwordResetRequestSchema, await readJsonBody(request));
  await requestPasswordReset(email);
  return jsonResponse({}, 202);
});
