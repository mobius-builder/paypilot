import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getAuthContext } from '@/lib/api-auth'

// Demo conversations data
function getDemoConversations() {
  const now = new Date()
  return {
    conversations: [
      {
        id: 'conv-demo-001',
        status: 'active',
        participant_user_id: 'demo-user',
        last_message_at: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
        agent_instances: {
          id: 'agent-inst-001',
          name: 'Weekly Pulse Check',
          agents: { name: 'Pulse Check', agent_type: 'pulse_check' },
        },
        profiles: {
          id: 'demo-user',
          full_name: 'Sarah Chen',
          email: 'sarah.chen@acme.com',
          avatar_url: null,
        },
        latest_message: {
          id: 'msg-001',
          content: 'Thanks for checking in! Things are going well this week. The new project is exciting!',
          sender_type: 'employee',
          created_at: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
        },
      },
      {
        id: 'conv-demo-002',
        status: 'active',
        participant_user_id: 'demo-user-2',
        last_message_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        agent_instances: {
          id: 'agent-inst-001',
          name: 'Weekly Pulse Check',
          agents: { name: 'Pulse Check', agent_type: 'pulse_check' },
        },
        profiles: {
          id: 'demo-user-2',
          full_name: 'Marcus Johnson',
          email: 'marcus.johnson@acme.com',
          avatar_url: null,
        },
        latest_message: {
          id: 'msg-002',
          content: 'The workload has been a bit heavy but I\'m managing. Looking forward to the team offsite next month.',
          sender_type: 'employee',
          created_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        },
      },
      {
        id: 'conv-demo-003',
        status: 'active',
        participant_user_id: 'demo-user-3',
        last_message_at: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(),
        agent_instances: {
          id: 'agent-inst-002',
          name: 'New Hire Onboarding',
          agents: { name: 'Onboarding Buddy', agent_type: 'onboarding' },
        },
        profiles: {
          id: 'demo-user-3',
          full_name: 'Emily Rodriguez',
          email: 'emily.rodriguez@acme.com',
          avatar_url: null,
        },
        latest_message: {
          id: 'msg-003',
          content: 'My first week has been amazing! Everyone has been so welcoming. I love the culture here.',
          sender_type: 'employee',
          created_at: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(),
        },
      },
      {
        id: 'conv-demo-004',
        status: 'active',
        participant_user_id: 'demo-user-4',
        last_message_at: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
        agent_instances: {
          id: 'agent-inst-001',
          name: 'Weekly Pulse Check',
          agents: { name: 'Pulse Check', agent_type: 'pulse_check' },
        },
        profiles: {
          id: 'demo-user-4',
          full_name: 'David Kim',
          email: 'david.kim@acme.com',
          avatar_url: null,
        },
        latest_message: {
          id: 'msg-004',
          content: 'Had some great conversations with the product team this week. Feeling aligned on our Q2 goals.',
          sender_type: 'employee',
          created_at: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
        },
      },
      {
        id: 'conv-demo-005',
        status: 'active',
        participant_user_id: 'demo-user-5',
        last_message_at: new Date(now.getTime() - 36 * 60 * 60 * 1000).toISOString(),
        agent_instances: {
          id: 'agent-inst-003',
          name: 'Manager Coaching',
          agents: { name: 'Manager Coach', agent_type: 'manager_coaching' },
        },
        profiles: {
          id: 'demo-user-5',
          full_name: 'Lisa Park',
          email: 'lisa.park@acme.com',
          avatar_url: null,
        },
        latest_message: {
          id: 'msg-005',
          content: 'The feedback session tips were really helpful. My team meeting went much better this week.',
          sender_type: 'employee',
          created_at: new Date(now.getTime() - 36 * 60 * 60 * 1000).toISOString(),
        },
      },
      {
        id: 'conv-demo-006',
        status: 'active',
        participant_user_id: 'demo-user-6',
        last_message_at: new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString(),
        agent_instances: {
          id: 'agent-inst-001',
          name: 'Weekly Pulse Check',
          agents: { name: 'Pulse Check', agent_type: 'pulse_check' },
        },
        profiles: {
          id: 'demo-user-6',
          full_name: 'James Wilson',
          email: 'james.wilson@acme.com',
          avatar_url: null,
        },
        latest_message: {
          id: 'msg-006',
          content: 'Really enjoying the new flexible work policy. Makes balancing work and family much easier.',
          sender_type: 'employee',
          created_at: new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString(),
        },
      },
    ],
  }
}

// GET /api/conversations - List conversations
export async function GET(request: Request) {
  try {
    const authContext = await getAuthContext()

    if (!authContext) {
      // Return demo data when not authenticated (for demo mode)
      return NextResponse.json(getDemoConversations())
    }

    const url = new URL(request.url)
    const view = url.searchParams.get('view') || 'employee' // 'employee' or 'admin'

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
      // Return demo data on error
      return NextResponse.json(getDemoConversations())
    }

    // If no conversations found, return demo data
    if (!conversations || conversations.length === 0) {
      return NextResponse.json(getDemoConversations())
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
    // Return demo data even on errors
    return NextResponse.json(getDemoConversations())
  }
}
