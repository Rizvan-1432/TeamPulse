#!/usr/bin/env bash
set -euo pipefail

# Applies migrations to production DB (Neon / Supabase).
# Requires DIRECT_URL or DATABASE_URL in environment or .env.production.local

if [ -f .env.production.local ]; then
  set -a
  # shellcheck disable=SC1091
  source .env.production.local
  set +a
fi

echo "→ Running prisma migrate deploy..."
npx prisma migrate deploy

echo "✓ Migrations applied."
