set check_function_bodies = off;

-- Keep notifications.source_type as a client-visible category field.
update public.notifications
set source_type = case
  when kind = 'system' then 'system'
  else coalesce(source_type, 'post')
end
where source_type is null;

alter table public.notifications
  alter column source_type set default 'system',
  alter column source_type set not null;

alter table public.notifications
  drop constraint if exists notifications_source_type_check;

alter table public.notifications
  add constraint notifications_source_type_check
  check (source_type in ('post', 'comment', 'system'));

-- Hide internal profile columns from client-side SELECT while keeping role/email readable.
revoke select (deleted_at, avatar_path) on table public.profiles from anon;
revoke select (deleted_at, avatar_path) on table public.profiles from authenticated;

-- Admin-only writes for route child tables while custom user routes remain closed.
drop policy if exists route_waypoints_delete_route_owner_or_admin on public.route_waypoints;
drop policy if exists route_waypoints_insert_route_owner_or_admin on public.route_waypoints;
drop policy if exists route_waypoints_update_route_owner_or_admin on public.route_waypoints;

create policy route_waypoints_admin_write
on public.route_waypoints
as permissive
for all
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

drop policy if exists route_paths_delete_route_owner_or_admin on public.route_paths;
drop policy if exists route_paths_insert_route_owner_or_admin on public.route_paths;
drop policy if exists route_paths_update_route_owner_or_admin on public.route_paths;

create policy route_paths_admin_write
on public.route_paths
as permissive
for all
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

-- Fix mutable search_path warnings on trigger functions.
create or replace function public.cleanup_reactions_for_target()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  delete from public.reactions
  where target_type = TG_ARGV[0]
    and target_id = old.id;

  return old;
end;
$$;

create or replace function public.cleanup_favorites_for_target()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  delete from public.favorites
  where target_type = TG_ARGV[0]
    and target_id = old.id;

  return old;
end;
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.sync_post_comment_count()
returns trigger
language plpgsql
set search_path = public
as $$
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
$$;

-- Internal functions should not be directly executable by anon/authenticated.
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.rls_auto_enable() from public, anon, authenticated;
revoke all on function public.cleanup_reactions_for_target() from public, anon, authenticated;
revoke all on function public.cleanup_favorites_for_target() from public, anon, authenticated;
revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.sync_post_comment_count() from public, anon, authenticated;

grant execute on function public.handle_new_user() to service_role;
grant execute on function public.rls_auto_enable() to service_role;
grant execute on function public.cleanup_reactions_for_target() to service_role;
grant execute on function public.cleanup_favorites_for_target() to service_role;
grant execute on function public.set_updated_at() to service_role;
grant execute on function public.sync_post_comment_count() to service_role;

-- Server-only post view RPC.
revoke all on function public.increment_post_view_count(uuid) from public, anon, authenticated;
grant execute on function public.increment_post_view_count(uuid) to service_role;

-- Server-only reaction toggle RPC using an explicit actor user id.
drop function if exists public.toggle_reaction(text, uuid, text);

create or replace function public.toggle_reaction(
  actor_user_id uuid,
  input_target_type text,
  input_target_id uuid,
  input_reaction text
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  current_reaction public.reactions%rowtype;
begin
  if actor_user_id is null then
    raise exception '로그인이 필요합니다.';
  end if;

  if input_target_type not in ('post', 'comment') then
    raise exception '지원하지 않는 반응 대상입니다.';
  end if;

  if input_reaction not in ('like', 'dislike') then
    raise exception '지원하지 않는 반응 타입입니다.';
  end if;

  if input_target_type = 'post' then
    perform 1 from public.posts where id = input_target_id;
  else
    perform 1 from public.comments where id = input_target_id;
  end if;

  if not found then
    raise exception '반응 대상을 찾을 수 없습니다.';
  end if;

  select *
  into current_reaction
  from public.reactions
  where user_id = actor_user_id
    and target_type = input_target_type
    and target_id = input_target_id
  for update;

  if found then
    if current_reaction.reaction = input_reaction then
      delete from public.reactions
      where id = current_reaction.id;

      return null;
    end if;

    update public.reactions
    set reaction = input_reaction
    where id = current_reaction.id;

    return input_reaction;
  end if;

  insert into public.reactions (user_id, target_type, target_id, reaction)
  values (actor_user_id, input_target_type, input_target_id, input_reaction);

  return input_reaction;
end;
$$;

revoke all on function public.toggle_reaction(uuid, text, uuid, text) from public, anon, authenticated;
grant execute on function public.toggle_reaction(uuid, text, uuid, text) to service_role;
