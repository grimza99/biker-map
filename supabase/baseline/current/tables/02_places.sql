create table public.places (
  id uuid default gen_random_uuid() not null,
  name text not null,
  category text not null,
  address text not null,
  phone text,
  description text,
  lat double precision not null,
  lng double precision not null,
  images text[] default '{}'::text[] not null,
  naver_place_url text not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  constraint places_pkey primary key (id),
  constraint places_category_check check (category = any (array['gas'::text, 'repair'::text, 'cafe'::text, 'shop'::text, 'rest'::text]))
);

create index idx_places_category on public.places using btree (category);
create index idx_places_lat_lng on public.places using btree (lat, lng);

alter table public.places enable row level security;

create policy places_admin_write
on public.places
as permissive
for all
to authenticated
using ((exists (select 1
   from profiles p
  where ((p.id = auth.uid()) and (p.role = 'admin'::text)))))
with check ((exists (select 1
   from profiles p
  where ((p.id = auth.uid()) and (p.role = 'admin'::text)))));

create policy places_read_all
on public.places
as permissive
for select
to anon, authenticated
using (true);

grant all on table public.places to anon;
grant all on table public.places to authenticated;
grant all on table public.places to service_role;

create trigger set_places_updated_at
before update on public.places
for each row execute function public.set_updated_at();
