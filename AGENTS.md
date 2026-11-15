# Next.js frontend engineering rules

This repository is one complete, independent frontend codebase. It may call a backend over HTTP, but it must never import files, dependencies, environment files, generated code, or runtime data from a sibling project.

This is the Next.js + React web template for projects whose backend is [`pocketbase-backend-template`](https://github.com/kawaiiRE/pocketbase-backend-template). It does not target the Fastify + Better Auth stack; the main web template for that stack is the Nuxt template.

## Starting a new project from this template

1. Copy the folder into the new project's wrapper (normally `<project>/frontend`), delete the copied `.git`, `node_modules`, `.next` and `*.tsbuildinfo`, then `git init` and add the project's own GitHub origin.
2. Rename `name` in `package.json`, the README title and links, `brandMark` in `src/config/site.ts`, and the app name and descriptions in `src/messages/en.json` and `src/messages/ar.json`.
3. `corepack yarn install --immutable`, copy `.env.example` to `.env.local` (`POCKETBASE_URL`, `APP_ORIGIN`, `NEXT_PUBLIC_SITE_URL`), start the PocketBase backend, then `corepack yarn dev`.
4. Replace the example `notes` feature with the product's features, keeping the contract, service, repository and presenter layers; update `docs/integration.md` with the backend.
5. Run `corepack yarn check` and `corepack yarn integration:check`, then follow `docs/deployment.md`. Set `NEXT_PUBLIC_INDEXABLE=true` only for a public site that should be indexed.

## Commands

- `corepack yarn dev`: Next.js dev server.
- `corepack yarn format`, `lint`, `typecheck`, `test:run`: Prettier, ESLint, `next typegen` + `tsc`, Vitest.
- `corepack yarn check`: all of the above plus `next build`. Run it before handoff.
- `corepack yarn integration:check`: verify the live gateway against a running backend (reads `.env.local`).

## Structure

- `src/app/`: route groups `(marketing)`, `(auth)`, `(app)` and the `api/v1` gateway. `src/AGENTS.md` describes every `src/` folder.
- `tests/`: Vitest unit tests. `scripts/check-integration.ts`: live contract check. `docs/`: architecture, integration, security, testing, deployment.

## Git and deployment rules

- Never commit, push or deploy without the owner's explicit go-ahead for that step.
- Commit messages and pull request descriptions never mention an AI: no `Co-Authored-By` trailer for an assistant, no "Generated with" line, no assistant names or noreply addresses.
- Deploy only through GitHub: reviewed local commit, push to the project's GitHub origin, then `git pull --ff-only` on the server and build there (`docker.sh` refuses dirty checkouts). Never copy source to a server by SCP, rsync, archives or direct edits.

## Architecture

- Use Next.js App Router, React functional components, strict TypeScript, native SCSS Modules, and Server Components by default.
- Keep framework route files thin. Rendering belongs in components, interaction belongs in hooks, transport belongs in services, persistence access belongs in server repositories, and response shaping belongs in presenters.
- Create request-scoped PocketBase clients. Never keep an authenticated client, token, or mutable store in a server singleton.
- Pass plain serializable models across Server/Client Component boundaries. Do not pass presenter class instances.
- Give every public request and response shape a named schema/type. Validate untrusted data with Zod at the boundary.
- Use `@/` aliases. Do not add cross-project aliases, parent-directory imports, symlinks, or workspace dependencies.

## Components and state

- Meaningful component folders use `index.tsx`, `logic.ts`, and `styles.module.scss`; omit a file only when that responsibility genuinely does not exist.
- JSX stays shallow and focused on rendering. Do not put business workflows, raw fetch calls, or PocketBase SDK calls in components.
- Prefer local state, URL state, and server data. If shared mutable browser state is truly required, use MobX with one provider-owned instance per React tree. Never create a request-shared server store.
- Do not add Redux, Zustand, Pinia, or another store alongside MobX.

## Styling and content

- Do not add Tailwind or CSS-in-JS. Use SCSS Modules and the centralized files in `src/styles/`.
- Use `rem` sizing, logical properties, explicit class names, and centralized color tokens. Do not hardcode palette values in component styles.
- Keep page and API paths in `src/constants/routes.ts`. Every visible string (including metadata, validation messages, toasts and errors) lives in `src/messages/en.json` and `src/messages/ar.json` with identical keys; `tests/i18n.test.ts` enforces parity.
- Support both directions: use logical properties, mirror directional icons with the `rtl-mirror` mixin, and format dates and numbers with next-intl.
- Preserve semantic HTML, keyboard access, focus visibility, reduced-motion behavior, loading/error/empty states, and responsive layouts.

## Security and quality

- Browser code calls same-origin Next.js endpoints. PocketBase URLs, administrative credentials, gateway keys, and auth tokens stay server-only.
- Authentication uses request-scoped, Secure, HttpOnly, host-only cookies in production. Never store auth tokens in localStorage.
- Mutations validate body size, content, authorization, and exact Origin in both Next.js and PocketBase. Sensitive routes are rate limited per client IP.
- The starter is not indexable by default (`noindex`, `robots.txt` disallow, empty sitemap). Only `NEXT_PUBLIC_INDEXABLE=true` at build time changes that.
- Never commit `.env`, `.next`, logs, generated type output, credentials, or runtime data.
- Update code, tests, contracts, and docs together. Before handoff run `corepack yarn check`.
- `/api/v1/**` is a versioned contract consumed by the web client and the Expo app (`docs/integration.md`). Only make additive or bug-fix changes in v1, keep the error shape `{ message, code, fields? }`, and run `corepack yarn integration:check` when both template services are available.
- Guest sessions, registration and email verification follow `GET /api/v1/config`; the UI hides what the backend disables.

## Deployment contract

- Preserve `Dockerfile`, `.dockerignore`, and executable `docker.sh` when copying this template.
- Production expects this repository at `/var/www/<project>/frontend` with the project Compose file one level above.
- Keep the Compose service named `frontend`, or set `FRONTEND_SERVICE_NAME` explicitly.
- A healthy container is not proof of a public release. Verify the reverse proxy, DNS, TLS, page content, and asset fingerprint separately.
