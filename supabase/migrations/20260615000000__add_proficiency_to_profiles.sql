do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'user_proficiency'
  ) then
    create type public.user_proficiency as enum ('beginner', 'intermediate', 'advanced');
  end if;
end
$$;

alter table public.profiles
add column if not exists proficiency public.user_proficiency;