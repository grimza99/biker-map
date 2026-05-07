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
