-- Phase 7: Admissions Email Notifications & Google Sheets Server Mirror Delivery Logs
create table if not exists public.admissions_delivery_log (
  id uuid primary key default gen_random_uuid(),
  admission_id uuid not null references public.admissions_requests(id) on delete cascade,
  channel text not null check (channel in ('admin_email', 'learner_email', 'google_sheet')),
  recipient_type text check (recipient_type is null or recipient_type in ('admin', 'learner', 'guardian', 'google_sheet')),
  status text not null check (status in ('success', 'failed', 'skipped')),
  error_summary text,
  created_at timestamptz not null default now()
);

-- Useful indexes for fast retrieval by admission and audit queries
create index if not exists idx_admissions_delivery_log_admission_id
  on public.admissions_delivery_log (admission_id);

create index if not exists idx_admissions_delivery_log_channel
  on public.admissions_delivery_log (channel);

create index if not exists idx_admissions_delivery_log_status
  on public.admissions_delivery_log (status);

create index if not exists idx_admissions_delivery_log_created_at
  on public.admissions_delivery_log (created_at desc);

-- Enable RLS
alter table public.admissions_delivery_log enable row level security;

-- Revoke all public/anon/authenticated direct access
revoke all on public.admissions_delivery_log from anon, authenticated, public;

-- Elevated service_role has full management capabilities (used by server endpoints & CRM)
grant select, insert, update, delete on public.admissions_delivery_log to service_role;
