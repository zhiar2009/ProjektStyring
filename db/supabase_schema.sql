-- Run this inside Supabase SQL Editor

create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text,
  created_at timestamptz default now()
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  project_number text not null,
  name text not null,
  type text not null,
  status text default 'active',
  progress int default 0,
  data jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index if not exists projects_user_number on projects (user_id, project_number);

create table if not exists settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  ui jsonb default '{}'::jsonb,
  preferences jsonb default '{}'::jsonb,
  updated_at timestamptz default now()
);

alter table projects enable row level security;
alter table settings enable row level security;

drop policy if exists projects_owner_select on projects;
drop policy if exists projects_owner_write on projects;
create policy projects_owner_select on projects
  for select using (auth.uid() = user_id);
create policy projects_owner_write on projects
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists settings_owner_select on settings;
drop policy if exists settings_owner_write on settings;
create policy settings_owner_select on settings
  for select using (auth.uid() = user_id);
create policy settings_owner_write on settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
