import { passwordResetConfirmSchema } from '@/contracts/auth';
import { parseInput } from '@/server/http/errors';
import { readJsonBody } from '@/server/http/request';
import { apiRoute, emptyResponse } from '@/server/http/route';
import { confirmPasswordReset } from '@/server/services/auth';

export const POST = apiRoute({ rateLimit: 'passwordResetConfirm' }, async (request) => {
  await confirmPasswordReset(parseInput(passwordResetConfirmSchema, await readJsonBody(request)));
  return emptyResponse();
});
