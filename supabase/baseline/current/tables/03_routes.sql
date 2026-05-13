create table public.routes (
  id uuid default gen_random_uuid() not null,
  title text not null,
  departure_region text not null,
  summary text not null,
  provider text not null,
  external_map_url text not null,
  thumbnail_url text,
  distance_km numeric,
  estimated_duration_minutes integer,
  tags text[] default '{}'::text[] not null,
  created_by uuid,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  source_type text not null,
  content text,
  destination_region text,
  departure_lat double precision,
  departure_lng double precision,
  destination_lat double precision,
  destination_lng double precision,
  directions_calculated_at timestamp with time zone,
  constraint routes_pkey primary key (id),
  constraint routes_created_by_fkey foreign key (created_by) references public.profiles(id) on delete set null,
  constraint routes_provider_check check (provider = any (array['naver'::text, 'kakao'::text, 'google'::text, 'etc'::text])),
  constraint routes_source_type_check check (source_type = any (array['curated'::text, 'user'::text]))
);

create index idx_routes_created_by on public.routes using btree (created_by);
create index idx_routes_region_created_at on public.routes using btree (departure_region, created_at desc);

alter table public.routes enable row level security;

create policy routes_admin_write
on public.routes
as permissive
for all
to authenticated
using ((exists (select 1
   from profiles p
  where ((p.id = auth.uid()) and (p.role = 'admin'::text)))))
with check ((exists (select 1
   from profiles p
  where ((p.id = auth.uid()) and (p.role = 'admin'::text)))));

create policy routes_read_all
on public.routes
as permissive
for select
to anon, authenticated
using (true);

grant all on table public.routes to anon;
grant all on table public.routes to authenticated;
grant all on table public.routes to service_role;

create trigger cleanup_route_favorites
after delete on public.routes
for each row execute function public.cleanup_favorites_for_target('route');

create trigger set_routes_updated_at
before update on public.routes
for each row execute function public.set_updated_at();
