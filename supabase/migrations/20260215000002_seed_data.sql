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
