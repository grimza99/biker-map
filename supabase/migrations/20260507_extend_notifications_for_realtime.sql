alter table public.notifications
add column if not exists source_type text,
add column if not exists source_comment_id uuid references public.comments(id) on delete set null;

update public.notifications
set source_type = case
  when kind = 'system' then 'system'
  else coalesce(source_type, 'post')
end
where source_type is null;

alter table public.notifications
alter column source_type set default 'system';
