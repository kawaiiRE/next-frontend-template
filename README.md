# Next.js + PocketBase frontend template

[![CI](https://github.com/kawaiiRE/next-pocketbase-frontend-template/actions/workflows/ci.yml/badge.svg)](https://github.com/kawaiiRE/next-pocketbase-frontend-template/actions/workflows/ci.yml)

[Live demo](https://next-template.rachida.dev) | [PocketBase backend template](https://github.com/kawaiiRE/pocketbase-next-backend-template)

A production-minded Next.js 16 / React 19 / TypeScript frontend that is deliberately independent from its backend. It keeps the useful discipline of the Nuxt starter—central routes and styling, typed services, presenters, focused components, tests, and safe deployment—without carrying Vue, Nuxt, Pinia, Vuestic, or Fastify conventions into React.

## Start a project

1. Copy this entire folder to a new wrapper folder. Do not place application files beside the wrapper or import from sibling projects.
2. Rename the package and update `src/config/site.ts`, `src/content/copy.ts`, and `.env.example`.
3. Run `corepack yarn install --immutable`, copy `.env.example` to `.env.local`, then run `corepack yarn dev`.
4. Replace the health example one domain slice at a time. Keep route, contract, repository, service, presenter, component, and test changes synchronized.

The frontend expects the versioned PocketBase health route at `/api/v1/health` on `POCKETBASE_URL`. The separate `pocketbase-next-backend-template` implements it, but this repository has no filesystem dependency on that backend.

## Run with the PocketBase template

Start `pocketbase-next-backend-template` first, then start this frontend with `POCKETBASE_URL` pointing to it. Once both are running, execute `corepack yarn integration:check` here. The check calls PocketBase directly and then calls the Next.js `/api/health` bridge, validating that both services expose the same API version and service identity. See `docs/integration.md` for the complete workflow.

## Commands

- `corepack yarn integration:check` — verify the live Next.js-to-PocketBase connection

- `corepack yarn dev` — local development
- `corepack yarn format:write` — format files
- `corepack yarn check` — formatting, lint, types, tests, and production build
- `corepack yarn start` — serve the production build

No global store is installed because the starter does not need one. If a real feature requires shared mutable browser state, add MobX and `mobx-react-lite`, keep stores domain-based, and create each store inside a client provider.

Read `docs/architecture.md`, `docs/security.md`, `docs/testing.md`, and `docs/deployment.md` before changing boundaries or deployment behavior.

## Contributing and security

Contributions are welcome; see `CONTRIBUTING.md`. Report security issues privately by following `SECURITY.md` rather than opening a public issue.
