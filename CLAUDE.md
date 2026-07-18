# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Góc Của Tụi Mình** is a full-stack couple space built with Next.js 16, TypeScript, Tailwind CSS, and Supabase. It provides public pages for sharing a couple's wishlist, special days, memories, and places, with a protected admin dashboard for managing content.

### Key Features
- Public landing page with couple intro and relationship overview
- Public wishlist, special days, gallery, and gift history pages
- Heart map for visited/planned places
- Admin dashboard with CRUD for all content
- Daily email notifications for special days via Vercel cron
- Role-based access control (Supabase Auth + `profiles.role`)
- Image uploads to Supabase Storage

## Development Commands

```bash
# Install dependencies (uses Node 24.x from .nvmrc)
nvm use
npm install

# Development
npm run dev                 # Start dev server on http://localhost:3000

# Building & Verification
npm run build              # Production build with Webpack (default)
npm run build:turbo        # Production build with Turbopack (experimental)
npm run typecheck          # TypeScript type checking
npm run lint               # ESLint check

# Production
npm run start              # Start production server
```

### Environment Setup

1. Copy `.env.example` to `.env.local`
2. Add Supabase credentials:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. For email notifications, configure SMTP (Gmail recommended):
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`
   - `NOTIFICATION_FROM_EMAIL`
   - `CRON_SECRET` (random string for cron endpoint protection)

### Database Setup

Run in Supabase SQL editor:
```sql
-- Create schema and seed data
\i db/schema.sql
\i db/seed.sql

-- Create admin user
UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
```

## Architecture

### Route Structure

**Public Routes** (`app/(public)/`)
- `/` — Landing page with couple intro, upcoming special day, wishlist preview
- `/wishlist` — Full wishlist with search/filter by owner and category
- `/special-days` — Special days with countdowns and love calendar
- `/gallery` — Memory gallery with photo grid
- `/gift-history` — Received gifts with notes
- `/places` — Heart map of visited/planned places

**Admin Routes** (`app/admin/`)
- `/admin` — Dashboard overview
- `/admin/wishlist` — Manage wishlist items
- `/admin/special-days` — Manage special days and milestones
- `/admin/gallery` — Manage gallery photos
- `/admin/places` — Manage place memories
- `/admin/gift-history` — Manage gift history
- `/admin/couple-profile` — Edit couple profile

**Auth Routes**
- `/login` — Supabase Auth login
- `/unauthorized` — Access denied page

### Data Flow

1. **Server Actions** (`app/actions/`) — Mutations (create, update, delete)
   - Use `requireAdmin()` to protect admin-only operations
   - Handle FormData parsing and validation with Zod
   - Manage image uploads/deletions via Supabase Storage
   - Call `revalidatePath()` to refresh cached data

2. **Data Queries** (`lib/data/queries.ts`) — Read operations
   - Fetch data from Supabase using server client
   - Transform raw data (e.g., parse URLs, compute countdowns)
   - Generate auto-milestones from `couple_profile.love_start_date`
   - Handle image URL generation with `getPublicStorageUrl()`

3. **Supabase Client** (`lib/supabase/`)
   - `server.ts` — Server-side client with cookie management
   - `admin.ts` — Admin client with service role key (for cron jobs)
   - `client.ts` — Client-side client (minimal use)
   - `env.ts` — Environment variable validation

4. **Middleware** (`proxy.ts`)
   - Redirects unauthenticated users from `/admin` to `/login`
   - Redirects authenticated users from `/login` to `/admin`
   - Manages Supabase session cookies

### Database Schema

**Core Tables**
- `profiles` — Supabase Auth users with role (admin/viewer)
- `couple_profile` — Single row with couple info, dates, story, cover image
- `wishlist_items` — Items with owner_type (me/honey), status (available/gifted), priority
- `special_days` — Manual special days + auto-generated birthdays/milestones
- `gallery_items` — Memory photos with captions and dates
- `place_memories` — Visited/planned places with coordinates and images
- `gift_history_items` — Received gifts with status (received/thanked/archived)

**Key Enums**
- `owner_type` — 'me' or 'honey'
- `wishlist_status` — 'available' or 'gifted'
- `place_status` — 'visited' or 'planned'
- `special_day_type` — 'birthday', 'anniversary', 'relationship', 'holiday', 'other'
- `profile_role` — 'admin' or 'viewer'

### Image Handling

- Images stored in Supabase Storage buckets (public/private)
- Upload via `uploadImageFile()` in server actions
- Delete via `deleteStorageFile()` when replacing/removing
- URLs generated with `getPublicStorageUrl()` for public display
- Validation with `getOptionalFile()` to ensure file type/size

### Cron Jobs

**Special Days Email Notification** (`/api/cron/special-days`)
- Runs daily at 00:00 UTC (07:00 Vietnam time)
- Sends emails for special_days and birthdays matching today
- Prevents duplicates using `special_day_notification_logs` table
- Uses SMTP (Gmail app password compatible)
- Requires `CRON_SECRET` header for authorization
- Manual test: `curl -X POST -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/special-days`

## Key Patterns

### Server Actions
- Always start with `"use server"` directive
- Call `requireAdmin()` to enforce auth
- Use Zod schemas for validation
- Return typed responses or throw errors
- Call `revalidatePath()` to invalidate Next.js cache

### Data Queries
- Use `createSupabaseServerClient()` for server-side reads
- Leverage date-fns for date calculations
- Parse URLs and transform data before returning
- Handle null/empty states gracefully

### Components
- Sections in `components/sections/` for page-level layouts
- UI components in `components/ui/` for reusable elements
- Admin forms in `components/admin/` for CRUD interfaces
- Use Tailwind CSS with custom color variables (mocha, blush, etc.)

### Validation
- Zod schemas in `lib/validation.ts`
- Validate FormData in server actions before DB operations
- Provide Vietnamese error messages for user feedback

## Deployment (Vercel)

1. Import repo into Vercel
2. Add environment variables (same as `.env.local`)
3. Deploy — Vercel automatically runs `npm run build`
4. Cron jobs run via `vercel.json` configuration
5. Note: Vercel cron schedules are UTC; adjust `NOTIFICATION_TIMEZONE` for local time

## Notes

- TypeScript strict mode enabled; all types must be explicit
- ESLint configured with Next.js core web vitals
- Images can be from any HTTPS source (see `next.config.ts`)
- Admin pages protected by middleware + role checks
- Love milestones auto-generated from `couple_profile.love_start_date`
- Birthdays auto-generated from `couple_profile.person_one_birthday` and `person_two_birthday`
