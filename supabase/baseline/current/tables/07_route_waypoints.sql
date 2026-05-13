create table public.route_waypoints (
  id uuid default gen_random_uuid() not null,
  route_id uuid not null,
  sequence integer not null,
  lat double precision not null,
  lng double precision not null,
  created_at timestamp with time zone default now() not null,
  constraint route_waypoints_pkey primary key (id),
  constraint route_waypoints_route_sequence_unique unique (route_id, sequence),
  constraint route_waypoints_route_id_fkey foreign key (route_id) references public.routes(id) on delete cascade,
  constraint route_waypoints_sequence_positive check (sequence > 0)
);

create index route_waypoints_route_id_sequence_idx on public.route_waypoints using btree (route_id, sequence);

alter table public.route_waypoints enable row level security;

create policy route_waypoints_delete_route_owner_or_admin
on public.route_waypoints
as permissive
for delete
to public
using ((exists (select 1
   from (routes r
     left join profiles p on ((p.id = auth.uid())))
  where ((r.id = route_waypoints.route_id) and ((r.created_by = auth.uid()) or (p.role = 'admin'::text))))));

create policy route_waypoints_insert_route_owner_or_admin
on public.route_waypoints
as permissive
for insert
to public
with check ((exists (select 1
   from (routes r
     left join profiles p on ((p.id = auth.uid())))
  where ((r.id = route_waypoints.route_id) and ((r.created_by = auth.uid()) or (p.role = 'admin'::text))))));

create policy route_waypoints_select_all
on public.route_waypoints
as permissive
for select
to public
using (true);

create policy route_waypoints_update_route_owner_or_admin
on public.route_waypoints
as permissive
for update
to public
using ((exists (select 1
   from (routes r
     left join profiles p on ((p.id = auth.uid())))
  where ((r.id = route_waypoints.route_id) and ((r.created_by = auth.uid()) or (p.role = 'admin'::text))))))
with check ((exists (select 1
   from (routes r
     left join profiles p on ((p.id = auth.uid())))
  where ((r.id = route_waypoints.route_id) and ((r.created_by = auth.uid()) or (p.role = 'admin'::text))))));

grant all on table public.route_waypoints to anon;
grant all on table public.route_waypoints to authenticated;
grant all on table public.route_waypoints to service_role;
