import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getAuthContext } from '@/lib/api-auth'
import {
  getAllDemoConversations,
  getDemoMessages,
} from '@/lib/demo-context'

// GET /api/conversations - List conversations
export async function GET(request: Request) {
  try {
    const authContext = await getAuthContext()

    if (!authContext) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const view = url.searchParams.get('view') || 'employee' // 'employee' or 'admin'

    // Demo mode - return mock conversations based on user role
    if (authContext.isDemo) {
      // Get all conversations for this user (base + dynamic, filtered by role)
      const conversations = getAllDemoConversations(authContext.userId, authContext.isAdmin)

      // Add latest message to each conversation
      const conversationsWithPreview = conversations.map(conv => ({
        ...conv,
        latest_message: getDemoMessages(conv.id)?.slice(-1)[0] || null,
      }))

      // Sort by last_message_at desc
      conversationsWithPreview.sort((a, b) =>
        new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
      )

      return NextResponse.json({ conversations: conversationsWithPreview })
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
    if (view === 'employee' || !authContext.isAdmin) {
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
