# Frontend source rules

- `app/` contains thin Next.js adapters and special files: route groups `(marketing)`, `(auth)` (with `(signed-out)` for pages a session skips) and `(app)` (authenticated shell), plus `api/v1` route handlers.
- `components/` contains rendering and local interaction, grouped by area (`ui`, `layout`, `auth`, `account`, `notes`, `dashboard`, `marketing`, `feedback`, `preferences`); meaningful components use the three-file folder pattern.
- `server/` is server-only and owns PocketBase access (`repositories`), workflows (`services`), HTTP adapters (`http`), sessions, cookies and Server Actions.
- `services/` contains stateless browser transport modules that call same-origin endpoints and validate every response.
- `contracts/` holds the Zod schemas for gateway DTOs, inputs and raw PocketBase DTOs; `presenters/` turns them into allowlisted models and view models.
- `constants/`, `config/`, `i18n/`, `messages/` and `styles/` are the single sources for their concerns. `hooks/` holds shared client hooks; `lib/` holds framework-neutral helpers.
- Never import a `server-only` module from a Client Component (Server Actions in `server/actions` are the exception by design).
- API DTOs stop at a service/presenter boundary; components receive application-facing models.
