# Testing

`corepack yarn check` runs Prettier, ESLint, strict TypeScript (after `next typegen`), the Vitest suite and a production build. Neither the tests nor the build need a running backend.

The unit tests (`tests/`) cover:

- gateway and PocketBase contracts, input validation and field codes;
- presenters, including guests and worst-case data (long names, mixed scripts, emoji, markup);
- safe error mapping from PocketBase to gateway codes;
- the origin rule, bearer parsing, client IP extraction and credential resolution;
- the rate limiter, JWT expiry helpers and the Content Security Policy;
- routing policy, `next` sanitizing, breadcrumbs and pagination ranges;
- message catalogue parity (keys, ICU arguments, Arabic plural forms) and locale resolution;
- colour token parity between SCSS and TypeScript.

With PocketBase and Next.js running, `corepack yarn integration:check` exercises the live contract end to end through the gateway, including guest sessions, cookie and bearer authentication and notes CRUD (`docs/integration.md`). It stays out of `yarn check` so CI remains deterministic.

For UI changes, also run the app and check 320 px to 1920 px widths in English and Arabic, light and dark themes, keyboard navigation and focus, the mobile drawer, loading, empty and error states, and reduced motion.
