create table if not exists public.reactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  target_type text not null,
  target_id uuid not null,
  reaction text not null,
  created_at timestamptz not null default now(),

  constraint reactions_target_type_check check (target_type in ('post', 'comment')),
  constraint reactions_reaction_check check (reaction in ('like', 'dislike')),
  constraint reactions_user_target_unique unique (user_id, target_type, target_id)
);

create index if not exists reactions_target_lookup_idx
on public.reactions (target_type, target_id, reaction);

create index if not exists reactions_user_lookup_idx
on public.reactions (user_id, target_type, target_id);

create or replace function public.cleanup_reactions_for_target()
returns trigger
language plpgsql
as $$
begin
  delete from public.reactions
  where target_type = TG_ARGV[0]
    and target_id = old.id;

  return old;
end;
$$;

drop trigger if exists cleanup_post_reactions on public.posts;
create trigger cleanup_post_reactions
after delete on public.posts
for each row
execute function public.cleanup_reactions_for_target('post');

drop trigger if exists cleanup_comment_reactions on public.comments;
create trigger cleanup_comment_reactions
after delete on public.comments
for each row
execute function public.cleanup_reactions_for_target('comment');

create or replace function public.toggle_reaction(
  input_target_type text,
  input_target_id uuid,
  input_reaction text
)
returns text
language plpgsql
security definer
set search_path = public
as $$
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
$$;

alter table public.reactions enable row level security;

create policy "reactions_select_all"
on public.reactions
for select
using (true);

create policy "reactions_insert_own"
on public.reactions
for insert
with check (auth.uid() = user_id);

create policy "reactions_delete_own"
on public.reactions
for delete
using (auth.uid() = user_id);

revoke all on function public.toggle_reaction(text, uuid, text) from public;
grant execute on function public.toggle_reaction(text, uuid, text) to authenticated;
grant execute on function public.toggle_reaction(text, uuid, text) to service_role;
