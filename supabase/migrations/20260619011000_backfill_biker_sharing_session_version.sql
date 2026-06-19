create sequence if not exists public.biker_sharing_session_session_version_seq;

alter sequence public.biker_sharing_session_session_version_seq
owned by none;

alter table if exists public.biker_sharing_session
add column if not exists session_version bigint;

alter table if exists public.biker_sharing_session
alter column session_version set default nextval('public.biker_sharing_session_session_version_seq');

update public.biker_sharing_session
set session_version = nextval('public.biker_sharing_session_session_version_seq')
where session_version is null;

alter table if exists public.biker_sharing_session
alter column session_version set not null;

comment on column public.biker_sharing_session.session_version is 'sharing on/off/location 요청의 순서 보장과 stale session 구분에 사용하는 단조 증가 버전';

create unique index if not exists uniq_biker_sharing_session_user_version
on public.biker_sharing_session using btree (user_id, session_version);

create index if not exists idx_biker_sharing_session_user_id_version_desc
on public.biker_sharing_session using btree (user_id, session_version desc);
