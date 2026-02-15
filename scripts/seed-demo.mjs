#!/usr/bin/env node

/**
 * Seed Demo Data Script
 * Run with: node scripts/seed-demo.mjs
 *
 * Creates demo users, company, employees, agents, conversations, and messages directly in Supabase
 */

import { createClient } from '@supabase/supabase-js'

// Load from environment or use defaults
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xhtqwyibrhgmauygoebr.supabase.co'
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhodHF3eWlicmhnbWF1eWdvZWJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTExNDg4NCwiZXhwIjoyMDg2NjkwODg0fQ.0BPr9Mf_nsY4Fd--vkqsJTZya6pgCyB8iCQ-wRa3mqA'

// Demo data constants - deterministic UUIDs for idempotency
const DEMO_COMPANY_ID = '00000000-0000-0000-0000-000000000001'
const DEMO_ADMIN_ID = '00000000-0000-0000-0000-000000000002'

// Additional employees
const EMPLOYEES = [
  { id: '00000000-0000-0000-0000-000000000010', name: 'Sarah Chen', email: 'sarah.chen@acme.com', title: 'VP of Engineering', dept: 'Engineering', hireDate: '2022-03-01', salary: 18500000 },
  { id: '00000000-0000-0000-0000-000000000011', name: 'Mike Johnson', email: 'mike.johnson@acme.com', title: 'Senior Software Engineer', dept: 'Engineering', hireDate: '2023-06-15', salary: 14500000 },
  { id: '00000000-0000-0000-0000-000000000012', name: 'Jordan Lee', email: 'jordan.lee@acme.com', title: 'DevOps Engineer', dept: 'Engineering', hireDate: '2023-09-01', salary: 13000000 },
  { id: '00000000-0000-0000-0000-000000000013', name: 'David Kim', email: 'david.kim@acme.com', title: 'Frontend Developer', dept: 'Engineering', hireDate: '2024-01-15', salary: 12000000 },
  { id: '00000000-0000-0000-0000-000000000014', name: 'Emily Davis', email: 'emily.davis@acme.com', title: 'Head of Design', dept: 'Design', hireDate: '2022-08-01', salary: 16000000 },
  { id: '00000000-0000-0000-0000-000000000015', name: 'Chris Wang', email: 'chris.wang@acme.com', title: 'UX Designer', dept: 'Design', hireDate: '2023-04-01', salary: 11000000 },
  { id: '00000000-0000-0000-0000-000000000016', name: 'Lisa Park', email: 'lisa.park@acme.com', title: 'VP of Sales', dept: 'Sales', hireDate: '2022-01-15', salary: 17500000 },
  { id: '00000000-0000-0000-0000-000000000017', name: 'Tom Wilson', email: 'tom.wilson@acme.com', title: 'Account Executive', dept: 'Sales', hireDate: '2023-02-01', salary: 9500000 },
  { id: '00000000-0000-0000-0000-000000000018', name: 'Anna Martinez', email: 'anna.martinez@acme.com', title: 'Sales Development Rep', dept: 'Sales', hireDate: '2024-02-01', salary: 7500000 },
  { id: '00000000-0000-0000-0000-000000000019', name: 'Alex Wong', email: 'alex.wong@acme.com', title: 'Marketing Lead', dept: 'Marketing', hireDate: '2023-01-01', salary: 13500000 },
  { id: '00000000-0000-0000-0000-000000000020', name: 'Sam Brown', email: 'sam.brown@acme.com', title: 'Content Specialist', dept: 'Marketing', hireDate: '2023-11-01', salary: 8500000 },
  { id: '00000000-0000-0000-0000-000000000021', name: 'Rachel Kim', email: 'rachel.kim@acme.com', title: 'HR Coordinator', dept: 'Human Resources', hireDate: '2022-05-01', salary: 9000000 },
]

async function main() {
  console.log('🚀 Starting demo data seed...\n')

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  const results = []

  // ========================================================================
  // 1. Create or update demo company
  // ========================================================================
  console.log('📦 Creating company...')
  const { error: companyError } = await supabase
    .from('companies')
    .upsert({
      id: DEMO_COMPANY_ID,
      name: 'Acme Inc',
      slug: 'acme-inc',
      industry: 'Technology',
      size: '51-200',
      status: 'active',
      subscription_tier: 'professional',
      subscription_status: 'active',
    }, { onConflict: 'id' })

  if (companyError) {
    console.error('❌ Failed to create company:', companyError.message)
    process.exit(1)
  }
  results.push('✅ Created company: Acme Inc')

  // ========================================================================
  // 2. Create or update demo admin user
  // ========================================================================
  console.log('👤 Creating admin user...')
  const { data: existingAdmin } = await supabase.auth.admin.getUserById(DEMO_ADMIN_ID)

  if (!existingAdmin.user) {
    const { data: adminUser, error: adminError } = await supabase.auth.admin.createUser({
      email: 'demo@acme.com',
      password: 'demo123',
      email_confirm: true,
      user_metadata: {
        full_name: 'Demo Admin',
      },
      id: DEMO_ADMIN_ID,
    })

    if (adminError) {
      console.error('❌ Failed to create admin user:', adminError.message)
      process.exit(1)
    }
    results.push(`✅ Created admin user: demo@acme.com (ID: ${adminUser.user.id})`)
  } else {
    const { error: updateError } = await supabase.auth.admin.updateUserById(DEMO_ADMIN_ID, {
      email: 'demo@acme.com',
      password: 'demo123',
      email_confirm: true,
    })

    if (updateError) {
      results.push(`⚠️ Warning: Could not update admin user: ${updateError.message}`)
    } else {
      results.push('✅ Updated admin user: demo@acme.com')
    }
  }

  // ========================================================================
  // 3. Create admin profile
  // ========================================================================
  console.log('📋 Creating admin profile...')
  const { error: adminProfileError } = await supabase
    .from('profiles')
    .upsert({
      id: DEMO_ADMIN_ID,
      email: 'demo@acme.com',
      full_name: 'Demo Admin',
      status: 'active',
      role: 'company_admin',
    }, { onConflict: 'id' })

  if (adminProfileError) {
    console.error('❌ Failed to create admin profile:', adminProfileError.message)
  } else {
    results.push('✅ Created admin profile')
  }

  // ========================================================================
  // 4. Create admin company membership
  // ========================================================================
  console.log('🏢 Creating admin company membership...')
  const { error: adminMemberError } = await supabase
    .from('company_members')
    .upsert({
      company_id: DEMO_COMPANY_ID,
      user_id: DEMO_ADMIN_ID,
      role: 'owner',
      job_title: 'HR Director',
      department: 'Human Resources',
      hire_date: '2020-01-15',
      status: 'active',
    }, { onConflict: 'company_id,user_id' })

  if (adminMemberError) {
    console.error('❌ Failed to create admin membership:', adminMemberError.message)
  } else {
    results.push('✅ Created admin company membership (role: owner)')
  }

  // ========================================================================
  // 5. Create employee users, profiles, and memberships
  // ========================================================================
  console.log('👥 Creating employees...')

  for (const emp of EMPLOYEES) {
    // Check if user exists
    const { data: existingUser } = await supabase.auth.admin.getUserById(emp.id)

    if (!existingUser.user) {
      // Create auth user
      const { error: userError } = await supabase.auth.admin.createUser({
        email: emp.email,
        password: 'demo123',
        email_confirm: true,
        user_metadata: { full_name: emp.name },
        id: emp.id,
      })

      if (userError) {
        results.push(`⚠️ Could not create user ${emp.name}: ${userError.message}`)
        continue
      }
    } else {
      // Update existing user
      await supabase.auth.admin.updateUserById(emp.id, {
        email: emp.email,
        password: 'demo123',
        email_confirm: true,
      })
    }

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: emp.id,
        email: emp.email,
        full_name: emp.name,
        status: 'active',
        role: 'employee',
      }, { onConflict: 'id' })

    if (profileError) {
      results.push(`⚠️ Could not create profile for ${emp.name}: ${profileError.message}`)
    }

    // Create company membership
    const { error: memberError } = await supabase
      .from('company_members')
      .upsert({
        company_id: DEMO_COMPANY_ID,
        user_id: emp.id,
        role: 'employee',
        job_title: emp.title,
        department: emp.dept,
        hire_date: emp.hireDate,
        status: 'active',
        salary_amount_cents: emp.salary,
        salary_currency: 'USD',
        salary_frequency: 'annual',
      }, { onConflict: 'company_id,user_id' })

    if (memberError) {
      results.push(`⚠️ Could not create membership for ${emp.name}: ${memberError.message}`)
    } else {
      results.push(`✅ Created employee: ${emp.name} (${emp.dept})`)
    }
  }

  // ========================================================================
  // 6. Verify system agents exist (they should be seeded by migration)
  // ========================================================================
  console.log('🤖 Checking system agents...')
  const { data: agents, error: agentsError } = await supabase
    .from('agents')
    .select('id, name')
    .eq('is_system', true)

  if (agentsError) {
    results.push(`⚠️ Could not check agents: ${agentsError.message}`)
  } else {
    results.push(`✅ Found ${agents?.length || 0} system agents`)
  }

  // ========================================================================
  // 7. Verify tone presets exist
  // ========================================================================
  console.log('🎨 Checking tone presets...')
  const { data: presets, error: presetsError } = await supabase
    .from('tone_presets')
    .select('id, name')
    .eq('is_system', true)

  if (presetsError) {
    results.push(`⚠️ Could not check tone presets: ${presetsError.message}`)
  } else {
    results.push(`✅ Found ${presets?.length || 0} tone presets`)
  }

  // Print results
  console.log('\n' + '='.repeat(60))
  console.log('📋 SEED RESULTS:')
  console.log('='.repeat(60))
  results.forEach(r => console.log(r))
  console.log('='.repeat(60))

  console.log('\n✨ Demo data seeded successfully!')
  console.log('\n📝 Login credentials:')
  console.log('   Admin: demo@acme.com / demo123')
  console.log('   Employees: [name]@acme.com / demo123')
  console.log('')
}

main().catch(console.error)
