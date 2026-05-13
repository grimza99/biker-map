create table public.profiles (
  id uuid not null,
  name text not null,
  email text,
  avatar_url text,
  role text default 'member'::text not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  deleted_at timestamp with time zone,
  avatar_path text,
  constraint profiles_pkey primary key (id),
  constraint profiles_id_fkey foreign key (id) references auth.users(id) on delete cascade,
  constraint profiles_role_check check (role = any (array['member'::text, 'admin'::text]))
);

comment on column public.profiles.avatar_path is '프로필 이미지가 있는 버킷 주소(버킷의 이미지 삭제용)';

alter table public.profiles enable row level security;

create policy profiles_read_all
on public.profiles
as permissive
for select
to anon, authenticated
using (true);

create policy profiles_update_self_or_admin
on public.profiles
as permissive
for update
to authenticated
using (((auth.uid() = id) or (exists (select 1
   from profiles p
  where ((p.id = auth.uid()) and (p.role = 'admin'::text))))))
with check (((auth.uid() = id) or (exists (select 1
   from profiles p
  where ((p.id = auth.uid()) and (p.role = 'admin'::text))))));

grant all on table public.profiles to anon;
grant all on table public.profiles to authenticated;
grant all on table public.profiles to service_role;

create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  insert into public.profiles (
    id,
    name,
    email,
    avatar_url,
    role
  )
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'display_name',
      split_part(coalesce(new.email, ''), '@', 1),
      'member'
    ),
    new.email,
    null,
    'member'
  )
  on conflict (id) do nothing;

  return new;
end;
$function$;

grant execute on function public.handle_new_user() to public;
grant execute on function public.handle_new_user() to anon;
grant execute on function public.handle_new_user() to authenticated;
grant execute on function public.handle_new_user() to service_role;
