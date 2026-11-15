import { afterEach, describe, expect, it, vi } from 'vitest';
import { expectEmpty, request } from '../src/services/api';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('browser request', () => {
  it('returns parsed data for a successful response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ value: 7 })));

    await expect(request('/api/example', (body) => body as { value: number })).resolves.toEqual({
      success: true,
      data: { value: 7 },
      status: 200,
    });
  });

  it('sends JSON bodies same-origin without caching', async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ ok: true }, { status: 201 }));
    vi.stubGlobal('fetch', fetchMock);

    await request('/api/v1/notes', (body) => body, { method: 'POST', body: { title: 'Hi' } });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/v1/notes');
    expect(init.method).toBe('POST');
    expect(init.credentials).toBe('same-origin');
    expect(init.cache).toBe('no-store');
    expect(init.body).toBe(JSON.stringify({ title: 'Hi' }));
    expect(new Headers(init.headers).get('content-type')).toBe('application/json');
  });

  it('treats 204 as success for empty-response endpoints', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 204 })));

    await expect(request('/api/v1/auth/logout', expectEmpty, { method: 'POST' })).resolves.toEqual({
      success: true,
      data: undefined,
      status: 204,
    });
  });

  it('passes validated field errors through and drops unknown properties', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        Response.json(
          {
            code: 'INVALID_INPUT',
            message: 'Invalid input.',
            fields: { email: 'taken', name: 'something-unknown' },
            internal: 'do not expose',
          },
          { status: 400 },
        ),
      ),
    );

    await expect(request('/api/example', (body) => body)).resolves.toEqual({
      success: false,
      error: {
        code: 'INVALID_INPUT',
        message: 'Invalid input.',
        fields: { email: 'taken', name: 'invalid' },
      },
      status: 400,
    });
  });

  it('rejects a malformed successful response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ unexpected: true })));

    await expect(
      request('/api/example', () => {
        throw new Error('invalid contract');
      }),
    ).resolves.toEqual({
      success: false,
      error: { code: 'INVALID_RESPONSE', message: 'The server returned an invalid response.' },
      status: 200,
    });
  });

  it('preserves the HTTP status when the response is not JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('<html>error</html>', { status: 502 })),
    );

    await expect(request('/api/example', (body) => body)).resolves.toEqual({
      success: false,
      error: { code: 'INVALID_RESPONSE', message: 'The server returned an invalid response.' },
      status: 502,
    });
  });

  it('maps transport failures to a safe unavailable result', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('socket details')));

    await expect(request('/api/example', (body) => body)).resolves.toEqual({
      success: false,
      error: { code: 'UNAVAILABLE', message: 'The connection is unavailable.' },
      status: 0,
    });
  });
});
