-- The import-uploads bucket itself is created via the Supabase dashboard
-- (Storage → New bucket → "import-uploads", Public bucket = OFF), the same
-- manual step already used for product-media/brand-logos. Unlike
-- product-media, this bucket must stay private — raw uploaded spreadsheets
-- can carry supplier pricing/cost columns, not public-facing content — so
-- reads need an explicit policy too, not just writes.
create policy "staff read import uploads" on storage.objects
  for select using (bucket_id = 'import-uploads' and is_editor_or_admin());

create policy "staff upload import uploads" on storage.objects
  for insert with check (bucket_id = 'import-uploads' and is_editor_or_admin());

create policy "staff update import uploads" on storage.objects
  for update using (bucket_id = 'import-uploads' and is_editor_or_admin());

create policy "staff delete import uploads" on storage.objects
  for delete using (bucket_id = 'import-uploads' and is_editor_or_admin());
