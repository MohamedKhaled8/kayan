# Database schema — prepared, not connected

No Supabase project is provisioned or connected. The SQL in `db/schema/` is
ready to run against your own project.

## Run in order

1. `schema/01_admin_roles.sql` — `app_role` enum, `user_roles` table,
   `has_role()` / `is_admin()` security-definer helpers.
2. `schema/02_products.sql` — `products`, `product_images`, grants, RLS
   policies (public read, admin-only writes), `updated_at` trigger.
3. `schema/03_storage.sql` — public `product-images` storage bucket with
   admin-only write policies.

Paste each file into the Supabase SQL editor, or copy them into
`supabase/migrations/` in your own repo and run `supabase db push`.

## Creating the admin user

1. Auth → Users → **Add user** (email + password). Keep public sign-up
   disabled in Auth settings so the dashboard stays admin-only.
2. `insert into public.user_roles (user_id, role) values ('<uuid>', 'admin');`

## Wiring the app afterwards

Two files are the only seams:

- `src/lib/admin-auth.ts` — replace with `supabase.auth.signInWithPassword`,
  `signOut`, and `onAuthStateChange`; gate `/admin` on `is_admin`.
- `src/lib/product-store.ts` — replace `read`/`write` with queries against
  `products` + `product_images` (order images by `sort_order`), and upload
  files to the `product-images` bucket instead of holding data URLs.

Routes, components, and the design system need no changes.
