#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

eval "$(
  npx supabase status -o env |
    grep -E '^(API_URL|PUBLISHABLE_KEY|SERVICE_ROLE_KEY)='
)"

export NEXT_PUBLIC_SUPABASE_URL="$API_URL"
export NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY="$PUBLISHABLE_KEY"
export SUPABASE_SERVICE_ROLE_KEY="$SERVICE_ROLE_KEY"
export AUTH_SECRET="${AUTH_SECRET:-playwright-local-auth-secret-for-supabase-local}"

npm --prefix web run test:e2e -- "$@"
