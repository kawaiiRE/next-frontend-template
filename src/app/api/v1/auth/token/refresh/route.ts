import { ApiFailure } from '@/server/http/errors';
import { readBearerToken } from '@/server/http/request';
import { apiRoute, jsonResponse } from '@/server/http/route';
import { refresh, toSession } from '@/server/services/auth';

/** Exchanges a still-valid bearer token for a new `Session`. */
export const POST = apiRoute({ rateLimit: 'refresh' }, async (request) => {
  const token = readBearerToken(request);
  if (!token) throw new ApiFailure('UNAUTHENTICATED');
  return jsonResponse(toSession(await refresh(token)));
});
