-- Enable required extensions
create extension if not exists "uuid-ossp";

-- Enums
create type owner_type as enum ('me', 'honey');
create type wishlist_priority as enum ('low', 'medium', 'high');
create type wishlist_status as enum ('available', 'gifted');
create type gift_history_status as enum ('received', 'thanked', 'archived');
create type special_day_type as enum ('birthday', 'anniversary', 'relationship', 'holiday', 'other');
create type profile_role as enum ('admin', 'viewer');

-- Tables
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  avatar_url text,
  role profile_role not null default 'viewer',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists couple_profile (
  id uuid primary key default uuid_generate_v4(),
  person_one_name text not null,
  person_two_name text not null,
  love_start_date date,
  person_one_birthday date,
  person_two_birthday date,
  person_one_favorite text,
  person_two_favorite text,
  person_one_hobby text,
  person_two_hobby text,
  story text,
  cover_image_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists wishlist_items (
  id uuid primary key default uuid_generate_v4(),
  owner_type owner_type not null,
  title text not null,
  description text,
  image_url text,
  product_url text,
  price_min numeric(10,2),
  price_max numeric(10,2),
  category text,
  priority wishlist_priority not null default 'medium',
  note text,
  status wishlist_status not null default 'available',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists special_days (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  date date not null,
  type special_day_type not null default 'other',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists gallery_items (
  id uuid primary key default uuid_generate_v4(),
  image_url text not null,
  caption text,
  memory_date date,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists gift_history_items (
  id uuid primary key default uuid_generate_v4(),
  recipient_owner_type owner_type not null,
  gift_name text not null,
  giver_name text not null,
  received_date date not null,
  special_day_id uuid references special_days(id) on delete set null,
  note text,
  photo_url text,
  wishlist_item_id uuid references wishlist_items(id) on delete set null,
  wishlist_item_title text,
  status gift_history_status not null default 'received',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Trigger utilities
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

-- Triggers
create trigger trg_wishlist_updated_at
before update on wishlist_items
for each row execute function set_updated_at();

create trigger trg_couple_profile_updated_at
before update on couple_profile
for each row execute function set_updated_at();

create trigger trg_gift_history_updated_at
before update on gift_history_items
for each row execute function set_updated_at();

-- Auth profile sync
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    'viewer'
  )
  on conflict (id) do nothing;

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure handle_new_user();

-- Storage bucket for uploads
insert into storage.buckets (id, name, public)
values ('couple-assets', 'couple-assets', true)
on conflict (id) do nothing;

-- Enable RLS
alter table profiles enable row level security;
alter table couple_profile enable row level security;
alter table wishlist_items enable row level security;
alter table special_days enable row level security;
alter table gallery_items enable row level security;
alter table gift_history_items enable row level security;

-- Policies: helper expression for admins
create policy "profiles self read"
on profiles for select
using (auth.uid() = id);

create policy "profiles self update"
on profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "public read couple profile"
on couple_profile for select
to anon, authenticated
using (true);

create policy "admin manage couple profile"
on couple_profile for all
to authenticated
using (
  exists (
    select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'
  )
)
with check (
  exists (
    select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'
  )
);

create policy "public read wishlist"
on wishlist_items for select
to anon, authenticated
using (true);

create policy "admin manage wishlist"
on wishlist_items for all
to authenticated
using (
  exists (
    select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'
  )
)
with check (
  exists (
    select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'
  )
);

create policy "public read special days"
on special_days for select
to anon, authenticated
using (true);

create policy "admin manage special days"
on special_days for all
to authenticated
using (
  exists (
    select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'
  )
)
with check (
  exists (
    select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'
  )
);

create policy "public read gallery"
on gallery_items for select
to anon, authenticated
using (true);

create policy "admin manage gallery"
on gallery_items for all
to authenticated
using (
  exists (
    select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'
  )
)
with check (
  exists (
    select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'
  )
);

-- Storage policies
create policy "public read storage"
on storage.objects for select
to public
using (bucket_id = 'couple-assets');

create policy "admin write storage"
on storage.objects for all
to authenticated
using (
  bucket_id = 'couple-assets'
  and exists (
    select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'
  )
)
with check (
  bucket_id = 'couple-assets'
  and exists (
    select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'
  )
);

create policy "public read gift history"
on gift_history_items for select
to anon, authenticated
using (true);

create policy "admin manage gift history"
on gift_history_items for all
to authenticated
using (
  exists (
    select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'
  )
)
with check (
  exists (
    select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'
  )
);
