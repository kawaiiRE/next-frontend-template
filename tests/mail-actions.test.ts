import { describe, expect, it, vi } from 'vitest';
import { ClientResponseError } from 'pocketbase';
import { mailActionSchema } from '../src/contracts/mail-actions';
import { parseMailLink, confirmMailAction } from '../src/services/mail-actions';
import { respondMailAction } from '../src/server/services/mail-actions';

const origin = 'https://mail.test.invalid';
const token = 'eyJhbGciOiJIUzI1NiJ9.eyJpZCI6InRlc3QifQ.synthetic-signature';
const input = { action: 'verification' as const, collection: 'users' as const, token };
const makeRequest = (body: unknown, headers: Record<string, string> = {}) =>
  new Request(origin + '/api/v1/mail-actions', {
    method: 'POST',
    headers: { Origin: origin, 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
describe('email action trust boundaries', () => {
  it('reads only the expected credential fragment and rejects duplicate or foreign selectors', () => {
    const hash = '#action=verification&collection=users&token=' + token;
    expect(parseMailLink(hash)).toEqual(input);
    for (const bad of [
      hash + '&token=other',
      hash + '&sandbox=1',
      hash.replace('users', 'foreign'),
      hash.replace(token, 'bad'),
      '#action=verification',
      '#token=' + 'x'.repeat(5000),
    ])
      expect(parseMailLink(bad)).toBeNull();
  });
  it('requires matching passwords and rejects administrative request extras', () => {
    expect(
      mailActionSchema.safeParse({
        ...input,
        action: 'password-reset',
        password: 'synthetic-password',
        passwordConfirm: 'different-password',
      }).success,
    ).toBe(false);
    expect(mailActionSchema.safeParse({ ...input, sandbox: true }).success).toBe(false);
    expect(mailActionSchema.safeParse({ ...input, origin: 'https://foreign.test' }).success).toBe(
      false,
    );
  });
  it('refuses cross-origin requests before calling PocketBase', async () => {
    const execute = vi.fn();
    const result = await respondMailAction(
      makeRequest(input, { Origin: 'https://foreign.test' }),
      execute,
      origin,
    );
    expect(result.status).toBe(403);
    expect(execute).not.toHaveBeenCalled();
  });
  it('refuses non-JSON, invalid and oversized requests before calling PocketBase', async () => {
    const execute = vi.fn();
    for (const [request, status] of [
      [makeRequest(input, { 'Content-Type': 'text/plain' }), 415],
      [makeRequest({ ...input, token: 'not-a-token' }), 400],
      [makeRequest(input, { 'Content-Length': 'bad' }), 413],
      [makeRequest(input, { 'Content-Length': '9000' }), 413],
      [makeRequest({ ...input, padding: '界'.repeat(3000) }), 413],
    ] as const) {
      expect((await respondMailAction(request, execute, origin)).status).toBe(status);
    }
    expect(execute).not.toHaveBeenCalled();
  });
  it('returns only a completion marker after the backend accepts the exact action', async () => {
    const execute = vi.fn(async () => {});
    const response = await respondMailAction(makeRequest(input), execute, origin);
    expect(execute).toHaveBeenCalledWith(input);
    expect(await response.json()).toEqual({ completed: true });
    expect(response.headers.get('cache-control')).toBe('no-store');
  });
  it('cancels stalled request bodies before any account action', async () => {
    vi.useFakeTimers();
    const cancel = vi.fn();
    const execute = vi.fn();
    try {
      const body = new ReadableStream<Uint8Array>({ cancel });
      const init: RequestInit & { duplex: 'half' } = {
        method: 'POST',
        headers: { Origin: origin, 'Content-Type': 'application/json' },
        body,
        duplex: 'half',
      };
      const result = respondMailAction(
        new Request(origin + '/api/v1/mail-actions', init),
        execute,
        origin,
      );
      await vi.advanceTimersByTimeAsync(10_001);
      expect((await result).status).toBe(408);
      expect(cancel).toHaveBeenCalledOnce();
      expect(execute).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });
  it('redacts expired-link errors and preserves rate limiting', async () => {
    for (const status of [400, 401, 403, 404, 422, 429]) {
      const execute = async () => {
        throw new ClientResponseError({
          status,
          response: { message: token, data: { private: 'withheld' } },
        });
      };
      const response = await respondMailAction(makeRequest(input), execute, origin);
      expect(response.status).toBe(status === 429 ? 429 : 400);
      const text = await response.text();
      expect(text).not.toContain(token);
      expect(text).not.toContain('withheld');
    }
  });
  it('sends once to the same-origin gateway without credentials in the URL', async () => {
    const send = vi.fn(async (url: RequestInfo | URL, init?: RequestInit) => {
      expect(url).toBe('/api/v1/mail-actions');
      expect(init?.credentials).toBe('same-origin');
      expect(init?.signal).toBeInstanceOf(AbortSignal);
      expect(JSON.parse(String(init?.body))).toEqual(input);
      return Response.json({ completed: true });
    });
    expect(await confirmMailAction(input, send as typeof fetch)).toEqual({ completed: true });
    expect(send).toHaveBeenCalledOnce();
  });
  it('reports a lost response as unconfirmed and never retries a one-time action', async () => {
    const send = vi.fn(async () => {
      throw new TypeError('connection lost');
    });
    expect(await confirmMailAction(input, send)).toEqual({
      completed: false,
      reason: 'unconfirmed',
    });
    expect(send).toHaveBeenCalledOnce();
  });
});
