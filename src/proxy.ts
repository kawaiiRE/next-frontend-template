import { NextResponse, type NextRequest } from 'next/server';
import { NONCE_HEADER, REQUEST_PATH_HEADER } from '@/constants/headers';
import { isLocale, LOCALE_COOKIE } from '@/i18n/config';
import { buildContentSecurityPolicy, createNonce } from '@/lib/csp';
import { isTokenActive, shouldRefreshToken } from '@/lib/jwt';
import { decideRoute } from '@/lib/navigation';
import { isSecureDeployment } from '@/server/environment';
import { isSessionRejection } from '@/server/http/route';
import { localeCookieOptions } from '@/server/preferences';
import { runWithRequestContext } from '@/server/request-context';
import { refresh } from '@/server/services/auth';
import {
  clearSessionCookie,
  sessionCookieSettings,
  setSessionCookie,
} from '@/server/session-cookie';

type SessionOutcome =
  { hasSession: false; clear: boolean } | { hasSession: true; refreshedToken: string | null };

/**
 * Optimistic check from the cookie (no network call) so redirects stay fast. Tokens close to expiry
 * are refreshed here so active users stay signed in. Layouts verify the session authoritatively.
 */
async function resolveSession(request: NextRequest): Promise<SessionOutcome> {
  const name = sessionCookieSettings().name;
  const token = request.cookies.get(name)?.value;
  if (!token) return { hasSession: false, clear: false };
  if (!isTokenActive(token)) {
    request.cookies.delete(name);
    return { hasSession: false, clear: true };
  }
  if (!shouldRefreshToken(token)) return { hasSession: true, refreshedToken: null };

  try {
    const refreshed = await runWithRequestContext(request, () => refresh(token));
    request.cookies.set(name, refreshed.token);
    return { hasSession: true, refreshedToken: refreshed.token };
  } catch (error) {
    if (isSessionRejection(error)) {
      request.cookies.delete(name);
      return { hasSession: false, clear: true };
    }
    return { hasSession: true, refreshedToken: null };
  }
}

function applySession(response: NextResponse, session: SessionOutcome) {
  if (session.hasSession && session.refreshedToken)
    setSessionCookie(response, session.refreshedToken);
  if (!session.hasSession && session.clear) clearSessionCookie(response);
}

/** `/ar` or `/en/...` switch the cookie-based locale and continue without the prefix. */
function localePrefixRedirect(request: NextRequest): NextResponse | null {
  const [, first, ...rest] = request.nextUrl.pathname.split('/');
  if (!isLocale(first)) return null;

  const target = request.nextUrl.clone();
  target.pathname = `/${rest.join('/')}`;
  const response = NextResponse.redirect(target);
  response.cookies.set(LOCALE_COOKIE, first, localeCookieOptions());
  return response;
}

export async function proxy(request: NextRequest) {
  const localeRedirect = localePrefixRedirect(request);
  if (localeRedirect) return localeRedirect;

  const session = await resolveSession(request);
  const decision = decideRoute({
    pathname: request.nextUrl.pathname,
    search: request.nextUrl.search,
    hasSession: session.hasSession,
    sessionExpired: !session.hasSession && session.clear,
  });

  if (decision.type === 'redirect') {
    const response = NextResponse.redirect(new URL(decision.location, request.url));
    applySession(response, session);
    return response;
  }

  const nonce = createNonce();
  const contentSecurityPolicy = buildContentSecurityPolicy({
    nonce,
    isDevelopment: process.env.NODE_ENV === 'development',
    upgradeInsecureRequests: isSecureDeployment(),
  });

  // Request headers carry the refreshed cookie, nonce and path to Server Components.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(NONCE_HEADER, nonce);
  requestHeaders.set('Content-Security-Policy', contentSecurityPolicy);
  requestHeaders.set(REQUEST_PATH_HEADER, `${request.nextUrl.pathname}${request.nextUrl.search}`);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('Content-Security-Policy', contentSecurityPolicy);
  applySession(response, session);
  return response;
}

export const config = {
  matcher: [
    {
      source:
        '/((?!api/|_next/static|_next/image|session/expired|favicon.ico|icon|apple-icon|opengraph-image|manifest.webmanifest|robots.txt|sitemap.xml).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
