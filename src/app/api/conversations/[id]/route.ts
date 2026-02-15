import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getAuthContext } from '@/lib/api-auth'
import { getDemoConversation, getDemoMessages } from '@/lib/demo-context'

// GET /api/conversations/[id] - Get conversation with messages
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await getAuthContext()
    const { id } = await params

    if (!authContext) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Demo mode - return mock conversation and messages
    if (authContext.isDemo) {
      const conversation = getDemoConversation(id)
      if (!conversation) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
      }
      const messages = getDemoMessages(id)
      return NextResponse.json({
        conversation,
        messages,
        summary: null,
      })
    }

    // Real Supabase query
    const supabase = await createClient()

    // Get conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select(`
        *,
        agent_instances (
          id,
          name,
          config,
          agents (
            name,
            agent_type,
            description
          )
        ),
        profiles!conversations_participant_user_id_fkey (
          id,
          full_name,
          email,
          avatar_url
        )
      `)
      .eq('id', id)
      .eq('company_id', authContext.companyId)
      .single()

    if (convError || !conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // Check access - employee can only see their own, admin can see all
    const isAdmin = ['owner', 'admin', 'hr_manager', 'manager'].includes(authContext.role)
    if (!isAdmin && conversation.participant_user_id !== authContext.userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get messages
    const { data: messages } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true })

    // Get latest summary (for admins)
    let latestSummary = null
    if (isAdmin) {
      const { data: summaries } = await supabase
        .from('feedback_summaries')
        .select('*')
        .eq('conversation_id', id)
        .order('computed_at', { ascending: false })
        .limit(1)

      latestSummary = summaries?.[0] || null
    }

    // Mark messages as read if this is the employee
    if (conversation.participant_user_id === authContext.userId) {
      const unreadIds = (messages || [])
        .filter(m => !m.is_read && m.sender_type === 'agent')
        .map(m => m.id)

      if (unreadIds.length > 0) {
        await supabase
          .from('messages')
          .update({ is_read: true })
          .in('id', unreadIds)

        await supabase
          .from('conversations')
          .update({ unread_count: 0 })
          .eq('id', id)
      }
    }

    return NextResponse.json({
      conversation,
      messages: messages || [],
      summary: latestSummary,
    })
  } catch (error) {
    console.error('Get conversation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
