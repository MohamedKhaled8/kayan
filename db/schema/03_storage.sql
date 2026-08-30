-- Storage bucket for product photography: public read, admin-only writes.

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "Product images are publicly viewable"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'product-images');

create policy "Admins can upload product images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-images' and public.is_admin(auth.uid()));

create policy "Admins can update product images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'product-images' and public.is_admin(auth.uid()));

create policy "Admins can delete product images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images' and public.is_admin(auth.uid()));
