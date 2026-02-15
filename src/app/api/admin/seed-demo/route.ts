import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Demo data constants - these IDs are deterministic for idempotency
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

// POST /api/admin/seed-demo - Seed demo users and data
// Protected by SEED_TOKEN env var or non-production environment
export async function POST(request: Request) {
  try {
    // Security check: require SEED_TOKEN in production
    const { searchParams } = new URL(request.url)
    const providedToken = searchParams.get('token')
    const seedToken = process.env.SEED_TOKEN

    if (process.env.NODE_ENV === 'production') {
      if (!seedToken) {
        return NextResponse.json({
          error: 'SEED_TOKEN not configured. Set it in Vercel environment variables.',
        }, { status: 403 })
      }
      if (providedToken !== seedToken) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 403 })
      }
    }

    // Get Supabase service role credentials
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({
        error: 'Supabase credentials not configured',
      }, { status: 500 })
    }

    // Create service role client (bypasses RLS)
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const results: string[] = []

    // ========================================================================
    // 1. Create or update demo company
    // ========================================================================
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
      return NextResponse.json({
        error: `Failed to create company: ${companyError.message}`,
      }, { status: 500 })
    }
    results.push('Upserted company: Acme Inc')

    // ========================================================================
    // 2. Create or update demo admin user
    // ========================================================================
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
        return NextResponse.json({
          error: `Failed to create admin user: ${adminError.message}`,
        }, { status: 500 })
      }
      results.push(`Created admin user: demo@acme.com (ID: ${adminUser.user.id})`)
    } else {
      const { error: updateError } = await supabase.auth.admin.updateUserById(DEMO_ADMIN_ID, {
        email: 'demo@acme.com',
        password: 'demo123',
        email_confirm: true,
      })

      if (updateError) {
        results.push(`Warning: Could not update admin user: ${updateError.message}`)
      } else {
        results.push('Updated admin user: demo@acme.com')
      }
    }

    // ========================================================================
    // 3. Create or update Sarah Chen user
    // ========================================================================
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
        return NextResponse.json({
          error: `Failed to create Sarah user: ${sarahError.message}`,
        }, { status: 500 })
      }
      results.push(`Created employee user: sarah.chen@acme.com (ID: ${sarahUser.user.id})`)
    } else {
      const { error: updateError } = await supabase.auth.admin.updateUserById(SARAH_CHEN_ID, {
        email: 'sarah.chen@acme.com',
        password: 'demo123',
        email_confirm: true,
      })

      if (updateError) {
        results.push(`Warning: Could not update Sarah user: ${updateError.message}`)
      } else {
        results.push('Updated employee user: sarah.chen@acme.com')
      }
    }

    // ========================================================================
    // 4. Create or update profiles
    // ========================================================================
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
      return NextResponse.json({
        error: `Failed to create admin profile: ${adminProfileError.message}`,
      }, { status: 500 })
    }
    results.push('Upserted admin profile')

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
      return NextResponse.json({
        error: `Failed to create Sarah profile: ${sarahProfileError.message}`,
      }, { status: 500 })
    }
    results.push('Upserted Sarah Chen profile')

    // ========================================================================
    // 5. Create or update company_members
    // ========================================================================
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
      return NextResponse.json({
        error: `Failed to create admin membership: ${adminMemberError.message}`,
      }, { status: 500 })
    }
    results.push('Upserted admin company membership (role: owner)')

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
        salary_amount_cents: 15000000, // $150,000
        salary_currency: 'USD',
        salary_frequency: 'annual',
      }, { onConflict: 'company_id,user_id' })

    if (sarahMemberError) {
      return NextResponse.json({
        error: `Failed to create Sarah membership: ${sarahMemberError.message}`,
      }, { status: 500 })
    }
    results.push('Upserted Sarah company membership (role: employee)')

    // ========================================================================
    // 6. Create agent templates (system-level)
    // ========================================================================
    const agentTemplates = [
      {
        id: PULSE_CHECK_AGENT_ID,
        name: 'Pulse Check',
        slug: 'pulse_check',
        description: 'Weekly check-in to gauge team morale, workload, and identify concerns early',
        agent_type: 'pulse_check',
        is_system: true,
        default_config: {
          max_messages: 5,
          escalation_enabled: true,
        },
      },
      {
        id: ONBOARDING_AGENT_ID,
        name: 'Onboarding Buddy',
        slug: 'onboarding',
        description: 'Guide new hires through their first 90 days with helpful tips and check-ins',
        agent_type: 'onboarding',
        is_system: true,
        default_config: {
          max_messages: 10,
          escalation_enabled: true,
        },
      },
      {
        id: EXIT_INTERVIEW_AGENT_ID,
        name: 'Exit Interview',
        slug: 'exit_interview',
        description: 'Gather candid feedback from departing employees to improve retention',
        agent_type: 'exit_interview',
        is_system: true,
        default_config: {
          max_messages: 8,
          escalation_enabled: false,
        },
      },
      {
        id: MANAGER_COACHING_AGENT_ID,
        name: 'Manager Coach',
        slug: 'manager_coaching',
        description: 'Provide coaching tips and feedback collection for people managers',
        agent_type: 'manager_coaching',
        is_system: true,
        default_config: {
          max_messages: 6,
          escalation_enabled: true,
        },
      },
    ]

    for (const agent of agentTemplates) {
      const { error } = await supabase
        .from('agents')
        .upsert(agent, { onConflict: 'id' })

      if (error) {
        results.push(`Warning: Could not upsert agent ${agent.name}: ${error.message}`)
      } else {
        results.push(`Upserted agent template: ${agent.name}`)
      }
    }

    // ========================================================================
    // 7. Create tone presets (system-level)
    // ========================================================================
    const tonePresets = [
      {
        id: POKE_LITE_PRESET_ID,
        slug: 'poke_lite',
        name: 'Poke-lite',
        description: 'Short, playful, emoji-friendly. Max 240 chars per message.',
        is_system: true,
        config: {
          max_length: 240,
          emoji_level: 'high',
          formality: 'casual',
        },
      },
      {
        id: FRIENDLY_PEER_PRESET_ID,
        slug: 'friendly_peer',
        name: 'Friendly Peer',
        description: 'Warm and conversational, like a work friend checking in.',
        is_system: true,
        config: {
          max_length: 500,
          emoji_level: 'medium',
          formality: 'casual',
        },
      },
      {
        id: PROFESSIONAL_HR_PRESET_ID,
        slug: 'professional_hr',
        name: 'Professional HR',
        description: 'Formal and supportive, appropriate for sensitive topics.',
        is_system: true,
        config: {
          max_length: 800,
          emoji_level: 'none',
          formality: 'formal',
        },
      },
      {
        id: WITTY_SAFE_PRESET_ID,
        slug: 'witty_safe',
        name: 'Witty-but-safe',
        description: 'Light humor that stays workplace appropriate.',
        is_system: true,
        config: {
          max_length: 400,
          emoji_level: 'low',
          formality: 'casual',
        },
      },
    ]

    for (const preset of tonePresets) {
      const { error } = await supabase
        .from('tone_presets')
        .upsert(preset, { onConflict: 'id' })

      if (error) {
        results.push(`Warning: Could not upsert tone preset ${preset.name}: ${error.message}`)
      } else {
        results.push(`Upserted tone preset: ${preset.name}`)
      }
    }

    // ========================================================================
    // 8. Create agent instances (company-level)
    // ========================================================================
    const agentInstances = [
      {
        id: WEEKLY_PULSE_INSTANCE_ID,
        company_id: DEMO_COMPANY_ID,
        agent_id: PULSE_CHECK_AGENT_ID,
        created_by: DEMO_ADMIN_ID,
        name: 'Weekly Team Pulse',
        config: {
          tone_preset: 'friendly_peer',
          audience_type: 'company_wide',
          target_employee_ids: [],
        },
        status: 'active',
      },
      {
        id: ONBOARDING_INSTANCE_ID,
        company_id: DEMO_COMPANY_ID,
        agent_id: ONBOARDING_AGENT_ID,
        created_by: DEMO_ADMIN_ID,
        name: 'New Hire Onboarding',
        config: {
          tone_preset: 'friendly_peer',
          audience_type: 'team',
          target_employee_ids: [],
        },
        status: 'active',
      },
    ]

    for (const instance of agentInstances) {
      const { error } = await supabase
        .from('agent_instances')
        .upsert(instance, { onConflict: 'id' })

      if (error) {
        results.push(`Warning: Could not upsert agent instance ${instance.name}: ${error.message}`)
      } else {
        results.push(`Upserted agent instance: ${instance.name}`)
      }
    }

    // ========================================================================
    // 9. Create agent schedules
    // ========================================================================
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
        results.push(`Warning: Could not upsert schedule: ${error.message}`)
      } else {
        results.push(`Upserted agent schedule for ${schedule.cadence}`)
      }
    }

    // ========================================================================
    // 10. Create conversation between Sarah and Pulse Check agent
    // ========================================================================
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
      results.push(`Warning: Could not create conversation: ${convError.message}`)
    } else {
      results.push('Upserted conversation: Sarah Chen <-> Weekly Team Pulse')
    }

    // ========================================================================
    // 11. Create messages in the conversation
    // ========================================================================
    // Delete existing messages first to avoid duplicates
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
        created_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      },
      {
        id: '00000000-0000-0000-0000-000000000702',
        conversation_id: SARAH_PULSE_CONVERSATION_ID,
        sender_type: 'employee',
        sender_id: SARAH_CHEN_ID,
        content: "Pretty good! Been heads down on the new feature release. Feeling productive but also a bit stretched with the deadline.",
        content_type: 'text',
        is_read: true,
        created_at: new Date(now.getTime() - 1.5 * 60 * 60 * 1000).toISOString(), // 1.5 hours ago
      },
      {
        id: '00000000-0000-0000-0000-000000000703',
        conversation_id: SARAH_PULSE_CONVERSATION_ID,
        sender_type: 'agent',
        sender_id: null,
        content: "Thanks for sharing! It sounds like you're making great progress 💪 When deadlines loom, what helps you most - more focused time blocks, clearer priorities, or something else?",
        content_type: 'text',
        is_read: true,
        created_at: new Date(now.getTime() - 1.4 * 60 * 60 * 1000).toISOString(), // 1.4 hours ago
      },
      {
        id: '00000000-0000-0000-0000-000000000704',
        conversation_id: SARAH_PULSE_CONVERSATION_ID,
        sender_type: 'employee',
        sender_id: SARAH_CHEN_ID,
        content: "Honestly, fewer meetings would help! I've been averaging 4 hours of meetings daily this week.",
        content_type: 'text',
        is_read: false,
        created_at: new Date(now.getTime() - 30 * 60 * 1000).toISOString(), // 30 min ago
      },
    ]

    for (const msg of messages) {
      const { error } = await supabase
        .from('messages')
        .insert(msg)

      if (error) {
        results.push(`Warning: Could not insert message: ${error.message}`)
      }
    }
    results.push(`Created ${messages.length} messages in conversation`)

    // ========================================================================
    // 12. Create an agent run record
    // ========================================================================
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
      results.push(`Warning: Could not create agent run: ${runError.message}`)
    } else {
      results.push('Upserted agent run record')
    }

    return NextResponse.json({
      success: true,
      message: 'Demo data seeded successfully',
      results,
      credentials: {
        admin: { email: 'demo@acme.com', password: 'demo123' },
        employee: { email: 'sarah.chen@acme.com', password: 'demo123' },
      },
      data_created: {
        company: 'Acme Inc',
        users: ['demo@acme.com (owner)', 'sarah.chen@acme.com (employee)'],
        agent_templates: ['Pulse Check', 'Onboarding Buddy', 'Exit Interview', 'Manager Coach'],
        tone_presets: ['Poke-lite', 'Friendly Peer', 'Professional HR', 'Witty-but-safe'],
        agent_instances: ['Weekly Team Pulse', 'New Hire Onboarding'],
        conversations: 1,
        messages: messages.length,
      },
    })
  } catch (error) {
    console.error('Seed demo error:', error)
    return NextResponse.json({
      error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }, { status: 500 })
  }
}

// Helper functions for scheduling
function getNextMonday(): string {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const daysUntilMonday = (8 - dayOfWeek) % 7 || 7
  const nextMonday = new Date(now)
  nextMonday.setDate(now.getDate() + daysUntilMonday)
  nextMonday.setHours(9, 0, 0, 0)
  return nextMonday.toISOString()
}

function getTomorrow9am(): string {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(9, 0, 0, 0)
  return tomorrow.toISOString()
}

// GET endpoint for checking status
export async function GET() {
  const seedToken = process.env.SEED_TOKEN

  return NextResponse.json({
    message: 'Seed Demo API',
    usage: 'POST /api/admin/seed-demo?token=YOUR_SEED_TOKEN',
    tokenConfigured: !!seedToken,
    nodeEnv: process.env.NODE_ENV,
  })
}
