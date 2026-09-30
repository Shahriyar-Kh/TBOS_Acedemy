-- Phase 6: Secure Admin Admissions CRM Foundation
-- 1. Create admin authorization table
create table if not exists public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null check (role in ('owner', 'admin', 'admissions')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_admin_users_email on public.admin_users (lower(email));
create index if not exists idx_admin_users_role on public.admin_users (role);
create index if not exists idx_admin_users_is_active on public.admin_users (is_active);

-- Enable RLS on admin_users
alter table public.admin_users enable row level security;

-- Revoke all public/anon access
revoke all on public.admin_users from anon, public;

-- Elevated service_role has full management capabilities
grant select, insert, update, delete on public.admin_users to service_role;

-- Allow authenticated users to view only their own active admin profile (e.g. for client-side role check)
drop policy if exists admin_users_read_own on public.admin_users;
create policy admin_users_read_own on public.admin_users
  for select
  to authenticated
  using (auth.uid() = id and is_active = true);


-- 2. Enhance admissions_requests with internal CRM fields
alter table public.admissions_requests
  add column if not exists admin_notes text,
  add column if not exists next_follow_up_at timestamptz,
  add column if not exists demo_scheduled_at timestamptz,
  add column if not exists demo_meeting_link text,
  add column if not exists last_contacted_at timestamptz,
  add column if not exists closed_reason text;

create index if not exists idx_admissions_requests_next_follow_up_at
  on public.admissions_requests (next_follow_up_at);

create index if not exists idx_admissions_requests_demo_scheduled_at
  on public.admissions_requests (demo_scheduled_at);


-- 3. Admissions activity history table for CRM audit trails
create table if not exists public.admissions_activity (
  id uuid primary key default gen_random_uuid(),
  admission_id uuid not null references public.admissions_requests(id) on delete cascade,
  admin_user_id uuid references auth.users(id) on delete set null,
  action_type text not null check (
    action_type in (
      'status_changed',
      'note_updated',
      'demo_scheduled',
      'follow_up_set',
      'contacted',
      'closed_reason_updated'
    )
  ),
  old_status text,
  new_status text,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists idx_admissions_activity_admission_id
  on public.admissions_activity (admission_id, created_at desc);

-- Enable RLS on activity history
alter table public.admissions_activity enable row level security;

-- Revoke public access
revoke all on public.admissions_activity from anon, public;

-- Grant access to service_role only (writes and reads happen through authenticated server endpoints)
grant select, insert, update, delete on public.admissions_activity to service_role;
