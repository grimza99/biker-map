alter table public.posts
add column if not exists favorite_count integer not null default 0;

alter table public.posts
drop constraint if exists posts_favorite_count_check;

alter table public.posts
add constraint posts_favorite_count_check check (favorite_count >= 0);

update public.posts p
set favorite_count = coalesce(f.favorite_count, 0)
from (
  select target_id as post_id, count(*)::integer as favorite_count
  from public.favorites
  where target_type = 'post'
  group by target_id
) f
where p.id = f.post_id;

update public.posts
set favorite_count = 0
where id not in (
  select target_id
  from public.favorites
  where target_type = 'post'
);

create or replace function private.sync_post_favorite_count()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if tg_op = 'INSERT' then
    if new.target_type = 'post' then
      update public.posts
      set favorite_count = favorite_count + 1
      where id = new.target_id;
    end if;

    return new;
  elsif tg_op = 'DELETE' then
    if old.target_type = 'post' then
      update public.posts
      set favorite_count = greatest(favorite_count - 1, 0)
      where id = old.target_id;
    end if;

    return old;
  end if;

  return null;
end;
$function$;

revoke all on function private.sync_post_favorite_count() from public, anon, authenticated, service_role;

drop trigger if exists sync_post_favorite_count_on_insert on public.favorites;
create trigger sync_post_favorite_count_on_insert
after insert on public.favorites
for each row execute function private.sync_post_favorite_count();

drop trigger if exists sync_post_favorite_count_on_delete on public.favorites;
create trigger sync_post_favorite_count_on_delete
after delete on public.favorites
for each row execute function private.sync_post_favorite_count();
