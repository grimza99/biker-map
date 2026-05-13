create table public.notifications (
  id uuid default gen_random_uuid() not null,
  user_id uuid not null,
  kind text not null,
  title text not null,
  message text not null,
  unread boolean default true not null,
  source_post_id uuid,
  source_comment_id uuid,
  source_route_id uuid,
  created_at timestamp with time zone default now() not null,
  read_at timestamp with time zone,
  url text,
  source_type text default 'system'::text,
  constraint notifications_pkey primary key (id),
  constraint notifications_source_comment_id_fkey foreign key (source_comment_id) references public.comments(id) on delete cascade,
  constraint notifications_source_post_id_fkey foreign key (source_post_id) references public.posts(id) on delete cascade,
  constraint notifications_source_route_id_fkey foreign key (source_route_id) references public.routes(id) on delete cascade,
  constraint notifications_user_id_fkey foreign key (user_id) references public.profiles(id) on delete cascade,
  constraint notifications_kind_check check (kind = any (array['comment'::text, 'reply'::text, 'reaction'::text, 'system'::text]))
);

create index idx_notifications_user_id_created_at on public.notifications using btree (user_id, created_at desc);
create index idx_notifications_user_id_unread_created_at on public.notifications using btree (user_id, unread, created_at desc);

alter table public.notifications enable row level security;

create policy notifications_read_own
on public.notifications
as permissive
for select
to authenticated
using ((auth.uid() = user_id));

create policy notifications_update_own
on public.notifications
as permissive
for update
to authenticated
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));

grant all on table public.notifications to anon;
grant all on table public.notifications to authenticated;
grant all on table public.notifications to service_role;
