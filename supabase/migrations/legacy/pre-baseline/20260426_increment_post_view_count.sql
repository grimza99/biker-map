create or replace function public.increment_post_view_count(target_post_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  next_view_count integer;
begin
  update public.posts
  set view_count = coalesce(view_count, 0) + 1
  where id = target_post_id
  returning view_count into next_view_count;

  return next_view_count;
end;
$$;

revoke all on function public.increment_post_view_count(uuid) from public;
grant execute on function public.increment_post_view_count(uuid) to anon;
grant execute on function public.increment_post_view_count(uuid) to authenticated;
grant execute on function public.increment_post_view_count(uuid) to service_role;
