create or replace function private.is_chat_room_participant(
  target_room_id uuid,
  target_user_id uuid default auth.uid()
)
returns boolean
language sql
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.chat_room_participants cp
    where cp.room_id = target_room_id
      and cp.user_id = target_user_id
  );
$$;

revoke all on function private.is_chat_room_participant(uuid, uuid)
from public, anon, authenticated, service_role;

grant execute on function private.is_chat_room_participant(uuid, uuid)
to authenticated, service_role;

drop policy if exists chat_rooms_select_participant
on public.chat_rooms;

create policy chat_rooms_select_participant
on public.chat_rooms
as permissive
for select
to authenticated
using (
  private.is_chat_room_participant(chat_rooms.id)
);

drop policy if exists chat_room_participants_select_same_room_participant
on public.chat_room_participants;

create policy chat_room_participants_select_same_room_participant
on public.chat_room_participants
as permissive
for select
to authenticated
using (
  private.is_chat_room_participant(chat_room_participants.room_id)
);

drop policy if exists chat_messages_select_same_room_participant
on public.chat_messages;

create policy chat_messages_select_same_room_participant
on public.chat_messages
as permissive
for select
to authenticated
using (
  private.is_chat_room_participant(chat_messages.room_id)
);

drop policy if exists chat_messages_insert_own_same_room_participant
on public.chat_messages;

create policy chat_messages_insert_own_same_room_participant
on public.chat_messages
as permissive
for insert
to authenticated
with check (
  auth.uid() = author_id
  and private.is_chat_room_participant(chat_messages.room_id)
);

drop policy if exists chat_realtime_messages_select_room_participant
on realtime.messages;

create policy chat_realtime_messages_select_room_participant
on realtime.messages
as permissive
for select
to authenticated
using (
  realtime.messages.extension = 'broadcast'
  and private.is_chat_room_participant(
    nullif(replace((select realtime.topic()), 'chat:room:', ''), '')::uuid
  )
);

drop policy if exists chat_realtime_messages_insert_room_participant
on realtime.messages;

create policy chat_realtime_messages_insert_room_participant
on realtime.messages
as permissive
for insert
to authenticated
with check (
  realtime.messages.extension = 'broadcast'
  and private.is_chat_room_participant(
    nullif(replace((select realtime.topic()), 'chat:room:', ''), '')::uuid
  )
);
