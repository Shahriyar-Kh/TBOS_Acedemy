-- ============================================================================
-- PHASE 17 — COMPLETE ACADEMY OPERATIONS MANAGEMENT SYSTEM MIGRATION
-- TBOS Academy: Operations, Scheduling, Billing Plans & Clash Detection
-- ============================================================================

-- 1. Enhance Enrollments Table
alter table public.enrollments add column if not exists start_date date;
alter table public.enrollments add column if not exists expected_end_date date;
alter table public.enrollments add column if not exists delivery_mode text check (delivery_mode in ('group', 'one_on_one')) default 'group';

-- 2. Billing Plans Table
create table if not exists public.billing_plans (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  enrollment_id uuid references public.enrollments(id) on delete cascade,
  plan_type text not null check (plan_type in ('monthly', 'one_time', 'custom')),
  amount numeric(12, 2) not null check (amount >= 0),
  currency text not null default 'PKR',
  billing_day integer not null check (billing_day between 1 and 28) default 1,
  status text not null check (status in ('active', 'paused', 'cancelled', 'completed')) default 'active',
  start_date date not null default current_date,
  end_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_billing_plan_enrollment unique (enrollment_id)
);

create index if not exists idx_billing_plans_student on public.billing_plans (student_id);
create index if not exists idx_billing_plans_status on public.billing_plans (status);

alter table public.billing_plans enable row level security;
revoke all on public.billing_plans from anon, public;
grant all on public.billing_plans to service_role;


-- 3. Recurring Class Schedules Table
create table if not exists public.recurring_class_schedules (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid references public.enrollments(id) on delete cascade,
  batch_id uuid references public.batches(id) on delete cascade,
  student_id uuid references public.students(id) on delete cascade,
  instructor_id uuid references public.admin_users(id) on delete set null,
  instructor_name text,
  title text not null,
  day_of_week integer not null check (day_of_week between 0 and 6), -- 0=Sun, 1=Mon, ..., 6=Sat
  start_time time not null,
  end_time time not null,
  timezone text not null default 'Asia/Karachi',
  meeting_link text,
  status text not null check (status in ('active', 'paused', 'cancelled')) default 'active',
  is_active boolean not null default true,
  start_date date not null default current_date,
  end_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_recurring_schedules_enrollment on public.recurring_class_schedules (enrollment_id);
create index if not exists idx_recurring_schedules_batch on public.recurring_class_schedules (batch_id);
create index if not exists idx_recurring_schedules_student on public.recurring_class_schedules (student_id);
create index if not exists idx_recurring_schedules_instructor on public.recurring_class_schedules (instructor_id);
create index if not exists idx_recurring_schedules_active on public.recurring_class_schedules (is_active, status);

alter table public.recurring_class_schedules enable row level security;
revoke all on public.recurring_class_schedules from anon, public;
grant all on public.recurring_class_schedules to service_role;


-- 4. Class Session Exceptions Table (for cancellations, reschedules, substitute faculty)
create table if not exists public.class_session_exceptions (
  id uuid primary key default gen_random_uuid(),
  recurring_schedule_id uuid not null references public.recurring_class_schedules(id) on delete cascade,
  session_date date not null,
  exception_type text not null check (exception_type in ('cancelled', 'rescheduled', 'substitute_instructor')),
  original_start_time time,
  original_end_time time,
  new_session_date date,
  new_start_time time,
  new_end_time time,
  new_instructor_id uuid references public.admin_users(id) on delete set null,
  new_instructor_name text,
  reason text not null,
  created_by uuid references public.admin_users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint uq_schedule_session_exception unique (recurring_schedule_id, session_date)
);

create index if not exists idx_session_exceptions_schedule on public.class_session_exceptions (recurring_schedule_id);
create index if not exists idx_session_exceptions_date on public.class_session_exceptions (session_date);

alter table public.class_session_exceptions enable row level security;
revoke all on public.class_session_exceptions from anon, public;
grant all on public.class_session_exceptions to service_role;


-- 5. Enhance Class Sessions Table
alter table public.class_sessions add column if not exists recurring_schedule_id uuid references public.recurring_class_schedules(id) on delete set null;
alter table public.class_sessions add column if not exists student_id uuid references public.students(id) on delete set null;
alter table public.class_sessions add column if not exists is_override boolean not null default false;
alter table public.class_sessions add column if not exists override_reason text;
alter table public.class_sessions add column if not exists override_by uuid references public.admin_users(id) on delete set null;

create index if not exists idx_class_sessions_recurring on public.class_sessions (recurring_schedule_id);
create index if not exists idx_class_sessions_student on public.class_sessions (student_id);


-- 6. Enhance Students Table
alter table public.students add column if not exists guardian_relationship text;
alter table public.students add column if not exists emergency_contact text;


-- 7. RPC: Atomic Complete Student Creation Transaction (create_student_full_tx)
create or replace function public.create_student_full_tx(
  p_params jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_now timestamptz := now();
  v_student_id_str text;
  v_student_id uuid;
  v_enrollment_id uuid;
  v_billing_plan_id uuid;
  v_invoice_id uuid;
  v_invoice_num text;
  v_sessions_count int := 0;
  
  -- Student inputs
  v_full_name text;
  v_email text;
  v_phone text;
  v_whatsapp text;
  v_guardian_name text;
  v_guardian_phone text;
  v_guardian_email text;
  v_guardian_rel text;
  v_emergency_contact text;
  v_dob date;
  v_age int;
  v_country text;
  v_city text;
  v_timezone text;
  v_status text;
  v_notes text;
  v_lead_id uuid;
  
  -- Enrollment inputs
  v_program_slug text;
  v_program_title text;
  v_program_type text;
  v_mode text;
  v_batch_id uuid;
  v_instructor_id uuid;
  v_instructor_name text;
  v_start_date date;
  v_end_date date;
  v_agreed_fee numeric;
  v_discount numeric;
  
  -- Billing inputs
  v_plan_type text;
  v_billing_day int;
  v_create_initial_invoice boolean;
  v_due_date date;
  v_billing_month text;
  v_initial_amount numeric;
  
  -- Schedule inputs
  v_schedules jsonb;
  v_schedule_item jsonb;
  v_gen_weeks int;
  v_sched_id uuid;
  v_sched_day int;
  v_sched_start time;
  v_sched_end time;
  v_sched_title text;
  v_sched_link text;
  v_sched_tz text;
  v_curr_date date;
  v_sess_date date;
  v_day_diff int;
  w int;
  
  -- Actor
  v_actor_id uuid;
  v_actor_email text;
  
  -- Result records
  v_student_row record;
  v_invoice_row record;
begin
  -- 1. Extract and sanitize inputs
  v_full_name := trim(p_params->>'fullName');
  v_email := lower(trim(p_params->>'email'));
  v_phone := trim(p_params->>'phone');
  v_whatsapp := nullif(trim(p_params->>'whatsapp'), '');
  v_guardian_name := nullif(trim(p_params->>'guardianName'), '');
  v_guardian_phone := nullif(trim(p_params->>'guardianPhone'), '');
  v_guardian_email := nullif(lower(trim(p_params->>'guardianEmail')), '');
  v_guardian_rel := nullif(trim(p_params->>'guardianRelationship'), '');
  v_emergency_contact := nullif(trim(p_params->>'emergencyContact'), '');
  if nullif(p_params->>'dateOfBirth', '') is not null then
    v_dob := (p_params->>'dateOfBirth')::date;
  end if;
  if nullif(p_params->>'age', '') is not null then
    v_age := (p_params->>'age')::int;
  end if;
  v_country := coalesce(nullif(trim(p_params->>'country'), ''), 'Pakistan');
  v_city := nullif(trim(p_params->>'city'), '');
  v_timezone := coalesce(nullif(trim(p_params->>'timezone'), ''), 'Asia/Karachi');
  v_status := coalesce(nullif(trim(p_params->>'status'), ''), 'active');
  v_notes := nullif(trim(p_params->>'notes'), '');
  if nullif(p_params->>'leadId', '') is not null then
    v_lead_id := (p_params->>'leadId')::uuid;
  end if;
  
  -- Actor
  if nullif(p_params->>'actorId', '') is not null then
    v_actor_id := (p_params->>'actorId')::uuid;
  end if;
  v_actor_email := coalesce(nullif(trim(p_params->>'actorEmail'), ''), 'system');
  
  if v_full_name is null or length(v_full_name) < 2 then
    raise exception 'INVALID_FULL_NAME';
  end if;
  if v_email is null or position('@' in v_email) = 0 then
    raise exception 'INVALID_EMAIL';
  end if;
  if v_phone is null or length(v_phone) < 7 then
    raise exception 'INVALID_PHONE';
  end if;
  
  -- Duplicate student check
  if exists (select 1 from public.students where email = v_email) then
    raise exception 'STUDENT_EMAIL_EXISTS';
  end if;
  
  -- 2. Generate Next Sequential Student ID
  v_student_id_str := public.get_next_student_id(extract(year from v_now)::int);
  
  v_billing_day := coalesce((p_params->>'billingDay')::int, 1);
  if v_billing_day < 1 or v_billing_day > 28 then
    v_billing_day := 1;
  end if;

  -- 3. Insert student record
  insert into public.students (
    student_id,
    full_name,
    email,
    phone,
    whatsapp,
    guardian_name,
    guardian_phone,
    guardian_email,
    guardian_relationship,
    emergency_contact,
    date_of_birth,
    age,
    country,
    city,
    timezone,
    status,
    notes,
    lead_id,
    billing_day
  ) values (
    v_student_id_str,
    v_full_name,
    v_email,
    v_phone,
    v_whatsapp,
    v_guardian_name,
    v_guardian_phone,
    v_guardian_email,
    v_guardian_rel,
    v_emergency_contact,
    v_dob,
    v_age,
    v_country,
    v_city,
    v_timezone,
    v_status,
    v_notes,
    v_lead_id,
    v_billing_day
  ) returning id into v_student_id;
  
  select * into v_student_row from public.students where id = v_student_id;
  
  -- 4. Enrollment Record (if provided)
  v_program_slug := nullif(trim(p_params->>'programSlug'), '');
  v_program_title := nullif(trim(p_params->>'programTitle'), '');
  v_program_type := coalesce(nullif(trim(p_params->>'programType'), ''), 'live_batch');
  v_mode := coalesce(nullif(trim(p_params->>'mode'), ''), nullif(trim(p_params->>'deliveryMode'), ''), 'group');
  if v_mode not in ('group', 'one_on_one') then
    v_mode := 'group';
  end if;
  if nullif(p_params->>'batchId', '') is not null then
    v_batch_id := (p_params->>'batchId')::uuid;
  end if;
  if nullif(p_params->>'instructorId', '') is not null then
    v_instructor_id := (p_params->>'instructorId')::uuid;
  end if;
  v_instructor_name := nullif(trim(p_params->>'instructorName'), '');
  v_agreed_fee := coalesce((p_params->>'agreedFee')::numeric, 0);
  v_discount := coalesce((p_params->>'discount')::numeric, 0);
  
  if nullif(p_params->>'startDate', '') is not null then
    v_start_date := (p_params->>'startDate')::date;
  else
    v_start_date := current_date;
  end if;
  if nullif(p_params->>'expectedEndDate', '') is not null then
    v_end_date := (p_params->>'expectedEndDate')::date;
  end if;
  
  if v_program_slug is not null and v_program_title is not null then
    insert into public.enrollments (
      student_id,
      batch_id,
      program_slug,
      program_title,
      program_type,
      delivery_mode,
      instructor_id,
      instructor_name,
      agreed_fee,
      discount,
      billing_day,
      enrollment_date,
      start_date,
      expected_end_date,
      status,
      notes
    ) values (
      v_student_id,
      v_batch_id,
      v_program_slug,
      v_program_title,
      v_program_type,
      v_mode,
      v_instructor_id,
      v_instructor_name,
      v_agreed_fee,
      v_discount,
      v_billing_day,
      v_start_date,
      v_start_date,
      v_end_date,
      'active',
      v_notes
    ) returning id into v_enrollment_id;
    
    -- 5. Billing Plan Record
    v_plan_type := coalesce(nullif(trim(p_params->>'planType'), ''), 'monthly');
    
    insert into public.billing_plans (
      student_id,
      enrollment_id,
      plan_type,
      amount,
      currency,
      billing_day,
      status,
      start_date,
      notes
    ) values (
      v_student_id,
      v_enrollment_id,
      v_plan_type,
      greatest(0, v_agreed_fee - v_discount),
      'PKR',
      v_billing_day,
      'active',
      v_start_date,
      v_notes
    ) returning id into v_billing_plan_id;
    
    -- 6. Initial Fee Invoice (if requested)
    v_create_initial_invoice := coalesce((p_params->>'createInitialInvoice')::boolean, true);
    if v_create_initial_invoice then
      v_initial_amount := greatest(0, v_agreed_fee - v_discount);
      v_billing_month := to_char(v_now, 'YYYY-MM');
      v_invoice_num := public.get_next_invoice_number(v_now);
      
      if nullif(p_params->>'dueDate', '') is not null then
        v_due_date := (p_params->>'dueDate')::date;
      else
        v_due_date := (current_date + interval '7 days')::date;
      end if;
      
      insert into public.fee_invoices (
        invoice_number,
        student_id,
        enrollment_id,
        billing_month,
        amount_due,
        amount_paid,
        balance,
        due_date,
        status,
        notes
      ) values (
        v_invoice_num,
        v_student_id,
        v_enrollment_id,
        v_billing_month,
        v_initial_amount,
        0,
        v_initial_amount,
        v_due_date,
        'due',
        'Initial enrollment invoice'
      ) returning id into v_invoice_id;
      
      select * into v_invoice_row from public.fee_invoices where id = v_invoice_id;
    end if;
    
    -- 7. Recurring Class Schedules & Initial Sessions
    v_schedules := p_params->'schedules';
    v_gen_weeks := coalesce((p_params->>'generateWeeks')::int, 4);
    if v_gen_weeks > 12 then v_gen_weeks := 12; end if;
    if v_gen_weeks < 0 then v_gen_weeks := 0; end if;
    
    if v_schedules is not null and jsonb_typeof(v_schedules) = 'array' and jsonb_array_length(v_schedules) > 0 then
      for v_schedule_item in select * from jsonb_array_elements(v_schedules) loop
        v_sched_day := (v_schedule_item->>'dayOfWeek')::int;
        v_sched_start := (v_schedule_item->>'startTime')::time;
        v_sched_end := (v_schedule_item->>'endTime')::time;
        v_sched_title := coalesce(nullif(trim(v_schedule_item->>'title'), ''), v_program_title || ' Class');
        v_sched_link := coalesce(nullif(trim(v_schedule_item->>'meetingLink'), ''), nullif(trim(v_schedule_item->>'meetingUrl'), ''));
        v_sched_tz := coalesce(nullif(trim(v_schedule_item->>'timezone'), ''), v_timezone);
        
        insert into public.recurring_class_schedules (
          enrollment_id,
          batch_id,
          student_id,
          instructor_id,
          instructor_name,
          title,
          day_of_week,
          start_time,
          end_time,
          timezone,
          meeting_link,
          status,
          is_active,
          start_date
        ) values (
          v_enrollment_id,
          v_batch_id,
          v_student_id,
          v_instructor_id,
          v_instructor_name,
          v_sched_title,
          v_sched_day,
          v_sched_start,
          v_sched_end,
          v_sched_tz,
          v_sched_link,
          'active',
          true,
          v_start_date
        ) returning id into v_sched_id;
        
        -- Generate occurrences for rolling window
        if v_gen_weeks > 0 then
          v_curr_date := v_start_date;
          v_day_diff := (v_sched_day - extract(dow from v_curr_date)::int + 7) % 7;
          v_sess_date := (v_curr_date + (v_day_diff || ' days')::interval)::date;
          
          for w in 0..(v_gen_weeks - 1) loop
            insert into public.class_sessions (
              batch_id,
              enrollment_id,
              recurring_schedule_id,
              student_id,
              instructor_id,
              instructor_name,
              title,
              session_date,
              start_time,
              end_time,
              timezone,
              meeting_link,
              status
            ) values (
              v_batch_id,
              v_enrollment_id,
              v_sched_id,
              v_student_id,
              v_instructor_id,
              v_instructor_name,
              case when v_gen_weeks > 1 then v_sched_title || ' (Session ' || (w + 1) || ')' else v_sched_title end,
              (v_sess_date + (w * 7 || ' days')::interval)::date,
              v_sched_start,
              v_sched_end,
              v_sched_tz,
              v_sched_link,
              'scheduled'
            );
            v_sessions_count := v_sessions_count + 1;
          end loop;
        end if;
      end loop;
    end if;
  end if;
  
  -- 8. Lead progression update (if applicable)
  if v_lead_id is not null then
    update public.admissions_requests
    set status = 'enrolled',
        converted_student_id = v_student_id,
        enrollment_date = v_now,
        updated_at = v_now
    where id = v_lead_id;
  end if;
  
  -- 9. Audit Log
  insert into public.crm_audit_logs (
    admin_user_id,
    actor_email,
    action,
    entity,
    entity_id,
    details
  ) values (
    v_actor_id,
    v_actor_email,
    'create_student_full',
    'students',
    v_student_id,
    jsonb_build_object(
      'student_id', v_student_id_str,
      'full_name', v_full_name,
      'email', v_email,
      'program_title', v_program_title,
      'sessions_created', v_sessions_count,
      'invoice_created', v_create_initial_invoice
    )
  );
  
  -- 10. Return created objects
  return jsonb_build_object(
    'student', row_to_json(v_student_row),
    'student_id', v_student_id_str,
    'enrollment_id', v_enrollment_id,
    'billing_plan_id', v_billing_plan_id,
    'invoice', case when v_invoice_id is not null then row_to_json(v_invoice_row) else null end,
    'sessions_count', v_sessions_count
  );
end;
$$;

revoke all on function public.create_student_full_tx(jsonb) from public, anon, authenticated;
grant execute on function public.create_student_full_tx(jsonb) to service_role;


-- 8. RPC: Generate Recurring Class Sessions Batch (generate_recurring_sessions_batch)
create or replace function public.generate_recurring_sessions_batch(
  p_weeks int default 8
)
returns int
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_weeks int := least(12, greatest(1, p_weeks));
  v_sched record;
  v_start_date date;
  v_day_diff int;
  v_first_date date;
  v_sess_date date;
  v_count int := 0;
  w int;
begin
  for v_sched in
    select rcs.*
    from public.recurring_class_schedules rcs
    where rcs.is_active = true
      and rcs.status = 'active'
      and (rcs.end_date is null or rcs.end_date >= current_date)
  loop
    v_start_date := current_date;
    v_day_diff := (v_sched.day_of_week - extract(dow from v_start_date)::int + 7) % 7;
    v_first_date := v_start_date + (v_day_diff || ' days')::interval;
    
    for w in 0..(v_weeks - 1) loop
      v_sess_date := (v_first_date + (w * 7 || ' days')::interval)::date;
      
      -- Check if beyond schedule end_date
      if v_sched.end_date is not null and v_sess_date > v_sched.end_date then
        exit;
      end if;
      
      -- Check if an exception (cancelled) exists for this date
      if exists (
        select 1 from public.class_session_exceptions cse
        where cse.recurring_schedule_id = v_sched.id
          and cse.session_date = v_sess_date
          and cse.exception_type = 'cancelled'
      ) then
        continue;
      end if;
      
      -- Insert if not already existing
      if not exists (
        select 1 from public.class_sessions cs
        where cs.recurring_schedule_id = v_sched.id
          and cs.session_date = v_sess_date
      ) then
        insert into public.class_sessions (
          batch_id,
          enrollment_id,
          recurring_schedule_id,
          student_id,
          instructor_id,
          instructor_name,
          title,
          session_date,
          start_time,
          end_time,
          timezone,
          meeting_link,
          status
        ) values (
          v_sched.batch_id,
          v_sched.enrollment_id,
          v_sched.id,
          v_sched.student_id,
          v_sched.instructor_id,
          v_sched.instructor_name,
          v_sched.title,
          v_sess_date,
          v_sched.start_time,
          v_sched.end_time,
          v_sched.timezone,
          v_sched.meeting_link,
          'scheduled'
        );
        v_count := v_count + 1;
      end if;
    end loop;
  end loop;
  
  return v_count;
end;
$$;

revoke all on function public.generate_recurring_sessions_batch(int) from public, anon, authenticated;
grant execute on function public.generate_recurring_sessions_batch(int) to service_role;


-- 9. RPC: Generate Monthly Dues Batch (generate_monthly_dues_batch)
create or replace function public.generate_monthly_dues_batch(
  p_billing_month text default to_char(current_date, 'YYYY-MM'),
  p_due_day int default 10
)
returns int
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_plan record;
  v_due_date date;
  v_inv_num text;
  v_count int := 0;
  v_now timestamptz := now();
  v_first_of_month date;
  v_last_of_month date;
  v_days_in_month int;
  v_target_day int;
begin
  -- Validate billing month format (YYYY-MM)
  begin
    v_first_of_month := (p_billing_month || '-01')::date;
  exception when others then
    v_first_of_month := date_trunc('month', current_date)::date;
  end;
  v_last_of_month := (v_first_of_month + interval '1 month - 1 day')::date;
  v_days_in_month := extract(day from v_last_of_month)::int;

  for v_plan in
    select bp.*, e.program_title
    from public.billing_plans bp
    join public.enrollments e on e.id = bp.enrollment_id
    where bp.status = 'active'
      and bp.plan_type = 'monthly'
      and bp.amount > 0
      and e.status = 'active'
  loop
    -- Check if invoice for this student, enrollment, billing_month already exists
    if not exists (
      select 1 from public.fee_invoices fi
      where fi.student_id = v_plan.student_id
        and fi.enrollment_id = v_plan.enrollment_id
        and fi.billing_month = p_billing_month
    ) then
      v_inv_num := public.get_next_invoice_number(v_now);
      
      -- Calculate due date based on each student's billing_day (safe for Feb & variable month lengths)
      v_target_day := coalesce(v_plan.billing_day, p_due_day, 10);
      if v_target_day < 1 then v_target_day := 1; end if;
      if v_target_day > v_days_in_month then v_target_day := v_days_in_month; end if;
      
      v_due_date := (to_char(v_first_of_month, 'YYYY-MM') || '-' || lpad(v_target_day::text, 2, '0'))::date;
      
      insert into public.fee_invoices (
        invoice_number,
        student_id,
        enrollment_id,
        billing_month,
        amount_due,
        amount_paid,
        balance,
        due_date,
        status,
        notes
      ) values (
        v_inv_num,
        v_plan.student_id,
        v_plan.enrollment_id,
        p_billing_month,
        v_plan.amount,
        0,
        v_plan.amount,
        v_due_date,
        'due',
        'Monthly recurring tuition fee for ' || coalesce(v_plan.program_title, 'Program')
      );
      v_count := v_count + 1;
    end if;
  end loop;
  
  return v_count;
end;
$$;

revoke all on function public.generate_monthly_dues_batch(text, int) from public, anon, authenticated;
grant execute on function public.generate_monthly_dues_batch(text, int) to service_role;


-- 10. RPC: Transactional Class Sessions Creation with Clash & Override Handling (create_class_sessions_tx)
create or replace function public.create_class_sessions_tx(
  p_params jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_batch_id uuid;
  v_enrollment_id uuid;
  v_student_id uuid;
  v_instructor_id uuid;
  v_instructor_name text;
  v_title text;
  v_session_date date;
  v_start_time time;
  v_end_time time;
  v_start_time_str text;
  v_end_time_str text;
  v_timezone text;
  v_meeting_link text;
  v_status text;
  v_topic_covered text;
  v_homework text;
  v_instructor_notes text;
  v_repeat_weeks int;
  v_override boolean;
  v_override_reason text;
  v_admin_user_id uuid;
  v_admin_email text;
  
  w int;
  v_curr_date date;
  v_conflict_count int;
  v_conflict_msg text;
  v_created_ids jsonb := '[]'::jsonb;
  v_new_id uuid;
  v_is_conflict boolean := false;
  v_now timestamptz := now();
begin
  -- 1. Extract & validate parameters
  v_title := nullif(trim(p_params->>'title'), '');
  if v_title is null then
    raise exception 'SESSION_TITLE_REQUIRED: Class session title is required.' using errcode = '22023';
  end if;
  
  begin
    v_session_date := (p_params->>'sessionDate')::date;
  exception when others then
    raise exception 'INVALID_SESSION_DATE: Valid session date (YYYY-MM-DD) is required.' using errcode = '22007';
  end;
  
  begin
    v_start_time := (p_params->>'startTime')::time;
    v_end_time := (p_params->>'endTime')::time;
  exception when others then
    raise exception 'INVALID_SESSION_TIME: Valid start time and end time (HH:mm) are required.' using errcode = '22007';
  end;
  
  if v_end_time <= v_start_time then
    raise exception 'INVALID_TIME_RANGE: End time must be after start time.' using errcode = '22023';
  end if;

  v_start_time_str := to_char(v_start_time, 'HH24:MI');
  v_end_time_str := to_char(v_end_time, 'HH24:MI');
  
  v_batch_id := nullif(trim(p_params->>'batchId'), '')::uuid;
  v_enrollment_id := nullif(trim(p_params->>'enrollmentId'), '')::uuid;
  v_student_id := nullif(trim(p_params->>'studentId'), '')::uuid;
  v_instructor_id := nullif(trim(p_params->>'instructorId'), '')::uuid;
  v_instructor_name := nullif(trim(p_params->>'instructorName'), '');
  v_timezone := coalesce(nullif(trim(p_params->>'timezone'), ''), 'Asia/Karachi');
  v_meeting_link := coalesce(nullif(trim(p_params->>'meetingLink'), ''), nullif(trim(p_params->>'meetingUrl'), ''));
  v_status := coalesce(nullif(trim(p_params->>'status'), ''), 'scheduled');
  v_topic_covered := nullif(trim(p_params->>'topicCovered'), '');
  v_homework := nullif(trim(p_params->>'homework'), '');
  v_instructor_notes := nullif(trim(p_params->>'instructorNotes'), '');
  
  v_repeat_weeks := coalesce((p_params->>'repeatWeeks')::int, 1);
  if v_repeat_weeks < 1 then v_repeat_weeks := 1; end if;
  if v_repeat_weeks > 12 then v_repeat_weeks := 12; end if;
  
  v_override := coalesce((p_params->>'override')::boolean, (p_params->>'ignoreWarnings')::boolean, false);
  v_override_reason := nullif(trim(p_params->>'overrideReason'), '');
  v_admin_user_id := nullif(trim(p_params->>'adminUserId'), '')::uuid;
  v_admin_email := nullif(trim(p_params->>'adminEmail'), '');
  
  -- 2. Pre-flight Conflict Detection Across All Occurrence Weeks
  for w in 0..(v_repeat_weeks - 1) loop
    v_curr_date := (v_session_date + (w * 7 || ' days')::interval)::date;
    
    select count(*), max(title || ' (' || cs.start_time || '-' || cs.end_time || ')')
    into v_conflict_count, v_conflict_msg
    from public.class_sessions cs
    where cs.session_date = v_curr_date
      and cs.status != 'cancelled'
      and not (cs.end_time::time <= v_start_time or cs.start_time::time >= v_end_time)
      and (
        (v_instructor_id is not null and cs.instructor_id = v_instructor_id) or
        (v_batch_id is not null and cs.batch_id = v_batch_id) or
        (v_student_id is not null and cs.student_id = v_student_id)
      );
      
    if v_conflict_count > 0 then
      v_is_conflict := true;
      if not v_override then
        raise exception 'SCHEDULE_CLASH_DETECTED: Schedule clash detected on % with session: %', v_curr_date, v_conflict_msg using errcode = '23505';
      end if;
      
      -- If overridden, ensure mandatory reason is provided
      if v_override_reason is null then
        raise exception 'MANDATORY_OVERRIDE_REASON_REQUIRED: An administrative override reason is mandatory when resolving schedule clashes.' using errcode = '22023';
      end if;
    end if;
  end loop;
  
  -- 3. Atomic Insertion of All Occurrences
  for w in 0..(v_repeat_weeks - 1) loop
    v_curr_date := (v_session_date + (w * 7 || ' days')::interval)::date;
    
    insert into public.class_sessions (
      batch_id,
      enrollment_id,
      student_id,
      instructor_id,
      instructor_name,
      title,
      session_date,
      start_time,
      end_time,
      timezone,
      meeting_link,
      status,
      topic_covered,
      homework,
      instructor_notes,
      is_override,
      override_reason,
      override_by
    ) values (
      v_batch_id,
      v_enrollment_id,
      v_student_id,
      v_instructor_id,
      v_instructor_name,
      case when v_repeat_weeks > 1 then v_title || ' (Week ' || (w + 1) || ')' else v_title end,
      v_curr_date,
      v_start_time_str,
      v_end_time_str,
      v_timezone,
      v_meeting_link,
      v_status,
      v_topic_covered,
      v_homework,
      v_instructor_notes,
      v_is_conflict and v_override,
      case when v_is_conflict and v_override then v_override_reason else null end,
      case when v_is_conflict and v_override then v_admin_user_id else null end
    ) returning id into v_new_id;
    
    v_created_ids := v_created_ids || to_jsonb(v_new_id::text);
  end loop;
  
  -- 4. Audit Log
  insert into public.crm_audit_logs (
    admin_user_id,
    actor_email,
    action,
    entity,
    entity_id,
    details
  ) values (
    v_admin_user_id,
    v_admin_email,
    case when v_is_conflict and v_override then 'class_sessions_override_scheduled' else 'class_sessions_scheduled' end,
    'class_sessions',
    v_created_ids->>0,
    jsonb_build_object(
      'title', v_title,
      'weeks', v_repeat_weeks,
      'session_ids', v_created_ids,
      'override', v_is_conflict and v_override,
      'override_reason', v_override_reason
    )
  );
  
  return jsonb_build_object(
    'ok', true,
    'success', true,
    'created_count', v_repeat_weeks,
    'session_ids', v_created_ids,
    'is_override', v_is_conflict and v_override
  );
end;
$$;

revoke all on function public.create_class_sessions_tx(jsonb) from public, anon, authenticated;
grant execute on function public.create_class_sessions_tx(jsonb) to service_role;


