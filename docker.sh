#!/bin/sh
set -eu

if [ "$#" -ne 0 ]; then
  echo "Usage: ./docker.sh" >&2
  exit 1
fi

SERVICE_NAME=${FRONTEND_SERVICE_NAME:-frontend}
REPO_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
DEPLOY_DIR=${DEPLOY_DIR:-$(dirname "$REPO_DIR")}

if [ ! -f "$DEPLOY_DIR/compose.yml" ] && [ ! -f "$DEPLOY_DIR/docker-compose.yml" ]; then
  echo "Production Compose file not found in $DEPLOY_DIR." >&2
  exit 1
fi

cd "$REPO_DIR"
if [ -n "$(git status --porcelain)" ]; then
  echo "Frontend checkout is dirty; refusing to pull or deploy." >&2
  git status --short
  exit 1
fi
git pull --ff-only

cd "$DEPLOY_DIR"
docker compose config --quiet
if ! docker compose config --services | grep -qx "$SERVICE_NAME"; then
  echo "Compose service not found: $SERVICE_NAME" >&2
  exit 1
fi

docker compose build "$SERVICE_NAME"
docker compose up -d --no-deps "$SERVICE_NAME"

attempt=1
while [ "$attempt" -le 45 ]; do
  if docker compose exec -T "$SERVICE_NAME" node -e \
    "fetch('http://127.0.0.1:3000/api/health').then(response=>{if(!response.ok)process.exit(1)}).catch(()=>process.exit(1))"; then
    docker compose ps "$SERVICE_NAME"
    echo "Frontend is healthy."
    exit 0
  fi
  sleep 2
  attempt=$((attempt + 1))
done

echo "Frontend did not become healthy within 90 seconds." >&2
docker compose logs --tail=150 "$SERVICE_NAME"
exit 1
