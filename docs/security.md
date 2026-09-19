# Security

- Keep PocketBase and administrative credentials on the server. Browser code uses same-origin endpoints only.
- Create a PocketBase client per request. Load auth from a Secure, HttpOnly, host-only, SameSite cookie and export any refreshed cookie deliberately.
- Validate exact Origin, authorization, content type, byte limits, and Zod schemas on mutations. PocketBase must independently enforce collection rules or hook guards.
- Return allowlisted models and stable safe error codes. Do not forward raw PocketBase errors or records.
- Set a restrictive Content Security Policy for the real application's asset and integration needs before launch.
- Keep dependencies small and pinned through `yarn.lock`. Review framework and SDK release notes during upgrades.
- Never put secrets in `NEXT_PUBLIC_*`, source files, documentation, test fixtures, client bundles, or command output.
