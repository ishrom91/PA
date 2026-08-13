-- Philosophia Activa — Supabase schema
-- Run in Supabase SQL Editor

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text,
  share_for_training boolean not null default false,
  created_at timestamptz not null default now()
);

-- Journal entries (one row per practice per day)
create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  entry_date date not null,
  practice_type text not null,
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, entry_date, practice_type)
);

-- Rule progress
create table if not exists public.rule_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  rule_id text not null,
  status text not null,
  activated_at timestamptz,
  integrated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, rule_id)
);

-- Book notes
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  section_id text not null,
  section_title text,
  anchor_text text not null,
  note_text text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Anonymous training corpus (no user_id)
create table if not exists public.training_data (
  id uuid primary key default gen_random_uuid(),
  practice_type text not null,
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.journal_entries enable row level security;
alter table public.rule_progress enable row level security;
alter table public.notes enable row level security;
alter table public.training_data enable row level security;

-- profiles: own row only
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- journal_entries
create policy "journal_select_own" on public.journal_entries
  for select using (auth.uid() = user_id);
create policy "journal_insert_own" on public.journal_entries
  for insert with check (auth.uid() = user_id);
create policy "journal_update_own" on public.journal_entries
  for update using (auth.uid() = user_id);
create policy "journal_delete_own" on public.journal_entries
  for delete using (auth.uid() = user_id);

-- rule_progress
create policy "rules_select_own" on public.rule_progress
  for select using (auth.uid() = user_id);
create policy "rules_insert_own" on public.rule_progress
  for insert with check (auth.uid() = user_id);
create policy "rules_update_own" on public.rule_progress
  for update using (auth.uid() = user_id);
create policy "rules_delete_own" on public.rule_progress
  for delete using (auth.uid() = user_id);

-- notes
create policy "notes_select_own" on public.notes
  for select using (auth.uid() = user_id);
create policy "notes_insert_own" on public.notes
  for insert with check (auth.uid() = user_id);
create policy "notes_update_own" on public.notes
  for update using (auth.uid() = user_id);
create policy "notes_delete_own" on public.notes
  for delete using (auth.uid() = user_id);

-- training_data: insert-only for authenticated users (anon corpus)
create policy "training_insert_auth" on public.training_data
  for insert to authenticated with check (true);

-- No select on training_data for regular users (admin via dashboard)

-- Updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger journal_entries_updated_at
  before update on public.journal_entries
  for each row execute function public.set_updated_at();

create trigger rule_progress_updated_at
  before update on public.rule_progress
  for each row execute function public.set_updated_at();

create trigger notes_updated_at
  before update on public.notes
  for each row execute function public.set_updated_at();
