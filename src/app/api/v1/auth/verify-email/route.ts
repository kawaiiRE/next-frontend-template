import { verifyEmailInputSchema } from '@/contracts/auth';
import { parseInput } from '@/server/http/errors';
import { readJsonBody } from '@/server/http/request';
import { apiRoute, emptyResponse } from '@/server/http/route';
import { verifyEmail } from '@/server/services/auth';

export const POST = apiRoute({ rateLimit: 'verifyEmail' }, async (request) => {
  const { token } = parseInput(verifyEmailInputSchema, await readJsonBody(request));
  await verifyEmail(token);
  return emptyResponse();
});
