# Server boundary rules

- Import `server-only` in every module that must never enter a browser bundle.
- Create one PocketBase SDK instance per request/workflow. Do not export an authenticated singleton.
- Repositories perform transport/persistence calls; services own workflows; presenters allowlist and normalize output.
- Return safe error codes to callers. Log error class/name only; never expose caught messages, stacks, tokens, or upstream response bodies.
- Public mutations require exact-origin checks and bounded validated bodies. Authorization must also be enforced by PocketBase rules or hooks.
