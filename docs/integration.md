# Integration (API v1)

This frontend is the public gateway of its stack. Browsers and the Expo mobile app call its same-origin `/api/v1/*` routes; the Next.js server alone talks to PocketBase over a private address. The two repositories never share source files, environment files, runtime data or credentials — only the HTTP contracts below. The PocketBase side is documented in `pocketbase-backend-template/docs/integration.md`.

```text
Browser ──cookie──┐
                  ├─> Next.js /api/v1/* ──> PocketBase (private) /api/v1/*, /api/collections/*
Expo app ─bearer──┘
```

## Local workflow

Start PocketBase (in its own wrapper folder), then this app, then verify both:

```powershell
cd D:\Me\PROJECTS\pocketbase-backend-template
corepack yarn install --immutable
corepack yarn setup
corepack yarn dev                     # PB_REGISTRATION_ENABLED / PB_GUEST_ENABLED in its .env

cd D:\Me\PROJECTS\next-frontend-template
corepack yarn install --immutable
Copy-Item .env.example .env.local     # POCKETBASE_URL, APP_ORIGIN
corepack yarn dev

corepack yarn integration:check
```

`integration:check` validates health and config on both services, the error contract, the email request routes, guest sessions and upgrades (cookie and bearer), registration, cookie and bearer sign-in, token refresh, the origin rule, the full notes CRUD and logout. It deletes every account it creates. It prints `SKIPPED` when a service is unreachable (set `INTEGRATION_REQUIRED=true` to fail instead) and skips account flows when registration is closed unless `INTEGRATION_EMAIL` and `INTEGRATION_PASSWORD` name an existing verified account.

## Conventions

| Topic        | Rule                                                                                                                                                            |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Base path    | `{origin}/api/v1`. Unknown paths answer `404 { code: "NOT_FOUND" }` as JSON.                                                                                    |
| Bodies       | `Content-Type: application/json` (else `415 UNSUPPORTED_MEDIA_TYPE`), at most 64 KiB (else `413 BODY_TOO_LARGE`). Note and profile bodies reject unknown keys.  |
| Success      | Raw DTOs, no envelope. `204` responses have no body. Every response sends `Cache-Control: no-store`.                                                            |
| Dates        | ISO-8601 UTC strings, e.g. `2026-10-18T12:00:00.000Z`.                                                                                                          |
| Native auth  | `Authorization: Bearer <token>`. A bearer token always wins over a cookie.                                                                                      |
| Browser auth | HttpOnly `SameSite=Lax` cookie: `__Host-session` (Secure) when `APP_ORIGIN` is HTTPS, `session` on plain-HTTP local development.                                |
| Origin rule  | A present `Origin` header must equal `APP_ORIGIN` (`403 FORBIDDEN_ORIGIN`). Cookie mutations and cookie-setting routes require it. Native apps send none.       |
| Client IP    | Rate limits key on `CLIENT_IP_HEADER` or the rightmost `X-Forwarded-For` hop; the gateway forwards that IP to PocketBase.                                       |
| Locale       | New accounts store the caller's language: the register body's `locale`, else the `locale` cookie, else `Accept-Language`, else `en`. Guest routes take no body. |

### DTOs

```ts
type Locale = 'en' | 'ar';

interface User {
  id: string;
  email: string; // guests carry a generated address on the reserved guest domain
  name: string;
  verified: boolean;
  isGuest: boolean;
  locale: Locale | null;
  createdAt: string;
}

interface Session {
  token: string; // PocketBase auth token (JWT), valid 7 days
  expiresAt: string; // from the token's `exp`
  user: User;
}

interface Note {
  id: string; // 15 lowercase alphanumerics
  title: string; // 1–160 characters, trimmed
  body: string; // up to 20 000 characters
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Page<T> {
  items: T[];
  page: number; // 1-based
  perPage: number;
  totalItems: number;
  totalPages: number; // 0 when there are no items
}

interface AppConfig {
  apiVersion: 1;
  features: {
    registration: boolean;
    emailVerification: boolean;
    guest: boolean;
    guestTtlHours: number; // may be fractional; guest accounts are deleted after this
  };
}
```

### Errors

Every failure is `{ message: string, code: string, fields?: Record<string, FieldCode> }`. `message` is generic English for logs; clients localize by `code`. `fields` maps an input name to one of `required`, `invalid`, `invalid_email`, `too_short`, `too_long`, `taken`, `invalid_token`, `incorrect_password`. `429` responses include `Retry-After` (seconds).

| Status | `code`                                                                                           |
| ------ | ------------------------------------------------------------------------------------------------ |
| 400    | `INVALID_INPUT`                                                                                  |
| 401    | `UNAUTHENTICATED` (missing, expired or revoked token — sign in again), `INVALID_CREDENTIALS`     |
| 403    | `FORBIDDEN_ORIGIN`, `REGISTRATION_DISABLED`, `GUEST_DISABLED`, `NOT_GUEST`, `EMAIL_NOT_VERIFIED` |
| 404    | `NOT_FOUND` (missing and foreign records are indistinguishable)                                  |
| 409    | `EMAIL_TAKEN`                                                                                    |
| 413    | `BODY_TOO_LARGE`                                                                                 |
| 415    | `UNSUPPORTED_MEDIA_TYPE`                                                                         |
| 429    | `RATE_LIMITED`                                                                                   |
| 502    | `INVALID_RESPONSE` (PocketBase answered with an unexpected shape)                                |
| 503    | `UPSTREAM_UNAVAILABLE`, `UNAVAILABLE`                                                            |

`GUEST_DISABLED` and `NOT_GUEST` were added with guest sessions; every other code is unchanged.

## Native (bearer) authentication

| Route                            | Body                                                | Success                                                                                       |
| -------------------------------- | --------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `POST /auth/token`               | `{ email, password }`                               | `200 Session`                                                                                 |
| `POST /auth/token/register`      | `{ name, email, password, locale? }`                | `201 { status: "authenticated", session }` or `201 { status: "verification_required", user }` |
| `POST /auth/token/refresh`       | — (bearer)                                          | `200 Session` with a new token                                                                |
| `POST /auth/token/guest`         | —                                                   | `200 Session` for a new guest (`user.isGuest: true`)                                          |
| `POST /auth/token/guest/upgrade` | `{ name, email, password, locale? }` (guest bearer) | `200 { status: "authenticated", session }` or `202 { status: "verification_required", user }` |

- `name` is 2–120 characters (trimmed); `email` a valid address (max 254); new passwords 8–71 UTF-8 bytes. Sign-in accepts any non-empty password.
- Sign-in errors: `401 INVALID_CREDENTIALS`, `403 EMAIL_NOT_VERIFIED` (verification required), `429`. Registration: `403 REGISTRATION_DISABLED`, `409 EMAIL_TAKEN` (`fields.email: "taken"`).
- Refresh before `expiresAt`; the web client renews cookies with less than two days left, and native clients should do the same. A refresh answering `401` (revoked: password changed, account deleted) or `403 EMAIL_NOT_VERIFIED` ends the session.
- There is no server-side logout for bearer tokens: discard the token. Changing the password revokes every token of the account.
- Guests: `403 GUEST_DISABLED` when `features.guest` is false. The upgrade converts the account in place (same `id`, notes kept). `202` means email verification is required: the guest token is no longer valid, the user verifies, then signs in with `/auth/token`. Upgrade errors: `401 UNAUTHENTICATED`, `403 NOT_GUEST`, `403 REGISTRATION_DISABLED`, `409 EMAIL_TAKEN`, `400 INVALID_INPUT`. Guests cannot change their password or email; they end the session with `DELETE /me`.

## Browser (cookie) authentication

These routes require an `Origin` equal to `APP_ORIGIN` and manage the session cookie; the token never appears in a body.

| Route                      | Body                                 | Success                                                                                                                |
| -------------------------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| `POST /auth/login`         | `{ email, password }`                | `200 { user }`, sets the cookie (and the `locale` cookie from the account)                                             |
| `POST /auth/register`      | `{ name, email, password, locale? }` | `201 { status: "authenticated" \| "verification_required", user }`; the cookie is set when authenticated               |
| `POST /auth/logout`        | —                                    | `204`, clears the cookie                                                                                               |
| `POST /auth/guest`         | —                                    | `200 { user }`, sets the cookie                                                                                        |
| `POST /auth/guest/upgrade` | `{ name, email, password, locale? }` | `200 { status: "authenticated", user }` replaces the cookie; `202 { status: "verification_required", user }` clears it |

## Shared routes (cookie or bearer)

| Route                                   | Body / query                                                                                                                                                  | Success                                                                                                                         |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `GET /health` (alias `GET /api/health`) | —                                                                                                                                                             | `200 { available, apiVersion: 1, service, checkedAt }`                                                                          |
| `GET /config`                           | —                                                                                                                                                             | `200 AppConfig`                                                                                                                 |
| `POST /auth/password-reset`             | `{ email }`                                                                                                                                                   | `202 {}` whether or not the account exists                                                                                      |
| `POST /auth/password-reset/confirm`     | `{ token, password }`                                                                                                                                         | `204`; bad token → `400` `fields.token: "invalid_token"`                                                                        |
| `POST /auth/verify-email`               | `{ token }`                                                                                                                                                   | `204`; bad token → `400` `fields.token: "invalid_token"`                                                                        |
| `POST /auth/verify-email/request`       | `{ email }`                                                                                                                                                   | `202 {}` whether or not the account exists                                                                                      |
| `GET /me`                               | —                                                                                                                                                             | `200 { user }`                                                                                                                  |
| `PATCH /me`                             | `{ name?, locale?: Locale \| null }` (at least one)                                                                                                           | `200 { user }`                                                                                                                  |
| `DELETE /me`                            | —                                                                                                                                                             | `204`; notes are deleted with the account                                                                                       |
| `POST /me/password`                     | `{ currentPassword, password }`                                                                                                                               | `204`; every session is revoked (cookie cleared); wrong current password → `400` `fields.currentPassword: "incorrect_password"` |
| `GET /notes`                            | `page` (≥ 1, default 1), `perPage` (1–100, default 20), `search` (≤ 100 chars, title or body, case-insensitive), `archived` (`true`/`false`, default `false`) | `200 Page<Note>`, newest update first                                                                                           |
| `POST /notes`                           | `{ title, body? }`                                                                                                                                            | `201 Note`                                                                                                                      |
| `GET /notes/{id}`                       | —                                                                                                                                                             | `200 Note`                                                                                                                      |
| `PATCH /notes/{id}`                     | `{ title?, body?, archived? }` (at least one)                                                                                                                 | `200 Note`                                                                                                                      |
| `DELETE /notes/{id}`                    | —                                                                                                                                                             | `204`                                                                                                                           |

Email links point at this app: `{PB_APP_URL}/verify-email?token=…` and `{PB_APP_URL}/reset-password?token=…`, so `PB_APP_URL` must equal `APP_ORIGIN`.

## Rate limits (per client IP, per gateway instance)

| Policy                                             | Limit             |
| -------------------------------------------------- | ----------------- |
| `auth/login`, `auth/token`                         | 10 per 5 minutes  |
| `auth/register`, `auth/token/register`             | 5 per hour        |
| `auth/guest`, `auth/token/guest`                   | 10 per hour       |
| `auth/guest/upgrade`, `auth/token/guest/upgrade`   | 10 per 15 minutes |
| `auth/token/refresh`                               | 30 per 5 minutes  |
| `auth/password-reset`                              | 5 per 15 minutes  |
| `auth/password-reset/confirm`, `auth/verify-email` | 10 per 15 minutes |
| `auth/verify-email/request`                        | 5 per 15 minutes  |
| `me/password`                                      | 5 per 15 minutes  |

PocketBase enforces its own limits behind these. The gateway limiter is in memory; run a shared limiter in the reverse proxy when several instances serve traffic.

## Cross-origin clients

The gateway sends no CORS headers. Native apps are unaffected. A browser build served from another origin (for example Expo web on `localhost:8081`) is rejected by the origin rule; serve it behind the same origin or add a reviewed CORS policy first.

## Contract changes

Release contract changes in both repositories together. Additive fields are backward compatible: the gateway treats a backend without `features.guest` as guests disabled and `guestTtlHours` as 24. Introduce `/api/v2` before removing or redefining a field that independently deployed clients use.
