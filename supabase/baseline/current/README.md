# Biker Map current database baseline

This directory captures the current live Supabase database shape for project
`caveyrhwcmfwrdfsstdu` (`biker-map`) as a source-of-truth recovery snapshot.

The repository was missing the original initial schema migration, and Supabase
migration tracking is currently empty. These files are therefore intentionally
kept separate from `supabase/migrations/` until the team decides how to rebuild
the migration history.

## Scope

- Public application tables.
- Primary keys, foreign keys, unique constraints, check constraints.
- Indexes.
- RLS enablement and policies.
- Trigger functions, table triggers, auth trigger, event trigger.
- Function execute grants and table grants visible from the live database.

## Files

- `00_extensions.sql`: installed extensions relevant to the application schema.
- `00_common_functions.sql`: shared trigger/event-trigger functions.
- `tables/*.sql`: one file per application table.
- `20_storage.sql`: current storage bucket and storage object policies.
- `99_auth_and_event_triggers.sql`: triggers outside the target public tables.

## Important notes

- This is a snapshot of the current live DB state, including known issues found
  during the pre-production audit.
- Do not treat these files as approved production migrations without review.
- No data dump is included.
- Some statements reflect the current broad grants and SECURITY DEFINER RPC
  surface exactly as observed, even where the audit recommends tightening them.
- Historical migration fragments that predate this snapshot are preserved under
  `supabase/migrations/legacy/pre-baseline/`.
