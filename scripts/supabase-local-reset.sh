#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "[supabase-local-reset] starting local Supabase"
npx supabase start

echo "[supabase-local-reset] resetting empty local database"
npx supabase db reset --local --no-seed

apply_sql() {
  local file="$1"
  echo "[supabase-local-reset] applying $file"
  docker exec -i supabase_db_biker-map-auth-flow-tests \
    psql -U postgres -d postgres -v ON_ERROR_STOP=1 < "$file" >/dev/null
}

baseline_files=(
  "supabase/baseline/current/00_extensions.sql"
  "supabase/baseline/current/00_common_functions.sql"
  "supabase/baseline/current/tables/01_profiles.sql"
  "supabase/baseline/current/tables/02_places.sql"
  "supabase/baseline/current/tables/03_routes.sql"
  "supabase/baseline/current/tables/04_posts.sql"
  "supabase/baseline/current/tables/05_comments.sql"
  "supabase/baseline/current/tables/06_notifications.sql"
  "supabase/baseline/current/tables/07_route_waypoints.sql"
  "supabase/baseline/current/tables/08_route_paths.sql"
  "supabase/baseline/current/tables/09_reactions.sql"
  "supabase/baseline/current/tables/10_favorites.sql"
  "supabase/baseline/current/20_storage.sql"
  "supabase/baseline/current/99_auth_and_event_triggers.sql"
)

for file in "${baseline_files[@]}"; do
  apply_sql "$file"
done

for file in supabase/migrations/[0-9]*_*.sql; do
  [[ -e "$file" ]] || continue
  apply_sql "$file"
done

if [[ -f "supabase/seed.sql" ]]; then
  apply_sql "supabase/seed.sql"
fi

echo "[supabase-local-reset] local Supabase is ready"
npx supabase status
