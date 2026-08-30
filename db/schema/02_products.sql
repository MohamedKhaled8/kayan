-- Maison Café — products and product images.
-- Public menu is readable by anyone; writes are admin-only.

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  price numeric(10, 2) not null check (price >= 0),
  category text not null check (category in ('Hot Drinks', 'Cold Drinks', 'Pastries', 'Specials')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select on public.products to anon;
grant select, insert, update, delete on public.products to authenticated;
grant all on public.products to service_role;

alter table public.products enable row level security;

create policy "Menu is publicly readable"
  on public.products for select
  to anon, authenticated
  using (true);

create policy "Admins can insert products"
  on public.products for insert
  to authenticated
  with check (public.is_admin(auth.uid()));

create policy "Admins can update products"
  on public.products for update
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create policy "Admins can delete products"
  on public.products for delete
  to authenticated
  using (public.is_admin(auth.uid()));

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  image_url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists product_images_product_id_idx
  on public.product_images (product_id, sort_order);

grant select on public.product_images to anon;
grant select, insert, update, delete on public.product_images to authenticated;
grant all on public.product_images to service_role;

alter table public.product_images enable row level security;

create policy "Product images are publicly readable"
  on public.product_images for select
  to anon, authenticated
  using (true);

create policy "Admins can insert product images"
  on public.product_images for insert
  to authenticated
  with check (public.is_admin(auth.uid()));

create policy "Admins can update product images"
  on public.product_images for update
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create policy "Admins can delete product images"
  on public.product_images for delete
  to authenticated
  using (public.is_admin(auth.uid()));

-- keep updated_at fresh
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_touch_updated_at on public.products;
create trigger products_touch_updated_at
  before update on public.products
  for each row execute function public.touch_updated_at();
