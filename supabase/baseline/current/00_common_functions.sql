-- Current live DB snapshot for shared trigger/event-trigger functions.
-- Project: caveyrhwcmfwrdfsstdu / biker-map

create or replace function public.cleanup_favorites_for_target()
returns trigger
language plpgsql
as $function$
begin
  delete from public.favorites
  where target_type = TG_ARGV[0]
    and target_id = old.id;

  return old;
end;
$function$;

grant execute on function public.cleanup_favorites_for_target() to public;
grant execute on function public.cleanup_favorites_for_target() to anon;
grant execute on function public.cleanup_favorites_for_target() to authenticated;
grant execute on function public.cleanup_favorites_for_target() to service_role;

create or replace function public.cleanup_reactions_for_target()
returns trigger
language plpgsql
as $function$
begin
  delete from public.reactions
  where target_type = TG_ARGV[0]
    and target_id = old.id;

  return old;
end;
$function$;

grant execute on function public.cleanup_reactions_for_target() to public;
grant execute on function public.cleanup_reactions_for_target() to anon;
grant execute on function public.cleanup_reactions_for_target() to authenticated;
grant execute on function public.cleanup_reactions_for_target() to service_role;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

grant execute on function public.set_updated_at() to public;
grant execute on function public.set_updated_at() to anon;
grant execute on function public.set_updated_at() to authenticated;
grant execute on function public.set_updated_at() to service_role;

create or replace function public.sync_post_comment_count()
returns trigger
language plpgsql
as $function$
begin
  if tg_op = 'INSERT' then
    if new.parent_comment_id is null then
      update public.posts
      set comment_count = comment_count + 1
      where id = new.post_id;
    else
      update public.comments
      set reply_count = reply_count + 1
      where id = new.parent_comment_id;
    end if;
    return new;
  elsif tg_op = 'DELETE' then
    if old.parent_comment_id is null then
      update public.posts
      set comment_count = greatest(comment_count - 1, 0)
      where id = old.post_id;
    else
      update public.comments
      set reply_count = greatest(reply_count - 1, 0)
      where id = old.parent_comment_id;
    end if;
    return old;
  end if;

  return null;
end;
$function$;

grant execute on function public.sync_post_comment_count() to public;
grant execute on function public.sync_post_comment_count() to anon;
grant execute on function public.sync_post_comment_count() to authenticated;
grant execute on function public.sync_post_comment_count() to service_role;

create or replace function public.rls_auto_enable()
returns event_trigger
language plpgsql
security definer
set search_path to 'pg_catalog'
as $function$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$function$;

grant execute on function public.rls_auto_enable() to public;
grant execute on function public.rls_auto_enable() to anon;
grant execute on function public.rls_auto_enable() to authenticated;
grant execute on function public.rls_auto_enable() to service_role;
