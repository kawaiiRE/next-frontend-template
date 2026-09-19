# Testing

Unit tests cover presenters, validation, state transitions, and non-trivial domain utilities. Route and service tests cover success, malformed data, authorization failures, upstream failures, and safe error mapping. Add browser acceptance tests when the application has real user flows.

Run `corepack yarn check` before handoff. A production build must not require a live backend; database-backed pages should render dynamically or handle unavailable data intentionally.

When the PocketBase and Next.js services are both running, run `corepack yarn integration:check`. It verifies the backend route directly and the same response through the Next.js API bridge. Keep this live check separate from `yarn check` so unit tests and production builds remain deterministic and do not depend on a running backend.

For meaningful UI changes, also run the app and inspect desktop and mobile widths, keyboard navigation, focus states, loading, empty, error, and reduced-motion behavior.
