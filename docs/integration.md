# PocketBase integration

The frontend and backend remain separate codebases and communicate only over HTTP. No sibling imports, symlinks, shared environment files, shared runtime directories, or shared credentials are required.

## Local workflow

Start the backend in one terminal:

```powershell
cd D:\Me\PROJECTS\pocketbase-next-backend-template
corepack yarn install --immutable
corepack yarn setup
$env:PB_ENCRYPTION_KEY = '<32-character-local-key>'
corepack yarn dev
```

Prepare and start the frontend in a second terminal:

```powershell
cd D:\Me\PROJECTS\next-pocketbase-frontend-template
corepack yarn install --immutable
Copy-Item .env.example .env.local
corepack yarn dev
```

With both processes running, verify the complete connection in a third terminal:

```powershell
cd D:\Me\PROJECTS\next-pocketbase-frontend-template
corepack yarn integration:check
```

The command validates both `POCKETBASE_URL/api/v1/health` and `APP_ORIGIN/api/health`. It fails if either service is unavailable, returns malformed JSON, or advertises an incompatible API version or service identity.

## Deployment

Set `POCKETBASE_URL` to the backend's private HTTPS or container-network address. Only Next.js needs this value; it must never use the `NEXT_PUBLIC_` prefix. Browsers call the same-origin Next.js API, so the PocketBase administration endpoint and internal address do not need to be publicly exposed.

Release contract changes deliberately in both repositories. Add a new versioned backend path before removing an old one when independently deployed clients require a compatibility window.
