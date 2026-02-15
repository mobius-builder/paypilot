import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getAuthContext } from '@/lib/api-auth'
import { generateInitialMessage, isAnthropicConfigured } from '@/lib/anthropic'

// POST /api/agents/instances/[id]/trigger - Manually trigger agent (Run button)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await getAuthContext()
    const { id } = await params

    if (!authContext) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // RBAC: Only admins can run agents
    if (!authContext.isAdmin) {
      return NextResponse.json({
        error: 'Insufficient permissions. Only admins can run agents.'
      }, { status: 403 })
    }

    // Parse optional target employees
    const body = await request.json().catch(() => ({}))
    const targetEmployees = body.target_employees as string[] | undefined

    const supabase = await createClient()

    // Verify instance exists and belongs to company
    const { data: instance, error: instanceError } = await supabase
      .from('agent_instances')
      .select('id, status, company_id, name, agent_id, config, agents(name, agent_type)')
      .eq('id', id)
      .eq('company_id', authContext.companyId)
      .single()

    if (instanceError || !instance) {
      return NextResponse.json({ error: 'Agent instance not found' }, { status: 404 })
    }

    if (instance.status !== 'active') {
      return NextResponse.json({ error: 'Agent is not active' }, { status: 400 })
    }

    // Create agent run record
    const { data: run, error: runError } = await supabase
      .from('agent_runs')
      .insert({
        agent_instance_id: id,
        run_type: 'manual',
        status: 'running',
      })
      .select()
      .single()

    if (runError) {
      console.error('Failed to create agent run:', runError)
      return NextResponse.json({ error: 'Failed to create agent run' }, { status: 500 })
    }

    // Get target employees
    let employeeQuery = supabase
      .from('company_members')
      .select('id, user_id, job_title, profiles(id, full_name, email)')
      .eq('company_id', authContext.companyId)
      .eq('status', 'active')

    if (targetEmployees && targetEmployees.length > 0) {
      employeeQuery = employeeQuery.in('user_id', targetEmployees)
    }

    const { data: employees } = await employeeQuery

    let messagesSent = 0
    let conversationsTouched = 0

    // Process each employee
    for (const employee of employees || []) {
      // profiles can be an object or array depending on the query, handle both
      const profileData = employee.profiles
      const profile = Array.isArray(profileData) ? profileData[0] : profileData
      if (!profile) continue
      const profileTyped = profile as { id: string; full_name: string; email: string }

      // Upsert conversation
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .upsert({
          company_id: authContext.companyId,
          agent_instance_id: id,
          participant_user_id: profileTyped.id,
          status: 'active',
        }, {
          onConflict: 'agent_instance_id,participant_user_id',
        })
        .select()
        .single()

      if (convError) {
        console.error('Failed to upsert conversation:', convError)
        continue
      }

      // Generate and insert agent message
      const agentsData = instance.agents
      const agentRecord = Array.isArray(agentsData) ? agentsData[0] : agentsData
      const agentType = (agentRecord as { agent_type: string } | null)?.agent_type || 'pulse_check'
      let openingMessage: string

      if (isAnthropicConfigured()) {
        try {
          openingMessage = await generateInitialMessage({
            employeeName: profileTyped.full_name,
            agentType,
            tonePreset: 'friendly_peer',
          })
        } catch {
          openingMessage = `Hey ${profileTyped.full_name.split(' ')[0]}! Quick check-in - how's your week going so far?`
        }
      } else {
        openingMessage = `Hey ${profileTyped.full_name.split(' ')[0]}! Quick check-in - how's your week going so far?`
      }

      // Insert message (using service role - bypasses RLS for agent messages)
      const { error: msgError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversation.id,
          sender_type: 'agent',
          content: openingMessage,
          content_type: 'text',
        })

      if (!msgError) {
        messagesSent++
        conversationsTouched++
      }
    }

    // Update agent run with results
    await supabase
      .from('agent_runs')
      .update({
        status: 'completed',
        finished_at: new Date().toISOString(),
        messages_sent: messagesSent,
        conversations_touched: conversationsTouched,
      })
      .eq('id', run.id)

    // Log audit
    await supabase
      .from('audit_logs')
      .insert({
        company_id: authContext.companyId,
        actor_user_id: authContext.userId,
        actor_role: authContext.role,
        action: 'agent_triggered',
        target_type: 'agent_instance',
        target_id: id,
        after_state: { run_id: run.id, messages_sent: messagesSent },
      })

    return NextResponse.json({
      success: true,
      run_id: run.id,
      messages_sent: messagesSent,
      conversations_touched: conversationsTouched,
    })
  } catch (error) {
    console.error('Trigger agent error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
