#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "[supabase-local-reset] starting local Supabase"
npx supabase start

echo "[supabase-local-reset] resetting empty local database"
npx supabase db reset --local --no-seed

get_local_db_port() {
  local db_url
  db_url="$(npx supabase status -o env | sed -n 's/^DB_URL=//p' | head -n 1)"
  db_url="${db_url%\"}"
  db_url="${db_url#\"}"
  db_url="${db_url%\'}"
  db_url="${db_url#\'}"

  if [[ -z "$db_url" ]]; then
    echo "[supabase-local-reset] failed to read DB_URL from Supabase status" >&2
    return 1
  fi

  if [[ "$db_url" =~ ^postgres(ql)?://[^@]+@[^:/]+:([0-9]+)/ ]]; then
    echo "${BASH_REMATCH[2]}"
    return 0
  fi

  echo "[supabase-local-reset] failed to parse local DB port from DB_URL: $db_url" >&2
  return 1
}

resolve_db_container() {
  local db_port="$1"
  local container
  local containers=()

  while IFS= read -r container; do
    [[ -n "$container" ]] || continue
    containers+=("$container")
  done < <(
    docker ps \
      --filter "name=supabase_db_" \
      --format '{{.Names}}\t{{.Ports}}' |
      awk -v published_port=":${db_port}->5432/tcp" \
        'index($0, published_port) { print $1 }'
  )

  if [[ "${#containers[@]}" -eq 1 ]]; then
    echo "${containers[0]}"
    return 0
  fi

  if [[ "${#containers[@]}" -eq 0 ]]; then
    echo "[supabase-local-reset] failed to find Supabase DB container for local DB port $db_port" >&2
  else
    echo "[supabase-local-reset] found multiple Supabase DB containers for local DB port $db_port: ${containers[*]}" >&2
  fi

  return 1
}

LOCAL_DB_PORT="$(get_local_db_port)"
DB_CONTAINER="$(resolve_db_container "$LOCAL_DB_PORT")"
echo "[supabase-local-reset] using DB container $DB_CONTAINER"

apply_sql() {
  local file="$1"
  echo "[supabase-local-reset] applying $file"
  docker exec -i "$DB_CONTAINER" \
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
