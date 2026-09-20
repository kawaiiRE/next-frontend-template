import 'server-only';
import { ClientResponseError } from 'pocketbase';
import { ZodError } from 'zod';
import { environment } from '@/server/environment';

const MAX_JSON_BODY_BYTES = 65_536;

export class ApiFailure extends Error {
  constructor(
    public readonly status: number,
    public readonly code:
      'BODY_TOO_LARGE' | 'FORBIDDEN_ORIGIN' | 'INVALID_INPUT' | 'UNSUPPORTED_MEDIA_TYPE',
  ) {
    super(code);
  }
}

interface SafeApiError {
  message: string;
  code:
    | 'BODY_TOO_LARGE'
    | 'FORBIDDEN_ORIGIN'
    | 'INVALID_INPUT'
    | 'INVALID_RESPONSE'
    | 'UNSUPPORTED_MEDIA_TYPE'
    | 'UPSTREAM_UNAVAILABLE'
    | 'UNAVAILABLE';
}

export async function readMutationJson(request: Request): Promise<unknown> {
  if (request.headers.get('origin') !== environment().APP_ORIGIN) {
    throw new ApiFailure(403, 'FORBIDDEN_ORIGIN');
  }

  const declaredLength = Number(request.headers.get('content-length') ?? 0);
  if (declaredLength > MAX_JSON_BODY_BYTES) {
    throw new ApiFailure(413, 'BODY_TOO_LARGE');
  }

  const mediaType = request.headers.get('content-type')?.split(';', 1)[0]?.trim().toLowerCase();
  const isJson =
    mediaType === 'application/json' ||
    (mediaType?.startsWith('application/') === true && mediaType.endsWith('+json'));
  if (!isJson) {
    throw new ApiFailure(415, 'UNSUPPORTED_MEDIA_TYPE');
  }

  const reader = request.body?.getReader();
  if (!reader) {
    throw new ApiFailure(400, 'INVALID_INPUT');
  }

  const chunks: Uint8Array[] = [];
  let length = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;

    length += value.byteLength;
    if (length > MAX_JSON_BODY_BYTES) {
      await reader.cancel();
      throw new ApiFailure(413, 'BODY_TOO_LARGE');
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
    return JSON.parse(new TextDecoder().decode(bytes)) as unknown;
  } catch {
    throw new ApiFailure(400, 'INVALID_INPUT');
  }
}

export async function handleApi(work: () => Promise<unknown>): Promise<Response> {
  try {
    return Response.json(await work(), {
      status: 200,
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    let status = 503;
    let body: SafeApiError = {
      message: 'The service is temporarily unavailable.',
      code: 'UNAVAILABLE',
    };

    if (error instanceof ApiFailure) {
      status = error.status;
      body = { message: 'The request could not be completed.', code: error.code };
    } else if (error instanceof ZodError) {
      status = 502;
      body = { message: 'The backend returned an invalid response.', code: 'INVALID_RESPONSE' };
    } else if (error instanceof ClientResponseError) {
      status = 503;
      body = { message: 'The backend is unavailable.', code: 'UPSTREAM_UNAVAILABLE' };
    }

    console.error('API request failed', error instanceof Error ? error.name : 'UnknownError');
    return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
  }
}
