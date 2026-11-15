# To do later

Not required to use the template as-is.

- Stack scope: this template targets the PocketBase backend, not the Fastify + Better Auth stack. The Nuxt template stays the main web template; keep this one for PocketBase/React projects unless the owner decides otherwise.
- Self-host fonts (bundle the font files instead of fetching them at build time) so builds work offline and no third party is contacted.
- Align Node and Yarn versions (`engines`, `packageManager`, Dockerfile base image) with the other templates.
