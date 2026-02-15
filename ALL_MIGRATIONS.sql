-- Combined Migrations for PayPilot
-- Generated: 2026-02-15T11:04:47.803Z

-- ========================================
-- Migration: 20260215000001_initial_schema.sql
-- ========================================

-- PayPilot Database Schema
-- Initial migration: Core entities for HR & Payroll platform

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";

-- ============================================================================
-- BOUNDED CONTEXT: Identity & Access
-- ============================================================================

-- Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email CITEXT UNIQUE NOT NULL,
  phone TEXT UNIQUE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('signup_pending', 'email_unverified', 'active', 'restricted', 'suspended', 'deleted')),
  role TEXT NOT NULL DEFAULT 'employee'
    CHECK (role IN ('super_admin', 'company_admin', 'hr_manager', 'manager', 'employee')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_status ON profiles(status);
CREATE INDEX idx_profiles_role ON profiles(role);

-- Companies/Organizations
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug CITEXT UNIQUE NOT NULL,
  logo_url TEXT,
  website TEXT,
  industry TEXT,
  size TEXT CHECK (size IN ('1-10', '11-50', '51-200', '201-500', '500+')),
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'US',
  tax_id TEXT,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('trial', 'active', 'suspended', 'cancelled')),
  stripe_customer_id TEXT,
  subscription_tier TEXT DEFAULT 'trial'
    CHECK (subscription_tier IN ('trial', 'starter', 'professional', 'enterprise')),
  subscription_status TEXT DEFAULT 'trialing'
    CHECK (subscription_status IN ('trialing', 'active', 'past_due', 'cancelled')),
  trial_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_companies_slug ON companies(slug);
CREATE INDEX idx_companies_status ON companies(status);
CREATE INDEX idx_companies_stripe ON companies(stripe_customer_id);

-- Company membership (links users to companies)
CREATE TABLE company_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'employee'
    CHECK (role IN ('owner', 'admin', 'hr_manager', 'manager', 'employee')),
  department TEXT,
  job_title TEXT,
  reports_to UUID REFERENCES profiles(id),
  hire_date DATE,
  employment_type TEXT DEFAULT 'full_time'
    CHECK (employment_type IN ('full_time', 'part_time', 'contractor', 'intern')),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('pending', 'active', 'on_leave', 'terminated')),
  salary_amount_cents BIGINT,
  salary_currency TEXT DEFAULT 'USD',
  salary_frequency TEXT DEFAULT 'annual'
    CHECK (salary_frequency IN ('hourly', 'annual')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  terminated_at TIMESTAMPTZ,
  UNIQUE(company_id, user_id)
);

CREATE INDEX idx_company_members_company ON company_members(company_id);
CREATE INDEX idx_company_members_user ON company_members(user_id);
CREATE INDEX idx_company_members_reports ON company_members(reports_to);
CREATE INDEX idx_company_members_status ON company_members(status);

-- ============================================================================
-- BOUNDED CONTEXT: Core Domain - Payroll
-- ============================================================================

-- Payroll runs
CREATE TABLE payroll_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  pay_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'pending_approval', 'approved', 'processing', 'completed', 'failed', 'cancelled')),
  total_gross_cents BIGINT NOT NULL DEFAULT 0,
  total_deductions_cents BIGINT NOT NULL DEFAULT 0,
  total_net_cents BIGINT NOT NULL DEFAULT 0,
  total_employer_taxes_cents BIGINT NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ,
  notes TEXT,
  version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payroll_runs_company ON payroll_runs(company_id);
CREATE INDEX idx_payroll_runs_status ON payroll_runs(status);
CREATE INDEX idx_payroll_runs_dates ON payroll_runs(period_start, period_end);

-- Payroll items (individual employee payments in a run)
CREATE TABLE payroll_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_run_id UUID NOT NULL REFERENCES payroll_runs(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES company_members(id) ON DELETE CASCADE,
  hours_worked DECIMAL(10,2),
  hourly_rate_cents BIGINT,
  gross_pay_cents BIGINT NOT NULL DEFAULT 0,
  federal_tax_cents BIGINT NOT NULL DEFAULT 0,
  state_tax_cents BIGINT NOT NULL DEFAULT 0,
  social_security_cents BIGINT NOT NULL DEFAULT 0,
  medicare_cents BIGINT NOT NULL DEFAULT 0,
  other_deductions_cents BIGINT NOT NULL DEFAULT 0,
  net_pay_cents BIGINT NOT NULL DEFAULT 0,
  deductions_breakdown JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'paid', 'failed')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payroll_items_run ON payroll_items(payroll_run_id);
CREATE INDEX idx_payroll_items_employee ON payroll_items(employee_id);
CREATE INDEX idx_payroll_items_status ON payroll_items(status);

-- ============================================================================
-- BOUNDED CONTEXT: Core Domain - Time Tracking
-- ============================================================================

-- Time entries
CREATE TABLE time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES company_members(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  clock_in TIMESTAMPTZ,
  clock_out TIMESTAMPTZ,
  break_minutes INT DEFAULT 0,
  total_hours DECIMAL(5,2),
  entry_type TEXT DEFAULT 'regular'
    CHECK (entry_type IN ('regular', 'overtime', 'holiday', 'sick', 'vacation', 'personal')),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_time_entries_company ON time_entries(company_id);
CREATE INDEX idx_time_entries_employee ON time_entries(employee_id);
CREATE INDEX idx_time_entries_date ON time_entries(date);
CREATE INDEX idx_time_entries_status ON time_entries(status);

-- PTO/Leave requests
CREATE TABLE leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES company_members(id) ON DELETE CASCADE,
  leave_type TEXT NOT NULL
    CHECK (leave_type IN ('vacation', 'sick', 'personal', 'parental', 'bereavement', 'unpaid')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days DECIMAL(4,1) NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_leave_requests_company ON leave_requests(company_id);
CREATE INDEX idx_leave_requests_employee ON leave_requests(employee_id);
CREATE INDEX idx_leave_requests_dates ON leave_requests(start_date, end_date);
CREATE INDEX idx_leave_requests_status ON leave_requests(status);

-- PTO balances
CREATE TABLE pto_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES company_members(id) ON DELETE CASCADE,
  leave_type TEXT NOT NULL
    CHECK (leave_type IN ('vacation', 'sick', 'personal')),
  year INT NOT NULL,
  total_days DECIMAL(5,1) NOT NULL DEFAULT 0,
  used_days DECIMAL(5,1) NOT NULL DEFAULT 0,
  pending_days DECIMAL(5,1) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(employee_id, leave_type, year)
);

CREATE INDEX idx_pto_balances_employee ON pto_balances(employee_id);

-- ============================================================================
-- BOUNDED CONTEXT: Core Domain - Benefits
-- ============================================================================

-- Benefit plans
CREATE TABLE benefit_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL
    CHECK (type IN ('health', 'dental', 'vision', '401k', 'life', 'disability', 'hsa', 'fsa')),
  provider TEXT,
  description TEXT,
  cost_employee_cents BIGINT NOT NULL DEFAULT 0,
  cost_employer_cents BIGINT NOT NULL DEFAULT 0,
  cost_frequency TEXT DEFAULT 'monthly'
    CHECK (cost_frequency IN ('monthly', 'biweekly', 'annual')),
  details JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_benefit_plans_company ON benefit_plans(company_id);
CREATE INDEX idx_benefit_plans_type ON benefit_plans(type);

-- Employee benefit enrollments
CREATE TABLE benefit_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES company_members(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES benefit_plans(id) ON DELETE CASCADE,
  coverage_level TEXT DEFAULT 'individual'
    CHECK (coverage_level IN ('individual', 'individual_spouse', 'individual_children', 'family')),
  effective_date DATE NOT NULL,
  termination_date DATE,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('pending', 'active', 'terminated')),
  monthly_employee_cost_cents BIGINT,
  dependents JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(employee_id, plan_id, effective_date)
);

CREATE INDEX idx_benefit_enrollments_employee ON benefit_enrollments(employee_id);
CREATE INDEX idx_benefit_enrollments_plan ON benefit_enrollments(plan_id);
CREATE INDEX idx_benefit_enrollments_status ON benefit_enrollments(status);

-- ============================================================================
-- BOUNDED CONTEXT: Trust, Safety & Compliance
-- ============================================================================

-- Audit logs (append-only, NEVER edited)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  actor_user_id UUID REFERENCES profiles(id),
  actor_role TEXT,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID,
  before_state JSONB,
  after_state JSONB,
  ip INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_target ON audit_logs(target_type, target_id);
CREATE INDEX idx_audit_actor ON audit_logs(actor_user_id);
CREATE INDEX idx_audit_company ON audit_logs(company_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

-- ============================================================================
-- BOUNDED CONTEXT: Communication
-- ============================================================================

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  link TEXT,
  read_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id) WHERE read_at IS NULL;

-- ============================================================================
-- BOUNDED CONTEXT: Event-Driven Backbone
-- ============================================================================

-- Outbox events (for reliable event publishing)
CREATE TABLE outbox_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  aggregate_type TEXT NOT NULL,
  aggregate_id UUID NOT NULL,
  payload JSONB NOT NULL,
  idempotency_key TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ,
  attempts INT NOT NULL DEFAULT 0,
  last_error TEXT
);

CREATE INDEX idx_outbox_unpublished ON outbox_events(created_at) WHERE published_at IS NULL;
CREATE INDEX idx_outbox_aggregate ON outbox_events(aggregate_type, aggregate_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE pto_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE benefit_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE benefit_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE outbox_events ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Company members policies
CREATE POLICY "Users can view members of their company" ON company_members
  FOR SELECT USING (
    user_id = auth.uid() OR
    company_id IN (SELECT company_id FROM company_members WHERE user_id = auth.uid())
  );

-- Companies policies
CREATE POLICY "Users can view their companies" ON companies
  FOR SELECT USING (
    id IN (SELECT company_id FROM company_members WHERE user_id = auth.uid())
  );

-- Time entries policies
CREATE POLICY "Users can view their own time entries" ON time_entries
  FOR SELECT USING (
    employee_id IN (SELECT id FROM company_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create their own time entries" ON time_entries
  FOR INSERT WITH CHECK (
    employee_id IN (SELECT id FROM company_members WHERE user_id = auth.uid())
  );

-- Leave requests policies
CREATE POLICY "Users can view their own leave requests" ON leave_requests
  FOR SELECT USING (
    employee_id IN (SELECT id FROM company_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create their own leave requests" ON leave_requests
  FOR INSERT WITH CHECK (
    employee_id IN (SELECT id FROM company_members WHERE user_id = auth.uid())
  );

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_members_updated_at BEFORE UPDATE ON company_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payroll_runs_updated_at BEFORE UPDATE ON payroll_runs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payroll_items_updated_at BEFORE UPDATE ON payroll_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_entries_updated_at BEFORE UPDATE ON time_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leave_requests_updated_at BEFORE UPDATE ON leave_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pto_balances_updated_at BEFORE UPDATE ON pto_balances
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_benefit_plans_updated_at BEFORE UPDATE ON benefit_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_benefit_enrollments_updated_at BEFORE UPDATE ON benefit_enrollments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    CASE WHEN NEW.email_confirmed_at IS NOT NULL THEN 'active' ELSE 'email_unverified' END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ========================================
-- Migration: 20260215000002_seed_data.sql
-- ========================================

-- PayPilot Seed Data
-- Demo data for showcasing the platform

-- Create demo company and user membership
DO $$
DECLARE
  demo_user_id UUID;
  acme_company_id UUID;
  demo_member_id UUID;
  health_plan_id UUID;
  dental_plan_id UUID;
  vision_plan_id UUID;
  k401_plan_id UUID;
BEGIN
  -- Get the demo user
  SELECT id INTO demo_user_id FROM auth.users WHERE email = 'demo@paypilot.com' LIMIT 1;

  IF demo_user_id IS NULL THEN
    RAISE NOTICE 'Demo user not found, skipping seed data';
    RETURN;
  END IF;

  -- Update demo user's profile if it exists, or create it
  INSERT INTO profiles (id, email, full_name, role, status)
  VALUES (demo_user_id, 'demo@paypilot.com', 'Demo User', 'company_admin', 'active')
  ON CONFLICT (id) DO UPDATE SET
    full_name = 'Demo User',
    role = 'company_admin',
    status = 'active';

  -- Create demo company
  INSERT INTO companies (
    id, name, slug, industry, size, address_line1, city, state, postal_code, country,
    status, subscription_tier, subscription_status, trial_ends_at
  ) VALUES (
    gen_random_uuid(),
    'Acme Technologies',
    'acme-technologies',
    'Technology',
    '51-200',
    '123 Innovation Drive',
    'San Francisco',
    'CA',
    '94105',
    'US',
    'active',
    'professional',
    'active',
    now() + interval '14 days'
  )
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO acme_company_id;

  -- Get company ID if it already existed
  IF acme_company_id IS NULL THEN
    SELECT id INTO acme_company_id FROM companies WHERE slug = 'acme-technologies';
  END IF;

  -- Add demo user as company owner
  INSERT INTO company_members (
    id, company_id, user_id, role, department, job_title, hire_date,
    employment_type, status, salary_amount_cents, salary_currency, salary_frequency
  ) VALUES (
    gen_random_uuid(),
    acme_company_id,
    demo_user_id,
    'owner',
    'Executive',
    'CEO & Founder',
    '2020-01-15',
    'full_time',
    'active',
    25000000,
    'USD',
    'annual'
  )
  ON CONFLICT (company_id, user_id) DO NOTHING
  RETURNING id INTO demo_member_id;

  -- Get member ID if it already existed
  IF demo_member_id IS NULL THEN
    SELECT id INTO demo_member_id FROM company_members WHERE company_id = acme_company_id AND user_id = demo_user_id;
  END IF;

  -- Create benefit plans
  INSERT INTO benefit_plans (id, company_id, name, type, provider, description, cost_employee_cents, cost_employer_cents, cost_frequency, status)
  VALUES (
    gen_random_uuid(),
    acme_company_id,
    'Premium Health Insurance',
    'health',
    'Blue Cross Blue Shield',
    'Comprehensive medical coverage including vision and mental health',
    35000,
    45000,
    'monthly',
    'active'
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO health_plan_id;

  INSERT INTO benefit_plans (id, company_id, name, type, provider, description, cost_employee_cents, cost_employer_cents, cost_frequency, status)
  VALUES (
    gen_random_uuid(),
    acme_company_id,
    'Dental Plus',
    'dental',
    'Delta Dental',
    'Full dental coverage including orthodontics',
    4500,
    5500,
    'monthly',
    'active'
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO dental_plan_id;

  INSERT INTO benefit_plans (id, company_id, name, type, provider, description, cost_employee_cents, cost_employer_cents, cost_frequency, status)
  VALUES (
    gen_random_uuid(),
    acme_company_id,
    'Vision Care',
    'vision',
    'VSP',
    'Vision coverage with annual eye exams and glasses/contacts allowance',
    1500,
    2000,
    'monthly',
    'active'
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO vision_plan_id;

  INSERT INTO benefit_plans (id, company_id, name, type, provider, description, cost_employee_cents, cost_employer_cents, cost_frequency, status)
  VALUES (
    gen_random_uuid(),
    acme_company_id,
    '401(k) Retirement Plan',
    '401k',
    'Fidelity',
    'Traditional and Roth 401(k) with 4% company match',
    0,
    0,
    'monthly',
    'active'
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO k401_plan_id;

  -- Create recent payroll run
  INSERT INTO payroll_runs (
    company_id, period_start, period_end, pay_date, status,
    total_gross_cents, total_deductions_cents, total_net_cents, total_employer_taxes_cents
  ) VALUES (
    acme_company_id,
    '2026-02-01',
    '2026-02-15',
    '2026-02-15',
    'completed',
    36725000,
    8172500,
    28552500,
    2810062
  );

  -- Create PTO balances for demo member
  INSERT INTO pto_balances (employee_id, leave_type, year, total_days, used_days, pending_days)
  SELECT demo_member_id, leave_type, 2026, total, used, pending
  FROM (VALUES
    ('vacation', 20.0, 5.0, 0.0),
    ('sick', 10.0, 2.0, 0.0),
    ('personal', 3.0, 1.0, 0.0)
  ) AS v(leave_type, total, used, pending)
  ON CONFLICT (employee_id, leave_type, year) DO NOTHING;

  -- Create some time entries for this month
  INSERT INTO time_entries (company_id, employee_id, date, clock_in, clock_out, break_minutes, total_hours, entry_type, status)
  SELECT
    acme_company_id,
    demo_member_id,
    d::date,
    d + interval '9 hours',
    d + interval '17 hours 30 minutes',
    30,
    8.0,
    'regular',
    'approved'
  FROM generate_series('2026-02-01'::date, '2026-02-14'::date, '1 day'::interval) d
  WHERE EXTRACT(dow FROM d) NOT IN (0, 6) -- Exclude weekends
  ON CONFLICT DO NOTHING;

  -- Create a pending leave request
  INSERT INTO leave_requests (
    company_id, employee_id, leave_type, start_date, end_date, total_days, reason, status
  ) VALUES (
    acme_company_id,
    demo_member_id,
    'vacation',
    '2026-03-15',
    '2026-03-19',
    5.0,
    'Spring vacation',
    'pending'
  );

  RAISE NOTICE 'Seed data created successfully for company: %', acme_company_id;
END $$;


-- ========================================
-- Migration: 20260215000003_ai_agents.sql
-- ========================================

-- ============================================================================
-- AI AGENTS MODULE - PayPilot
-- Orthogonal module for AI-powered employee engagement agents
-- ============================================================================

-- ============================================================================
-- HELPER FUNCTION (create if not exists)
-- ============================================================================

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Agent templates/definitions (system-level)
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  agent_type TEXT NOT NULL CHECK (agent_type IN ('pulse_check', 'onboarding', 'exit_interview', 'manager_coaching', 'policy_qa', 'custom')),
  base_prompt TEXT NOT NULL,
  tools_allowed JSONB DEFAULT '[]'::jsonb,
  default_config JSONB DEFAULT '{}'::jsonb,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Agent instances (company-specific deployments)
CREATE TABLE agent_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id),
  name TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Config includes: tone_preset, audience_type, audience_filter, guardrails
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'paused', 'archived')),
  version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_agent_instances_company ON agent_instances(company_id);
CREATE INDEX idx_agent_instances_status ON agent_instances(status);

-- Agent schedules (when to trigger)
CREATE TABLE agent_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_instance_id UUID NOT NULL REFERENCES agent_instances(id) ON DELETE CASCADE,
  cadence TEXT NOT NULL CHECK (cadence IN ('once', 'daily', 'weekly', 'biweekly', 'monthly', 'custom')),
  cron_expression TEXT, -- For custom cadence
  timezone TEXT NOT NULL DEFAULT 'America/New_York',
  next_run_at TIMESTAMPTZ,
  last_run_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_agent_schedules_next_run ON agent_schedules(next_run_at) WHERE is_active = true;
CREATE INDEX idx_agent_schedules_instance ON agent_schedules(agent_instance_id);

-- Conversations (one per employee per agent instance)
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  agent_instance_id UUID NOT NULL REFERENCES agent_instances(id) ON DELETE CASCADE,
  participant_user_id UUID NOT NULL REFERENCES profiles(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'escalated', 'closed')),
  last_message_at TIMESTAMPTZ,
  last_touched_at TIMESTAMPTZ DEFAULT now(),
  message_count INT DEFAULT 0,
  unread_count INT DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_conversations_unique ON conversations(agent_instance_id, participant_user_id);
CREATE INDEX idx_conversations_company ON conversations(company_id);
CREATE INDEX idx_conversations_participant ON conversations(participant_user_id);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC);

-- Messages (conversation thread)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('employee', 'agent', 'system')),
  sender_id UUID, -- NULL for agent/system, user_id for employee
  content TEXT NOT NULL,
  content_type TEXT DEFAULT 'text' CHECK (content_type IN ('text', 'quick_reply', 'card', 'escalation')),
  metadata JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_unread ON messages(conversation_id) WHERE is_read = false;

-- Agent runs (execution log)
CREATE TABLE agent_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_instance_id UUID NOT NULL REFERENCES agent_instances(id) ON DELETE CASCADE,
  run_type TEXT NOT NULL CHECK (run_type IN ('scheduled', 'manual', 'reply', 'nudge')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  started_at TIMESTAMPTZ DEFAULT now(),
  finished_at TIMESTAMPTZ,
  messages_sent INT DEFAULT 0,
  conversations_touched INT DEFAULT 0,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_agent_runs_instance ON agent_runs(agent_instance_id, created_at DESC);
CREATE INDEX idx_agent_runs_status ON agent_runs(status) WHERE status IN ('pending', 'running');

-- Feedback summaries (AI-generated insights per conversation)
CREATE TABLE feedback_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  sentiment TEXT NOT NULL CHECK (sentiment IN ('positive', 'neutral', 'negative', 'mixed')),
  sentiment_score DECIMAL(3,2), -- -1.0 to 1.0
  tags JSONB DEFAULT '[]'::jsonb, -- ['workload', 'manager', 'culture']
  action_items JSONB DEFAULT '[]'::jsonb, -- [{text, confidence, priority}]
  key_quotes JSONB DEFAULT '[]'::jsonb, -- Notable employee quotes
  message_range_start UUID REFERENCES messages(id),
  message_range_end UUID REFERENCES messages(id),
  previous_summary_id UUID REFERENCES feedback_summaries(id),
  delta_notes TEXT, -- What changed since last summary
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_feedback_summaries_conversation ON feedback_summaries(conversation_id, computed_at DESC);
CREATE INDEX idx_feedback_summaries_sentiment ON feedback_summaries(sentiment);
CREATE INDEX idx_feedback_summaries_computed ON feedback_summaries(computed_at DESC);

-- Escalations (when agent detects serious issues)
CREATE TABLE agent_escalations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  trigger_message_id UUID REFERENCES messages(id),
  escalation_type TEXT NOT NULL CHECK (escalation_type IN ('safety', 'harassment', 'discrimination', 'urgent', 'manual')),
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'acknowledged', 'resolved', 'dismissed')),
  assigned_to UUID REFERENCES profiles(id),
  resolved_by UUID REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_escalations_company ON agent_escalations(company_id, status);
CREATE INDEX idx_escalations_open ON agent_escalations(status) WHERE status = 'open';

-- ============================================================================
-- TONE PRESETS (stored as config reference)
-- ============================================================================

CREATE TABLE tone_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  system_prompt_modifier TEXT NOT NULL,
  constraints JSONB DEFAULT '{}'::jsonb,
  example_messages JSONB DEFAULT '[]'::jsonb,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_escalations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tone_presets ENABLE ROW LEVEL SECURITY;

-- Agents: system templates readable by all authenticated
CREATE POLICY "agents_read_system" ON agents
  FOR SELECT TO authenticated
  USING (is_system = true);

-- Agent instances: company members can read, admins can manage
CREATE POLICY "agent_instances_read" ON agent_instances
  FOR SELECT TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM company_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "agent_instances_insert" ON agent_instances
  FOR INSERT TO authenticated
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM company_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'hr_manager')
    )
  );

CREATE POLICY "agent_instances_update" ON agent_instances
  FOR UPDATE TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM company_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'hr_manager')
    )
  );

-- Agent schedules: follow agent instance access
CREATE POLICY "agent_schedules_read" ON agent_schedules
  FOR SELECT TO authenticated
  USING (
    agent_instance_id IN (
      SELECT id FROM agent_instances WHERE company_id IN (
        SELECT company_id FROM company_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "agent_schedules_manage" ON agent_schedules
  FOR ALL TO authenticated
  USING (
    agent_instance_id IN (
      SELECT id FROM agent_instances WHERE company_id IN (
        SELECT company_id FROM company_members
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'hr_manager')
      )
    )
  );

-- Conversations: employees see their own, admins see all in company
CREATE POLICY "conversations_read_own" ON conversations
  FOR SELECT TO authenticated
  USING (
    participant_user_id = auth.uid()
    OR company_id IN (
      SELECT company_id FROM company_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'hr_manager', 'manager')
    )
  );

CREATE POLICY "conversations_insert" ON conversations
  FOR INSERT TO authenticated
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM company_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "conversations_update" ON conversations
  FOR UPDATE TO authenticated
  USING (
    participant_user_id = auth.uid()
    OR company_id IN (
      SELECT company_id FROM company_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'hr_manager')
    )
  );

-- Messages: follow conversation access
CREATE POLICY "messages_read" ON messages
  FOR SELECT TO authenticated
  USING (
    conversation_id IN (
      SELECT id FROM conversations WHERE
        participant_user_id = auth.uid()
        OR company_id IN (
          SELECT company_id FROM company_members
          WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'hr_manager', 'manager')
        )
    )
  );

CREATE POLICY "messages_insert" ON messages
  FOR INSERT TO authenticated
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM conversations WHERE
        participant_user_id = auth.uid()
        OR company_id IN (
          SELECT company_id FROM company_members
          WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'hr_manager')
        )
    )
  );

-- Agent runs: admins only
CREATE POLICY "agent_runs_read" ON agent_runs
  FOR SELECT TO authenticated
  USING (
    agent_instance_id IN (
      SELECT id FROM agent_instances WHERE company_id IN (
        SELECT company_id FROM company_members
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'hr_manager')
      )
    )
  );

-- Feedback summaries: admins see all, employees see limited
CREATE POLICY "feedback_summaries_admin_read" ON feedback_summaries
  FOR SELECT TO authenticated
  USING (
    conversation_id IN (
      SELECT id FROM conversations WHERE company_id IN (
        SELECT company_id FROM company_members
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'hr_manager', 'manager')
      )
    )
  );

-- Escalations: admins only
CREATE POLICY "escalations_read" ON agent_escalations
  FOR SELECT TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM company_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'hr_manager')
    )
  );

CREATE POLICY "escalations_manage" ON agent_escalations
  FOR ALL TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM company_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'hr_manager')
    )
  );

-- Tone presets: readable by all
CREATE POLICY "tone_presets_read" ON tone_presets
  FOR SELECT TO authenticated
  USING (true);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update conversation stats on new message
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET
    last_message_at = NEW.created_at,
    last_touched_at = NEW.created_at,
    message_count = message_count + 1,
    unread_count = CASE
      WHEN NEW.sender_type = 'agent' THEN unread_count + 1
      ELSE unread_count
    END,
    updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_message_insert
AFTER INSERT ON messages
FOR EACH ROW EXECUTE FUNCTION update_conversation_on_message();

-- Auto-update updated_at
CREATE TRIGGER trg_agent_instances_updated
BEFORE UPDATE ON agent_instances
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_agent_schedules_updated
BEFORE UPDATE ON agent_schedules
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_conversations_updated
BEFORE UPDATE ON conversations
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_escalations_updated
BEFORE UPDATE ON agent_escalations
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- SEED SYSTEM DATA
-- ============================================================================

-- Insert system tone presets
INSERT INTO tone_presets (slug, name, description, system_prompt_modifier, constraints, example_messages, is_system) VALUES
('friendly_peer', 'Friendly Peer', 'Casual and approachable, like a colleague',
'Communicate like a friendly coworker. Use casual language, contractions, and occasional emoji. Be warm but not overly familiar.',
'{"max_formality": 3, "emoji_allowed": true, "humor_level": "light"}'::jsonb,
'["Hey! Quick check-in - how''s your week going so far? 🙂", "Thanks for sharing that! Sounds like things are moving along."]'::jsonb,
true),

('professional_hr', 'Professional HR', 'Formal and supportive HR tone',
'Communicate professionally as an HR representative. Use proper grammar, be supportive and empathetic, but maintain appropriate boundaries.',
'{"max_formality": 8, "emoji_allowed": false, "humor_level": "none"}'::jsonb,
'["Good afternoon. I wanted to check in regarding your experience this week.", "Thank you for your feedback. Your input is valuable to us."]'::jsonb,
true),

('witty_safe', 'Witty but Safe', 'Light humor while staying appropriate',
'Use light humor and wit to keep conversations engaging, but never at anyone''s expense. Stay positive and inclusive.',
'{"max_formality": 4, "emoji_allowed": true, "humor_level": "medium"}'::jsonb,
'["Time for our weekly chat! Promise this won''t feel like a dentist appointment 😄", "That''s great to hear! High five through the screen ✋"]'::jsonb,
true),

('poke_lite', 'Poke-lite', 'Short, playful, never manipulative - inspired by Poke',
'Be brief, friendly, and slightly playful. Ask ONE question at a time, max 240 characters. Never guilt-trip or manipulate. Reference previous conversations when relevant. If someone seems stressed, be supportive without being therapy-like.',
'{"max_formality": 2, "emoji_allowed": true, "humor_level": "light", "max_chars": 240, "questions_per_message": 1}'::jsonb,
'["Hey! One quick q: How''s the workload feeling this week? 📊", "Got it! Last time you mentioned projects piling up - any better?", "Thanks for the honesty. That''s helpful to know 💪"]'::jsonb,
true);

-- Insert system agent templates
INSERT INTO agents (slug, name, description, agent_type, base_prompt, tools_allowed, default_config, is_system) VALUES
('pulse_check', 'Pulse Check', 'Weekly check-in to gauge employee sentiment and surface issues early', 'pulse_check',
'You are PayPilot''s Pulse Assistant. You are NOT a human - always be transparent about being an AI assistant.

Your job: Get honest employee feedback with minimal burden. Help surface workplace issues before they become problems.

RULES:
1. Ask ONE question at a time, max 240 characters
2. Be conversational and natural, not robotic
3. Reference previous conversations when relevant ("Last time you mentioned X...")
4. If this is a first conversation, introduce yourself briefly

NEVER:
- Ask for medical info, immigration status, SSN, bank details, or anything illegal
- Pretend to be human
- Be manipulative or guilt-trippy
- Provide therapy or medical advice
- Make promises you can''t keep

IF employee indicates self-harm, harassment, discrimination, or safety risk:
- Express care and concern
- Tell them you''re routing to HR for proper support
- End the automated conversation

TOPICS TO EXPLORE (vary by conversation):
- Workload and stress levels
- Team dynamics and collaboration
- Manager relationship
- Tools and resources
- Growth and development
- Work-life balance
- Company culture

Start conversations with a simple, warm check-in. Build rapport over time.',
'["memory", "escalate", "summarize"]'::jsonb,
'{"default_tone": "poke_lite", "default_cadence": "weekly"}'::jsonb,
true),

('onboarding', 'Onboarding Buddy', 'Help new hires get settled and surface early friction', 'onboarding',
'You are PayPilot''s Onboarding Buddy. You help new employees feel welcome and ensure their first weeks go smoothly.

Your job: Check in with new hires, answer common questions, and flag issues to HR.

APPROACH:
- Be warm and welcoming
- Ask about their onboarding experience
- Check if they have what they need (equipment, access, introductions)
- Identify any blockers or confusion early

NEVER:
- Answer policy questions definitively - always suggest checking with HR
- Make promises about compensation, benefits, or job changes
- Pretend to be human',
'["memory", "escalate", "summarize", "handoff_hr"]'::jsonb,
'{"default_tone": "friendly_peer", "default_cadence": "daily", "duration_days": 30}'::jsonb,
true),

('exit_interview', 'Exit Interview', 'Gather candid feedback from departing employees', 'exit_interview',
'You are PayPilot''s Exit Interview Assistant. You help gather honest feedback from employees who are leaving.

Your job: Create a safe space for departing employees to share their experience and suggestions.

APPROACH:
- Thank them for their time at the company
- Ask open-ended questions about their experience
- Probe gently on areas of improvement
- Focus on actionable feedback

TOPICS:
- Reasons for leaving (without pressure)
- What they enjoyed most
- What could be improved
- Manager and team dynamics
- Advice for the company

Be respectful that this may be an emotional time.',
'["memory", "summarize"]'::jsonb,
'{"default_tone": "professional_hr", "default_cadence": "once"}'::jsonb,
true),

('manager_coaching', 'Manager Coaching', 'Help managers improve their leadership skills', 'manager_coaching',
'You are PayPilot''s Manager Coach. You help managers reflect on their leadership and identify growth areas.

Your job: Prompt reflection, share best practices, and help managers support their teams better.

APPROACH:
- Ask about recent team interactions
- Prompt reflection on what went well and what could improve
- Share relevant management tips when appropriate
- Be supportive, not judgmental

NEVER:
- Criticize specific employees
- Make HR decisions
- Override company policy',
'["memory", "summarize"]'::jsonb,
'{"default_tone": "professional_hr", "default_cadence": "weekly"}'::jsonb,
true);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get next run time based on cadence
CREATE OR REPLACE FUNCTION calculate_next_run(
  p_cadence TEXT,
  p_timezone TEXT DEFAULT 'America/New_York',
  p_from_time TIMESTAMPTZ DEFAULT now()
) RETURNS TIMESTAMPTZ AS $$
DECLARE
  next_time TIMESTAMPTZ;
BEGIN
  CASE p_cadence
    WHEN 'daily' THEN
      next_time := (p_from_time AT TIME ZONE p_timezone + INTERVAL '1 day')::date + TIME '09:00:00';
    WHEN 'weekly' THEN
      next_time := (p_from_time AT TIME ZONE p_timezone + INTERVAL '7 days')::date + TIME '09:00:00';
    WHEN 'biweekly' THEN
      next_time := (p_from_time AT TIME ZONE p_timezone + INTERVAL '14 days')::date + TIME '09:00:00';
    WHEN 'monthly' THEN
      next_time := (p_from_time AT TIME ZONE p_timezone + INTERVAL '1 month')::date + TIME '09:00:00';
    WHEN 'once' THEN
      next_time := NULL;
    ELSE
      next_time := (p_from_time AT TIME ZONE p_timezone + INTERVAL '7 days')::date + TIME '09:00:00';
  END CASE;

  RETURN next_time AT TIME ZONE p_timezone;
END;
$$ LANGUAGE plpgsql;

-- Claim due schedules for processing (with row locking)
CREATE OR REPLACE FUNCTION claim_due_schedules(p_limit INT DEFAULT 10)
RETURNS TABLE(schedule_id UUID, instance_id UUID, company_id UUID) AS $$
BEGIN
  RETURN QUERY
  WITH due_schedules AS (
    SELECT s.id, s.agent_instance_id
    FROM agent_schedules s
    JOIN agent_instances i ON s.agent_instance_id = i.id
    WHERE s.is_active = true
      AND s.next_run_at <= now()
      AND i.status = 'active'
    ORDER BY s.next_run_at
    LIMIT p_limit
    FOR UPDATE OF s SKIP LOCKED
  )
  UPDATE agent_schedules
  SET
    last_run_at = now(),
    next_run_at = calculate_next_run(cadence, timezone),
    updated_at = now()
  FROM due_schedules
  WHERE agent_schedules.id = due_schedules.id
  RETURNING
    agent_schedules.id AS schedule_id,
    agent_schedules.agent_instance_id AS instance_id,
    (SELECT ai.company_id FROM agent_instances ai WHERE ai.id = agent_schedules.agent_instance_id) AS company_id;
END;
$$ LANGUAGE plpgsql;


-- ========================================
-- Migration: 20260215000004_ai_agents_seed.sql
-- ========================================

-- ============================================================================
-- AI AGENTS MODULE - Seed Data for Demo
-- ============================================================================

-- Create a demo agent instance for Acme Technologies
-- First, we need to get the company_id and a user_id

DO $$
DECLARE
  v_company_id UUID;
  v_user_id UUID;
  v_pulse_agent_id UUID;
  v_onboarding_agent_id UUID;
  v_instance_id UUID;
  v_conversation_id UUID;
BEGIN
  -- Get Acme Technologies company
  SELECT id INTO v_company_id FROM companies WHERE slug = 'acme-technologies' LIMIT 1;

  IF v_company_id IS NULL THEN
    RAISE NOTICE 'Acme Technologies company not found, skipping agent seed';
    RETURN;
  END IF;

  -- Get demo user (or any admin user)
  SELECT cm.user_id INTO v_user_id
  FROM company_members cm
  WHERE cm.company_id = v_company_id AND cm.role IN ('owner', 'admin')
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE NOTICE 'No admin user found, skipping agent seed';
    RETURN;
  END IF;

  -- Get pulse check agent template
  SELECT id INTO v_pulse_agent_id FROM agents WHERE slug = 'pulse_check' LIMIT 1;
  SELECT id INTO v_onboarding_agent_id FROM agents WHERE slug = 'onboarding' LIMIT 1;

  IF v_pulse_agent_id IS NULL THEN
    RAISE NOTICE 'Pulse check agent template not found, skipping';
    RETURN;
  END IF;

  -- Create Weekly Pulse Check agent instance
  INSERT INTO agent_instances (
    company_id,
    agent_id,
    created_by,
    name,
    config,
    status
  ) VALUES (
    v_company_id,
    v_pulse_agent_id,
    v_user_id,
    'Weekly Team Pulse',
    '{
      "tone_preset": "poke_lite",
      "audience_type": "company_wide",
      "guardrails": {
        "no_sensitive_topics": true,
        "no_medical_legal": true,
        "no_coercion": true,
        "no_harassment": true
      }
    }'::jsonb,
    'active'
  )
  RETURNING id INTO v_instance_id;

  -- Create schedule for weekly runs
  INSERT INTO agent_schedules (
    agent_instance_id,
    cadence,
    timezone,
    next_run_at,
    is_active
  ) VALUES (
    v_instance_id,
    'weekly',
    'America/New_York',
    now() + INTERVAL '1 hour', -- Demo: runs in 1 hour
    true
  );

  RAISE NOTICE 'Created Weekly Team Pulse agent instance: %', v_instance_id;

  -- Create a sample conversation with the demo user
  INSERT INTO conversations (
    company_id,
    agent_instance_id,
    participant_user_id,
    status,
    last_message_at,
    last_touched_at,
    message_count,
    unread_count
  ) VALUES (
    v_company_id,
    v_instance_id,
    v_user_id,
    'active',
    now() - INTERVAL '2 hours',
    now() - INTERVAL '2 hours',
    4,
    1
  )
  RETURNING id INTO v_conversation_id;

  -- Add sample messages to the conversation
  INSERT INTO messages (conversation_id, sender_type, content, content_type, is_read, created_at) VALUES
  (v_conversation_id, 'agent', 'Hey! Quick check-in - how''s your week going so far?', 'text', true, now() - INTERVAL '3 hours'),
  (v_conversation_id, 'employee', 'It''s been pretty busy actually. We''ve got a lot of deadlines coming up and I''m feeling a bit overwhelmed.', 'text', true, now() - INTERVAL '2 hours 30 minutes'),
  (v_conversation_id, 'agent', 'Thanks for being honest about that. What''s been the biggest challenge with the workload?', 'text', true, now() - INTERVAL '2 hours 15 minutes'),
  (v_conversation_id, 'employee', 'I think it''s the context switching. I''m on three different projects and it''s hard to make progress on any of them. My manager is supportive but there''s only so much they can do.', 'text', true, now() - INTERVAL '2 hours');

  -- Create a feedback summary for this conversation
  INSERT INTO feedback_summaries (
    conversation_id,
    summary,
    sentiment,
    sentiment_score,
    tags,
    action_items,
    key_quotes,
    computed_at
  ) VALUES (
    v_conversation_id,
    'Employee is feeling overwhelmed due to high workload and context switching across multiple projects. Manager relationship is positive but capacity issues persist.',
    'negative',
    -0.4,
    '["workload", "manager", "work_life_balance"]'::jsonb,
    '[
      {"text": "Review employee workload and consider redistributing tasks or adjusting deadlines.", "confidence": 0.8, "priority": "high", "category": "workload"},
      {"text": "Discuss project prioritization with employee to reduce context switching.", "confidence": 0.7, "priority": "medium", "category": "workload"}
    ]'::jsonb,
    '["I''m feeling a bit overwhelmed", "context switching across three projects"]'::jsonb,
    now() - INTERVAL '1 hour'
  );

  -- Create onboarding agent instance if template exists
  IF v_onboarding_agent_id IS NOT NULL THEN
    INSERT INTO agent_instances (
      company_id,
      agent_id,
      created_by,
      name,
      config,
      status
    ) VALUES (
      v_company_id,
      v_onboarding_agent_id,
      v_user_id,
      'New Hire Onboarding',
      '{
        "tone_preset": "friendly_peer",
        "audience_type": "individual",
        "guardrails": {
          "no_sensitive_topics": true,
          "no_medical_legal": true,
          "no_coercion": true,
          "no_harassment": true
        }
      }'::jsonb,
      'active'
    )
    RETURNING id INTO v_instance_id;

    INSERT INTO agent_schedules (
      agent_instance_id,
      cadence,
      timezone,
      next_run_at,
      is_active
    ) VALUES (
      v_instance_id,
      'daily',
      'America/New_York',
      now() + INTERVAL '24 hours',
      true
    );

    RAISE NOTICE 'Created New Hire Onboarding agent instance: %', v_instance_id;
  END IF;

  -- Create a sample agent run record
  INSERT INTO agent_runs (
    agent_instance_id,
    run_type,
    status,
    started_at,
    finished_at,
    messages_sent,
    conversations_touched
  )
  SELECT
    ai.id,
    'scheduled',
    'completed',
    now() - INTERVAL '3 hours',
    now() - INTERVAL '2 hours 55 minutes',
    12,
    12
  FROM agent_instances ai
  WHERE ai.name = 'Weekly Team Pulse'
  LIMIT 1;

  RAISE NOTICE 'AI Agents seed data created successfully';
END $$;


-- ========================================
-- Migration: 20260215000005_rbac_fixes.sql
-- ========================================

-- ============================================================================
-- RBAC FIXES FOR AI AGENTS
-- Proper role-based access control for agent management and messaging
-- ============================================================================

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Check if user is company admin (owner or admin role)
CREATE OR REPLACE FUNCTION is_company_admin(cid uuid)
RETURNS boolean
LANGUAGE sql STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM company_members cm
    WHERE cm.company_id = cid
      AND cm.user_id = auth.uid()
      AND cm.role IN ('owner', 'admin')
  );
$$;

-- Check if user is company HR (owner, admin, or hr_manager)
CREATE OR REPLACE FUNCTION is_company_hr(cid uuid)
RETURNS boolean
LANGUAGE sql STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM company_members cm
    WHERE cm.company_id = cid
      AND cm.user_id = auth.uid()
      AND cm.role IN ('owner', 'admin', 'hr_manager')
  );
$$;

-- Check if user can access a conversation
CREATE OR REPLACE FUNCTION can_access_conversation(conv_id uuid)
RETURNS boolean
LANGUAGE sql STABLE AS $$
  SELECT EXISTS (
    SELECT 1
    FROM conversations c
    LEFT JOIN company_members cm
      ON cm.company_id = c.company_id
     AND cm.user_id = auth.uid()
    WHERE c.id = conv_id
      AND (
        c.participant_user_id = auth.uid()
        OR cm.role IN ('owner', 'admin', 'hr_manager')
      )
  );
$$;

-- ============================================================================
-- DROP EXISTING POLICIES (to recreate with proper logic)
-- ============================================================================

-- Agent instances
DROP POLICY IF EXISTS "agent_instances_read" ON agent_instances;
DROP POLICY IF EXISTS "agent_instances_insert" ON agent_instances;
DROP POLICY IF EXISTS "agent_instances_update" ON agent_instances;

-- Agent schedules
DROP POLICY IF EXISTS "agent_schedules_read" ON agent_schedules;
DROP POLICY IF EXISTS "agent_schedules_manage" ON agent_schedules;

-- Agent runs
DROP POLICY IF EXISTS "agent_runs_read" ON agent_runs;
DROP POLICY IF EXISTS "agent_runs_insert" ON agent_runs;

-- Conversations
DROP POLICY IF EXISTS "conversations_read_own" ON conversations;
DROP POLICY IF EXISTS "conversations_insert" ON conversations;
DROP POLICY IF EXISTS "conversations_update" ON conversations;

-- Messages
DROP POLICY IF EXISTS "messages_read" ON messages;
DROP POLICY IF EXISTS "messages_insert" ON messages;

-- ============================================================================
-- AGENT INSTANCES - Only admin can create/manage, all members can read
-- ============================================================================

CREATE POLICY "agent_instances_select"
ON agent_instances FOR SELECT TO authenticated
USING (
  company_id IN (
    SELECT company_id FROM company_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "agent_instances_insert"
ON agent_instances FOR INSERT TO authenticated
WITH CHECK (
  is_company_hr(company_id)
);

CREATE POLICY "agent_instances_update"
ON agent_instances FOR UPDATE TO authenticated
USING (
  is_company_hr(company_id)
)
WITH CHECK (
  is_company_hr(company_id)
);

CREATE POLICY "agent_instances_delete"
ON agent_instances FOR DELETE TO authenticated
USING (
  is_company_admin(company_id)
);

-- ============================================================================
-- AGENT SCHEDULES - Only admin can manage
-- ============================================================================

CREATE POLICY "agent_schedules_select"
ON agent_schedules FOR SELECT TO authenticated
USING (
  agent_instance_id IN (
    SELECT id FROM agent_instances WHERE company_id IN (
      SELECT company_id FROM company_members WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "agent_schedules_insert"
ON agent_schedules FOR INSERT TO authenticated
WITH CHECK (
  agent_instance_id IN (
    SELECT id FROM agent_instances WHERE is_company_hr(company_id)
  )
);

CREATE POLICY "agent_schedules_update"
ON agent_schedules FOR UPDATE TO authenticated
USING (
  agent_instance_id IN (
    SELECT id FROM agent_instances WHERE is_company_hr(company_id)
  )
);

CREATE POLICY "agent_schedules_delete"
ON agent_schedules FOR DELETE TO authenticated
USING (
  agent_instance_id IN (
    SELECT id FROM agent_instances WHERE is_company_admin(company_id)
  )
);

-- ============================================================================
-- AGENT RUNS - Only admin can create and view
-- ============================================================================

CREATE POLICY "agent_runs_select"
ON agent_runs FOR SELECT TO authenticated
USING (
  agent_instance_id IN (
    SELECT id FROM agent_instances WHERE is_company_hr(company_id)
  )
);

CREATE POLICY "agent_runs_insert"
ON agent_runs FOR INSERT TO authenticated
WITH CHECK (
  agent_instance_id IN (
    SELECT id FROM agent_instances WHERE is_company_hr(company_id)
  )
);

-- ============================================================================
-- CONVERSATIONS - Employees see their own, admins see all in company
-- ============================================================================

CREATE POLICY "conversations_select"
ON conversations FOR SELECT TO authenticated
USING (
  participant_user_id = auth.uid()
  OR is_company_hr(company_id)
);

-- Only service role or HR can create conversations (agents create them)
CREATE POLICY "conversations_insert"
ON conversations FOR INSERT TO authenticated
WITH CHECK (
  is_company_hr(company_id)
);

CREATE POLICY "conversations_update"
ON conversations FOR UPDATE TO authenticated
USING (
  participant_user_id = auth.uid()
  OR is_company_hr(company_id)
);

-- ============================================================================
-- MESSAGES - Employees see/send only in their conversations, admins see all
-- ============================================================================

CREATE POLICY "messages_select"
ON messages FOR SELECT TO authenticated
USING (
  can_access_conversation(conversation_id)
);

-- Employee can only insert messages in their own conversation
CREATE POLICY "messages_insert_employee"
ON messages FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = conversation_id
      AND c.participant_user_id = auth.uid()
  )
);

-- Service role bypasses RLS for agent messages (handled in code)

-- ============================================================================
-- FEEDBACK SUMMARIES - Only HR can see
-- ============================================================================

DROP POLICY IF EXISTS "feedback_summaries_admin_read" ON feedback_summaries;

CREATE POLICY "feedback_summaries_select"
ON feedback_summaries FOR SELECT TO authenticated
USING (
  conversation_id IN (
    SELECT id FROM conversations WHERE is_company_hr(company_id)
  )
);

-- ============================================================================
-- ESCALATIONS - Only HR can see and manage
-- ============================================================================

DROP POLICY IF EXISTS "escalations_read" ON agent_escalations;
DROP POLICY IF EXISTS "escalations_manage" ON agent_escalations;

CREATE POLICY "escalations_select"
ON agent_escalations FOR SELECT TO authenticated
USING (
  is_company_hr(company_id)
);

CREATE POLICY "escalations_insert"
ON agent_escalations FOR INSERT TO authenticated
WITH CHECK (
  is_company_hr(company_id)
);

CREATE POLICY "escalations_update"
ON agent_escalations FOR UPDATE TO authenticated
USING (
  is_company_hr(company_id)
);

-- ============================================================================
-- GRANT SERVICE ROLE BYPASS FOR AGENT MESSAGES
-- Server-side code uses service role to insert agent messages
-- ============================================================================

-- Note: Service role already bypasses RLS by default in Supabase
-- Just ensure the API routes use the service role for agent-authored messages


-- ========================================
-- Migration: 20260215000006_fix_rls_recursion.sql
-- ========================================

-- ============================================================================
-- FIX RLS RECURSION BUG
-- The company_members policy causes infinite recursion because it queries
-- itself in the policy check. Fix by using a SECURITY DEFINER function.
-- ============================================================================

-- Create a function that gets user's company IDs without RLS
CREATE OR REPLACE FUNCTION get_user_company_ids(uid uuid)
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT company_id FROM company_members WHERE user_id = uid;
$$;

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view members of their company" ON company_members;

-- Create a fixed policy that uses the SECURITY DEFINER function
CREATE POLICY "Users can view members of their company" ON company_members
  FOR SELECT USING (
    user_id = auth.uid()
    OR company_id IN (SELECT get_user_company_ids(auth.uid()))
  );

-- Also fix the companies policy to use the same pattern
DROP POLICY IF EXISTS "Users can view their companies" ON companies;

CREATE POLICY "Users can view their companies" ON companies
  FOR SELECT USING (
    id IN (SELECT get_user_company_ids(auth.uid()))
  );

-- Fix time_entries policies
DROP POLICY IF EXISTS "Users can view their own time entries" ON time_entries;
DROP POLICY IF EXISTS "Users can create their own time entries" ON time_entries;

-- Helper function to get user's company member IDs
CREATE OR REPLACE FUNCTION get_user_member_ids(uid uuid)
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT id FROM company_members WHERE user_id = uid;
$$;

CREATE POLICY "Users can view their own time entries" ON time_entries
  FOR SELECT USING (
    employee_id IN (SELECT get_user_member_ids(auth.uid()))
  );

CREATE POLICY "Users can create their own time entries" ON time_entries
  FOR INSERT WITH CHECK (
    employee_id IN (SELECT get_user_member_ids(auth.uid()))
  );

-- Fix leave_requests policies
DROP POLICY IF EXISTS "Users can view their own leave requests" ON leave_requests;
DROP POLICY IF EXISTS "Users can create their own leave requests" ON leave_requests;

CREATE POLICY "Users can view their own leave requests" ON leave_requests
  FOR SELECT USING (
    employee_id IN (SELECT get_user_member_ids(auth.uid()))
  );

CREATE POLICY "Users can create their own leave requests" ON leave_requests
  FOR INSERT WITH CHECK (
    employee_id IN (SELECT get_user_member_ids(auth.uid()))
  );

-- Fix agent_instances_select policy
DROP POLICY IF EXISTS "agent_instances_select" ON agent_instances;

CREATE POLICY "agent_instances_select"
ON agent_instances FOR SELECT TO authenticated
USING (
  company_id IN (SELECT get_user_company_ids(auth.uid()))
);

-- Fix agent_schedules_select policy
DROP POLICY IF EXISTS "agent_schedules_select" ON agent_schedules;

CREATE POLICY "agent_schedules_select"
ON agent_schedules FOR SELECT TO authenticated
USING (
  agent_instance_id IN (
    SELECT id FROM agent_instances WHERE company_id IN (SELECT get_user_company_ids(auth.uid()))
  )
);

-- Fix conversations_select policy
DROP POLICY IF EXISTS "conversations_select" ON conversations;

CREATE POLICY "conversations_select"
ON conversations FOR SELECT TO authenticated
USING (
  participant_user_id = auth.uid()
  OR is_company_hr(company_id)
);

-- Recreate is_company_admin and is_company_hr to use SECURITY DEFINER
CREATE OR REPLACE FUNCTION is_company_admin(cid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM company_members cm
    WHERE cm.company_id = cid
      AND cm.user_id = auth.uid()
      AND cm.role IN ('owner', 'admin')
  );
$$;

CREATE OR REPLACE FUNCTION is_company_hr(cid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM company_members cm
    WHERE cm.company_id = cid
      AND cm.user_id = auth.uid()
      AND cm.role IN ('owner', 'admin', 'hr_manager')
  );
$$;

-- Grant execute on functions to authenticated users
GRANT EXECUTE ON FUNCTION get_user_company_ids(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_member_ids(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION is_company_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION is_company_hr(uuid) TO authenticated;


