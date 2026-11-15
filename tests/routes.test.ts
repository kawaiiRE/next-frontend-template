import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setTestEnvironment, TEST_APP_ORIGIN } from './support/env';
import { fakeToken } from './support/tokens';

const notesService = vi.hoisted(() => ({
  listNotes: vi.fn(),
  createNote: vi.fn(),
  getNote: vi.fn(),
  updateNote: vi.fn(),
  deleteNote: vi.fn(),
}));
const authService = vi.hoisted(() => ({
  login: vi.fn(),
  register: vi.fn(),
  refresh: vi.fn(),
  toSession: vi.fn(),
  requestPasswordReset: vi.fn(),
  confirmPasswordReset: vi.fn(),
  verifyEmail: vi.fn(),
}));

vi.mock('@/server/services/notes', () => notesService);
vi.mock('@/server/services/auth', () => authService);

const note = {
  id: 'note00000000001',
  title: 'Hello',
  body: '',
  archived: false,
  createdAt: '2026-01-31T12:00:00.000Z',
  updatedAt: '2026-01-31T12:00:00.000Z',
};
const user = {
  id: 'user00000000001',
  email: 'jane@example.com',
  name: 'Jane',
  verified: true,
  locale: 'ar' as const,
  createdAt: '2026-01-31T12:00:00.000Z',
};

beforeEach(() => {
  setTestEnvironment();
  vi.clearAllMocks();
});

function jsonRequest(
  url: string,
  method: string,
  body: unknown,
  headers: Record<string, string> = {},
) {
  return new NextRequest(`http://localhost:3000${url}`, {
    method,
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json', ...headers },
  });
}

describe('/api/v1/notes', () => {
  const token = fakeToken({ id: user.id, expiresInSeconds: 7 * 24 * 3600 });

  it('creates a note for a same-origin cookie session', async () => {
    notesService.createNote.mockResolvedValue(note);
    const { POST } = await import('../src/app/api/v1/notes/route');

    const response = await POST(
      jsonRequest(
        '/api/v1/notes',
        'POST',
        { title: 'Hello' },
        { cookie: `session=${token}`, origin: TEST_APP_ORIGIN },
      ),
      undefined,
    );

    expect(response.status).toBe(201);
    expect(response.headers.get('cache-control')).toBe('no-store');
    await expect(response.json()).resolves.toEqual(note);
    expect(notesService.createNote).toHaveBeenCalledWith(
      expect.objectContaining({ userId: user.id, via: 'cookie' }),
      { title: 'Hello', body: '' },
    );
  });

  it('rejects a cross-origin request before touching the backend', async () => {
    const { POST } = await import('../src/app/api/v1/notes/route');
    const response = await POST(
      jsonRequest(
        '/api/v1/notes',
        'POST',
        { title: 'x' },
        { cookie: `session=${token}`, origin: 'https://evil.example' },
      ),
      undefined,
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      message: 'The request origin is not allowed.',
      code: 'FORBIDDEN_ORIGIN',
    });
    expect(notesService.createNote).not.toHaveBeenCalled();
  });

  it('accepts bearer requests without an Origin (native clients)', async () => {
    notesService.listNotes.mockResolvedValue({
      items: [note],
      page: 1,
      perPage: 20,
      totalItems: 1,
      totalPages: 1,
    });
    const { GET } = await import('../src/app/api/v1/notes/route');
    const response = await GET(
      new NextRequest('http://localhost:3000/api/v1/notes?archived=true&search=hi', {
        headers: { authorization: `Bearer ${token}` },
      }),
      undefined,
    );

    expect(response.status).toBe(200);
    expect(notesService.listNotes).toHaveBeenCalledWith(
      expect.objectContaining({ via: 'bearer' }),
      {
        page: 1,
        perPage: 20,
        search: 'hi',
        archived: true,
      },
    );
  });

  it('returns field-level errors for invalid input', async () => {
    const { POST } = await import('../src/app/api/v1/notes/route');
    const response = await POST(
      jsonRequest('/api/v1/notes', 'POST', { title: '' }, { authorization: `Bearer ${token}` }),
      undefined,
    );
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      code: 'INVALID_INPUT',
      fields: { title: 'required' },
    });
  });

  it('answers 401 and clears a stale cookie without credentials', async () => {
    const { GET } = await import('../src/app/api/v1/notes/route');
    const response = await GET(
      new NextRequest('http://localhost:3000/api/v1/notes', {
        headers: { cookie: `session=${fakeToken({ expiresInSeconds: -1 })}` },
      }),
      undefined,
    );
    expect(response.status).toBe(401);
    expect(response.headers.get('set-cookie')).toMatch(/session=;.*Max-Age=0/i);
  });
});

describe('/api/v1/auth', () => {
  it('sets a HttpOnly SameSite=Lax session cookie and the account locale on login', async () => {
    authService.login.mockResolvedValue({ token: fakeToken({ expiresInSeconds: 3600 }), user });
    const { POST } = await import('../src/app/api/v1/auth/login/route');

    const response = await POST(
      jsonRequest(
        '/api/v1/auth/login',
        'POST',
        { email: user.email, password: 'secret' },
        { origin: TEST_APP_ORIGIN },
      ),
      undefined,
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ user });
    const cookies = response.headers.getSetCookie();
    const session = cookies.find((cookie) => cookie.startsWith('session='));
    expect(session).toMatch(/HttpOnly/i);
    expect(session).toMatch(/SameSite=lax/i);
    expect(session).toMatch(/Path=\//);
    expect(session).not.toMatch(/Domain=/i);
    expect(cookies.some((cookie) => cookie.startsWith('locale=ar'))).toBe(true);
  });

  it('requires a matching Origin for cookie-setting web login', async () => {
    const { POST } = await import('../src/app/api/v1/auth/login/route');
    const response = await POST(
      jsonRequest('/api/v1/auth/login', 'POST', { email: user.email, password: 'x' }),
      undefined,
    );
    expect(response.status).toBe(403);
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('returns 202 for password reset requests regardless of account existence', async () => {
    authService.requestPasswordReset.mockResolvedValue(undefined);
    const { POST } = await import('../src/app/api/v1/auth/password-reset/route');
    const response = await POST(
      jsonRequest('/api/v1/auth/password-reset', 'POST', { email: 'nobody@example.com' }),
      undefined,
    );
    expect(response.status).toBe(202);
    await expect(response.json()).resolves.toEqual({});
  });

  it('rate-limits token login per client IP', async () => {
    authService.login.mockRejectedValue(Object.assign(new Error('x'), {}));
    const { POST } = await import('../src/app/api/v1/auth/token/route');
    const attempt = () =>
      POST(
        jsonRequest(
          '/api/v1/auth/token',
          'POST',
          { email: user.email, password: 'wrong' },
          { 'x-forwarded-for': '198.51.100.77' },
        ),
        undefined,
      );

    const statuses: number[] = [];
    for (let index = 0; index < 11; index += 1) statuses.push((await attempt()).status);
    expect(statuses.at(-1)).toBe(429);
    const limited = await attempt();
    expect(Number(limited.headers.get('retry-after'))).toBeGreaterThan(0);
  });

  it('issues a bearer session for native clients', async () => {
    const token = fakeToken({ expiresInSeconds: 3600 });
    const session = { token, expiresAt: new Date(Date.now() + 3600_000).toISOString(), user };
    authService.login.mockResolvedValue({ token, user });
    authService.toSession.mockReturnValue(session);
    const { POST } = await import('../src/app/api/v1/auth/token/route');

    const response = await POST(
      jsonRequest(
        '/api/v1/auth/token',
        'POST',
        { email: user.email, password: 'secret' },
        { 'x-forwarded-for': '198.51.100.1' },
      ),
      undefined,
    );
    expect(response.status).toBe(200);
    expect(response.headers.get('set-cookie')).toBeNull();
    await expect(response.json()).resolves.toEqual(session);
  });
});

describe('unknown API routes', () => {
  it('answer with the gateway error shape', async () => {
    const { GET } = await import('../src/app/api/v1/[...path]/route');
    const response = await GET(new NextRequest('http://localhost:3000/api/v1/nope'), undefined);
    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      message: 'The requested resource was not found.',
      code: 'NOT_FOUND',
    });
  });
});
