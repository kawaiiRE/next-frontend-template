# Architecture

## Request flow

Pages render on the server; interactive pieces call the same-origin gateway:

```text
Server Component page -> server service -> repository -> request-scoped PocketBase client
                                                      -> Zod-validated DTO -> presenter -> props

Client Component -> browser service (src/services) -> /api/v1 route handler -> server service
                 -> repository -> PocketBase -> presenter -> validated JSON -> view model
```

- **Route handlers** (`src/app/api/v1`) are thin adapters wrapped by `apiRoute` / `authedRoute` (`src/server/http/route.ts`). The wrappers enforce the origin rule, rate limits, credential resolution (bearer first, then cookie), cookie refresh, safe error mapping and `Cache-Control: no-store`.
- **Server services** (`src/server/services`) own workflows such as registration, guest upgrades and the dashboard summary, and map PocketBase failures to stable gateway codes.
- **Repositories** (`src/server/repositories`) are the only modules that use the PocketBase SDK. Each call creates a fresh client (`src/server/pocketbase.ts`) that forwards the end user's IP and times out after eight seconds.
- **Contracts** (`src/contracts`) define every gateway DTO, input and raw PocketBase DTO with Zod. Upstream responses that fail validation become `502 INVALID_RESPONSE`, never a crash or a leak.
- **Presenters** (`src/presenters`) allowlist fields (`presentUser`, `presentNote`) and build view models for components (`presentUserView`, `presentNoteView`).
- **Browser services** (`src/services`) validate every same-origin response and return `ApiResult<T>` instead of throwing.

## Sessions

`src/proxy.ts` runs before every page. It reads the session cookie without a network call, refreshes tokens with less than two days left, redirects anonymous visitors from protected pages to `/login?next=…` (with a `session-expired` notice when a stale cookie was dropped) and sends signed-in users away from the signed-out pages. It also sets the per-request CSP nonce.

The authenticated layout verifies the session with PocketBase on every request (`requireSession`). A token PocketBase rejects is cleared through `/session/expired`, which only deletes the cookie after PocketBase confirms it is invalid. Browser requests that come back `UNAUTHENTICATED` follow the same path (`useApiError`), so users return to the page they were on after signing in again.

Guest sessions are ordinary sessions whose user has `isGuest: true`. The shell shows a dismissible banner (a session cookie keeps it dismissed until the browser session ends), the user menu offers the upgrade dialog, sign-out asks for confirmation, and settings replace the password form and account deletion with "End guest session".

## UI composition

- Route groups: `(marketing)` for the landing page, `(auth)` for authentication pages (its `(signed-out)` group holds login, register and forgot-password), and `(app)` for the authenticated shell with its own loading and error boundaries.
- `components/ui` wraps Base UI primitives (dialogs, menus, select, tooltip, drawer) and native elements in tokenized SCSS Modules; feature folders compose them.
- State is local, in the URL (notes search, archive filter and page) or on the server. Mutations refresh the route instead of patching client copies. No global store is installed; MobX is the only approved option if a real feature needs shared mutable browser state.

## Internationalization and theming

- next-intl without locale-prefixed URLs. The locale comes from the `locale` cookie, then `Accept-Language`. `/ar` and `/en` set the cookie and redirect. Signing in applies the account language; switching language saves it to the account through a Server Action.
- `<html lang dir>` follows the locale, Base UI receives the direction, and directional icons mirror in RTL. Dates and numbers use next-intl formats.
- The theme preference (`light`, `dark`, `system`) is a cookie rendered on the server into `data-theme`, so pages never flash the wrong theme. Colour tokens live in `src/styles/palette.scss`; values needed outside CSS are mirrored in `src/styles/tokens.ts` and kept in sync by a unit test.

## Contracts with other repositories

The frontend owns its contracts and dependencies. PocketBase exposes matching HTTP contracts, but neither repository imports from the other. `GET /api/v1/health` and `GET /api/v1/config` are validated against a pinned `apiVersion`; a mismatch fails instead of silently accepting an incompatible backend. See `docs/integration.md`.
