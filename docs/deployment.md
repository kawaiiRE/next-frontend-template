# Deployment

Deploy this checkout as an independent frontend, normally `/var/www/<project>/frontend`. Put the project-level Compose file and private runtime configuration in `/var/www/<project>`, not inside another application's checkout.

Bind the frontend container to an assigned loopback host port and place Caddy or another reverse proxy in front of it. Set `POCKETBASE_URL` to the backend's private network address, and set `APP_ORIGIN` and `NEXT_PUBLIC_SITE_URL` to the canonical HTTPS origin. Do not publish the PocketBase administration port through this frontend.

`docker.sh` refuses a dirty checkout, pulls with `--ff-only`, validates the parent Compose project, rebuilds only `frontend`, and waits for `/api/health`. After it succeeds, verify public HTTPS, DNS/CDN behavior, page content, assets, and existing applications. Container health alone is not a launch verification.
