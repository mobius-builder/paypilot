import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { isDemoMode } from '@/lib/api-auth'
import {
  STATIC_CONVERSATIONS,
  STATIC_AGENT_INSTANCES,
  getAgentAnalytics,
} from '@/lib/static-demo-data'

// Generate insights data from static demo conversations
function getDemoInsightsData(days: number) {
  const now = new Date()
  const analytics = getAgentAnalytics()

  // Build feed from conversations with summaries
  const feed = STATIC_CONVERSATIONS
    .filter(conv => conv.summary) // Only conversations with summaries
    .slice(0, 15) // Top 15 most recent
    .map((conv, index) => {
      const agentInstance = STATIC_AGENT_INSTANCES.find(a => a.id === conv.agentInstanceId)
      // Extract a key quote from the last employee message
      const employeeMessages = conv.messages.filter(m => m.senderType === 'employee')
      const lastEmployeeMsg = employeeMessages[employeeMessages.length - 1]

      return {
        id: `fb-${conv.id}`,
        conversation_id: conv.id,
        summary: generateSummaryText(conv),
        sentiment: conv.summary.sentiment,
        tags: conv.summary.tags,
        computed_at: new Date(now.getTime() - (index * 3 + 1) * 60 * 60 * 1000).toISOString(),
        participant: { name: conv.employeeName, avatar_url: null },
        agent_name: agentInstance?.name || 'AI Agent',
        key_quotes: lastEmployeeMsg ? [lastEmployeeMsg.content.substring(0, 100)] : [],
        delta_notes: conv.summary.riskLevel === 'high' ? 'Requires immediate attention' :
                     conv.summary.riskLevel === 'moderate' ? 'Monitor closely' : null,
      }
    })

  // Build action items from conversation summaries
  const actionItems = STATIC_CONVERSATIONS
    .filter(conv => conv.summary.actionItems.length > 0)
    .flatMap(conv =>
      conv.summary.actionItems.map((item, idx) => ({
        text: item,
        confidence: 0.95 - (idx * 0.05),
        priority: conv.summary.riskLevel === 'high' ? 'high' :
                  conv.summary.riskLevel === 'moderate' ? 'medium' : 'low',
        conversation_id: conv.id,
        participant_name: conv.employeeName,
      }))
    )
    .slice(0, 10)

  // Build tag counts from all conversations
  const tagCounts: Record<string, number> = {}
  for (const conv of STATIC_CONVERSATIONS) {
    for (const tag of conv.summary.tags) {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1
    }
  }
  const topTags = Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  // Find escalations
  const escalations = STATIC_CONVERSATIONS
    .filter(conv => conv.status === 'escalated' || conv.summary.riskLevel === 'high')
    .map(conv => ({
      id: `esc-${conv.id}`,
      escalation_type: 'safety',
      severity: 'high',
      status: 'open',
      created_at: conv.lastMessageAt,
      participant_name: conv.employeeName,
    }))

  return {
    feed,
    sentiment_distribution: analytics.sentimentDistribution,
    top_tags: topTags,
    action_items: actionItems,
    escalations,
    delta_highlights: {
      improved: analytics.sentimentDistribution.positive > 15 ? ['Overall sentiment trending positive'] : [],
      declined: analytics.sentimentDistribution.negative > 5 ? ['Some negative sentiment detected'] : [],
      new_concerns: analytics.riskDistribution.high > 0 ? ['High-risk conversation requires attention'] : [],
    },
    stats: {
      active_conversations: analytics.activeConversations,
      messages_this_period: STATIC_CONVERSATIONS.reduce((sum, c) => sum + c.messages.length, 0),
      summaries_count: analytics.totalConversations,
      open_escalations: analytics.escalatedConversations,
    },
    period: {
      days,
      since: new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString(),
    },
  }
}

// Generate a human-readable summary from conversation data
function generateSummaryText(conv: typeof STATIC_CONVERSATIONS[0]): string {
  const sentiment = conv.summary.sentiment
  const tags = conv.summary.tags.slice(0, 2).join(' and ')

  if (sentiment === 'positive') {
    return `${conv.employeeName} shared positive feedback about ${tags}. Employee appears engaged and satisfied with their current situation.`
  } else if (sentiment === 'negative') {
    return `${conv.employeeName} expressed concerns about ${tags}. This conversation may require follow-up attention.`
  } else if (sentiment === 'mixed') {
    return `${conv.employeeName} had mixed feelings about ${tags}. Some positive aspects noted alongside areas of concern.`
  } else {
    return `${conv.employeeName} discussed ${tags} in a balanced manner. No immediate concerns identified.`
  }
}

// GET /api/insights - Get insights dashboard data
export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const days = parseInt(url.searchParams.get('days') || '7', 10)

    // Demo mode: return static data from conversations
    if (await isDemoMode()) {
      return NextResponse.json(getDemoInsightsData(days))
    }

    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      // Return demo data for unauthenticated users
      return NextResponse.json(getDemoInsightsData(days))
    }

    // Verify admin permissions
    const { data: membership } = await supabase
      .from('company_members')
      .select('company_id, role')
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      // Return demo data if no membership found
      return NextResponse.json(getDemoInsightsData(days))
    }

    if (!['owner', 'admin', 'hr_manager', 'manager'].includes(membership.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

    // Get recent summaries with participant info
    const { data: summaries, error: summaryError } = await supabase
      .from('feedback_summaries')
      .select(`
        *,
        conversations (
          id,
          participant_user_id,
          agent_instance_id,
          profiles!conversations_participant_user_id_fkey (
            full_name,
            email,
            avatar_url
          ),
          agent_instances (
            name
          )
        )
      `)
      .gte('computed_at', since)
      .order('computed_at', { ascending: false })
      .limit(50)

    if (summaryError) {
      console.error('Error fetching summaries:', summaryError)
    }

    // If no real data, return demo data
    if (!summaries || summaries.length === 0) {
      return NextResponse.json(getDemoInsightsData(days))
    }

    // Calculate sentiment distribution
    const sentimentCounts = { positive: 0, neutral: 0, negative: 0, mixed: 0 }
    const tagCounts: Record<string, number> = {}
    const allActionItems: Array<{
      text: string
      confidence: number
      priority: string
      conversation_id: string
      participant_name: string
    }> = []

    for (const summary of summaries || []) {
      // Count sentiment
      if (summary.sentiment in sentimentCounts) {
        sentimentCounts[summary.sentiment as keyof typeof sentimentCounts]++
      }

      // Count tags
      const tags = summary.tags as string[] || []
      for (const tag of tags) {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      }

      // Collect action items
      const actions = summary.action_items as Array<{
        text: string
        confidence: number
        priority: string
      }> || []
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const conv = summary.conversations as any
      const participantName = conv?.profiles?.full_name || 'Employee'

      for (const action of actions) {
        allActionItems.push({
          ...action,
          conversation_id: summary.conversation_id,
          participant_name: participantName,
        })
      }
    }

    // Sort tags by count
    const topTags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Get open escalations
    const { data: escalations } = await supabase
      .from('agent_escalations')
      .select(`
        *,
        conversations (
          profiles!conversations_participant_user_id_fkey (
            full_name
          )
        )
      `)
      .eq('company_id', membership.company_id)
      .eq('status', 'open')
      .order('created_at', { ascending: false })

    // Calculate delta highlights (comparing this week to last week)
    const lastWeekSince = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
    const { data: lastWeekSummaries } = await supabase
      .from('feedback_summaries')
      .select('sentiment, tags')
      .gte('computed_at', lastWeekSince)
      .lt('computed_at', since)

    let deltaHighlights = {
      improved: [] as string[],
      declined: [] as string[],
      new_concerns: [] as string[],
    }

    if (lastWeekSummaries && lastWeekSummaries.length > 0) {
      const lastWeekNegativeRate = lastWeekSummaries.filter(s => s.sentiment === 'negative').length / lastWeekSummaries.length
      const thisWeekNegativeRate = sentimentCounts.negative / Math.max((summaries || []).length, 1)

      if (thisWeekNegativeRate < lastWeekNegativeRate - 0.1) {
        deltaHighlights.improved.push('Overall sentiment has improved')
      } else if (thisWeekNegativeRate > lastWeekNegativeRate + 0.1) {
        deltaHighlights.declined.push('More negative feedback this week')
      }

      // Find new tags that weren't present last week
      const lastWeekTags = new Set(lastWeekSummaries.flatMap(s => s.tags as string[] || []))
      const newTags = Object.keys(tagCounts).filter(t => !lastWeekTags.has(t))
      if (newTags.length > 0) {
        deltaHighlights.new_concerns.push(`New topics: ${newTags.join(', ')}`)
      }
    }

    // Format recent summaries for feed
    const recentFeed = (summaries || []).map(summary => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const conv = summary.conversations as any
      return {
        id: summary.id,
        conversation_id: summary.conversation_id,
        summary: summary.summary,
        sentiment: summary.sentiment,
        tags: summary.tags,
        computed_at: summary.computed_at,
        participant: {
          name: conv?.profiles?.full_name || 'Employee',
          avatar_url: conv?.profiles?.avatar_url,
        },
        agent_name: conv?.agent_instances?.name || 'Agent',
        key_quotes: summary.key_quotes,
        delta_notes: summary.delta_notes,
      }
    })

    // Get conversation stats
    const { count: activeConversations } = await supabase
      .from('conversations')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', membership.company_id)
      .eq('status', 'active')

    const { count: totalMessages } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', since)

    return NextResponse.json({
      feed: recentFeed,
      sentiment_distribution: sentimentCounts,
      top_tags: topTags,
      action_items: allActionItems.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 }
        return (priorityOrder[a.priority as keyof typeof priorityOrder] || 2) -
               (priorityOrder[b.priority as keyof typeof priorityOrder] || 2)
      }).slice(0, 20),
      escalations: (escalations || []).map(e => ({
        ...e,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        participant_name: (e.conversations as any)?.profiles?.full_name || 'Employee',
      })),
      delta_highlights: deltaHighlights,
      stats: {
        active_conversations: activeConversations || 0,
        messages_this_period: totalMessages || 0,
        summaries_count: (summaries || []).length,
        open_escalations: (escalations || []).length,
      },
      period: {
        days,
        since,
      },
    })
  } catch (error) {
    console.error('Insights API error:', error)
    // Return demo data even on errors
    return NextResponse.json(getDemoInsightsData(7))
  }
}
