# Deployment

Deploy this checkout as an independent frontend, normally `/var/www/<project>/frontend`. Put the project-level Compose file and private runtime configuration in `/var/www/<project>`, not inside another application's checkout.

Bind the frontend container to an assigned loopback host port and place Caddy or another reverse proxy in front of it. Do not publish the PocketBase administration port through this frontend; the frontend reaches PocketBase over the private container network.

## Environment

| Variable                | When        | Default                                 | Purpose and failure mode                                                                                                                                                                                                                                                   |
| ----------------------- | ----------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POCKETBASE_URL`        | runtime     | none (required)                         | Private PocketBase base URL, e.g. `http://backend:8080`. Both required variables are validated on first use; if either is missing or invalid, every page and API request fails.                                                                                            |
| `APP_ORIGIN`            | runtime     | none (required)                         | Canonical public origin, e.g. `https://next-template.rachida.dev`. Drives the exact-origin check (a wrong value rejects every browser sign-in and mutation with `FORBIDDEN_ORIGIN`), the `__Host-session` Secure cookie on HTTPS and `upgrade-insecure-requests`.          |
| `CLIENT_IP_HEADER`      | runtime     | unset → rightmost `X-Forwarded-For` hop | Header holding the real client IP. Caddy replaces `X-Forwarded-For` with the client address, so the default is correct directly behind Caddy. Behind a CDN set the CDN's header (e.g. `cf-connecting-ip`); otherwise every visitor shares the CDN edge IP for rate limits. |
| `NEXT_PUBLIC_SITE_URL`  | build (arg) | `http://localhost:3000`                 | Canonical URL for metadata, Open Graph images, `robots.txt` and the sitemap. Unset: social previews and canonical links point at localhost.                                                                                                                                |
| `NEXT_PUBLIC_INDEXABLE` | build (arg) | `false`                                 | `true` allows indexing (robots, sitemap, no `noindex`). Leave `false` for the template demo.                                                                                                                                                                               |
| `PORT`, `HOSTNAME`      | runtime     | `3000`, `0.0.0.0` (Dockerfile)          | Listening address of the standalone server.                                                                                                                                                                                                                                |

There is no session secret: PocketBase signs and verifies the tokens. The gateway forwards the client IP to PocketBase in `X-Forwarded-For`, so run PocketBase with `PB_TRUSTED_PROXY_HEADERS=X-Forwarded-For` and set its `PB_APP_URL` to `APP_ORIGIN` so email links open this app. Registration, email verification and guest sessions are controlled by PocketBase (`PB_REGISTRATION_ENABLED`, `PB_REQUIRE_EMAIL_VERIFICATION`, `PB_GUEST_ENABLED`, `PB_GUEST_TTL_HOURS`) and reach the UI through `GET /api/v1/config`.

## Container

The image builds in three stages: dependencies (`yarn install --immutable`), build (lint, typecheck, tests and `next build`, which also downloads the fonts) and a minimal runtime that runs `node server.js` from the standalone output as an unprivileged user. The app uses no image optimization, ISR or uploads, so the server does not write to its filesystem in normal operation; it is meant to run with a read-only root filesystem and a `/tmp` tmpfs.

The starter preview is excluded from search by default (`noindex`, `robots.txt` disallow, empty sitemap). For a finished public application, set the Docker build argument `NEXT_PUBLIC_INDEXABLE=true` only after its content, canonical HTTPS URL, and sitemap have been reviewed. This is a build-time choice, not a runtime environment switch.

## Release

`docker.sh` refuses a dirty checkout, pulls with `--ff-only`, validates the parent Compose project, rebuilds only `frontend`, and waits for `/api/v1/health`. After it succeeds, verify public HTTPS, DNS/CDN behavior, page content, assets, and existing applications. Container health alone is not a launch verification.
