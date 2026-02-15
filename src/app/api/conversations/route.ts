import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getAuthContext } from '@/lib/api-auth'
import { DEMO_CONVERSATIONS, DEMO_MESSAGES } from '@/lib/demo-context'

// GET /api/conversations - List conversations
export async function GET(request: Request) {
  try {
    const authContext = await getAuthContext()

    if (!authContext) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const view = url.searchParams.get('view') || 'employee' // 'employee' or 'admin'

    // Demo mode - return mock conversations
    if (authContext.isDemo) {
      const demoConversations = DEMO_CONVERSATIONS.map(conv => ({
        ...conv,
        latest_message: DEMO_MESSAGES[conv.id]?.[DEMO_MESSAGES[conv.id].length - 1] || null,
      }))
      return NextResponse.json({ conversations: demoConversations })
    }

    // Real Supabase query
    const supabase = await createClient()

    let query = supabase
      .from('conversations')
      .select(`
        *,
        agent_instances (
          id,
          name,
          agents (
            name,
            agent_type
          )
        ),
        profiles!conversations_participant_user_id_fkey (
          id,
          full_name,
          email,
          avatar_url
        )
      `)
      .eq('company_id', authContext.companyId)
      .order('last_message_at', { ascending: false, nullsFirst: false })

    // Employee view: only their conversations
    // Admin view: all conversations
    if (view === 'employee' || !['owner', 'admin', 'hr_manager', 'manager'].includes(authContext.role)) {
      query = query.eq('participant_user_id', authContext.userId)
    }

    const { data: conversations, error } = await query.limit(50)

    if (error) {
      console.error('Error fetching conversations:', error)
      return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
    }

    // Get latest message for each conversation
    const conversationsWithPreview = await Promise.all(
      (conversations || []).map(async (conv) => {
        const { data: latestMessage } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        return {
          ...conv,
          latest_message: latestMessage || null,
        }
      })
    )

    return NextResponse.json({ conversations: conversationsWithPreview })
  } catch (error) {
    console.error('Conversations API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
