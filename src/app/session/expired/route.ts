import { NextResponse, type NextRequest } from 'next/server';
import { APP_ROUTES, NEXT_PARAM } from '@/constants/routes';
import { readTokenClaims } from '@/lib/jwt';
import { loginPathWithNext, safeNextPath } from '@/lib/navigation';
import { ApiFailure } from '@/server/http/errors';
import { runWithRequestContext } from '@/server/request-context';
import { getAccount } from '@/server/services/account';
import { clearSessionCookie, readSessionCookie } from '@/server/session-cookie';

/**
 * Server Components cannot delete cookies, so layouts send a rejected session here. The cookie is
 * only cleared after PocketBase confirms it is invalid, which keeps this GET free of CSRF impact.
 */
export async function GET(request: NextRequest) {
  const next = safeNextPath(request.nextUrl.searchParams.get(NEXT_PARAM));
  const token = readSessionCookie(request.cookies);
  const claims = readTokenClaims(token);

  if (token && claims) {
    try {
      await runWithRequestContext(request, () => getAccount({ token, userId: claims.id }));
      return NextResponse.redirect(new URL(next ?? APP_ROUTES.dashboard, request.url));
    } catch (error) {
      if (!(error instanceof ApiFailure && error.code === 'UNAUTHENTICATED')) {
        return NextResponse.redirect(new URL(next ?? APP_ROUTES.dashboard, request.url));
      }
    }
  }

  const response = NextResponse.redirect(
    new URL(loginPathWithNext(next, 'session-expired'), request.url),
  );
  clearSessionCookie(response);
  return response;
}
