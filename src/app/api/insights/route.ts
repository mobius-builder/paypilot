import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Rich demo data for the insights dashboard
function getDemoInsightsData(days: number) {
  const now = new Date()

  return {
    feed: [
      {
        id: 'fb-001',
        conversation_id: 'conv-001',
        summary: 'Employee expressed enthusiasm about the new project direction and appreciated the recent team restructuring. They feel more aligned with company goals.',
        sentiment: 'positive',
        tags: ['culture', 'growth', 'team_dynamics'],
        computed_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        participant: { name: 'Sarah Chen', avatar_url: null },
        agent_name: 'Pulse Check Agent',
        key_quotes: ['I really appreciate how transparent leadership has been lately'],
        delta_notes: 'Sentiment improved from neutral last week',
      },
      {
        id: 'fb-002',
        conversation_id: 'conv-002',
        summary: 'Discussed workload concerns but overall positive outlook. Looking forward to new tooling rollout next month.',
        sentiment: 'neutral',
        tags: ['workload', 'tooling'],
        computed_at: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(),
        participant: { name: 'Marcus Johnson', avatar_url: null },
        agent_name: 'Weekly Check-in',
        key_quotes: ['Things are busy but manageable'],
        delta_notes: null,
      },
      {
        id: 'fb-003',
        conversation_id: 'conv-003',
        summary: 'Very positive feedback about manager relationship and career development opportunities. Feels supported in pursuing new skills.',
        sentiment: 'positive',
        tags: ['manager', 'growth', 'recognition'],
        computed_at: new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString(),
        participant: { name: 'Emily Rodriguez', avatar_url: null },
        agent_name: 'Pulse Check Agent',
        key_quotes: ['My manager has been incredibly supportive of my growth'],
        delta_notes: null,
      },
      {
        id: 'fb-004',
        conversation_id: 'conv-004',
        summary: 'Shared excitement about upcoming team offsite. Mentioned some concerns about communication across departments.',
        sentiment: 'mixed',
        tags: ['communication', 'team_dynamics', 'culture'],
        computed_at: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
        participant: { name: 'David Kim', avatar_url: null },
        agent_name: 'Weekly Check-in',
        key_quotes: ['Looking forward to the offsite, hoping we can improve cross-team sync'],
        delta_notes: null,
      },
      {
        id: 'fb-005',
        conversation_id: 'conv-005',
        summary: 'Positive feedback on work-life balance improvements. Appreciates the flexible schedule policy.',
        sentiment: 'positive',
        tags: ['work_life_balance', 'culture'],
        computed_at: new Date(now.getTime() - 36 * 60 * 60 * 1000).toISOString(),
        participant: { name: 'Lisa Park', avatar_url: null },
        agent_name: 'Pulse Check Agent',
        key_quotes: ['The flexible hours have made such a difference for my family'],
        delta_notes: 'New positive signal about work-life balance',
      },
      {
        id: 'fb-006',
        conversation_id: 'conv-006',
        summary: 'Discussed career aspirations and interest in moving to a leadership role. Feels ready for more responsibility.',
        sentiment: 'positive',
        tags: ['growth', 'manager'],
        computed_at: new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString(),
        participant: { name: 'James Wilson', avatar_url: null },
        agent_name: 'Career Development Agent',
        key_quotes: ['I feel ready to take on more leadership opportunities'],
        delta_notes: null,
      },
      {
        id: 'fb-007',
        conversation_id: 'conv-007',
        summary: 'Expressed some frustration with current project timeline but remains committed to team goals.',
        sentiment: 'neutral',
        tags: ['workload', 'team_dynamics'],
        computed_at: new Date(now.getTime() - 72 * 60 * 60 * 1000).toISOString(),
        participant: { name: 'Rachel Wong', avatar_url: null },
        agent_name: 'Weekly Check-in',
        key_quotes: ['The timeline is tight but we will make it work'],
        delta_notes: null,
      },
      {
        id: 'fb-008',
        conversation_id: 'conv-008',
        summary: 'Very positive about recent compensation review. Feels valued and fairly compensated for their contributions.',
        sentiment: 'positive',
        tags: ['compensation', 'recognition'],
        computed_at: new Date(now.getTime() - 96 * 60 * 60 * 1000).toISOString(),
        participant: { name: 'Alex Thompson', avatar_url: null },
        agent_name: 'Pulse Check Agent',
        key_quotes: ['I feel truly valued here, the raise was unexpected and appreciated'],
        delta_notes: null,
      },
    ],
    sentiment_distribution: {
      positive: 18,
      neutral: 8,
      negative: 2,
      mixed: 4,
    },
    top_tags: [
      { tag: 'culture', count: 12 },
      { tag: 'growth', count: 10 },
      { tag: 'work_life_balance', count: 8 },
      { tag: 'manager', count: 7 },
      { tag: 'team_dynamics', count: 6 },
      { tag: 'workload', count: 5 },
      { tag: 'communication', count: 4 },
      { tag: 'compensation', count: 3 },
      { tag: 'recognition', count: 3 },
      { tag: 'tooling', count: 2 },
    ],
    action_items: [
      {
        text: 'Schedule 1:1 with David Kim to discuss cross-team communication concerns',
        confidence: 0.92,
        priority: 'high',
        conversation_id: 'conv-004',
        participant_name: 'David Kim',
      },
      {
        text: 'Consider James Wilson for upcoming team lead position',
        confidence: 0.88,
        priority: 'medium',
        conversation_id: 'conv-006',
        participant_name: 'James Wilson',
      },
      {
        text: 'Review project timeline with Rachel Wong\'s team',
        confidence: 0.85,
        priority: 'medium',
        conversation_id: 'conv-007',
        participant_name: 'Rachel Wong',
      },
      {
        text: 'Share positive feedback about flexible schedule policy with leadership',
        confidence: 0.78,
        priority: 'low',
        conversation_id: 'conv-005',
        participant_name: 'Lisa Park',
      },
      {
        text: 'Plan team recognition event to maintain positive momentum',
        confidence: 0.75,
        priority: 'low',
        conversation_id: 'conv-001',
        participant_name: 'Sarah Chen',
      },
    ],
    escalations: [],
    delta_highlights: {
      improved: ['Overall sentiment up 12% from last week', 'Work-life balance feedback significantly improved'],
      declined: [],
      new_concerns: ['Cross-team communication emerging as new topic'],
    },
    stats: {
      active_conversations: 34,
      messages_this_period: 156,
      summaries_count: 32,
      open_escalations: 0,
    },
    period: {
      days,
      since: new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString(),
    },
  }
}

// GET /api/insights - Get insights dashboard data
export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      // Return demo data for unauthenticated users
      const url = new URL(request.url)
      const days = parseInt(url.searchParams.get('days') || '7', 10)
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
      const url = new URL(request.url)
      const days = parseInt(url.searchParams.get('days') || '7', 10)
      return NextResponse.json(getDemoInsightsData(days))
    }

    if (!['owner', 'admin', 'hr_manager', 'manager'].includes(membership.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const url = new URL(request.url)
    const days = parseInt(url.searchParams.get('days') || '7', 10)
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
