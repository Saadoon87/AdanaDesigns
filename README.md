# Adana Designs

Private mobile-first admin app for managing a handmade jewelry business.

## What Is Included

- Supabase email/password login with approved-email allowlist checks.
- Protected dashboard layout with mobile bottom navigation and desktop sidebar.
- Products with stock, pricing, images, categories, statuses, edit, and archive.
- Customers, sales orders, shipping tracking, expenses, and reports.
- SQL migration for schema, RLS policies, private storage bucket, and sale stock RPCs.

## Local Setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Create `.env.local` from `.env.example`:

   ```bash
   copy .env.example .env.local
   ```

3. Fill in:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
   ```

4. Run the app:

   ```bash
   pnpm dev
   ```

5. Open `http://localhost:3000`.

## Supabase Setup

Run `supabase/migrations/0001_adana_designs_schema.sql` in the Supabase SQL editor or with your preferred migration workflow.

Then update and run `supabase/seed.sql` with your two approved login emails:

```sql
insert into public.allowed_users (email)
values
  ('you@example.com'),
  ('wife@example.com')
on conflict (email) do nothing;
```

Create matching users in Supabase Auth using email/password. Users must exist in Auth and in `allowed_users`.

## Storage

The migration creates a private `product-images` bucket. The app uploads product images there and displays them using signed URLs.

## Verification

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

`test:e2e` starts the dev server and checks basic routing/responsive behavior.

## Vercel Deployment

1. Push this repo to GitHub.
2. Import the project in Vercel.
3. Add the same Supabase environment variables in Vercel project settings.
4. Deploy.

Do not add Supabase secret/service-role keys as public variables. Only variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

## Known Limitations In This MVP

- Reports are intentionally simple and calculated from current records.
- Sales are created as drafts, then confirmed from the order details page to deduct stock.
- Customer editing and detailed customer order-history pages can be added after the first working version.
- No public ecommerce storefront, payment gateway, delivery company integration, or complex accounting is included.
