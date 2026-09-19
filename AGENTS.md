# Next.js frontend engineering rules

This repository is one complete, independent frontend codebase. It may call a backend over HTTP, but it must never import files, dependencies, environment files, generated code, or runtime data from a sibling project.

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
- Keep routes in `src/constants/routes.ts` and visible starter copy in `src/content/copy.ts`.
- Preserve semantic HTML, keyboard access, focus visibility, reduced-motion behavior, loading/error/empty states, and responsive layouts.

## Security and quality

- Browser code calls same-origin Next.js endpoints. PocketBase URLs, administrative credentials, gateway keys, and auth tokens stay server-only.
- Authentication uses request-scoped, Secure, HttpOnly, host-only cookies in production. Never store auth tokens in localStorage.
- Mutations validate body size, content, authorization, and exact Origin in both Next.js and PocketBase.
- Never commit `.env`, `.next`, logs, generated type output, credentials, or runtime data.
- Update code, tests, contracts, and docs together. Before handoff run `corepack yarn check`.
- Preserve the `/api/v1/health` compatibility handshake and run `corepack yarn integration:check` when both template services are available.

## Deployment contract

- Preserve `Dockerfile`, `.dockerignore`, and executable `docker.sh` when copying this template.
- Production expects this repository at `/var/www/<project>/frontend` with the project Compose file one level above.
- Keep the Compose service named `frontend`, or set `FRONTEND_SERVICE_NAME` explicitly.
- A healthy container is not proof of a public release. Verify the reverse proxy, DNS, TLS, page content, and asset fingerprint separately.
