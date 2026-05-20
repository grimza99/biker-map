create schema if not exists private;

revoke all on schema private from public, anon, authenticated;

create or replace function private.cleanup_favorites_for_target()
returns trigger
language plpgsql
set search_path = ''
as $function$
begin
  delete from public.favorites
  where target_type = TG_ARGV[0]
    and target_id = old.id;

  return old;
end;
$function$;

create or replace function private.cleanup_reactions_for_target()
returns trigger
language plpgsql
set search_path = ''
as $function$
begin
  delete from public.reactions
  where target_type = TG_ARGV[0]
    and target_id = old.id;

  return old;
end;
$function$;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

create or replace function private.sync_post_comment_count()
returns trigger
language plpgsql
set search_path = ''
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

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  insert into public.profiles (
    id,
    name,
    email,
    avatar_url,
    role
  )
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'display_name',
      split_part(coalesce(new.email, ''), '@', 1),
      'member'
    ),
    new.email,
    null,
    'member'
  )
  on conflict (id) do nothing;

  return new;
end;
$function$;

create or replace function private.rls_auto_enable()
returns event_trigger
language plpgsql
security definer
set search_path = 'pg_catalog'
as $function$
declare
  cmd record;
begin
  for cmd in
    select *
    from pg_event_trigger_ddl_commands()
    where command_tag in ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      and object_type in ('table', 'partitioned table')
  loop
    if cmd.schema_name is not null
       and cmd.schema_name in ('public')
       and cmd.schema_name not in ('pg_catalog', 'information_schema')
       and cmd.schema_name not like 'pg_toast%'
       and cmd.schema_name not like 'pg_temp%' then
      begin
        execute format(
          'alter table if exists %s enable row level security',
          cmd.object_identity
        );
        raise log 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      exception
        when others then
          raise log 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      end;
    else
      raise log 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)',
        cmd.object_identity,
        cmd.schema_name;
    end if;
  end loop;
end;
$function$;

revoke all on function private.cleanup_favorites_for_target() from public, anon, authenticated, service_role;
revoke all on function private.cleanup_reactions_for_target() from public, anon, authenticated, service_role;
revoke all on function private.set_updated_at() from public, anon, authenticated, service_role;
revoke all on function private.sync_post_comment_count() from public, anon, authenticated, service_role;
revoke all on function private.handle_new_user() from public, anon, authenticated, service_role;
revoke all on function private.rls_auto_enable() from public, anon, authenticated, service_role;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function private.set_updated_at();

drop trigger if exists set_places_updated_at on public.places;
create trigger set_places_updated_at
before update on public.places
for each row execute function private.set_updated_at();

drop trigger if exists cleanup_route_favorites on public.routes;
create trigger cleanup_route_favorites
after delete on public.routes
for each row execute function private.cleanup_favorites_for_target('route');

drop trigger if exists set_routes_updated_at on public.routes;
create trigger set_routes_updated_at
before update on public.routes
for each row execute function private.set_updated_at();

drop trigger if exists cleanup_post_favorites on public.posts;
create trigger cleanup_post_favorites
after delete on public.posts
for each row execute function private.cleanup_favorites_for_target('post');

drop trigger if exists cleanup_post_reactions on public.posts;
create trigger cleanup_post_reactions
after delete on public.posts
for each row execute function private.cleanup_reactions_for_target('post');

drop trigger if exists set_posts_updated_at on public.posts;
create trigger set_posts_updated_at
before update on public.posts
for each row execute function private.set_updated_at();

drop trigger if exists cleanup_comment_reactions on public.comments;
create trigger cleanup_comment_reactions
after delete on public.comments
for each row execute function private.cleanup_reactions_for_target('comment');

drop trigger if exists set_comments_updated_at on public.comments;
create trigger set_comments_updated_at
before update on public.comments
for each row execute function private.set_updated_at();

drop trigger if exists sync_post_comment_count_on_delete on public.comments;
create trigger sync_post_comment_count_on_delete
after delete on public.comments
for each row execute function private.sync_post_comment_count();

drop trigger if exists sync_post_comment_count_on_insert on public.comments;
create trigger sync_post_comment_count_on_insert
after insert on public.comments
for each row execute function private.sync_post_comment_count();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

drop event trigger if exists ensure_rls;
create event trigger ensure_rls
on ddl_command_end
execute function private.rls_auto_enable();

drop function if exists public.cleanup_favorites_for_target();
drop function if exists public.cleanup_reactions_for_target();
drop function if exists public.set_updated_at();
drop function if exists public.sync_post_comment_count();
drop function if exists public.handle_new_user();
drop function if exists public.rls_auto_enable();
