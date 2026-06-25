create sequence if not exists public.chat_message_order_seq;

alter table public.chat_messages
add column if not exists message_order bigint;

alter table public.chat_messages
alter column message_order set default nextval('public.chat_message_order_seq');

with ordered_messages as (
  select
    id,
    row_number() over (order by created_at asc, id asc) as next_message_order
  from public.chat_messages
)
update public.chat_messages chat_message
set message_order = ordered_messages.next_message_order
from ordered_messages
where chat_message.id = ordered_messages.id
  and chat_message.message_order is null;

select setval(
  'public.chat_message_order_seq',
  coalesce((select max(message_order) from public.chat_messages), 0)
);

alter table public.chat_messages
alter column message_order set not null;

create unique index if not exists uniq_chat_messages_message_order
on public.chat_messages using btree (message_order);

drop index if exists idx_chat_messages_room_id_created_at_desc;

create index if not exists idx_chat_messages_room_id_message_order_desc
on public.chat_messages using btree (room_id, message_order desc);

comment on column public.chat_messages.message_order is '채팅 메시지 unread/read 경계 계산용 전역 단조 증가 순서값';
