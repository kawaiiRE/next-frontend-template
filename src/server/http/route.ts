import 'server-only';
import { NextResponse, type NextRequest } from 'next/server';
import { readTokenClaims, shouldRefreshToken } from '@/lib/jwt';
import { environment } from '@/server/environment';
import { ApiFailure, errorBody, logFailure, toApiFailure } from '@/server/http/errors';
import { rateLimiterFor, type RateLimitPolicy } from '@/server/http/rate-limit';
import {
  assertOrigin,
  clientIpFromHeaders,
  readBearerToken,
  type OriginPolicy,
} from '@/server/http/request';
import { runWithRequestContext } from '@/server/request-context';
import type { AuthContext } from '@/server/services/account';
import { refresh } from '@/server/services/auth';
import {
  clearSessionCookie,
  readSessionCookie,
  sessionCookieSettings,
  setSessionCookie,
} from '@/server/session-cookie';

const NO_STORE = { 'Cache-Control': 'no-store' } as const;

export function jsonResponse(body: unknown, status = 200): NextResponse {
  return NextResponse.json(body, { status, headers: NO_STORE });
}

export function emptyResponse(status = 204): NextResponse {
  return new NextResponse(null, { status, headers: NO_STORE });
}

export function failureResponse(failure: ApiFailure): NextResponse {
  return NextResponse.json(errorBody(failure), {
    status: failure.status,
    headers: { ...NO_STORE, ...failure.headers },
  });
}

export interface ApiRouteOptions {
  /** Default `if-present`: a present Origin must match; native clients send none. */
  origin?: OriginPolicy;
  rateLimit?: RateLimitPolicy;
}

function enforceRateLimit(request: NextRequest, policy: RateLimitPolicy) {
  const result = rateLimiterFor(policy).consume(
    `${policy}:${clientIpFromHeaders(request.headers, environment().CLIENT_IP_HEADER) ?? 'unknown'}`,
  );
  if (!result.allowed) {
    throw new ApiFailure('RATE_LIMITED', undefined, {
      'Retry-After': String(result.retryAfterSeconds),
    });
  }
}

type Handler<C> = (request: NextRequest, context: C) => Promise<NextResponse>;

/** Wraps a route handler with origin, rate-limit and safe error handling. */
export function apiRoute<C = unknown>(options: ApiRouteOptions, handler: Handler<C>): Handler<C> {
  return async (request, context) => {
    try {
      assertOrigin(request, environment().APP_ORIGIN, options.origin ?? 'if-present');
      if (options.rateLimit) enforceRateLimit(request, options.rateLimit);
      return await runWithRequestContext(request, () => handler(request, context));
    } catch (error) {
      const failure = toApiFailure(error);
      logFailure(`${request.method} ${request.nextUrl.pathname}`, error, failure);
      const response = failureResponse(failure);
      if (failure.code === 'UNAUTHENTICATED' && readSessionCookie(request.cookies)) {
        clearSessionCookie(response);
      }
      return response;
    }
  };
}

export interface RequestAuth extends AuthContext {
  via: 'cookie' | 'bearer';
}

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * Resolves credentials: a bearer token wins over the cookie. Cookie credentials are only honoured
 * for mutations that carry a matching Origin (CSRF defence in depth on top of SameSite=Lax).
 */
export function resolveRequestAuth(request: NextRequest): RequestAuth {
  const bearer = readBearerToken(request);
  const token = bearer ?? readSessionCookie(request.cookies);
  const via = bearer ? 'bearer' : 'cookie';
  const claims = readTokenClaims(token);
  if (!token || !claims || claims.exp * 1000 <= Date.now()) throw new ApiFailure('UNAUTHENTICATED');

  if (via === 'cookie' && !SAFE_METHODS.has(request.method)) {
    assertOrigin(request, environment().APP_ORIGIN, 'required');
  }
  return { token, userId: claims.id, via };
}

type AuthedHandler<C> = (
  request: NextRequest,
  auth: RequestAuth,
  context: C,
) => Promise<NextResponse>;

/**
 * Authenticated route: resolves credentials and, for cookie sessions close to expiry, refreshes the
 * token and re-issues the cookie on the response.
 */
export function authedRoute<C = unknown>(options: ApiRouteOptions, handler: AuthedHandler<C>) {
  return apiRoute<C>(options, async (request, context) => {
    let auth = resolveRequestAuth(request);
    let refreshedToken: string | null = null;

    if (auth.via === 'cookie' && shouldRefreshToken(auth.token)) {
      try {
        const refreshed = await refresh(auth.token);
        auth = { ...auth, token: refreshed.token };
        refreshedToken = refreshed.token;
      } catch (error) {
        if (isSessionRejection(error)) throw new ApiFailure('UNAUTHENTICATED');
        // Backend hiccup: keep using the still-valid token.
      }
    }

    const response = await handler(request, auth, context);
    // A handler that already set or cleared the session cookie (password change, deletion) wins.
    if (
      refreshedToken &&
      response.status < 400 &&
      !response.cookies.has(sessionCookieSettings().name)
    ) {
      setSessionCookie(response, refreshedToken);
    }
    return response;
  });
}

/** A refresh rejected because the token is revoked or the account must verify its email. */
export function isSessionRejection(error: unknown): boolean {
  return (
    error instanceof ApiFailure &&
    (error.code === 'UNAUTHENTICATED' || error.code === 'EMAIL_NOT_VERIFIED')
  );
}
