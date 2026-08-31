-- ==============================================================================
-- KAYAN CAFÉ DATABASE SCHEMA (Supabase PostgreSQL)
-- Run this script in the Supabase SQL Editor: Dashboard -> SQL Editor -> New query
-- ==============================================================================

-- 1. Create CATEGORIES Table
create table if not exists public.categories (
  id text primary key,
  name text not null,
  description text default '',
  icon text default 'Coffee',
  sort_order integer default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Create PRODUCTS Table
create table if not exists public.products (
  id text primary key,
  name text not null,
  description text default '',
  price numeric(10, 2) not null default 0,
  category text not null,
  images text[] default array[]::text[],
  featured boolean default false,
  preparation_time text default '',
  calories integer default 0,
  is_available boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Enable Row Level Security (RLS)
alter table public.categories enable row level security;
alter table public.products enable row level security;

-- 4. Policies for Categories
drop policy if exists "Categories are publicly readable" on public.categories;
create policy "Categories are publicly readable"
  on public.categories for select
  to anon, authenticated
  using (true);

drop policy if exists "Categories can be inserted" on public.categories;
create policy "Categories can be inserted"
  on public.categories for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Categories can be updated" on public.categories;
create policy "Categories can be updated"
  on public.categories for update
  to anon, authenticated
  using (true);

drop policy if exists "Categories can be deleted" on public.categories;
create policy "Categories can be deleted"
  on public.categories for delete
  to anon, authenticated
  using (true);

-- 5. Policies for Products
drop policy if exists "Products are publicly readable" on public.products;
create policy "Products are publicly readable"
  on public.products for select
  to anon, authenticated
  using (true);

drop policy if exists "Products can be inserted" on public.products;
create policy "Products can be inserted"
  on public.products for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Products can be updated" on public.products;
create policy "Products can be updated"
  on public.products for update
  to anon, authenticated
  using (true);

drop policy if exists "Products can be deleted" on public.products;
create policy "Products can be deleted"
  on public.products for delete
  to anon, authenticated
  using (true);

-- 6. Enable Realtime Publications on both tables
alter publication supabase_realtime add table public.categories;
alter publication supabase_realtime add table public.products;
