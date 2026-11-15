import { verificationRequestSchema } from '@/contracts/auth';
import { parseInput } from '@/server/http/errors';
import { readJsonBody } from '@/server/http/request';
import { apiRoute, jsonResponse } from '@/server/http/route';
import { requestVerification } from '@/server/services/auth';

/** Always 202 for valid input: the response never reveals whether the account exists. */
export const POST = apiRoute({ rateLimit: 'verificationRequest' }, async (request) => {
  const { email } = parseInput(verificationRequestSchema, await readJsonBody(request));
  await requestVerification(email);
  return jsonResponse({}, 202);
});
