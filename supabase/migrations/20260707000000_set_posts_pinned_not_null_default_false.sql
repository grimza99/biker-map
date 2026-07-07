begin;

update public.posts
set pinned = false
where pinned is null;

alter table public.posts
alter column pinned set default false;

alter table public.posts
alter column pinned set not null;

commit;
