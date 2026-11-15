import type { Session } from '@/contracts/auth';
import { apiRoute, jsonResponse } from '@/server/http/route';
import { requestLocale } from '@/server/preferences';
import { startGuestSession, toSession } from '@/server/services/auth';

/** Native guest session: returns a bearer `Session` (like `/auth/token`) and never sets a cookie. */
export const POST = apiRoute({ rateLimit: 'guest' }, async (request) => {
  const session: Session = toSession(await startGuestSession(requestLocale(request)));
  return jsonResponse(session);
});
