alter table public.profiles
  add column if not exists bike_brand text,
  add column if not exists bike_model text;
