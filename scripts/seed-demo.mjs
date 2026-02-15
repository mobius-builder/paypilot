#!/usr/bin/env node

/**
 * Seed Demo Data Script
 * Run with: node scripts/seed-demo.mjs
 *
 * Creates demo users, company, agents, conversations, and messages directly in Supabase
 */

import { createClient } from '@supabase/supabase-js'

// Load from environment or use defaults
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jmhklrepnarnrtltmhab.supabase.co'
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptaGtscmVwbmFybnJ0bHRtaGFiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTEyNjk0NSwiZXhwIjoyMDg2NzAyOTQ1fQ.77lV_CRXzALLn6h1yoeVMmLNBZTO4tBweL5Ru2Wn6fQ'

// Demo data constants - deterministic UUIDs for idempotency
const DEMO_COMPANY_ID = '00000000-0000-0000-0000-000000000001'
const DEMO_ADMIN_ID = '00000000-0000-0000-0000-000000000002'
const SARAH_CHEN_ID = '00000000-0000-0000-0000-000000000010'

// Agent template IDs
const PULSE_CHECK_AGENT_ID = '00000000-0000-0000-0000-000000000201'
const ONBOARDING_AGENT_ID = '00000000-0000-0000-0000-000000000202'
const EXIT_INTERVIEW_AGENT_ID = '00000000-0000-0000-0000-000000000203'
const MANAGER_COACHING_AGENT_ID = '00000000-0000-0000-0000-000000000204'

// Tone preset IDs
const POKE_LITE_PRESET_ID = '00000000-0000-0000-0000-000000000301'
const FRIENDLY_PEER_PRESET_ID = '00000000-0000-0000-0000-000000000302'
const PROFESSIONAL_HR_PRESET_ID = '00000000-0000-0000-0000-000000000303'
const WITTY_SAFE_PRESET_ID = '00000000-0000-0000-0000-000000000304'

// Agent instance IDs
const WEEKLY_PULSE_INSTANCE_ID = '00000000-0000-0000-0000-000000000401'
const ONBOARDING_INSTANCE_ID = '00000000-0000-0000-0000-000000000402'

// Conversation IDs
const SARAH_PULSE_CONVERSATION_ID = '00000000-0000-0000-0000-000000000501'

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
  // 3. Create or update Sarah Chen user
  // ========================================================================
  console.log('👤 Creating Sarah Chen user...')
  const { data: existingSarah } = await supabase.auth.admin.getUserById(SARAH_CHEN_ID)

  if (!existingSarah.user) {
    const { data: sarahUser, error: sarahError } = await supabase.auth.admin.createUser({
      email: 'sarah.chen@acme.com',
      password: 'demo123',
      email_confirm: true,
      user_metadata: {
        full_name: 'Sarah Chen',
      },
      id: SARAH_CHEN_ID,
    })

    if (sarahError) {
      console.error('❌ Failed to create Sarah user:', sarahError.message)
      process.exit(1)
    }
    results.push(`✅ Created employee user: sarah.chen@acme.com (ID: ${sarahUser.user.id})`)
  } else {
    const { error: updateError } = await supabase.auth.admin.updateUserById(SARAH_CHEN_ID, {
      email: 'sarah.chen@acme.com',
      password: 'demo123',
      email_confirm: true,
    })

    if (updateError) {
      results.push(`⚠️ Warning: Could not update Sarah user: ${updateError.message}`)
    } else {
      results.push('✅ Updated employee user: sarah.chen@acme.com')
    }
  }

  // ========================================================================
  // 4. Create or update profiles
  // ========================================================================
  console.log('📋 Creating profiles...')
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
    process.exit(1)
  }
  results.push('✅ Created admin profile')

  const { error: sarahProfileError } = await supabase
    .from('profiles')
    .upsert({
      id: SARAH_CHEN_ID,
      email: 'sarah.chen@acme.com',
      full_name: 'Sarah Chen',
      status: 'active',
      role: 'employee',
    }, { onConflict: 'id' })

  if (sarahProfileError) {
    console.error('❌ Failed to create Sarah profile:', sarahProfileError.message)
    process.exit(1)
  }
  results.push('✅ Created Sarah Chen profile')

  // ========================================================================
  // 5. Create or update company_members
  // ========================================================================
  console.log('🏢 Creating company memberships...')
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
    process.exit(1)
  }
  results.push('✅ Created admin company membership (role: owner)')

  const { error: sarahMemberError } = await supabase
    .from('company_members')
    .upsert({
      company_id: DEMO_COMPANY_ID,
      user_id: SARAH_CHEN_ID,
      role: 'employee',
      job_title: 'Senior Software Engineer',
      department: 'Engineering',
      hire_date: '2022-03-01',
      status: 'active',
      salary_amount_cents: 15000000,
      salary_currency: 'USD',
      salary_frequency: 'annual',
    }, { onConflict: 'company_id,user_id' })

  if (sarahMemberError) {
    console.error('❌ Failed to create Sarah membership:', sarahMemberError.message)
    process.exit(1)
  }
  results.push('✅ Created Sarah company membership (role: employee)')

  // ========================================================================
  // 6. Create agent templates
  // ========================================================================
  console.log('🤖 Creating agent templates...')
  const agentTemplates = [
    {
      id: PULSE_CHECK_AGENT_ID,
      name: 'Pulse Check',
      slug: 'pulse_check',
      description: 'Weekly check-in to gauge team morale, workload, and identify concerns early',
      agent_type: 'pulse_check',
      is_system: true,
      default_config: { max_messages: 5, escalation_enabled: true },
    },
    {
      id: ONBOARDING_AGENT_ID,
      name: 'Onboarding Buddy',
      slug: 'onboarding',
      description: 'Guide new hires through their first 90 days with helpful tips and check-ins',
      agent_type: 'onboarding',
      is_system: true,
      default_config: { max_messages: 10, escalation_enabled: true },
    },
    {
      id: EXIT_INTERVIEW_AGENT_ID,
      name: 'Exit Interview',
      slug: 'exit_interview',
      description: 'Gather candid feedback from departing employees to improve retention',
      agent_type: 'exit_interview',
      is_system: true,
      default_config: { max_messages: 8, escalation_enabled: false },
    },
    {
      id: MANAGER_COACHING_AGENT_ID,
      name: 'Manager Coach',
      slug: 'manager_coaching',
      description: 'Provide coaching tips and feedback collection for people managers',
      agent_type: 'manager_coaching',
      is_system: true,
      default_config: { max_messages: 6, escalation_enabled: true },
    },
  ]

  for (const agent of agentTemplates) {
    const { error } = await supabase
      .from('agents')
      .upsert(agent, { onConflict: 'id' })

    if (error) {
      results.push(`⚠️ Warning: Could not upsert agent ${agent.name}: ${error.message}`)
    } else {
      results.push(`✅ Created agent template: ${agent.name}`)
    }
  }

  // ========================================================================
  // 7. Create tone presets
  // ========================================================================
  console.log('🎨 Creating tone presets...')
  const tonePresets = [
    {
      id: POKE_LITE_PRESET_ID,
      slug: 'poke_lite',
      name: 'Poke-lite',
      description: 'Short, playful, emoji-friendly. Max 240 chars per message.',
      is_system: true,
      config: { max_length: 240, emoji_level: 'high', formality: 'casual' },
    },
    {
      id: FRIENDLY_PEER_PRESET_ID,
      slug: 'friendly_peer',
      name: 'Friendly Peer',
      description: 'Warm and conversational, like a work friend checking in.',
      is_system: true,
      config: { max_length: 500, emoji_level: 'medium', formality: 'casual' },
    },
    {
      id: PROFESSIONAL_HR_PRESET_ID,
      slug: 'professional_hr',
      name: 'Professional HR',
      description: 'Formal and supportive, appropriate for sensitive topics.',
      is_system: true,
      config: { max_length: 800, emoji_level: 'none', formality: 'formal' },
    },
    {
      id: WITTY_SAFE_PRESET_ID,
      slug: 'witty_safe',
      name: 'Witty-but-safe',
      description: 'Light humor that stays workplace appropriate.',
      is_system: true,
      config: { max_length: 400, emoji_level: 'low', formality: 'casual' },
    },
  ]

  for (const preset of tonePresets) {
    const { error } = await supabase
      .from('tone_presets')
      .upsert(preset, { onConflict: 'id' })

    if (error) {
      results.push(`⚠️ Warning: Could not upsert tone preset ${preset.name}: ${error.message}`)
    } else {
      results.push(`✅ Created tone preset: ${preset.name}`)
    }
  }

  // ========================================================================
  // 8. Create agent instances
  // ========================================================================
  console.log('🔧 Creating agent instances...')
  const agentInstances = [
    {
      id: WEEKLY_PULSE_INSTANCE_ID,
      company_id: DEMO_COMPANY_ID,
      agent_id: PULSE_CHECK_AGENT_ID,
      created_by: DEMO_ADMIN_ID,
      name: 'Weekly Team Pulse',
      config: { tone_preset: 'friendly_peer', audience_type: 'company_wide', target_employee_ids: [] },
      status: 'active',
    },
    {
      id: ONBOARDING_INSTANCE_ID,
      company_id: DEMO_COMPANY_ID,
      agent_id: ONBOARDING_AGENT_ID,
      created_by: DEMO_ADMIN_ID,
      name: 'New Hire Onboarding',
      config: { tone_preset: 'friendly_peer', audience_type: 'team', target_employee_ids: [] },
      status: 'active',
    },
  ]

  for (const instance of agentInstances) {
    const { error } = await supabase
      .from('agent_instances')
      .upsert(instance, { onConflict: 'id' })

    if (error) {
      results.push(`⚠️ Warning: Could not upsert agent instance ${instance.name}: ${error.message}`)
    } else {
      results.push(`✅ Created agent instance: ${instance.name}`)
    }
  }

  // ========================================================================
  // 9. Create agent schedules
  // ========================================================================
  console.log('📅 Creating agent schedules...')
  const getNextMonday = () => {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const daysUntilMonday = (8 - dayOfWeek) % 7 || 7
    const nextMonday = new Date(now)
    nextMonday.setDate(now.getDate() + daysUntilMonday)
    nextMonday.setHours(9, 0, 0, 0)
    return nextMonday.toISOString()
  }

  const getTomorrow9am = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(9, 0, 0, 0)
    return tomorrow.toISOString()
  }

  const schedules = [
    {
      id: '00000000-0000-0000-0000-000000000601',
      agent_instance_id: WEEKLY_PULSE_INSTANCE_ID,
      cadence: 'weekly',
      timezone: 'America/New_York',
      next_run_at: getNextMonday(),
      is_active: true,
    },
    {
      id: '00000000-0000-0000-0000-000000000602',
      agent_instance_id: ONBOARDING_INSTANCE_ID,
      cadence: 'daily',
      timezone: 'America/New_York',
      next_run_at: getTomorrow9am(),
      is_active: true,
    },
  ]

  for (const schedule of schedules) {
    const { error } = await supabase
      .from('agent_schedules')
      .upsert(schedule, { onConflict: 'id' })

    if (error) {
      results.push(`⚠️ Warning: Could not upsert schedule: ${error.message}`)
    } else {
      results.push(`✅ Created agent schedule for ${schedule.cadence}`)
    }
  }

  // ========================================================================
  // 10. Create conversation
  // ========================================================================
  console.log('💬 Creating conversation...')
  const { error: convError } = await supabase
    .from('conversations')
    .upsert({
      id: SARAH_PULSE_CONVERSATION_ID,
      company_id: DEMO_COMPANY_ID,
      agent_instance_id: WEEKLY_PULSE_INSTANCE_ID,
      participant_user_id: SARAH_CHEN_ID,
      status: 'active',
      message_count: 4,
      unread_count: 1,
      last_message_at: new Date().toISOString(),
    }, { onConflict: 'id' })

  if (convError) {
    results.push(`⚠️ Warning: Could not create conversation: ${convError.message}`)
  } else {
    results.push('✅ Created conversation: Sarah Chen <-> Weekly Team Pulse')
  }

  // ========================================================================
  // 11. Create messages
  // ========================================================================
  console.log('✉️ Creating messages...')
  // Delete existing messages first
  await supabase
    .from('messages')
    .delete()
    .eq('conversation_id', SARAH_PULSE_CONVERSATION_ID)

  const now = new Date()
  const messages = [
    {
      id: '00000000-0000-0000-0000-000000000701',
      conversation_id: SARAH_PULSE_CONVERSATION_ID,
      sender_type: 'agent',
      sender_id: null,
      content: "Hey Sarah! 👋 Quick check-in - how's your week going so far?",
      content_type: 'text',
      is_read: true,
      created_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '00000000-0000-0000-0000-000000000702',
      conversation_id: SARAH_PULSE_CONVERSATION_ID,
      sender_type: 'employee',
      sender_id: SARAH_CHEN_ID,
      content: "Pretty good! Been heads down on the new feature release. Feeling productive but also a bit stretched with the deadline.",
      content_type: 'text',
      is_read: true,
      created_at: new Date(now.getTime() - 1.5 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '00000000-0000-0000-0000-000000000703',
      conversation_id: SARAH_PULSE_CONVERSATION_ID,
      sender_type: 'agent',
      sender_id: null,
      content: "Thanks for sharing! It sounds like you're making great progress 💪 When deadlines loom, what helps you most - more focused time blocks, clearer priorities, or something else?",
      content_type: 'text',
      is_read: true,
      created_at: new Date(now.getTime() - 1.4 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '00000000-0000-0000-0000-000000000704',
      conversation_id: SARAH_PULSE_CONVERSATION_ID,
      sender_type: 'employee',
      sender_id: SARAH_CHEN_ID,
      content: "Honestly, fewer meetings would help! I've been averaging 4 hours of meetings daily this week.",
      content_type: 'text',
      is_read: false,
      created_at: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
    },
  ]

  for (const msg of messages) {
    const { error } = await supabase
      .from('messages')
      .insert(msg)

    if (error) {
      results.push(`⚠️ Warning: Could not insert message: ${error.message}`)
    }
  }
  results.push(`✅ Created ${messages.length} messages in conversation`)

  // ========================================================================
  // 12. Create agent run record
  // ========================================================================
  console.log('📊 Creating agent run record...')
  const { error: runError } = await supabase
    .from('agent_runs')
    .upsert({
      id: '00000000-0000-0000-0000-000000000801',
      agent_instance_id: WEEKLY_PULSE_INSTANCE_ID,
      run_type: 'scheduled',
      status: 'completed',
      started_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      finished_at: new Date(now.getTime() - 2 * 60 * 60 * 1000 + 5000).toISOString(),
      messages_sent: 1,
      conversations_touched: 1,
    }, { onConflict: 'id' })

  if (runError) {
    results.push(`⚠️ Warning: Could not create agent run: ${runError.message}`)
  } else {
    results.push('✅ Created agent run record')
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
  console.log('   Employee: sarah.chen@acme.com / demo123')
  console.log('')
}

main().catch(console.error)
