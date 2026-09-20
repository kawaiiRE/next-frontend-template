import { afterEach, describe, expect, it, vi } from 'vitest';
import { request } from '../src/services/api';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('request', () => {
  it('returns parsed data for a successful response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ value: 7 })));

    await expect(request('/api/example', (body) => body as { value: number })).resolves.toEqual({
      success: true,
      data: { value: 7 },
      status: 200,
    });
  });

  it('allows only validated error fields through the browser boundary', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          Response.json(
            { code: 'INVALID_INPUT', message: 'Invalid input.', internal: 'do not expose' },
            { status: 400 },
          ),
        ),
    );

    await expect(request('/api/example', (body) => body)).resolves.toEqual({
      success: false,
      error: { code: 'INVALID_INPUT', message: 'Invalid input.' },
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
