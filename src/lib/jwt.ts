/**
 * Reads (without verifying) the claims PocketBase puts in its auth tokens. Used only for expiry
 * hints and routing; PocketBase remains the authority that verifies every token.
 */
export interface TokenClaims {
  id: string;
  exp: number;
}

function decodeBase64Url(segment: string): string {
  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  return new TextDecoder().decode(Uint8Array.from(atob(padded), (char) => char.charCodeAt(0)));
}

export function readTokenClaims(token: string | undefined | null): TokenClaims | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3 || !parts[1]) return null;

  try {
    const payload: unknown = JSON.parse(decodeBase64Url(parts[1]));
    if (
      typeof payload === 'object' &&
      payload !== null &&
      'exp' in payload &&
      'id' in payload &&
      typeof payload.exp === 'number' &&
      typeof payload.id === 'string' &&
      payload.id.length > 0
    ) {
      return { id: payload.id, exp: payload.exp };
    }
    return null;
  } catch {
    return null;
  }
}

export function tokenExpiresAt(token: string): Date | null {
  const claims = readTokenClaims(token);
  return claims ? new Date(claims.exp * 1000) : null;
}

export function isTokenActive(token: string | undefined | null, now = Date.now()): boolean {
  const claims = readTokenClaims(token);
  return claims !== null && claims.exp * 1000 > now;
}

/** Refresh when less than a quarter of a 7-day token (or 2 days, whichever is smaller) remains. */
export const REFRESH_THRESHOLD_MS = 2 * 24 * 60 * 60 * 1000;

export function shouldRefreshToken(token: string, now = Date.now()): boolean {
  const claims = readTokenClaims(token);
  if (!claims) return false;
  const remaining = claims.exp * 1000 - now;
  return remaining > 0 && remaining < REFRESH_THRESHOLD_MS;
}
