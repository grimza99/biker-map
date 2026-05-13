-- Current storage state used by the application.

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'biker-map-assets',
  'biker-map-assets',
  true,
  null,
  null
)
on conflict (id) do update
set
  name = excluded.name,
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "authenticated can delete own route images"
on storage.objects
as permissive
for delete
to authenticated
using (
  (bucket_id = 'biker-map-assets'::text)
  and ((storage.foldername(name))[1] = 'routes'::text)
  and ((storage.foldername(name))[2] = (auth.uid())::text)
);

create policy "authenticated can update own route images"
on storage.objects
as permissive
for update
to authenticated
using (
  (bucket_id = 'biker-map-assets'::text)
  and ((storage.foldername(name))[1] = 'routes'::text)
  and ((storage.foldername(name))[2] = (auth.uid())::text)
)
with check (
  (bucket_id = 'biker-map-assets'::text)
  and ((storage.foldername(name))[1] = 'routes'::text)
  and ((storage.foldername(name))[2] = (auth.uid())::text)
);

create policy "authenticated can upload own route images"
on storage.objects
as permissive
for insert
to authenticated
with check (
  (bucket_id = 'biker-map-assets'::text)
  and ((storage.foldername(name))[1] = 'routes'::text)
  and ((storage.foldername(name))[2] = (auth.uid())::text)
);
