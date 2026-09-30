-- Migration: 20260930000001_create_admissions_requests.sql
-- Description: Create public.admissions_requests table with RLS, CRM status enum, indexes, and updated_at trigger

-- 1. Create admissions_requests table
create table if not exists public.admissions_requests (
  id uuid primary key default gen_random_uuid(),

  -- Submission Classification
  submission_kind text not null check (submission_kind in ('application', 'demo')),
  application_type text not null,
  selected_program_slug text,
  selected_program_title text not null,
  selected_program_category text,

  -- Student Information
  student_name text not null,
  email text not null,
  phone text not null,
  country text not null,
  city text,
  age text,
  education_level text not null,
  institution text,
  skill_level text,

  -- Learning Goals & Preferences
  learning_goal text,
  learning_preference text,

  -- Scheduling Preferences
  preferred_days text,
  preferred_time text,
  timezone text,

  -- Guardian Information (for minor learners)
  guardian_name text,
  guardian_phone text,
  guardian_email text,

  -- Context & Notes
  notes text,
  source_page text,

  -- CRM Lifecycle Status
  status text not null default 'new' check (
    status in (
      'new',
      'contacted',
      'qualified',
      'demo_requested',
      'demo_scheduled',
      'demo_completed',
      'enrolled',
      'closed'
    )
  ),

  -- Timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Reliable updated_at trigger
create or replace function public.handle_admissions_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_admissions_requests_updated_at on public.admissions_requests;
create trigger set_admissions_requests_updated_at
  before update on public.admissions_requests
  for each row execute function public.handle_admissions_updated_at();

-- 3. Row Level Security (RLS)
alter table public.admissions_requests enable row level security;

-- Public / Anonymous users must NOT be able to select, update, delete or browse records.
-- Server endpoint connects via service_role key which bypasses RLS.
revoke all on public.admissions_requests from anon, authenticated;
grant all on public.admissions_requests to service_role;

-- 4. Indexes for query performance and CRM filtering
create index if not exists idx_admissions_requests_created_at on public.admissions_requests (created_at desc);
create index if not exists idx_admissions_requests_status on public.admissions_requests (status);
create index if not exists idx_admissions_requests_submission_kind on public.admissions_requests (submission_kind);
create index if not exists idx_admissions_requests_application_type on public.admissions_requests (application_type);
create index if not exists idx_admissions_requests_email on public.admissions_requests (email);
create index if not exists idx_admissions_requests_phone on public.admissions_requests (phone);
