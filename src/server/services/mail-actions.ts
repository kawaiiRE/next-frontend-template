import 'server-only';
import { ClientResponseError } from 'pocketbase';
import {
  mailActionSchema,
  type MailAction,
  type MailActionError,
  type MailActionResult,
} from '@/contracts/mail-actions';
import { environment } from '@/server/environment';
import { executeMailAction } from '@/server/repositories/mail-actions';

class MailRequestFailure extends Error {
  constructor(
    readonly status: number,
    readonly code: MailActionError['code'],
  ) {
    super(code);
  }
}
export async function readMailAction(request: Request, origin: string): Promise<MailAction> {
  if (request.headers.get('origin') !== new URL(origin).origin)
    throw new MailRequestFailure(403, 'FORBIDDEN_ORIGIN');
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get('content-type') ?? ''))
    throw new MailRequestFailure(415, 'UNSUPPORTED_MEDIA_TYPE');
  const declared = request.headers.get('content-length');
  if (declared && (!/^\d+$/.test(declared) || Number(declared) > 8192))
    throw new MailRequestFailure(413, 'BODY_TOO_LARGE');
  const reader = request.body?.getReader();
  if (!reader) throw new MailRequestFailure(400, 'INVALID_INPUT');
  const chunks: Uint8Array[] = [];
  let length = 0;
  let expired = false;
  const deadline = setTimeout(() => {
    expired = true;
    void reader.cancel().catch(() => {});
  }, 10_000);
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 8192) {
        await reader.cancel();
        throw new MailRequestFailure(413, 'BODY_TOO_LARGE');
      }
      chunks.push(value);
    }
    if (expired) throw new MailRequestFailure(408, 'UNAVAILABLE');
  } finally {
    clearTimeout(deadline);
    reader.releaseLock();
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  let body: unknown;
  try {
    body = JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    throw new MailRequestFailure(400, 'INVALID_INPUT');
  }
  const parsed = mailActionSchema.safeParse(body);
  if (!parsed.success) throw new MailRequestFailure(400, 'INVALID_INPUT');
  return parsed.data;
}
export async function respondMailAction(
  request: Request,
  execute: (input: MailAction) => Promise<void> = executeMailAction,
  origin: string = environment().APP_ORIGIN,
): Promise<Response> {
  const headers = { 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' };
  try {
    const input = await readMailAction(request, origin);
    await execute(input);
    const result: MailActionResult = { completed: true };
    return Response.json(result, { headers });
  } catch (error) {
    let status = 503;
    let code: MailActionError['code'] = 'UNAVAILABLE';
    if (error instanceof MailRequestFailure) {
      status = error.status;
      code = error.code;
    } else if (
      error instanceof ClientResponseError &&
      [400, 401, 403, 404, 422, 429].includes(error.status)
    ) {
      status = error.status === 429 ? 429 : 400;
      code = status === 429 ? 'RATE_LIMITED' : 'LINK_INVALID';
    } else
      console.error(
        'Mail confirmation failed',
        error instanceof Error ? error.name : 'UnknownError',
      );
    const body: MailActionError = { code, message: 'The confirmation could not be completed.' };
    return Response.json(body, { status, headers });
  }
}
