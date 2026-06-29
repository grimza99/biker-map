do $$
begin
  if exists (
    select 1
    from public.places
    where category not in ('gas', 'repair', 'cafe', 'shop')
  ) then
    raise exception
      'places contains unsupported categories; clean the data before restricting places_category_check';
  end if;
end
$$;

alter table public.places
  drop constraint if exists places_category_check;

alter table public.places
  add constraint places_category_check
  check (category in ('gas', 'repair', 'cafe', 'shop'));
