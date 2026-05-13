create table public.favorites (
  id uuid default gen_random_uuid() not null,
  user_id uuid not null,
  target_type text not null,
  target_id uuid not null,
  created_at timestamp with time zone default now() not null,
  constraint favorites_pkey primary key (id),
  constraint favorites_user_target_unique unique (user_id, target_type, target_id),
  constraint favorites_user_id_fkey foreign key (user_id) references public.profiles(id) on delete cascade,
  constraint favorites_target_type_check check (target_type = any (array['post'::text, 'route'::text]))
);

create index favorites_target_lookup_idx on public.favorites using btree (target_type, target_id);
create index favorites_user_lookup_idx on public.favorites using btree (user_id, target_type, created_at desc);

alter table public.favorites enable row level security;

create policy favorites_delete_own
on public.favorites
as permissive
for delete
to public
using ((auth.uid() = user_id));

create policy favorites_insert_own
on public.favorites
as permissive
for insert
to public
with check ((auth.uid() = user_id));

create policy favorites_select_own
on public.favorites
as permissive
for select
to public
using ((auth.uid() = user_id));

grant all on table public.favorites to anon;
grant all on table public.favorites to authenticated;
grant all on table public.favorites to service_role;
