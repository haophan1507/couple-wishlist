# Góc Của Tụi Mình

A full-stack private couple space for wishlist items, special days, places, memories, and gift history, built with TanStack Start, TypeScript, Tailwind CSS, and Supabase.

## Features

- Public landing page with couple intro, cover photo, and relationship overview
- Private couple wishlist page with search/filter and item status tracking
- Public special days page with countdowns and days-together counter
- Email notifications when special days arrive (daily cron)
- Automatic love milestones from the couple's love start date
- Automatic birthdays from the couple profile
- Monthly love calendar with milestone and special-day details
- Couple profile facts such as age, favorites, and hobbies
- Heart map for visited and planned places
- Public gallery page with memory cards
- Public gift history page for received gifts and notes
- Protected admin dashboard with CRUD for:
  - Couple profile
  - Wishlist items
  - Gift history
  - Places
  - Special days
  - Gallery photos
- Supabase Storage image uploads for gallery
- Role-based admin protection using Supabase Auth + `profiles.role`
- Loading, empty, and error states
- Mobile + desktop responsive UI
- Optional dark mode toggle

## Tech Stack

- TanStack Start (Vite) + TanStack Router + TanStack Query
- TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (Postgres, Auth, Storage)
- Nodemailer for special-day emails
- Vercel-ready setup

## Project Structure

```text
src/
  routes/          # file-based routes (public, admin, api/cron)
  features/        # page feature modules
  server/          # createServerFn mutations + geo helpers
  styles.css
components/
  admin/
  sections/
  ui/
lib/
  auth/
  data/client-queries.ts
  supabase/
db/
  schema.sql
  seed.sql
types/
  database.ts
```

## Setup

1. Install dependencies:

```bash
nvm use
npm install
```

2. Copy env and fill values:

```bash
cp .env.example .env.local
```

Required env keys (see `.env.example`):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server uploads / cron only)
- SMTP settings for Nodemailer
- `CRON_SECRET` for `/api/cron/special-days`

On Vercel: keep Framework preset **TanStack Start**, Node **24.x**. Cron path stays `/api/cron/special-days`.


3. Apply DB schema/seed in Supabase if needed (`db/`).

4. Run the app:

```bash
npm run dev
```

Open http://localhost:3000

## Scripts

- `npm run dev` — Vite / TanStack Start dev server
- `npm run build` — production build
- `npm run start` — run production server from `.output`
- `npm run typecheck` — TypeScript check
- `npm run lint` — ESLint
- `npm run doctor` — react-doctor scan

## Cron

Vercel cron hits `GET /api/cron/special-days` daily (see `vercel.json`). Authorize with `Authorization: Bearer $CRON_SECRET`.
