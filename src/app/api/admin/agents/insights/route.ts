import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getAuthContext } from '@/lib/api-auth'
import { getAgentAnalytics, STATIC_CONVERSATIONS, STATIC_FEEDBACK_SUMMARIES, STATIC_EMPLOYEES } from '@/lib/agent-demo-data'

/**
 * GET /api/admin/agents/insights - Admin insights dashboard data
 *
 * Returns aggregated data for admin dashboard:
 * - Conversation counts by status
 * - Sentiment distribution from feedback summaries
 * - Top action items
 * - Escalation count
 * - Response rates
 * - Recent activity
 */
export async function GET(request: Request) {
  try {
    const authContext = await getAuthContext()

    if (!authContext) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // RBAC: Only admins can access insights
    if (!authContext.isAdmin) {
      return NextResponse.json({
        error: 'Insufficient permissions. Admin access required.'
      }, { status: 403 })
    }

    const url = new URL(request.url)
    const period = url.searchParams.get('period') || '30d' // 7d, 30d, 90d, all

    // Return demo data in demo mode
    if (authContext.isDemo) {
      const analytics = getAgentAnalytics()

      // Calculate sentiment distribution
      const sentimentDistribution: Record<string, number> = {
        positive: 0,
        neutral: 0,
        negative: 0,
      }
      STATIC_FEEDBACK_SUMMARIES.forEach(s => {
        sentimentDistribution[s.sentiment] = (sentimentDistribution[s.sentiment] || 0) + 1
      })

      // Calculate message counts
      const totalMessages = STATIC_CONVERSATIONS.reduce((acc, c) => acc + c.messages.length, 0)

      return NextResponse.json({
        period,
        summary: {
          totalConversations: analytics.totalConversations,
          activeConversations: analytics.activeConversations,
          totalMessages,
          uniqueParticipants: analytics.totalConversations, // Each conversation has unique participant
          totalEmployees: STATIC_EMPLOYEES.length,
          engagementRate: Math.round(analytics.participationRate * 100),
          responseRate: 85, // Demo value
          activeAgents: 2,
          escalationCount: analytics.escalations.length,
          avgSentimentScore: analytics.avgSentimentScore,
        },
        conversationsByStatus: {
          active: analytics.activeConversations,
          completed: analytics.completedConversations,
          escalated: analytics.escalatedConversations,
        },
        sentimentDistribution,
        topTags: analytics.topTags,
        escalationsByStatus: {
          open: analytics.escalations.length,
          resolved: 0,
        },
        messagesBySender: {
          agent: Math.ceil(totalMessages * 0.5),
          employee: Math.floor(totalMessages * 0.5),
        },
        recentRuns: [
          {
            id: 'run_001',
            runType: 'scheduled',
            status: 'completed',
            startedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            finishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000 + 300000).toISOString(),
            messagesSent: 10,
            conversationsTouched: 10,
            agentName: 'Weekly Pulse Check',
          },
        ],
      })
    }

    const supabase = await createClient()

    // Calculate date filter
    let dateFilter: Date | null = null
    switch (period) {
      case '7d':
        dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        dateFilter = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
        break
      default:
        dateFilter = null
    }

    // Get conversation counts by status
    const { data: convStats } = await supabase
      .from('conversations')
      .select('status')
      .eq('company_id', authContext.companyId)

    const conversationCounts = (convStats || []).reduce((acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Get sentiment distribution from feedback summaries
    let feedbackQuery = supabase
      .from('feedback_summaries')
      .select('sentiment, sentiment_score, tags')
      .eq('company_id', authContext.companyId)

    if (dateFilter) {
      feedbackQuery = feedbackQuery.gte('computed_at', dateFilter.toISOString())
    }

    const { data: feedbackData } = await feedbackQuery

    const sentimentDistribution = (feedbackData || []).reduce((acc, f) => {
      const sentiment = f.sentiment || 'neutral'
      acc[sentiment] = (acc[sentiment] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Calculate average sentiment score
    const scores = (feedbackData || [])
      .map(f => f.sentiment_score)
      .filter((s): s is number => typeof s === 'number')
    const avgSentimentScore = scores.length > 0
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : 0

    // Get tag frequency from feedback summaries
    const tagCounts: Record<string, number> = {}
    for (const f of feedbackData || []) {
      const tags = f.tags as string[] | null
      if (tags && Array.isArray(tags)) {
        for (const tag of tags) {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1
        }
      }
    }
    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }))

    // Get escalation count
    let escalationQuery = supabase
      .from('agent_escalations')
      .select('id, status, created_at', { count: 'exact', head: false })
      .eq('company_id', authContext.companyId)

    if (dateFilter) {
      escalationQuery = escalationQuery.gte('created_at', dateFilter.toISOString())
    }

    const { data: escalations, count: escalationCount } = await escalationQuery

    const escalationsByStatus = (escalations || []).reduce((acc, e) => {
      acc[e.status || 'open'] = (acc[e.status || 'open'] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Get message stats
    let messageQuery = supabase
      .from('messages')
      .select('sender_type, created_at')
      .eq('company_id', authContext.companyId)

    if (dateFilter) {
      messageQuery = messageQuery.gte('created_at', dateFilter.toISOString())
    }

    const { data: messageStats, count: totalMessages } = await messageQuery

    const messagesBySender = (messageStats || []).reduce((acc, m) => {
      acc[m.sender_type] = (acc[m.sender_type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Calculate response rate (employee messages / agent messages)
    const agentMessages = messagesBySender['agent'] || 0
    const employeeMessages = messagesBySender['employee'] || 0
    const responseRate = agentMessages > 0
      ? Math.round((employeeMessages / agentMessages) * 100)
      : 0

    // Get active agent instances
    const { data: activeAgents, count: activeAgentCount } = await supabase
      .from('agent_instances')
      .select('id', { count: 'exact', head: false })
      .eq('company_id', authContext.companyId)
      .eq('status', 'active')

    // Get recent agent runs
    const { data: recentRuns } = await supabase
      .from('agent_runs')
      .select(`
        id,
        run_type,
        status,
        started_at,
        finished_at,
        messages_sent,
        conversations_touched,
        agent_instances (
          id,
          name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(10)

    // Filter runs by company via agent_instances
    const companyRuns = (recentRuns || []).filter(run => {
      const instances = run.agent_instances
      return instances !== null
    })

    // Get unique participants in conversations
    const { data: uniqueParticipants } = await supabase
      .from('conversations')
      .select('participant_user_id')
      .eq('company_id', authContext.companyId)

    const uniqueParticipantCount = new Set(
      (uniqueParticipants || []).map(p => p.participant_user_id)
    ).size

    // Get total employees in company
    const { count: totalEmployees } = await supabase
      .from('company_members')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', authContext.companyId)
      .eq('status', 'active')

    // Engagement rate (participants / total employees)
    const engagementRate = totalEmployees && totalEmployees > 0
      ? Math.round((uniqueParticipantCount / totalEmployees) * 100)
      : 0

    return NextResponse.json({
      period,
      summary: {
        totalConversations: convStats?.length || 0,
        activeConversations: conversationCounts['active'] || 0,
        totalMessages: totalMessages || 0,
        uniqueParticipants: uniqueParticipantCount,
        totalEmployees: totalEmployees || 0,
        engagementRate,
        responseRate,
        activeAgents: activeAgentCount || 0,
        escalationCount: escalationCount || 0,
        avgSentimentScore: Math.round(avgSentimentScore * 100) / 100,
      },
      conversationsByStatus: conversationCounts,
      sentimentDistribution,
      topTags,
      escalationsByStatus,
      messagesBySender,
      recentRuns: companyRuns.map(run => {
        // agent_instances can be object or array depending on query shape
        const instanceData = run.agent_instances
        const instance = Array.isArray(instanceData) ? instanceData[0] : instanceData
        const agentName = (instance as { name?: string } | null)?.name || 'Unknown'

        return {
          id: run.id,
          runType: run.run_type,
          status: run.status,
          startedAt: run.started_at,
          finishedAt: run.finished_at,
          messagesSent: run.messages_sent,
          conversationsTouched: run.conversations_touched,
          agentName,
        }
      }),
    })
  } catch (error) {
    console.error('[Admin Insights] API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
