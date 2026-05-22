
-- Profiles table
create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  gender text check (gender in ('male','female')),
  dob date,
  height_cm integer,
  community text,
  education text,
  profession text,
  salary_range text,
  city text,
  district text,
  state text,
  phone text,
  email text,
  about text,
  expectations text,
  family_details text,
  horoscope_url text,
  profile_completion integer not null default 10,
  plan text not null default 'free',
  is_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles viewable by authenticated"
  on public.profiles for select to authenticated using (true);

create policy "Users insert own profile"
  on public.profiles for insert to authenticated with check (auth.uid() = user_id);

create policy "Users update own profile"
  on public.profiles for update to authenticated using (auth.uid() = user_id);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (user_id, email)
  values (new.id, new.email)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Photos
create table public.profile_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  url text not null,
  is_primary boolean not null default false,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);
create index on public.profile_photos(user_id);
alter table public.profile_photos enable row level security;
create policy "Photos viewable by authenticated"
  on public.profile_photos for select to authenticated using (true);
create policy "Users manage own photos insert"
  on public.profile_photos for insert to authenticated with check (auth.uid() = user_id);
create policy "Users manage own photos update"
  on public.profile_photos for update to authenticated using (auth.uid() = user_id);
create policy "Users manage own photos delete"
  on public.profile_photos for delete to authenticated using (auth.uid() = user_id);

-- Interests
create table public.interests (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users(id) on delete cascade,
  receiver_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted','declined')),
  created_at timestamptz not null default now(),
  unique(sender_id, receiver_id)
);
create index on public.interests(receiver_id);
alter table public.interests enable row level security;
create policy "Interests visible to sender or receiver"
  on public.interests for select to authenticated
  using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy "Users create interests as sender"
  on public.interests for insert to authenticated with check (auth.uid() = sender_id);
create policy "Receiver updates status"
  on public.interests for update to authenticated using (auth.uid() = receiver_id);

-- Saved profiles
create table public.saved_profiles (
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, profile_user_id)
);
alter table public.saved_profiles enable row level security;
create policy "Users see own saves"
  on public.saved_profiles for select to authenticated using (auth.uid() = user_id);
create policy "Users create own saves"
  on public.saved_profiles for insert to authenticated with check (auth.uid() = user_id);
create policy "Users delete own saves"
  on public.saved_profiles for delete to authenticated using (auth.uid() = user_id);

-- Visitors
create table public.visitors (
  id uuid primary key default gen_random_uuid(),
  visitor_id uuid not null references auth.users(id) on delete cascade,
  profile_user_id uuid not null references auth.users(id) on delete cascade,
  visited_at timestamptz not null default now()
);
create index on public.visitors(profile_user_id, visited_at desc);
alter table public.visitors enable row level security;
create policy "Profile owner sees visitors"
  on public.visitors for select to authenticated using (auth.uid() = profile_user_id);
create policy "Authenticated log a visit"
  on public.visitors for insert to authenticated with check (auth.uid() = visitor_id);

-- Storage buckets
insert into storage.buckets (id, name, public) values ('profile-photos','profile-photos', true)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('horoscopes','horoscopes', false)
  on conflict (id) do nothing;

create policy "Profile photos public read"
  on storage.objects for select using (bucket_id = 'profile-photos');
create policy "Users upload own profile photos"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'profile-photos' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Users update own profile photos"
  on storage.objects for update to authenticated
  using (bucket_id = 'profile-photos' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Users delete own profile photos"
  on storage.objects for delete to authenticated
  using (bucket_id = 'profile-photos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users view own horoscope"
  on storage.objects for select to authenticated
  using (bucket_id = 'horoscopes' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Users upload own horoscope"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'horoscopes' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Users update own horoscope"
  on storage.objects for update to authenticated
  using (bucket_id = 'horoscopes' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Users delete own horoscope"
  on storage.objects for delete to authenticated
  using (bucket_id = 'horoscopes' and auth.uid()::text = (storage.foldername(name))[1]);
