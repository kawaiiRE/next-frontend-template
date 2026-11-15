import { apiRoute, emptyResponse } from '@/server/http/route';
import { clearSessionCookie } from '@/server/session-cookie';

/**
 * Clears the browser session. PocketBase tokens are stateless, so other devices stay signed in
 * until they expire; changing the password revokes every session.
 */
export const POST = apiRoute({ origin: 'required' }, async () => {
  const response = emptyResponse();
  clearSessionCookie(response);
  return response;
});
