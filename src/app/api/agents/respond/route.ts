import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAuthContext } from '@/lib/api-auth'
import { generateAgentResponse, isAnthropicConfigured, AgentContext } from '@/lib/anthropic'

/**
 * POST /api/agents/respond
 *
 * Called when an employee sends a message in a conversation.
 * Generates an AI response using Claude and handles escalations.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthContext()

    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { conversation_id, message_content } = body

    if (!conversation_id || !message_content) {
      return NextResponse.json({ error: 'Missing conversation_id or message_content' }, { status: 400 })
    }

    // Check if Anthropic is configured
    if (!isAnthropicConfigured()) {
      console.warn('[Agent Respond] ANTHROPIC_API_KEY not configured, using fallback')
      return NextResponse.json({
        response: {
          content: "Thanks for sharing! I'm listening. Tell me more about how things are going.",
          shouldEscalate: false,
        },
        message: null,
        warning: 'Anthropic API key not configured. Using fallback response.',
      })
    }

    const supabase = await createClient()

    // Get conversation with agent instance details
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select(`
        *,
        agent_instances (
          *,
          agents (*)
        ),
        profiles!conversations_participant_user_id_fkey (
          id, full_name, email
        )
      `)
      .eq('id', conversation_id)
      .single()

    if (convError || !conversation) {
      console.error('[Agent Respond] Conversation not found:', convError)
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // Verify the user is the participant or has admin access
    const isParticipant = conversation.participant_user_id === auth.userId
    const isAdmin = ['owner', 'admin', 'hr_manager'].includes(auth.role)

    if (!isParticipant && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get last N messages for context
    const { data: recentMessages } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversation_id)
      .order('created_at', { ascending: false })
      .limit(10)

    // Build conversation history (oldest to newest)
    const conversationHistory = (recentMessages || [])
      .reverse()
      .map(m => ({
        role: m.sender_type === 'employee' ? 'user' as const : 'assistant' as const,
        content: m.content,
      }))

    // Add the new user message
    conversationHistory.push({ role: 'user', content: message_content })

    // Get agent config
    const agentInstance = conversation.agent_instances
    const agent = agentInstance?.agents
    const participant = conversation.profiles as { id: string; full_name: string; email: string }

    // Determine tone preset from config
    const tonePreset = agentInstance?.config?.tone_preset || 'friendly_peer'

    // Build context for Claude
    const agentContext: AgentContext = {
      employeeName: participant?.full_name || 'there',
      employeeTitle: agentInstance?.config?.employee_title,
      department: agentInstance?.config?.department,
      agentType: agent?.agent_type || 'pulse_check',
      tonePreset,
      conversationHistory,
    }

    // Generate response
    const agentResponse = await generateAgentResponse(agentContext)

    // Store the employee message
    const { data: employeeMessage } = await supabase
      .from('messages')
      .insert({
        conversation_id,
        sender_type: 'employee',
        sender_id: auth.userId,
        content: message_content,
        content_type: 'text',
        is_read: true,
      })
      .select()
      .single()

    // Store the agent response
    const { data: agentMessage, error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id,
        sender_type: 'agent',
        sender_id: null,
        content: agentResponse.content,
        content_type: agentResponse.shouldEscalate ? 'escalation' : 'text',
        is_read: false,
      })
      .select()
      .single()

    if (messageError) {
      console.error('[Agent Respond] Error storing message:', messageError)
      return NextResponse.json({ error: 'Failed to store response' }, { status: 500 })
    }

    // Update conversation timestamps
    await supabase
      .from('conversations')
      .update({
        last_message_at: new Date().toISOString(),
        message_count: (conversation.message_count || 0) + 2,
        unread_count: (conversation.unread_count || 0) + 1,
      })
      .eq('id', conversation_id)

    // Handle escalation if needed
    if (agentResponse.shouldEscalate) {
      // Create escalation record
      await supabase
        .from('agent_escalations')
        .insert({
          conversation_id,
          company_id: auth.companyId,
          trigger_message_id: employeeMessage?.id,
          escalation_type: agentResponse.escalationType || 'safety',
          severity: agentResponse.escalationType === 'safety' ? 'critical' : 'high',
          description: agentResponse.escalationReason,
          status: 'open',
        })

      // Update conversation status
      await supabase
        .from('conversations')
        .update({ status: 'escalated' })
        .eq('id', conversation_id)

      // Log escalation
      await supabase
        .from('audit_logs')
        .insert({
          company_id: auth.companyId,
          actor_user_id: null,
          action: 'agent_escalation_created',
          target_type: 'conversation',
          target_id: conversation_id,
          after_state: {
            type: agentResponse.escalationType,
            reason: agentResponse.escalationReason,
          },
        })
    }

    return NextResponse.json({
      response: agentResponse,
      message: agentMessage,
      escalated: agentResponse.shouldEscalate,
    })
  } catch (error) {
    console.error('[Agent Respond] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Generate demo response without API call
 */
function getDemoResponse(userMessage: string): { content: string; shouldEscalate: boolean } {
  const lowerMessage = userMessage.toLowerCase()

  // Check for concerning keywords
  if (['suicide', 'kill myself', 'self-harm', 'harassment', 'discriminat'].some(k => lowerMessage.includes(k))) {
    return {
      content: "I hear you, and I want you to know that your wellbeing matters. I've flagged this for our HR team who will reach out to support you directly.",
      shouldEscalate: true,
    }
  }

  // Positive responses
  if (['great', 'good', 'awesome', 'fantastic', 'love'].some(k => lowerMessage.includes(k))) {
    return {
      content: "That's wonderful to hear! What's been the highlight of your week so far?",
      shouldEscalate: false,
    }
  }

  // Negative responses
  if (['stressed', 'overwhelmed', 'frustrated', 'tired', 'exhausted'].some(k => lowerMessage.includes(k))) {
    return {
      content: "I hear you - that sounds challenging. What's been contributing to that feeling the most?",
      shouldEscalate: false,
    }
  }

  // Neutral responses
  if (['okay', 'fine', 'alright', 'meh'].some(k => lowerMessage.includes(k))) {
    return {
      content: "Thanks for sharing. Is there anything specific on your mind this week - good or challenging?",
      shouldEscalate: false,
    }
  }

  // Default follow-up
  return {
    content: "Thanks for sharing that! What else is on your mind about work lately?",
    shouldEscalate: false,
  }
}
