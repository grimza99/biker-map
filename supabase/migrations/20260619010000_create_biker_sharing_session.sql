create table if not exists public.biker_sharing_session (
  session_id uuid default gen_random_uuid() not null,
  user_id uuid not null,
  status text not null default 'active',
  started_at timestamp with time zone default now() not null,
  ended_at timestamp with time zone,
  guard_expires_at timestamp with time zone,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  constraint biker_sharing_session_pkey primary key (session_id),
  constraint biker_sharing_session_user_id_fkey foreign key (user_id) references public.profiles(id) on delete cascade,
  constraint biker_sharing_session_status_check check (
    status = any (array['active'::text, 'ended'::text])
  ),
  constraint biker_sharing_session_state_check check (
    (
      status = 'active'::text
      and ended_at is null
      and guard_expires_at is null
    )
    or
    (
      status = 'ended'::text
      and ended_at is not null
      and guard_expires_at is not null
      and guard_expires_at >= ended_at
    )
  )
);

comment on table public.biker_sharing_session is '위치 데이터 없이 live biker sharing session 유효성만 관리하는 세션 테이블';
comment on column public.biker_sharing_session.guard_expires_at is '종료된 세션 row를 늦게 도착한 location 요청 필터링용으로 유지하는 만료 시각';

create unique index if not exists uniq_biker_sharing_session_active_user
on public.biker_sharing_session using btree (user_id)
where (status = 'active'::text);

create index if not exists idx_biker_sharing_session_guard_expires_at
on public.biker_sharing_session using btree (guard_expires_at)
where (status = 'ended'::text);

create index if not exists idx_biker_sharing_session_user_id_started_at_desc
on public.biker_sharing_session using btree (user_id, started_at desc);

alter table public.biker_sharing_session enable row level security;

create policy biker_sharing_session_read_own
on public.biker_sharing_session
as permissive
for select
to authenticated
using ((auth.uid() = user_id));

create policy biker_sharing_session_insert_own
on public.biker_sharing_session
as permissive
for insert
to authenticated
with check ((auth.uid() = user_id));

create policy biker_sharing_session_update_own
on public.biker_sharing_session
as permissive
for update
to authenticated
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));

create policy biker_sharing_session_delete_own
on public.biker_sharing_session
as permissive
for delete
to authenticated
using ((auth.uid() = user_id));

grant all on table public.biker_sharing_session to anon;
grant all on table public.biker_sharing_session to authenticated;
grant all on table public.biker_sharing_session to service_role;

create trigger set_biker_sharing_session_updated_at
before update on public.biker_sharing_session
for each row execute function private.set_updated_at();
