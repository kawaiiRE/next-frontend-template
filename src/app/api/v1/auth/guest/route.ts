import { apiRoute, jsonResponse } from '@/server/http/route';
import { requestLocale } from '@/server/preferences';
import { startGuestSession } from '@/server/services/auth';
import { setSessionCookie } from '@/server/session-cookie';

/** Browser guest session: sets the session cookie and returns `{ user }` like login. */
export const POST = apiRoute({ origin: 'required', rateLimit: 'guest' }, async (request) => {
  const { token, user } = await startGuestSession(requestLocale(request));
  const response = jsonResponse({ user });
  setSessionCookie(response, token);
  return response;
});
