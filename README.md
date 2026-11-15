# Next.js frontend template

[![CI](https://github.com/kawaiiRE/next-frontend-template/actions/workflows/ci.yml/badge.svg)](https://github.com/kawaiiRE/next-frontend-template/actions/workflows/ci.yml)

[Live demo](https://next-template.rachida.dev) · [PocketBase backend template](https://github.com/kawaiiRE/pocketbase-backend-template)

A production-minded Next.js 16 / React 19 / TypeScript starter with every flow a new product needs: a polished marketing page, complete authentication, guest sessions, a responsive app shell, a notes example with search and pagination, account settings, English and Arabic (RTL), and light, dark and system themes. It is the web client **and** the API gateway of its stack: browsers use HttpOnly cookies, and the Expo mobile template uses bearer tokens against the same versioned `/api/v1` contract. PocketBase stays private behind it.

## Features

- **Authentication** — sign-in with redirect back, registration (hidden when the backend closes it), forgot and reset password, email verification with resend, sign-out, and session-expiry handling that returns users to where they were.
- **Guest sessions** — "Continue as guest" when the backend enables it, a dismissible banner with the data lifetime, an in-place upgrade to a full account that keeps the notes, and guarded sign-out.
- **App shell** — collapsible desktop sidebar (remembered, `Ctrl`/`⌘` + `B`), off-canvas mobile drawer with focus trap, Escape and swipe, topbar with breadcrumbs, theme and language menus, and a user menu.
- **Notes example** — dashboard stats and recent notes; list with debounced search and archive filter in the URL, link-based pagination, skeletons, empty, error and retry states; create, edit, archive, restore and delete with confirmation dialogs and toasts.
- **Account** — profile name, language synced to the account, password change (signs out everywhere), and account deletion behind a typed confirmation.
- **Internationalization** — next-intl with English and Arabic, `dir="rtl"`, mirrored icons, Arabic plural rules, locale-aware dates and numbers, and a key-parity test.
- **Design system** — SCSS Modules on centralized tokens, Base UI primitives, logical properties, fluid type, visible focus, reduced motion, and WCAG AA contrast in both themes. Verified from 320 px to 1920 px.
- **Security** — nonce-based CSP, exact-origin checks, Secure host-only cookies, per-IP rate limits, Zod validation at every boundary, safe errors, and `noindex` by default.

## Stack

Next.js App Router · React 19 · TypeScript (strict) · SCSS Modules · Base UI · next-intl · Zod · sonner · lucide-react · PocketBase JS SDK (server-side only) · Vitest · Yarn 4

## Quick start

Requirements: Node.js 24 and Corepack.

```powershell
corepack yarn install --immutable
Copy-Item .env.example .env.local
corepack yarn dev
```

The app expects the [PocketBase template](https://github.com/kawaiiRE/pocketbase-backend-template) at `POCKETBASE_URL`. Start it first; enable registration or guests there (`PB_REGISTRATION_ENABLED`, `PB_GUEST_ENABLED`) and seed demo data with its `corepack yarn seed` (`demo@example.com` / `demo-password-123`). With both running, `corepack yarn integration:check` verifies the whole contract end to end.

## Scripts

| Command                           | Purpose                                                      |
| --------------------------------- | ------------------------------------------------------------ |
| `corepack yarn dev`               | Development server                                           |
| `corepack yarn check`             | Prettier, ESLint, typecheck, unit tests and production build |
| `corepack yarn test`              | Vitest in watch mode                                         |
| `corepack yarn integration:check` | Live gateway check against running PocketBase and Next.js    |
| `corepack yarn build` / `start`   | Production build and server                                  |
| `corepack yarn format:write`      | Format files                                                 |

## Project structure

```text
src/
  app/            routes: (marketing), (auth), (app) and api/v1 route handlers
  components/     ui primitives and feature components (index.tsx, logic.ts, styles.module.scss)
  contracts/      Zod schemas for gateway DTOs, inputs and raw PocketBase DTOs
  presenters/     allowlisted models and view models
  server/         repositories, services, HTTP adapters, sessions (server-only)
  services/       validated browser transport to same-origin routes
  messages/       en.json and ar.json
  styles/         palette, tokens, mixins and globals
tests/            Vitest unit tests
scripts/          live integration check
```

## Make it yours

1. Copy the whole folder into a new wrapper folder; never import from sibling projects.
2. Rename the package, update `src/config/site.ts`, the colour tokens in `src/styles/palette.scss` (mirrored in `src/styles/tokens.ts`) and the copy in `src/messages/*.json`.
3. Replace the notes example one slice at a time, keeping contract, repository, service, presenter, route, component, message and test changes together.

## Documentation

- [Architecture](docs/architecture.md) — layers, request flow, sessions, i18n and theming
- [Integration](docs/integration.md) — the complete `/api/v1` contract for web and mobile clients
- [Security](docs/security.md) — sessions, CSRF, validation, headers and abuse controls
- [Testing](docs/testing.md) — unit, live integration and manual UI checks
- [Deployment](docs/deployment.md) — environment variables, container and release procedure

## Contributing and security

Contributions are welcome; see `CONTRIBUTING.md`. Report security issues privately by following `SECURITY.md` rather than opening a public issue.

Licensed under the MIT License.
