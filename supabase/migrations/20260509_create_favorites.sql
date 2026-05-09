create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  target_type text not null,
  target_id uuid not null,
  created_at timestamptz not null default now(),

  constraint favorites_target_type_check check (target_type in ('post', 'route')),
  constraint favorites_user_target_unique unique (user_id, target_type, target_id)
);

create index if not exists favorites_user_lookup_idx
on public.favorites (user_id, target_type, created_at desc);

create index if not exists favorites_target_lookup_idx
on public.favorites (target_type, target_id);

create or replace function public.cleanup_favorites_for_target()
returns trigger
language plpgsql
as $$
begin
  delete from public.favorites
  where target_type = TG_ARGV[0]
    and target_id = old.id;

  return old;
end;
$$;

drop trigger if exists cleanup_post_favorites on public.posts;
create trigger cleanup_post_favorites
after delete on public.posts
for each row
execute function public.cleanup_favorites_for_target('post');

drop trigger if exists cleanup_route_favorites on public.routes;
create trigger cleanup_route_favorites
after delete on public.routes
for each row
execute function public.cleanup_favorites_for_target('route');

alter table public.favorites enable row level security;

drop policy if exists "favorites_select_own" on public.favorites;
create policy "favorites_select_own"
on public.favorites
for select
using (auth.uid() = user_id);

drop policy if exists "favorites_insert_own" on public.favorites;
create policy "favorites_insert_own"
on public.favorites
for insert
with check (auth.uid() = user_id);

drop policy if exists "favorites_delete_own" on public.favorites;
create policy "favorites_delete_own"
on public.favorites
for delete
using (auth.uid() = user_id);
