/**
 * Live end-to-end check of the Next.js gateway against a running PocketBase backend.
 *
 *   corepack yarn integration:check
 *
 * Exercises health, config, registration/login (cookie and bearer), guest sessions and upgrades,
 * the notes CRUD contract, the origin rule, the email request routes and logout. When either service is unreachable it prints SKIPPED and exits 0,
 * unless INTEGRATION_REQUIRED=true. A user created by the check deletes itself at the end.
 * Set INTEGRATION_EMAIL / INTEGRATION_PASSWORD to use an existing (verified) account instead.
 */
import { apiErrorSchema } from '../src/contracts/api-error.ts';
import {
  sessionSchema,
  tokenRegisterResponseSchema,
  webRegisterResponseSchema,
} from '../src/contracts/auth.ts';
import { appConfigSchema } from '../src/contracts/config.ts';
import {
  healthViewModelSchema,
  POCKETBASE_HEALTH_PATH,
  pocketBaseHealthSchema,
} from '../src/contracts/health.ts';
import { noteSchema, notesPageSchema } from '../src/contracts/note.ts';
import { userEnvelopeSchema } from '../src/contracts/user.ts';

const TIMEOUT_MS = 8_000;

class Skip extends Error {}

function baseUrl(value: string, name: string): URL {
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol))
    throw new Error(`${name} must use HTTP or HTTPS.`);
  return url;
}

const pocketBase = baseUrl(process.env.POCKETBASE_URL ?? 'http://127.0.0.1:8090', 'POCKETBASE_URL');
const app = baseUrl(process.env.APP_ORIGIN ?? 'http://localhost:3000', 'APP_ORIGIN');
const origin = app.origin;
const sessionCookieName = app.protocol === 'https:' ? '__Host-session' : 'session';

interface CallOptions {
  method?: string;
  body?: unknown;
  cookie?: string | null;
  bearer?: string;
  origin?: string | null;
}

async function call(base: URL, path: string, options: CallOptions = {}) {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  if (options.cookie) headers.Cookie = options.cookie;
  if (options.bearer) headers.Authorization = `Bearer ${options.bearer}`;
  if (options.origin) headers.Origin = options.origin;

  try {
    return await fetch(new URL(path, base), {
      method: options.method ?? 'GET',
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      redirect: 'manual',
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    throw new Skip(`${base.origin} is not reachable`);
  }
}

async function json(response: Response): Promise<unknown> {
  const text = await response.text();
  return text ? (JSON.parse(text) as unknown) : undefined;
}

function expectStatus(response: Response, expected: number, step: string) {
  if (response.status !== expected)
    throw new Error(`${step}: expected HTTP ${expected}, got ${response.status}.`);
}

async function expectError(response: Response, status: number, code: string, step: string) {
  expectStatus(response, status, step);
  const body = apiErrorSchema.parse(await json(response));
  if (body.code !== code) throw new Error(`${step}: expected ${code}, got ${body.code}.`);
}

function sessionCookie(response: Response): string | null {
  const cookie = response.headers
    .getSetCookie()
    .find((value) => value.startsWith(`${sessionCookieName}=`));
  if (!cookie) return null;
  const pair = cookie.split(';', 1)[0] ?? '';
  return pair.endsWith('=') ? null : pair;
}

function log(step: string) {
  console.log(`  ✓ ${step}`);
}

async function checkHealthAndConfig() {
  const backend = pocketBaseHealthSchema.parse(
    await json(await call(pocketBase, POCKETBASE_HEALTH_PATH)),
  );
  const gateway = healthViewModelSchema.parse(await json(await call(app, '/api/v1/health')));
  if (backend.apiVersion !== gateway.apiVersion || backend.service !== gateway.service) {
    throw new Error('Next.js and PocketBase returned incompatible health contracts.');
  }
  log(`health: ${gateway.service} API v${gateway.apiVersion}`);

  const backendConfig = appConfigSchema.parse(await json(await call(pocketBase, '/api/v1/config')));
  const gatewayConfig = appConfigSchema.parse(await json(await call(app, '/api/v1/config')));
  if (JSON.stringify(backendConfig) !== JSON.stringify(gatewayConfig)) {
    throw new Error('Gateway config differs from PocketBase config.');
  }
  log(
    `config: registration=${gatewayConfig.features.registration} emailVerification=${gatewayConfig.features.emailVerification} guest=${gatewayConfig.features.guest}`,
  );
  return gatewayConfig;
}

async function obtainCredentials(registration: boolean) {
  const email = process.env.INTEGRATION_EMAIL;
  const password = process.env.INTEGRATION_PASSWORD;
  if (email && password) return { email, password, created: false };
  if (!registration) return null;

  const credentials = newAccount();

  await expectError(
    await call(app, '/api/v1/auth/register', {
      method: 'POST',
      body: credentials,
      origin: 'https://evil.example',
    }),
    403,
    'FORBIDDEN_ORIGIN',
    'register from a foreign origin',
  );

  const response = await call(app, '/api/v1/auth/register', {
    method: 'POST',
    body: credentials,
    origin,
  });
  expectStatus(response, 201, 'register');
  const result = webRegisterResponseSchema.parse(await json(response));
  if (result.status === 'verification_required') {
    log('register: verification required (auth flows skipped; set INTEGRATION_EMAIL/PASSWORD)');
    return null;
  }
  log('register: authenticated');
  return { email: credentials.email, password: credentials.password, created: true };
}

async function checkNotes(auth: { cookie?: string; bearer?: string }) {
  const write = { ...auth, origin: auth.cookie ? origin : null };

  const created = noteSchema.parse(
    await json(
      await call(app, '/api/v1/notes', {
        method: 'POST',
        body: { title: 'Integration note', body: 'Hello' },
        ...write,
      }),
    ),
  );
  log('notes: create');

  const page = notesPageSchema.parse(
    await json(await call(app, '/api/v1/notes?search=Integration', auth)),
  );
  if (!page.items.some((note) => note.id === created.id))
    throw new Error('Created note missing from search results.');
  log('notes: list + search');

  noteSchema.parse(await json(await call(app, `/api/v1/notes/${created.id}`, auth)));
  const archived = noteSchema.parse(
    await json(
      await call(app, `/api/v1/notes/${created.id}`, {
        method: 'PATCH',
        body: { archived: true },
        ...write,
      }),
    ),
  );
  if (!archived.archived) throw new Error('Archive did not persist.');
  log('notes: get + archive');

  expectStatus(
    await call(app, `/api/v1/notes/${created.id}`, { method: 'DELETE', ...write }),
    204,
    'notes: delete',
  );
  await expectError(
    await call(app, `/api/v1/notes/${created.id}`, auth),
    404,
    'NOT_FOUND',
    'notes: deleted note',
  );
  log('notes: delete');
}

async function checkAuthFlows(credentials: { email: string; password: string; created: boolean }) {
  // Web (cookie)
  const login = await call(app, '/api/v1/auth/login', {
    method: 'POST',
    body: { email: credentials.email, password: credentials.password },
    origin,
  });
  expectStatus(login, 200, 'web login');
  userEnvelopeSchema.parse(await json(login));
  const cookie = sessionCookie(login);
  if (!cookie) throw new Error('web login did not set the session cookie.');
  log('web: login sets session cookie');

  userEnvelopeSchema.parse(await json(await call(app, '/api/v1/me', { cookie })));
  await expectError(
    await call(app, '/api/v1/notes', { method: 'POST', body: { title: 'x' }, cookie }),
    403,
    'FORBIDDEN_ORIGIN',
    'cookie mutation without Origin',
  );
  log('web: /me + origin rule');
  await checkNotes({ cookie });

  // Native (bearer)
  const tokenResponse = await call(app, '/api/v1/auth/token', {
    method: 'POST',
    body: { email: credentials.email, password: credentials.password },
  });
  expectStatus(tokenResponse, 200, 'token login');
  const session = sessionSchema.parse(await json(tokenResponse));
  userEnvelopeSchema.parse(await json(await call(app, '/api/v1/me', { bearer: session.token })));
  const refreshed = sessionSchema.parse(
    await json(
      await call(app, '/api/v1/auth/token/refresh', { method: 'POST', bearer: session.token }),
    ),
  );
  log('native: token + /me + refresh');
  await checkNotes({ bearer: refreshed.token });

  // Logout
  const logout = await call(app, '/api/v1/auth/logout', { method: 'POST', cookie, origin });
  expectStatus(logout, 204, 'logout');
  if (sessionCookie(logout) !== null) throw new Error('logout did not clear the session cookie.');
  log('web: logout clears cookie');

  if (credentials.created) {
    expectStatus(
      await call(app, '/api/v1/me', { method: 'DELETE', bearer: refreshed.token }),
      204,
      'delete test account',
    );
    log('cleanup: test account deleted');
  }
}

function newAccount() {
  return {
    name: 'Integration Check',
    email: `integration-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`,
    password: `It-${crypto.randomUUID()}`.slice(0, 40),
  };
}

async function checkEmailRequests() {
  for (const path of ['/api/v1/auth/password-reset', '/api/v1/auth/verify-email/request']) {
    expectStatus(
      await call(app, path, { method: 'POST', body: { email: 'nobody@example.com' } }),
      202,
      path,
    );
  }
  log('email requests: password reset + verification resend (202, no enumeration)');
}

async function checkGuestFlows(registration: boolean) {
  // Web (cookie)
  await expectError(
    await call(app, '/api/v1/auth/guest', { method: 'POST', origin: 'https://evil.example' }),
    403,
    'FORBIDDEN_ORIGIN',
    'guest from a foreign origin',
  );
  const start = await call(app, '/api/v1/auth/guest', { method: 'POST', origin });
  expectStatus(start, 200, 'web guest');
  if (!userEnvelopeSchema.parse(await json(start)).user.isGuest) {
    throw new Error('web guest: user is not marked as a guest.');
  }
  const guestCookie = sessionCookie(start);
  if (!guestCookie) throw new Error('web guest did not set the session cookie.');
  const note = noteSchema.parse(
    await json(
      await call(app, '/api/v1/notes', {
        method: 'POST',
        body: { title: 'Guest note' },
        cookie: guestCookie,
        origin,
      }),
    ),
  );
  log('web guest: session cookie + note');

  if (registration) {
    const upgrade = await call(app, '/api/v1/auth/guest/upgrade', {
      method: 'POST',
      body: newAccount(),
      cookie: guestCookie,
      origin,
    });
    if (upgrade.status === 202) {
      log('web guest upgrade: verification required (session ended)');
    } else {
      expectStatus(upgrade, 200, 'web guest upgrade');
      const upgraded = webRegisterResponseSchema.parse(await json(upgrade)).user;
      const cookie = sessionCookie(upgrade);
      if (upgraded.isGuest || !cookie)
        throw new Error('web guest upgrade did not convert the user.');
      noteSchema.parse(await json(await call(app, `/api/v1/notes/${note.id}`, { cookie })));
      await expectError(
        await call(app, '/api/v1/auth/guest/upgrade', {
          method: 'POST',
          body: newAccount(),
          cookie,
          origin,
        }),
        403,
        'NOT_GUEST',
        'second upgrade',
      );
      expectStatus(
        await call(app, '/api/v1/me', { method: 'DELETE', cookie, origin }),
        204,
        'delete upgraded account',
      );
      log('web guest upgrade: account kept its notes, cookie replaced, NOT_GUEST afterwards');
    }
  } else {
    expectStatus(
      await call(app, '/api/v1/me', { method: 'DELETE', cookie: guestCookie, origin }),
      204,
      'end web guest session',
    );
    log('web guest: ended');
  }

  // Native (bearer)
  const nativeStart = await call(app, '/api/v1/auth/token/guest', { method: 'POST' });
  expectStatus(nativeStart, 200, 'native guest');
  const guestSession = sessionSchema.parse(await json(nativeStart));
  if (!guestSession.user.isGuest) throw new Error('native guest: user is not marked as a guest.');
  let bearer = guestSession.token;
  let outcome = 'session';
  if (registration) {
    const upgrade = await call(app, '/api/v1/auth/token/guest/upgrade', {
      method: 'POST',
      body: newAccount(),
      bearer,
    });
    const result = tokenRegisterResponseSchema.parse(await json(upgrade));
    if (result.status === 'authenticated') {
      expectStatus(upgrade, 200, 'native guest upgrade');
      if (result.session.user.isGuest) {
        throw new Error('native guest upgrade did not convert the user.');
      }
      bearer = result.session.token;
      outcome += ' + upgrade';
    } else {
      expectStatus(upgrade, 202, 'native guest upgrade (verification required)');
      bearer = '';
      outcome += ' + upgrade (verification required)';
    }
  }
  if (bearer) {
    expectStatus(
      await call(app, '/api/v1/me', { method: 'DELETE', bearer }),
      204,
      'delete native guest',
    );
    outcome += ' + delete';
  }
  log(`native guest: ${outcome}`);
}

async function main() {
  console.log(`Integration check: ${app.origin} -> ${pocketBase.origin}`);
  const config = await checkHealthAndConfig();
  await expectError(await call(app, '/api/v1/does-not-exist'), 404, 'NOT_FOUND', 'unknown route');
  await expectError(await call(app, '/api/v1/me'), 401, 'UNAUTHENTICATED', 'anonymous /me');
  log('error contract');

  await checkEmailRequests();
  if (config.features.guest) await checkGuestFlows(config.features.registration);
  else console.log('  - guest flows skipped (guest sessions disabled)');

  const credentials = await obtainCredentials(config.features.registration);
  if (credentials) await checkAuthFlows(credentials);
  else
    console.log(
      '  - auth and notes flows skipped (no verified account; set INTEGRATION_EMAIL/PASSWORD)',
    );
  console.log('Integration healthy.');
}

try {
  await main();
} catch (error) {
  if (error instanceof Skip && process.env.INTEGRATION_REQUIRED !== 'true') {
    console.log(`Integration check SKIPPED: ${error.message}. Start both services to run it.`);
  } else {
    console.error(
      'Integration check failed:',
      error instanceof Error ? error.message : 'Unknown error',
    );
    process.exitCode = 1;
  }
}
