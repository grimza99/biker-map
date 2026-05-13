create table public.comments (
  id uuid default gen_random_uuid() not null,
  post_id uuid not null,
  author_id uuid not null,
  parent_comment_id uuid,
  content text not null,
  reply_count integer default 0 not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  constraint comments_pkey primary key (id),
  constraint comments_author_id_fkey foreign key (author_id) references public.profiles(id) on delete cascade,
  constraint comments_parent_comment_id_fkey foreign key (parent_comment_id) references public.comments(id) on delete cascade,
  constraint comments_post_id_fkey foreign key (post_id) references public.posts(id) on delete cascade,
  constraint comments_reply_count_check check (reply_count >= 0)
);

create index idx_comments_author_id on public.comments using btree (author_id);
create index idx_comments_parent_comment_id on public.comments using btree (parent_comment_id);
create index idx_comments_post_id_created_at on public.comments using btree (post_id, created_at);

alter table public.comments enable row level security;

create policy comments_delete_owner_or_admin
on public.comments
as permissive
for delete
to authenticated
using (((auth.uid() = author_id) or (exists (select 1
   from profiles p
  where ((p.id = auth.uid()) and (p.role = 'admin'::text))))));

create policy comments_insert_member_or_admin
on public.comments
as permissive
for insert
to authenticated
with check ((auth.uid() = author_id));

create policy comments_read_all
on public.comments
as permissive
for select
to anon, authenticated
using (true);

create policy comments_update_owner_or_admin
on public.comments
as permissive
for update
to authenticated
using (((auth.uid() = author_id) or (exists (select 1
   from profiles p
  where ((p.id = auth.uid()) and (p.role = 'admin'::text))))))
with check (((auth.uid() = author_id) or (exists (select 1
   from profiles p
  where ((p.id = auth.uid()) and (p.role = 'admin'::text))))));

grant all on table public.comments to anon;
grant all on table public.comments to authenticated;
grant all on table public.comments to service_role;

create trigger cleanup_comment_reactions
after delete on public.comments
for each row execute function public.cleanup_reactions_for_target('comment');

create trigger set_comments_updated_at
before update on public.comments
for each row execute function public.set_updated_at();

create trigger sync_post_comment_count_on_delete
after delete on public.comments
for each row execute function public.sync_post_comment_count();

create trigger sync_post_comment_count_on_insert
after insert on public.comments
for each row execute function public.sync_post_comment_count();
