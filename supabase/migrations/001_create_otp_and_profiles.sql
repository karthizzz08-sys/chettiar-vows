-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- OTP Verifications table
create table if not exists public.otp_verifications (
  id uuid primary key default uuid_generate_v4(),
  email text not null,
  otp_code text not null, -- 6-digit code as string
  otp_hash text not null, -- bcrypt hash for secure comparison
  attempts int default 0,
  max_attempts int default 5,
  expires_at timestamp with time zone not null,
  verified_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  
  -- Constraints
  constraint otp_email_unique_unverified unique (email) where verified_at is null,
  constraint otp_max_attempts_check check (attempts <= max_attempts)
);

-- Create index for faster lookups
create index idx_otp_email on public.otp_verifications(email);
create index idx_otp_expires_at on public.otp_verifications(expires_at);

-- User Profiles table
create table if not exists public.profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  gender text, -- 'male', 'female', 'other'
  date_of_birth date,
  location_city text,
  location_state text,
  caste text, -- For matrimony context
  occupation text,
  education text,
  bio text,
  profile_picture_url text,
  profile_completion_percentage int default 10,
  verified_email boolean default false,
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create index for user lookups
create index idx_profiles_user_id on public.profiles(user_id);
create index idx_profiles_email on public.profiles(email);

-- Enable RLS on both tables
alter table public.otp_verifications enable row level security;
alter table public.profiles enable row level security;

-- RLS Policies for otp_verifications (server can read/write)
create policy "Enable read for authenticated users" on public.otp_verifications
  for select using (auth.uid() is not null);

create policy "Enable insert for authenticated users" on public.otp_verifications
  for insert with check (true);

-- RLS Policies for profiles
create policy "Users can read own profile" on public.profiles
  for select using (auth.uid() = user_id or auth.role() = 'authenticated');

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = user_id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = user_id);

-- Grant permissions
grant all on public.otp_verifications to authenticated;
grant all on public.profiles to authenticated;
