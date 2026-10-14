# TBOS Academy CRM Disaster Recovery & Data Restoration Guide

**Document Version**: 1.0 (Phase 16)  
**Classification**: Administrative Confidential  
**Target Roles**: System Owner, Lead Database Engineer  

---

## 1. Overview & Data Sovereignty

TechBuilt Open School (TBOS) maintains a strict offline disaster recovery and data sovereignty policy.  
All administrative and operational data—including students, academic cohorts, fee structures, payment ledgers, class timetable sessions, and administrative audit trails—can be exported into a single standardized JSON snapshot containing cryptographic and versioning metadata.

---

## 2. Export Specifications

### Authorization
- **Strict Role Restriction**: Only authenticated users with the **`owner`** role can trigger or download full disaster recovery backups.
- Requests from any other administrative role (`admin`, `admissions`, `instructor`, `accountant`) are rejected with `HTTP 403 Forbidden`.

### Snapshot Schema Structure
```json
{
  "schema_version": "20261014.1",
  "exported_at": "2026-10-14T07:00:00.000Z",
  "exported_by": "shahriyarkhanpk1@gmail.com",
  "academy": "TechBuilt Open School",
  "environment": "production",
  "entities": {
    "students": [...],
    "batches": [...],
    "enrollments": [...],
    "fee_invoices": [...],
    "fee_payments": [...],
    "class_sessions": [...],
    "class_attendance": [...],
    "crm_tasks": [...],
    "crm_audit_logs": [...]
  }
}
```

---

## 3. Restoration Procedure

In the event of a catastrophic incident or migration to a fresh database cluster, follow this step-by-step restoration pipeline:

### Step 1: Provision Clean Database Schema
Execute the base migration on the target PostgreSQL instance:
```bash
supabase db push
# Or run: supabase/migrations/20261014000000_phase16_academy_crm.sql
```

### Step 2: Validate Backup Integrity
Before ingestion, verify that the backup file:
1. Parses as valid JSON without truncation.
2. Contains `schema_version: "20261014.1"`.
3. Validates foreign key referential integrity (students → enrollments → invoices → payments).

### Step 3: Run Ingestion Script
Run the automated restore utility (`scripts/restore-crm-backup.cjs` or equivalent):
```bash
node scripts/restore-crm-backup.cjs --file=./TBOS_CRM_FULL_BACKUP_2026-10-14.json
```

The restoration script applies the following transactional order:
1. `students` (with historical `student_id` preserved)
2. `batches`
3. `enrollments` (linked to `students` and `batches`)
4. `fee_invoices` (linked to `students` and `enrollments`)
5. `fee_payments` (linked to `fee_invoices`)
6. `class_sessions`
7. `class_attendance`
8. `crm_tasks`
9. `crm_sequences` (reset counters to `max(existing) + 1` to prevent future collisions)

### Step 4: Reset Sequence Counters
Ensure that monotonic counters reflect the restored maximum values:
```sql
insert into public.crm_sequences (sequence_key, current_value, updated_at)
values ('student_id_2026', (select coalesce(max(substring(student_id from 11)::bigint), 0) from public.students), now())
on conflict (sequence_key)
do update set current_value = excluded.current_value;
```

---

## 4. Verification Check
After restoration, verify row counts and referential integrity:
```sql
select count(*) as restored_students from public.students;
select count(*) as restored_invoices from public.fee_invoices;
select count(*) as restored_payments from public.fee_payments;
```

