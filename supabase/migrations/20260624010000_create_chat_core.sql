create table if not exists public.chat_rooms (
  id uuid default gen_random_uuid() not null,
  kind text not null default 'direct',
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  constraint chat_rooms_pkey primary key (id),
  constraint chat_rooms_kind_check check (
    kind = any (array['direct'::text])
  )
);

comment on table public.chat_rooms is '모바일 1:1 채팅방 메타 테이블';

create table if not exists public.chat_room_participants (
  room_id uuid not null,
  user_id uuid not null,
  joined_at timestamp with time zone default now() not null,
  last_read_message_id uuid,
  last_read_at timestamp with time zone,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  constraint chat_room_participants_pkey primary key (room_id, user_id),
  constraint chat_room_participants_room_id_fkey foreign key (room_id) references public.chat_rooms(id) on delete cascade,
  constraint chat_room_participants_user_id_fkey foreign key (user_id) references public.profiles(id) on delete cascade
);

comment on table public.chat_room_participants is '채팅방 참가자와 마지막 읽음 상태를 보관하는 테이블';

create table if not exists public.chat_messages (
  id uuid default gen_random_uuid() not null,
  room_id uuid not null,
  author_id uuid not null,
  body text not null,
  client_message_id text,
  created_at timestamp with time zone default now() not null,
  constraint chat_messages_pkey primary key (id),
  constraint chat_messages_room_id_fkey foreign key (room_id) references public.chat_rooms(id) on delete cascade,
  constraint chat_messages_author_id_fkey foreign key (author_id) references public.profiles(id) on delete cascade,
  constraint chat_messages_body_check check (
    char_length(btrim(body)) >= 1
    and char_length(btrim(body)) <= 2000
  )
);

comment on table public.chat_messages is '채팅 메시지 본문과 작성 시각을 보관하는 테이블';
comment on column public.chat_messages.client_message_id is '모바일 중복 전송 방지용 클라이언트 메시지 식별자';

alter table public.chat_room_participants
add constraint chat_room_participants_last_read_message_id_fkey
foreign key (last_read_message_id) references public.chat_messages(id)
on delete set null;

create index if not exists idx_chat_room_participants_user_id_joined_at_desc
on public.chat_room_participants using btree (user_id, joined_at desc);

create index if not exists idx_chat_messages_room_id_created_at_desc
on public.chat_messages using btree (room_id, created_at desc, id desc);

create unique index if not exists uniq_chat_messages_room_author_client_message_id
on public.chat_messages using btree (room_id, author_id, client_message_id)
where (client_message_id is not null);

alter table public.chat_rooms enable row level security;
alter table public.chat_room_participants enable row level security;
alter table public.chat_messages enable row level security;

create policy chat_rooms_select_participant
on public.chat_rooms
as permissive
for select
to authenticated
using (
  exists (
    select 1
    from public.chat_room_participants cp
    where cp.room_id = chat_rooms.id
      and cp.user_id = auth.uid()
  )
);

create policy chat_room_participants_select_same_room_participant
on public.chat_room_participants
as permissive
for select
to authenticated
using (
  exists (
    select 1
    from public.chat_room_participants viewer
    where viewer.room_id = chat_room_participants.room_id
      and viewer.user_id = auth.uid()
  )
);

create policy chat_messages_select_same_room_participant
on public.chat_messages
as permissive
for select
to authenticated
using (
  exists (
    select 1
    from public.chat_room_participants cp
    where cp.room_id = chat_messages.room_id
      and cp.user_id = auth.uid()
  )
);

create policy chat_messages_insert_own_same_room_participant
on public.chat_messages
as permissive
for insert
to authenticated
with check (
  auth.uid() = author_id
  and exists (
    select 1
    from public.chat_room_participants cp
    where cp.room_id = chat_messages.room_id
      and cp.user_id = auth.uid()
  )
);

create policy chat_realtime_messages_select_room_participant
on realtime.messages
as permissive
for select
to authenticated
using (
  realtime.messages.extension = 'broadcast'
  and exists (
    select 1
    from public.chat_room_participants cp
    where cp.user_id = (select auth.uid())
      and ('chat:room:' || cp.room_id::text) = (select realtime.topic())
  )
);

create policy chat_realtime_messages_insert_room_participant
on realtime.messages
as permissive
for insert
to authenticated
with check (
  realtime.messages.extension = 'broadcast'
  and exists (
    select 1
    from public.chat_room_participants cp
    where cp.user_id = (select auth.uid())
      and ('chat:room:' || cp.room_id::text) = (select realtime.topic())
  )
);

grant all on table public.chat_rooms to anon;
grant all on table public.chat_rooms to authenticated;
grant all on table public.chat_rooms to service_role;

grant all on table public.chat_room_participants to anon;
grant all on table public.chat_room_participants to authenticated;
grant all on table public.chat_room_participants to service_role;

grant all on table public.chat_messages to anon;
grant all on table public.chat_messages to authenticated;
grant all on table public.chat_messages to service_role;

create or replace function private.sync_chat_room_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  update public.chat_rooms
  set updated_at = new.created_at
  where id = new.room_id;

  return new;
end;
$$;

create trigger set_chat_rooms_updated_at
before update on public.chat_rooms
for each row execute function private.set_updated_at();

create trigger set_chat_room_participants_updated_at
before update on public.chat_room_participants
for each row execute function private.set_updated_at();

create trigger sync_chat_room_updated_at_on_message_insert
after insert on public.chat_messages
for each row execute function private.sync_chat_room_updated_at();
