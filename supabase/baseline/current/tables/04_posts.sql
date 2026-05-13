create table public.posts (
  id uuid default gen_random_uuid() not null,
  author_id uuid not null,
  category text not null,
  title text not null,
  content text not null,
  excerpt text not null,
  images text[] default '{}'::text[] not null,
  view_count integer default 0 not null,
  comment_count integer default 0 not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  pinned boolean,
  constraint posts_pkey primary key (id),
  constraint posts_author_id_fkey foreign key (author_id) references public.profiles(id) on delete cascade,
  constraint posts_category_check check (category = any (array['notice'::text, 'question'::text, 'info'::text, 'free'::text])),
  constraint posts_comment_count_check check (comment_count >= 0),
  constraint posts_view_count_check check (view_count >= 0)
);

comment on column public.posts.pinned is '상단 고정 게시슬';

create index idx_posts_author_id on public.posts using btree (author_id);
create index idx_posts_category_created_at on public.posts using btree (category, created_at desc);

alter table public.posts enable row level security;

create policy posts_delete_owner_or_admin
on public.posts
as permissive
for delete
to authenticated
using (((auth.uid() = author_id) or (exists (select 1
   from profiles p
  where ((p.id = auth.uid()) and (p.role = 'admin'::text))))));

create policy posts_insert_member_or_admin
on public.posts
as permissive
for insert
to authenticated
with check (((auth.uid() = author_id) and ((category <> 'notice'::text) or (exists (select 1
   from profiles p
  where ((p.id = auth.uid()) and (p.role = 'admin'::text)))))));

create policy posts_read_all
on public.posts
as permissive
for select
to anon, authenticated
using (true);

create policy posts_update_owner_or_admin
on public.posts
as permissive
for update
to authenticated
using (((auth.uid() = author_id) or (exists (select 1
   from profiles p
  where ((p.id = auth.uid()) and (p.role = 'admin'::text))))))
with check (((auth.uid() = author_id) or (exists (select 1
   from profiles p
  where ((p.id = auth.uid()) and (p.role = 'admin'::text))))));

grant all on table public.posts to anon;
grant all on table public.posts to authenticated;
grant all on table public.posts to service_role;

create trigger cleanup_post_favorites
after delete on public.posts
for each row execute function public.cleanup_favorites_for_target('post');

create trigger cleanup_post_reactions
after delete on public.posts
for each row execute function public.cleanup_reactions_for_target('post');

create trigger set_posts_updated_at
before update on public.posts
for each row execute function public.set_updated_at();

create or replace function public.increment_post_view_count(target_post_id uuid)
returns integer
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  next_view_count integer;
begin
  update public.posts
  set view_count = coalesce(view_count, 0) + 1
  where id = target_post_id
  returning view_count into next_view_count;

  return next_view_count;
end;
$function$;

grant execute on function public.increment_post_view_count(uuid) to anon;
grant execute on function public.increment_post_view_count(uuid) to authenticated;
grant execute on function public.increment_post_view_count(uuid) to service_role;
