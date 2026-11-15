import {
  APP_ROUTES,
  LOGIN_NOTICE_PARAM,
  NEXT_PARAM,
  PROTECTED_PATH_PREFIXES,
  SIGNED_OUT_ONLY_PATHS,
  type LoginNotice,
} from '@/constants/routes';

/**
 * Accepts only same-site relative paths for post-login redirects. Rejects absolute URLs,
 * protocol-relative URLs (`//evil`), backslash tricks and control characters.
 */
export function safeNextPath(value: string | null | undefined): string | null {
  if (!value || value.length > 512) return null;
  if (!value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) return null;
  if (/[\u0000-\u001f\\]/.test(value)) return null;

  try {
    const url = new URL(value, 'http://internal.invalid');
    if (url.origin !== 'http://internal.invalid') return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

function matchesPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function isProtectedPath(pathname: string) {
  return PROTECTED_PATH_PREFIXES.some((prefix) => matchesPrefix(pathname, prefix));
}

export function isSignedOutOnlyPath(pathname: string) {
  return SIGNED_OUT_ONLY_PATHS.some((path) => matchesPrefix(pathname, path));
}

export function loginPathWithNext(next: string | null, notice?: LoginNotice) {
  const params = new URLSearchParams();
  const safe = safeNextPath(next);
  if (safe && safe !== APP_ROUTES.login) params.set(NEXT_PARAM, safe);
  if (notice) params.set(LOGIN_NOTICE_PARAM, notice);
  const query = params.toString();
  return query ? `${APP_ROUTES.login}?${query}` : APP_ROUTES.login;
}

export type RouteDecision = { type: 'continue' } | { type: 'redirect'; location: string };

/** Pure routing policy used by `proxy.ts`; layouts repeat the authoritative check server-side. */
export function decideRoute(input: {
  pathname: string;
  search: string;
  hasSession: boolean;
  /** The request carried a session cookie that is expired or was rejected. */
  sessionExpired?: boolean;
}): RouteDecision {
  if (!input.hasSession && isProtectedPath(input.pathname)) {
    return {
      type: 'redirect',
      location: loginPathWithNext(
        `${input.pathname}${input.search}`,
        input.sessionExpired ? 'session-expired' : undefined,
      ),
    };
  }

  if (input.hasSession && isSignedOutOnlyPath(input.pathname)) {
    const next = safeNextPath(new URLSearchParams(input.search).get(NEXT_PARAM));
    return { type: 'redirect', location: next ?? APP_ROUTES.dashboard };
  }

  return { type: 'continue' };
}
