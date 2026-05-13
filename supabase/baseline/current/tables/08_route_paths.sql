create table public.route_paths (
  route_id uuid not null,
  path jsonb not null,
  raw_summary jsonb,
  raw_response jsonb,
  calculated_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  constraint route_paths_pkey primary key (route_id),
  constraint route_paths_route_id_fkey foreign key (route_id) references public.routes(id) on delete cascade,
  constraint route_paths_path_array_check check (jsonb_typeof(path) = 'array'::text)
);

alter table public.route_paths enable row level security;

create policy route_paths_delete_route_owner_or_admin
on public.route_paths
as permissive
for delete
to public
using ((exists (select 1
   from (routes r
     left join profiles p on ((p.id = auth.uid())))
  where ((r.id = route_paths.route_id) and ((r.created_by = auth.uid()) or (p.role = 'admin'::text))))));

create policy route_paths_insert_route_owner_or_admin
on public.route_paths
as permissive
for insert
to public
with check ((exists (select 1
   from (routes r
     left join profiles p on ((p.id = auth.uid())))
  where ((r.id = route_paths.route_id) and ((r.created_by = auth.uid()) or (p.role = 'admin'::text))))));

create policy route_paths_select_all
on public.route_paths
as permissive
for select
to public
using (true);

create policy route_paths_update_route_owner_or_admin
on public.route_paths
as permissive
for update
to public
using ((exists (select 1
   from (routes r
     left join profiles p on ((p.id = auth.uid())))
  where ((r.id = route_paths.route_id) and ((r.created_by = auth.uid()) or (p.role = 'admin'::text))))))
with check ((exists (select 1
   from (routes r
     left join profiles p on ((p.id = auth.uid())))
  where ((r.id = route_paths.route_id) and ((r.created_by = auth.uid()) or (p.role = 'admin'::text))))));

grant all on table public.route_paths to anon;
grant all on table public.route_paths to authenticated;
grant all on table public.route_paths to service_role;
