import 'server-only';
import { ApiFailure } from '@/server/http/errors';

export const MAX_JSON_BODY_BYTES = 65_536;

export type OriginPolicy = 'required' | 'if-present';

/**
 * Exact-origin rule for the gateway: a present `Origin` must equal `APP_ORIGIN`. With `required`,
 * a missing Origin is also rejected (cookie-authenticated or cookie-setting mutations).
 */
export function isOriginAllowed(
  origin: string | null,
  appOrigin: string,
  policy: OriginPolicy,
): boolean {
  if (origin === null || origin === '') return policy === 'if-present';
  return origin === appOrigin;
}

export function assertOrigin(request: Request, appOrigin: string, policy: OriginPolicy) {
  if (!isOriginAllowed(request.headers.get('origin'), appOrigin, policy)) {
    throw new ApiFailure('FORBIDDEN_ORIGIN');
  }
}

function isJsonMediaType(contentType: string | null) {
  const mediaType = contentType?.split(';', 1)[0]?.trim().toLowerCase();
  return (
    mediaType === 'application/json' ||
    (mediaType?.startsWith('application/') === true && mediaType.endsWith('+json'))
  );
}

/** Reads a bounded JSON body (declared and streamed length) with a JSON media type. */
export async function readJsonBody(
  request: Request,
  maxBytes = MAX_JSON_BODY_BYTES,
): Promise<unknown> {
  const declaredLength = Number(request.headers.get('content-length') ?? 0);
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    throw new ApiFailure('BODY_TOO_LARGE');
  }

  if (!isJsonMediaType(request.headers.get('content-type'))) {
    throw new ApiFailure('UNSUPPORTED_MEDIA_TYPE');
  }

  const reader = request.body?.getReader();
  if (!reader) throw new ApiFailure('INVALID_INPUT', { body: 'required' });

  const chunks: Uint8Array[] = [];
  let length = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;

    length += value.byteLength;
    if (length > maxBytes) {
      await reader.cancel();
      throw new ApiFailure('BODY_TOO_LARGE');
    }
    chunks.push(value);
  }

  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)) as unknown;
  } catch {
    throw new ApiFailure('INVALID_INPUT', { body: 'invalid' });
  }
}

/** Extracts the bearer token from `Authorization`, if any. */
export function readBearerToken(request: Request): string | null {
  const header = request.headers.get('authorization');
  if (!header) return null;
  const match = /^Bearer\s+([A-Za-z0-9\-_.]+)$/i.exec(header.trim());
  return match?.[1] ?? null;
}

const IP_PATTERN = /^[0-9a-fA-F.:]{2,45}$/;

/**
 * Client IP as reported by our reverse proxy. Trusts only the configured header, otherwise the
 * rightmost `X-Forwarded-For` hop (the one appended by our own proxy), then `X-Real-IP`.
 * Returns `null` when no well-formed address is available.
 */
export function clientIpFromHeaders(
  headers: { get(name: string): string | null },
  trustedHeader?: string,
): string | null {
  const candidates = [
    trustedHeader ? headers.get(trustedHeader)?.split(',').at(-1) : undefined,
    headers.get('x-forwarded-for')?.split(',').at(-1),
    headers.get('x-real-ip') ?? undefined,
  ];
  for (const candidate of candidates) {
    const value = candidate?.trim();
    if (value && IP_PATTERN.test(value)) return value;
  }
  return null;
}
