create table if not exists public.biker_presence (
  user_id uuid not null,
  lat double precision not null,
  lng double precision not null,
  accuracy_meters double precision,
  heading double precision,
  speed_kph double precision,
  observed_at timestamp with time zone not null,
  expires_at timestamp with time zone not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  constraint biker_presence_pkey primary key (user_id),
  constraint biker_presence_user_id_fkey foreign key (user_id) references public.profiles(id) on delete cascade,
  constraint biker_presence_lat_check check ((lat >= (-90)::double precision) and (lat <= (90)::double precision)),
  constraint biker_presence_lng_check check ((lng >= (-180)::double precision) and (lng <= (180)::double precision)),
  constraint biker_presence_accuracy_meters_check check ((accuracy_meters is null) or (accuracy_meters >= (0)::double precision)),
  constraint biker_presence_heading_check check ((heading is null) or ((heading >= (0)::double precision) and (heading < (360)::double precision))),
  constraint biker_presence_speed_kph_check check ((speed_kph is null) or (speed_kph >= (0)::double precision)),
  constraint biker_presence_expires_at_check check ((expires_at >= observed_at))
);

comment on table public.biker_presence is '현재 위치 공유 중인 유저의 최신 위치 1건만 보관하는 active presence 테이블';
comment on column public.biker_presence.observed_at is '디바이스가 해당 위치를 관측한 시각';
comment on column public.biker_presence.expires_at is '현재 presence row가 stale로 간주되는 만료 시각';

create index if not exists idx_biker_presence_expires_at
on public.biker_presence using btree (expires_at);

create index if not exists idx_biker_presence_updated_at_desc
on public.biker_presence using btree (updated_at desc);

alter table public.biker_presence enable row level security;

create policy biker_presence_read_own
on public.biker_presence
as permissive
for select
to authenticated
using ((auth.uid() = user_id));

create policy biker_presence_insert_own
on public.biker_presence
as permissive
for insert
to authenticated
with check ((auth.uid() = user_id));

create policy biker_presence_update_own
on public.biker_presence
as permissive
for update
to authenticated
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));

create policy biker_presence_delete_own
on public.biker_presence
as permissive
for delete
to authenticated
using ((auth.uid() = user_id));

grant all on table public.biker_presence to anon;
grant all on table public.biker_presence to authenticated;
grant all on table public.biker_presence to service_role;

create trigger set_biker_presence_updated_at
before update on public.biker_presence
for each row execute function private.set_updated_at();
