create table public.reactions (
  id uuid default gen_random_uuid() not null,
  user_id uuid not null,
  target_type text not null,
  target_id uuid not null,
  reaction text not null,
  created_at timestamp with time zone default now() not null,
  constraint reactions_pkey primary key (id),
  constraint reactions_user_target_unique unique (user_id, target_type, target_id),
  constraint reactions_user_id_fkey foreign key (user_id) references public.profiles(id) on delete cascade,
  constraint reactions_reaction_check check (reaction = any (array['like'::text, 'dislike'::text])),
  constraint reactions_target_type_check check (target_type = any (array['post'::text, 'comment'::text]))
);

create index reactions_target_lookup_idx on public.reactions using btree (target_type, target_id, reaction);
create index reactions_user_lookup_idx on public.reactions using btree (user_id, target_type, target_id);

alter table public.reactions enable row level security;

create policy reactions_delete_own
on public.reactions
as permissive
for delete
to public
using ((auth.uid() = user_id));

create policy reactions_insert_own
on public.reactions
as permissive
for insert
to public
with check ((auth.uid() = user_id));

create policy reactions_select_all
on public.reactions
as permissive
for select
to public
using (true);

grant all on table public.reactions to anon;
grant all on table public.reactions to authenticated;
grant all on table public.reactions to service_role;

create or replace function public.toggle_reaction(
  input_target_type text,
  input_target_id uuid,
  input_reaction text
)
returns text
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  current_reaction public.reactions%rowtype;
begin
  if auth.uid() is null then
    raise exception '로그인이 필요합니다.';
  end if;

  if input_target_type not in ('post', 'comment') then
    raise exception '지원하지 않는 반응 대상입니다.';
  end if;

  if input_reaction not in ('like', 'dislike') then
    raise exception '지원하지 않는 반응 타입입니다.';
  end if;

  if input_target_type = 'post' then
    perform 1 from public.posts where id = input_target_id;
  else
    perform 1 from public.comments where id = input_target_id;
  end if;

  if not found then
    raise exception '반응 대상을 찾을 수 없습니다.';
  end if;

  select *
  into current_reaction
  from public.reactions
  where user_id = auth.uid()
    and target_type = input_target_type
    and target_id = input_target_id
  for update;

  if found then
    if current_reaction.reaction = input_reaction then
      delete from public.reactions
      where id = current_reaction.id;

      return null;
    end if;

    update public.reactions
    set reaction = input_reaction
    where id = current_reaction.id;

    return input_reaction;
  end if;

  insert into public.reactions (user_id, target_type, target_id, reaction)
  values (auth.uid(), input_target_type, input_target_id, input_reaction);

  return input_reaction;
end;
$function$;

grant execute on function public.toggle_reaction(text, uuid, text) to anon;
grant execute on function public.toggle_reaction(text, uuid, text) to authenticated;
grant execute on function public.toggle_reaction(text, uuid, text) to service_role;
