# Couple Wishlist

A full-stack romantic wishlist website built with Next.js App Router, TypeScript, Tailwind CSS, and Supabase.

## Features

- Public landing page with couple intro, cover photo, and wishlist/special-day previews
- Private couple wishlist page with search/filter and gift status tracking
- Public special days page with countdowns and days-together counter
- Automatic love milestones from the couple's love start date
- Automatic birthdays from the couple profile
- Monthly love calendar with milestone and special-day details
- Couple profile facts such as age, favorites, and hobbies
- Public gallery page with memory cards
- Protected admin dashboard with CRUD for:
  - Couple profile
  - Wishlist items
  - Special days
  - Gallery photos
- Supabase Storage image uploads for gallery
- Role-based admin protection using Supabase Auth + `profiles.role`
- Loading, empty, and error states
- Mobile + desktop responsive UI
- Optional dark mode toggle

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Postgres, Auth, Storage)
- Vercel-ready setup

## Project Structure

```text
app/
  (public)/
    page.tsx
    wishlist/page.tsx
    special-days/page.tsx
    gallery/page.tsx
  login/page.tsx
  admin/
    page.tsx
    wishlist/page.tsx
    special-days/page.tsx
    gallery/page.tsx
  actions/
components/
  admin/
  sections/
  ui/
lib/
  auth.ts
  validation.ts
  data/queries.ts
  supabase/
db/
  schema.sql
  seed.sql
types/
  database.ts
middleware.ts
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create env file:

```bash
cp .env.example .env.local
```

3. Add your Supabase values to `.env.local`.

4. In Supabase SQL editor, run:

- `db/schema.sql`
- `db/seed.sql`

5. Create an admin user:

- Sign up the user in Supabase Auth
- In SQL editor, set role:

```sql
update profiles
set role = 'admin'
where email = 'your-admin-email@example.com';
```

6. Run locally:

```bash
npm run dev
```

Open:

- [http://localhost:3000](http://localhost:3000)
- Admin login: `/login`

## Environment Variables

See `.env.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Deployment (Vercel)

1. Import project into Vercel
2. Add the same environment variables in Vercel settings
3. Deploy

## Notes

- Admin pages are protected by proxy + role checks.
- Love milestones are auto-generated from `couple_profile.love_start_date`.
