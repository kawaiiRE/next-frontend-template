# Architecture

The normal request path is:

`page or browser component -> service -> same-origin route handler -> server service -> repository -> request-scoped PocketBase client -> presenter -> serializable response`

App Router pages and layouts are Server Components unless browser APIs, state, or event handlers require a Client Component. Route handlers adapt HTTP only; they do not own business logic. Repositories are the only modules that use the PocketBase SDK. Services coordinate workflows. Presenters allowlist fields and return plain objects suitable for React serialization.

The frontend owns its contracts and dependencies. A backend may expose matching HTTP contracts, but neither repository imports from the other. Contract changes are reviewed and released in both projects explicitly.

The starter integration contract is `GET /api/v1/health`. PocketBase returns the raw versioned DTO, the server repository validates it, and the Next.js route exposes the presented application model at `GET /api/health`. A version mismatch fails validation instead of silently accepting incompatible services.

Local state and URL state come before a global store. MobX is the only approved shared browser store and is added only with a concrete domain need. A provider owns each store instance so SSR requests never share mutable state.
