-- ==============================================================================
-- PHASE 16: COMPLETE TBOS ACADEMY CRM, STUDENT, FEE & CLASS MANAGEMENT SYSTEM
-- Migration: 20261014000000_phase16_academy_crm.sql
-- ==============================================================================

-- 1. Extend admin_users role constraint to support 'instructor' and 'accountant'
do $$
begin
  alter table public.admin_users drop constraint if exists admin_users_role_check;
  alter table public.admin_users add constraint admin_users_role_check
    check (role in ('owner', 'admin', 'admissions', 'instructor', 'accountant'));
exception
  when others then null;
end $$;

-- Add optional name and phone to admin_users if not present
alter table public.admin_users
  add column if not exists full_name text,
  add column if not exists phone text;


-- 2. Students Table
create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  student_id text unique not null,
  full_name text not null,
  email text not null,
  phone text not null,
  whatsapp text,
  guardian_name text,
  guardian_phone text,
  guardian_email text,
  date_of_birth date,
  age smallint check (age is null or (age >= 4 and age <= 120)),
  country text not null default 'Pakistan',
  city text,
  timezone text not null default 'Asia/Karachi',
  status text not null default 'active' check (
    status in ('active', 'trial', 'paused', 'on_hold', 'completed', 'dropped', 'cancelled')
  ),
  enrollment_date date not null default current_date,
  billing_day smallint not null default 1 check (billing_day >= 1 and billing_day <= 28),
  notes text,
  lead_id uuid references public.admissions_requests(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_students_student_id on public.students (student_id);
create index if not exists idx_students_email on public.students (lower(email));
create index if not exists idx_students_phone on public.students (phone);
create index if not exists idx_students_status on public.students (status);
create index if not exists idx_students_lead_id on public.students (lead_id);
create index if not exists idx_students_created_at on public.students (created_at desc);

alter table public.students enable row level security;
revoke all on public.students from anon, public;
grant all on public.students to service_role;


-- 3. Batches Table
create table if not exists public.batches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  program_slug text not null,
  program_title text not null,
  program_type text not null check (
    program_type in ('live_batch', 'specialization', 'course', 'tutoring')
  ),
  mode text not null default 'group' check (mode in ('group', 'one_on_one')),
  instructor_id uuid references public.admin_users(id) on delete set null,
  instructor_name text,
  start_date date,
  expected_end_date date,
  days_of_week text[] not null default '{}',
  start_time text,
  end_time text,
  timezone text not null default 'Asia/Karachi',
  max_capacity integer not null default 20 check (max_capacity > 0),
  active_student_count integer not null default 0,
  meeting_link text,
  status text not null default 'active' check (
    status in ('planned', 'enrolling', 'active', 'paused', 'completed', 'cancelled')
  ),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_batches_status on public.batches (status);
create index if not exists idx_batches_program_slug on public.batches (program_slug);
create index if not exists idx_batches_instructor_id on public.batches (instructor_id);

alter table public.batches enable row level security;
revoke all on public.batches from anon, public;
grant all on public.batches to service_role;


-- 4. Enrollments Table
create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  batch_id uuid references public.batches(id) on delete set null,
  program_slug text not null,
  program_title text not null,
  program_type text not null,
  instructor_id uuid references public.admin_users(id) on delete set null,
  instructor_name text,
  agreed_fee numeric(12, 2) not null default 0 check (agreed_fee >= 0),
  discount numeric(12, 2) not null default 0 check (discount >= 0),
  billing_day smallint not null default 1 check (billing_day >= 1 and billing_day <= 28),
  enrollment_date date not null default current_date,
  schedule text,
  status text not null default 'active' check (
    status in ('active', 'paused', 'completed', 'cancelled')
  ),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_enrollments_student_id on public.enrollments (student_id);
create index if not exists idx_enrollments_batch_id on public.enrollments (batch_id);
create index if not exists idx_enrollments_status on public.enrollments (status);

alter table public.enrollments enable row level security;
revoke all on public.enrollments from anon, public;
grant all on public.enrollments to service_role;


-- 5. Fee Invoices / Dues Table
create table if not exists public.fee_invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text unique not null,
  student_id uuid not null references public.students(id) on delete cascade,
  enrollment_id uuid references public.enrollments(id) on delete set null,
  billing_month text not null, -- Format YYYY-MM
  amount_due numeric(12, 2) not null default 0 check (amount_due >= 0),
  amount_paid numeric(12, 2) not null default 0 check (amount_paid >= 0),
  balance numeric(12, 2) not null default 0,
  due_date date not null,
  status text not null default 'due' check (
    status in ('upcoming', 'due', 'partially_paid', 'paid', 'overdue', 'waived', 'refunded')
  ),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_student_enrollment_month unique (student_id, enrollment_id, billing_month)
);

create index if not exists idx_fee_invoices_student_id on public.fee_invoices (student_id);
create index if not exists idx_fee_invoices_billing_month on public.fee_invoices (billing_month);
create index if not exists idx_fee_invoices_status on public.fee_invoices (status);
create index if not exists idx_fee_invoices_due_date on public.fee_invoices (due_date);

alter table public.fee_invoices enable row level security;
revoke all on public.fee_invoices from anon, public;
grant all on public.fee_invoices to service_role;


-- 6. Fee Payments Table
create table if not exists public.fee_payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.fee_invoices(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  payment_date date not null default current_date,
  payment_method text not null check (
    payment_method in ('bank_transfer', 'jazzcash', 'easypaisa', 'cash', 'other')
  ),
  reference_number text,
  notes text,
  recorded_by uuid references public.admin_users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_fee_payments_invoice_id on public.fee_payments (invoice_id);
create index if not exists idx_fee_payments_student_id on public.fee_payments (student_id);
create index if not exists idx_fee_payments_payment_date on public.fee_payments (payment_date desc);

alter table public.fee_payments enable row level security;
revoke all on public.fee_payments from anon, public;
grant all on public.fee_payments to service_role;


-- 7. Class Sessions Table
create table if not exists public.class_sessions (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid references public.batches(id) on delete cascade,
  enrollment_id uuid references public.enrollments(id) on delete cascade,
  instructor_id uuid references public.admin_users(id) on delete set null,
  instructor_name text,
  title text not null,
  session_date date not null,
  start_time text not null, -- Format HH:mm
  end_time text not null,   -- Format HH:mm
  timezone text not null default 'Asia/Karachi',
  meeting_link text,
  status text not null default 'scheduled' check (
    status in ('scheduled', 'completed', 'rescheduled', 'cancelled', 'missed')
  ),
  topic_covered text,
  homework text,
  instructor_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_class_sessions_date on public.class_sessions (session_date);
create index if not exists idx_class_sessions_batch_id on public.class_sessions (batch_id);
create index if not exists idx_class_sessions_instructor_id on public.class_sessions (instructor_id);
create index if not exists idx_class_sessions_status on public.class_sessions (status);

alter table public.class_sessions enable row level security;
revoke all on public.class_sessions from anon, public;
grant all on public.class_sessions to service_role;


-- 8. Class Attendance Table
create table if not exists public.class_attendance (
  id uuid primary key default gen_random_uuid(),
  class_session_id uuid not null references public.class_sessions(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  status text not null default 'present' check (
    status in ('present', 'absent', 'late', 'excused')
  ),
  notes text,
  recorded_at timestamptz not null default now(),
  constraint uq_session_student_attendance unique (class_session_id, student_id)
);

create index if not exists idx_attendance_session_id on public.class_attendance (class_session_id);
create index if not exists idx_attendance_student_id on public.class_attendance (student_id);

alter table public.class_attendance enable row level security;
revoke all on public.class_attendance from anon, public;
grant all on public.class_attendance to service_role;


-- 9. Instructor Availability Table
create table if not exists public.instructor_availability (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid not null references public.admin_users(id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6), -- 0=Sunday, 6=Saturday
  start_time text not null,
  end_time text not null,
  is_blocked boolean not null default false,
  notes text
);

create index if not exists idx_instructor_avail_instructor on public.instructor_availability (instructor_id);

alter table public.instructor_availability enable row level security;
revoke all on public.instructor_availability from anon, public;
grant all on public.instructor_availability to service_role;


-- 10. CRM Tasks & Follow-ups Table
create table if not exists public.crm_tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  due_date timestamptz not null,
  priority text not null default 'medium' check (
    priority in ('low', 'medium', 'high', 'urgent')
  ),
  status text not null default 'pending' check (
    status in ('pending', 'in_progress', 'completed', 'cancelled')
  ),
  assigned_to uuid references public.admin_users(id) on delete set null,
  related_type text check (
    related_type in ('lead', 'student', 'class', 'payment', 'other')
  ),
  related_id text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_crm_tasks_status on public.crm_tasks (status);
create index if not exists idx_crm_tasks_due_date on public.crm_tasks (due_date);
create index if not exists idx_crm_tasks_assigned_to on public.crm_tasks (assigned_to);

alter table public.crm_tasks enable row level security;
revoke all on public.crm_tasks from anon, public;
grant all on public.crm_tasks to service_role;


-- 11. CRM Notifications Table
create table if not exists public.crm_notifications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  type text not null check (
    type in ('new_application', 'demo_due', 'follow_up_due', 'class_soon', 'payment_due', 'reminder_failed', 'conflict', 'info')
  ),
  link text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_crm_notifications_is_read on public.crm_notifications (is_read, created_at desc);

alter table public.crm_notifications enable row level security;
revoke all on public.crm_notifications from anon, public;
grant all on public.crm_notifications to service_role;


-- 12. Message Templates Table
create table if not exists public.message_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  channel text not null check (channel in ('email', 'whatsapp')),
  category text not null check (
    category in ('fee_reminder', 'class_reminder', 'demo_reminder', 'welcome', 'follow_up', 'general')
  ),
  subject text,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.message_templates enable row level security;
revoke all on public.message_templates from anon, public;
grant all on public.message_templates to service_role;


-- 13. Message Delivery Logs Table
create table if not exists public.message_logs (
  id uuid primary key default gen_random_uuid(),
  channel text not null check (channel in ('email', 'whatsapp')),
  recipient text not null,
  recipient_name text,
  subject text,
  content text not null,
  status text not null check (status in ('sent', 'failed', 'prepared_link', 'skipped')),
  error_message text,
  created_by uuid references public.admin_users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_message_logs_created_at on public.message_logs (created_at desc);

alter table public.message_logs enable row level security;
revoke all on public.message_logs from anon, public;
grant all on public.message_logs to service_role;


-- 14. CRM Audit Logs Table
create table if not exists public.crm_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid references public.admin_users(id) on delete set null,
  actor_email text,
  action text not null,
  entity text not null,
  entity_id text,
  details jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_crm_audit_logs_created_at on public.crm_audit_logs (created_at desc);
create index if not exists idx_crm_audit_logs_entity on public.crm_audit_logs (entity, entity_id);

alter table public.crm_audit_logs enable row level security;
revoke all on public.crm_audit_logs from anon, public;
grant all on public.crm_audit_logs to service_role;


-- 15. Password Reset Tokens Table
create table if not exists public.password_reset_tokens (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  token_hash text not null,
  expires_at timestamptz not null,
  used boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_password_reset_tokens_hash on public.password_reset_tokens (token_hash);
create index if not exists idx_password_reset_tokens_email on public.password_reset_tokens (lower(email));

alter table public.password_reset_tokens enable row level security;
revoke all on public.password_reset_tokens from anon, public;
grant all on public.password_reset_tokens to service_role;

