#!/usr/bin/env bash
set -euo pipefail

# Répertoire du projet sur le serveur (à adapter ou fournir via REPO_DIR)
REPO_DIR="${REPO_DIR:-/home/USER/nodeapps/plisa}"
BRANCH="${BRANCH:-main}"

export NODE_ENV=production

cd "$REPO_DIR"

echo "[deploy] Sync branch ${BRANCH}..."
git fetch origin "$BRANCH"
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"

echo "[deploy] Install production dependencies..."
npm ci --omit=dev

echo "[deploy] Run database migrations..."
npx prisma migrate deploy

if [ "${SKIP_BUILD:-0}" = "1" ]; then
  echo "[deploy] SKIP_BUILD=1 -> skipping npm run build (ensure you deploy prebuilt assets)."
else
  echo "[deploy] Build app..."
  npm run build
fi

echo "[deploy] Restart app (touch tmp/restart.txt)..."
mkdir -p tmp
touch tmp/restart.txt

echo "[deploy] Done."
