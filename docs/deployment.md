# Deployment

Deploy this checkout as an independent frontend, normally `/var/www/<project>/frontend`. Put the project-level Compose file and private runtime configuration in `/var/www/<project>`, not inside another application's checkout.

Bind the frontend container to an assigned loopback host port and place Caddy or another reverse proxy in front of it. Set `POCKETBASE_URL` to the backend's private network address, and set `APP_ORIGIN` and `NEXT_PUBLIC_SITE_URL` to the canonical HTTPS origin. Do not publish the PocketBase administration port through this frontend.

The starter preview is excluded from search by default (`noindex`, `robots.txt` disallow, empty sitemap). For a finished public application, set the Docker build argument `NEXT_PUBLIC_INDEXABLE=true` only after its content, canonical HTTPS URL, and sitemap have been reviewed. This is a build-time choice, not a runtime environment switch.

`docker.sh` refuses a dirty checkout, pulls with `--ff-only`, validates the parent Compose project, rebuilds only `frontend`, and waits for `/api/health`. After it succeeds, verify public HTTPS, DNS/CDN behavior, page content, assets, and existing applications. Container health alone is not a launch verification.
