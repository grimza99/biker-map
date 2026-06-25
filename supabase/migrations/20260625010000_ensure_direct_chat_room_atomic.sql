create or replace function public.ensure_direct_chat_room(
  actor_user_id uuid,
  target_user_id uuid
)
returns table (
  room_id uuid,
  created boolean
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  ensured_room_id uuid;
  room_pair_key text;
begin
  if actor_user_id is null or target_user_id is null then
    raise exception '채팅방 참여자 식별자가 올바르지 않습니다.';
  end if;

  if actor_user_id = target_user_id then
    raise exception '자기 자신과의 채팅방은 만들 수 없습니다.';
  end if;

  if not exists (
    select 1
    from public.profiles profile_row
    where profile_row.id = actor_user_id
  ) then
    raise exception '채팅 요청 사용자를 찾을 수 없습니다.';
  end if;

  if not exists (
    select 1
    from public.profiles profile_row
    where profile_row.id = target_user_id
  ) then
    raise exception '채팅 상대 프로필을 찾을 수 없습니다.';
  end if;

  room_pair_key := least(actor_user_id::text, target_user_id::text)
    || ':'
    || greatest(actor_user_id::text, target_user_id::text);

  perform pg_advisory_xact_lock(hashtextextended(room_pair_key, 0));

  select room_row.id
  into ensured_room_id
  from public.chat_rooms room_row
  join public.chat_room_participants participant_row
    on participant_row.room_id = room_row.id
  where room_row.kind = 'direct'
    and participant_row.user_id in (actor_user_id, target_user_id)
  group by room_row.id
  having count(distinct participant_row.user_id) = 2
    and (
      select count(*)
      from public.chat_room_participants all_participant_row
      where all_participant_row.room_id = room_row.id
    ) = 2
  order by max(room_row.updated_at) desc, room_row.id desc
  limit 1;

  if ensured_room_id is not null then
    room_id := ensured_room_id;
    created := false;
    return next;
    return;
  end if;

  insert into public.chat_rooms (kind)
  values ('direct')
  returning id into ensured_room_id;

  insert into public.chat_room_participants (room_id, user_id)
  values
    (ensured_room_id, actor_user_id),
    (ensured_room_id, target_user_id);

  room_id := ensured_room_id;
  created := true;
  return next;
end;
$$;

revoke all on function public.ensure_direct_chat_room(uuid, uuid)
from public, anon, authenticated;

grant execute on function public.ensure_direct_chat_room(uuid, uuid)
to service_role;
