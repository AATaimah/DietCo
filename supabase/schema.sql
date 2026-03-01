-- Run this in Supabase SQL editor.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  account_type text not null check (account_type in ('individual', 'clinic')),
  full_name text not null,
  clinic_name text,
  phone text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  account_type text not null check (account_type in ('individual', 'clinic')),
  buyer_name text not null,
  clinic_name text,
  email text not null,
  phone text not null,
  address text not null,
  city text not null,
  district text,
  postal_code text,
  additional_notes text,
  items jsonb not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, account_type, full_name, clinic_name, phone)
  values (
    new.id,
    case
      when new.raw_user_meta_data ->> 'account_type' = 'clinic' then 'clinic'
      else 'individual'
    end,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(new.email, '@', 1)),
    nullif(new.raw_user_meta_data ->> 'clinic_name', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', '')
  )
  on conflict (id) do update
  set
    account_type = excluded.account_type,
    full_name = excluded.full_name,
    clinic_name = excluded.clinic_name,
    phone = excluded.phone,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user_profile();

-- Backfill profiles for users created before this trigger existed.
insert into public.profiles (id, account_type, full_name, clinic_name, phone)
select
  u.id,
  case
    when u.raw_user_meta_data ->> 'account_type' = 'clinic' then 'clinic'
    else 'individual'
  end as account_type,
  coalesce(nullif(u.raw_user_meta_data ->> 'full_name', ''), split_part(u.email, '@', 1)) as full_name,
  nullif(u.raw_user_meta_data ->> 'clinic_name', '') as clinic_name,
  coalesce(u.raw_user_meta_data ->> 'phone', '') as phone
from auth.users u
on conflict (id) do update
set
  account_type = excluded.account_type,
  full_name = excluded.full_name,
  clinic_name = excluded.clinic_name,
  phone = excluded.phone,
  updated_at = now();

alter table public.profiles enable row level security;
alter table public.orders enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own"
on public.orders
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "orders_insert_own_or_guest" on public.orders;
create policy "orders_insert_own_or_guest"
on public.orders
for insert
to anon, authenticated
with check (
  (auth.role() = 'anon' and user_id is null)
  or
  (auth.role() = 'authenticated' and auth.uid() = user_id)
);
