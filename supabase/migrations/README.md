# Supabase migrations

The original initial schema migration for this project was not captured.
The live Supabase project also currently has an empty migration tracking table.

Because of that, the current live DB schema has been captured separately at:

- `supabase/baseline/current/`

Files under `supabase/migrations/legacy/pre-baseline/` are preserved historical
changes that existed before the baseline snapshot was created. They are kept for
audit/history only and should not be treated as a complete database rebuild path.

From the baseline date forward, new database changes should be added as normal
Supabase migrations in this directory.
