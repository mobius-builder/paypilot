import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { CreateAgentInstanceRequest } from '@/lib/agents/types'
import { getAuthContext, hasRole } from '@/lib/api-auth'
import { STATIC_AGENT_INSTANCES, AGENT_TEMPLATES, getAgentAnalytics } from '@/lib/agent-demo-data'

// GET /api/agents/instances - List agent instances for company
export async function GET() {
  try {
    const auth = await getAuthContext()

    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Return static data in demo mode
    if (auth.isDemo) {
      // Map static instances to expected format
      const instances = STATIC_AGENT_INSTANCES.map(inst => {
        const template = AGENT_TEMPLATES.find(t => t.id === inst.agent_id)
        const analytics = getAgentAnalytics(inst.id)

        return {
          id: inst.id,
          name: inst.name,
          status: inst.status,
          config: {
            tone_preset: inst.tone,
            audience_type: inst.audience_type,
            ...inst.config,
          },
          created_at: inst.created_at,
          agents: template ? {
            id: template.id,
            name: template.name,
            slug: template.slug,
            description: template.description,
            agent_type: template.agent_type,
          } : null,
          agent_schedules: inst.last_run_at ? [
            {
              cadence: 'weekly',
              next_run_at: new Date(new Date(inst.last_run_at).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            },
          ] : [],
          stats: {
            conversations: analytics.totalConversations,
            messages: inst.conversations_count * 3, // Approximate
          },
        }
      })

      return NextResponse.json({ instances })
    }

    const supabase = await createClient()

    // Get agent instances with related data
    const { data: instances, error } = await supabase
      .from('agent_instances')
      .select(`
        *,
        agents (*),
        agent_schedules (*),
        profiles!agent_instances_created_by_fkey (full_name)
      `)
      .eq('company_id', auth.companyId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[Agent Instances] Error fetching:', {
        companyId: auth.companyId,
        error: error.message,
        code: error.code,
      })
      return NextResponse.json({ error: 'Failed to fetch instances' }, { status: 500 })
    }

    // Get stats for each instance
    const instancesWithStats = await Promise.all(
      (instances || []).map(async (instance) => {
        const { count: conversationCount } = await supabase
          .from('conversations')
          .select('id', { count: 'exact', head: true })
          .eq('agent_instance_id', instance.id)

        const { count: messageCount } = await supabase
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .eq('conversation_id', instance.id)

        return {
          ...instance,
          stats: {
            conversations: conversationCount || 0,
            messages: messageCount || 0,
          },
        }
      })
    )

    return NextResponse.json({ instances: instancesWithStats })
  } catch (error) {
    console.error('[Agent Instances] API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/agents/instances - Create new agent instance
export async function POST(request: Request) {
  try {
    const auth = await getAuthContext()

    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check role permissions
    if (!hasRole(auth, ['owner', 'admin', 'hr_manager'])) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body: CreateAgentInstanceRequest = await request.json()

    // Validate required fields
    if (!body.agent_id || !body.name || !body.config || !body.schedule) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = await createClient()

    // Create agent instance
    const { data: instance, error: instanceError } = await supabase
      .from('agent_instances')
      .insert({
        company_id: auth.companyId,
        agent_id: body.agent_id,
        created_by: auth.userId,
        name: body.name,
        config: body.config,
        status: 'active',
      })
      .select()
      .single()

    if (instanceError) {
      console.error('[Agent Instances] Error creating:', {
        companyId: auth.companyId,
        error: instanceError.message,
        code: instanceError.code,
      })
      return NextResponse.json({ error: 'Failed to create instance' }, { status: 500 })
    }

    // Create schedule
    const nextRunAt = calculateNextRun(body.schedule.cadence)

    const { error: scheduleError } = await supabase
      .from('agent_schedules')
      .insert({
        agent_instance_id: instance.id,
        cadence: body.schedule.cadence,
        cron_expression: body.schedule.cron_expression || null,
        timezone: body.schedule.timezone || 'America/New_York',
        next_run_at: nextRunAt,
        is_active: true,
      })

    if (scheduleError) {
      console.error('[Agent Instances] Error creating schedule:', scheduleError)
      // Don't fail the whole request, schedule can be created later
    }

    // Log action
    await supabase
      .from('audit_logs')
      .insert({
        company_id: auth.companyId,
        actor_user_id: auth.userId,
        actor_role: auth.role,
        action: 'agent_instance_created',
        target_type: 'agent_instance',
        target_id: instance.id,
        after_state: { name: body.name, agent_id: body.agent_id },
      })

    return NextResponse.json({ instance })
  } catch (error) {
    console.error('[Agent Instances] Create error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function calculateNextRun(cadence: string): string | null {
  const now = new Date()
  let next: Date

  switch (cadence) {
    case 'once':
      // Schedule for next hour
      next = new Date(now.getTime() + 60 * 60 * 1000)
      break
    case 'daily':
      // Tomorrow at 9am
      next = new Date(now)
      next.setDate(next.getDate() + 1)
      next.setHours(9, 0, 0, 0)
      break
    case 'weekly':
      // Next Monday at 9am
      next = new Date(now)
      next.setDate(next.getDate() + ((8 - next.getDay()) % 7 || 7))
      next.setHours(9, 0, 0, 0)
      break
    case 'biweekly':
      // Two weeks from now
      next = new Date(now)
      next.setDate(next.getDate() + 14)
      next.setHours(9, 0, 0, 0)
      break
    case 'monthly':
      // First of next month at 9am
      next = new Date(now)
      next.setMonth(next.getMonth() + 1, 1)
      next.setHours(9, 0, 0, 0)
      break
    default:
      next = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  }

  return next.toISOString()
}
