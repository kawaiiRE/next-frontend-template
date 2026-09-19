# Frontend source rules

- `app/` contains thin Next.js adapters and special files.
- `components/` contains rendering and local interaction; meaningful components use the three-file folder pattern.
- `server/` is server-only and owns PocketBase access, repositories, workflows, safe API errors, and presentation.
- `services/` contains stateless browser-facing transport modules that call same-origin endpoints.
- `contracts/`, `constants/`, `content/`, and `config/` are the single sources for their concerns.
- Never import a `server-only` module from a Client Component.
- API DTOs stop at a service/presenter boundary; components receive application-facing models.
