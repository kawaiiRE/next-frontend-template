import 'server-only';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { APP_ROUTES } from '@/constants/routes';
import type { User } from '@/contracts/user';
import { isTokenActive, readTokenClaims } from '@/lib/jwt';
import { loginPathWithNext, safeNextPath } from '@/lib/navigation';
import { ApiFailure } from '@/server/http/errors';
import { getAccount, type AuthContext } from '@/server/services/account';
import { readSessionCookie } from '@/server/session-cookie';

import { REQUEST_PATH_HEADER } from '@/constants/headers';

export type SessionState =
  | { status: 'authenticated'; auth: AuthContext; user: User }
  | { status: 'anonymous' }
  | { status: 'invalid' }
  | { status: 'unavailable' };

/** Reads the session cookie for the current request (no network call). */
export const getSessionAuth = cache(async (): Promise<AuthContext | null> => {
  const token = readSessionCookie(await cookies());
  const claims = readTokenClaims(token);
  if (!token || !claims || !isTokenActive(token)) return null;
  return { token, userId: claims.id };
});

/** Verifies the session with PocketBase once per request. */
export const getSessionState = cache(async (): Promise<SessionState> => {
  const auth = await getSessionAuth();
  if (!auth) return { status: 'anonymous' };

  try {
    return { status: 'authenticated', auth, user: await getAccount(auth) };
  } catch (error) {
    if (error instanceof ApiFailure && error.code === 'UNAUTHENTICATED')
      return { status: 'invalid' };
    return { status: 'unavailable' };
  }
});

async function currentPath() {
  return safeNextPath((await headers()).get(REQUEST_PATH_HEADER));
}

/**
 * Authoritative guard for authenticated layouts and pages. Proxy redirects are only an optimisation.
 * A backend outage throws so the segment error boundary can offer a retry.
 */
export async function requireSession(): Promise<{ auth: AuthContext; user: User }> {
  const state = await getSessionState();
  if (state.status === 'authenticated') return { auth: state.auth, user: state.user };

  const next = await currentPath();
  if (state.status === 'anonymous') redirect(loginPathWithNext(next));
  if (state.status === 'invalid') {
    redirect(
      next
        ? `${APP_ROUTES.sessionExpired}?next=${encodeURIComponent(next)}`
        : APP_ROUTES.sessionExpired,
    );
  }
  throw new ApiFailure('UPSTREAM_UNAVAILABLE');
}

/** For signed-out pages: signed-in users continue to the dashboard (or their `next`). */
export async function redirectIfAuthenticated(next?: string | null) {
  const state = await getSessionState();
  if (state.status === 'authenticated') redirect(safeNextPath(next) ?? APP_ROUTES.dashboard);
}
