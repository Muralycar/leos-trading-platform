-- The product-media bucket itself is created via the Storage Admin API
-- (public: true — public GET via the object's public URL needs no RLS),
-- not a table migration, so it isn't in this file. Bucket-marked-public
-- only covers reads through the public URL; writes to storage.objects
-- still go through RLS regardless, so uploads/updates/deletes need
-- explicit policies here, reusing is_editor_or_admin() from 0001.

create policy "staff upload product media" on storage.objects
  for insert with check (bucket_id = 'product-media' and is_editor_or_admin());

create policy "staff update product media" on storage.objects
  for update using (bucket_id = 'product-media' and is_editor_or_admin());

create policy "staff delete product media" on storage.objects
  for delete using (bucket_id = 'product-media' and is_editor_or_admin());
