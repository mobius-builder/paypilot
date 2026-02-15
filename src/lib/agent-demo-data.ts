/**
 * Static Demo Data for AI Agent System
 *
 * This file contains all hardcoded demo data for the AI Agent system.
 * Data is architecturally correct and can be replaced with real DB queries later.
 */

import { DEMO_COMPANY_ID, DEMO_USER_ID, SARAH_USER_ID } from './demo-context'

// =============================================================================
// STATIC EMPLOYEES (for dropdown, no DB query)
// =============================================================================

export const STATIC_EMPLOYEES = [
  { id: 'emp_001', name: 'Sarah Chen', email: 'sarah.chen@acme.com', department: 'Engineering', job_title: 'Senior Engineer', user_id: SARAH_USER_ID },
  { id: 'emp_002', name: 'David Kim', email: 'david.kim@acme.com', department: 'Design', job_title: 'UX Designer', user_id: 'user_002' },
  { id: 'emp_003', name: 'Maria Lopez', email: 'maria.lopez@acme.com', department: 'Sales', job_title: 'Account Executive', user_id: 'user_003' },
  { id: 'emp_004', name: 'Mike Johnson', email: 'mike.johnson@acme.com', department: 'Engineering', job_title: 'Tech Lead', user_id: 'user_004' },
  { id: 'emp_005', name: 'Emily Davis', email: 'emily.davis@acme.com', department: 'Product', job_title: 'Product Manager', user_id: 'user_005' },
  { id: 'emp_006', name: 'Tom Wilson', email: 'tom.wilson@acme.com', department: 'Sales', job_title: 'Sales Director', user_id: 'user_006' },
  { id: 'emp_007', name: 'Lisa Park', email: 'lisa.park@acme.com', department: 'Finance', job_title: 'Financial Analyst', user_id: 'user_007' },
  { id: 'emp_008', name: 'Alex Wong', email: 'alex.wong@acme.com', department: 'Engineering', job_title: 'Backend Developer', user_id: 'user_008' },
  { id: 'emp_009', name: 'Jennifer Lee', email: 'jennifer.lee@acme.com', department: 'HR', job_title: 'HR Manager', user_id: 'user_009' },
  { id: 'emp_010', name: 'Chris Martin', email: 'chris.martin@acme.com', department: 'Engineering', job_title: 'Frontend Developer', user_id: 'user_010' },
]

// =============================================================================
// AGENT TEMPLATES (global, read-only)
// =============================================================================

export const AGENT_TEMPLATES = [
  {
    id: 'pulse_check',
    name: 'Pulse Check',
    slug: 'pulse_check',
    description: 'Regular check-ins to understand employee sentiment and wellbeing',
    agent_type: 'pulse_check',
    base_prompt: 'You are a friendly HR assistant conducting a pulse check...',
    tools_allowed: ['sentiment_analysis', 'topic_extraction'],
    icon: '💬',
    color: 'bg-primary',
  },
  {
    id: 'onboarding',
    name: 'Onboarding Assistant',
    slug: 'onboarding',
    description: 'Helps new employees get settled and answers common questions',
    agent_type: 'onboarding',
    base_prompt: 'You are a welcoming onboarding assistant...',
    tools_allowed: ['sentiment_analysis', 'escalation'],
    icon: '👋',
    color: 'bg-primary/80',
  },
  {
    id: 'exit_interview',
    name: 'Exit Interview',
    slug: 'exit_interview',
    description: 'Conducts thoughtful exit interviews to gather feedback',
    agent_type: 'exit_interview',
    base_prompt: 'You are conducting a thoughtful exit interview...',
    tools_allowed: ['sentiment_analysis', 'topic_extraction', 'escalation'],
    icon: '🚪',
    color: 'bg-primary/60',
  },
  {
    id: 'manager_coaching',
    name: 'Manager Coaching',
    slug: 'manager_coaching',
    description: 'Supports managers with leadership and team challenges',
    agent_type: 'manager_coaching',
    base_prompt: 'You are a supportive coaching assistant for managers...',
    tools_allowed: ['sentiment_analysis'],
    icon: '🎯',
    color: 'bg-primary/70',
  },
]

// =============================================================================
// TONE PRESETS
// =============================================================================

export const TONE_PRESETS = [
  {
    id: 'poke_lite',
    name: 'Poke-lite',
    description: 'Short, playful, emoji-friendly (max 240 chars)',
    example: "Hey! Quick check - how's your week going? 🙂",
    max_length: 240,
  },
  {
    id: 'friendly_peer',
    name: 'Friendly Peer',
    description: 'Warm and conversational, like a coworker',
    example: "Hi there! Just wanted to check in - how are things going for you this week?",
  },
  {
    id: 'professional_hr',
    name: 'Professional HR',
    description: 'Formal but approachable HR voice',
    example: "Good day! I'm reaching out to understand how your week has been going.",
  },
  {
    id: 'witty_but_safe',
    name: 'Witty but Safe',
    description: 'Light humor while staying professional',
    example: "Time for our weekly vibe check. On a scale of 'living the dream' to 'send coffee', where are we?",
  },
]

// =============================================================================
// STATIC AGENT INSTANCES (company-level configurations)
// =============================================================================

export const STATIC_AGENT_INSTANCES = [
  {
    id: 'inst_001',
    company_id: DEMO_COMPANY_ID,
    agent_id: 'pulse_check',
    name: 'Weekly Pulse Check',
    tone: 'friendly_peer',
    audience_type: 'all' as const,
    config: {},
    status: 'active' as const,
    created_by: DEMO_USER_ID,
    created_at: '2026-02-01T10:00:00Z',
    conversations_count: 45,
    last_run_at: '2026-02-14T09:00:00Z',
  },
  {
    id: 'inst_002',
    company_id: DEMO_COMPANY_ID,
    agent_id: 'onboarding',
    name: 'New Hire Onboarding',
    tone: 'professional_hr',
    audience_type: 'specific' as const,
    config: {},
    status: 'active' as const,
    created_by: DEMO_USER_ID,
    created_at: '2026-01-15T14:00:00Z',
    conversations_count: 8,
    last_run_at: '2026-02-10T10:00:00Z',
  },
  {
    id: 'inst_003',
    company_id: DEMO_COMPANY_ID,
    agent_id: 'manager_coaching',
    name: 'Manager Check-in',
    tone: 'witty_but_safe',
    audience_type: 'department' as const,
    config: { department: 'Engineering' },
    status: 'paused' as const,
    created_by: DEMO_USER_ID,
    created_at: '2026-01-20T11:00:00Z',
    conversations_count: 12,
    last_run_at: '2026-02-07T09:00:00Z',
  },
]

// =============================================================================
// STATIC CONVERSATIONS (with proper relationships)
// =============================================================================

export const STATIC_CONVERSATIONS = [
  // Sarah Chen's pulse check conversation
  {
    id: 'conv_001',
    company_id: DEMO_COMPANY_ID,
    agent_instance_id: 'inst_001',
    employee_id: 'emp_001',
    participant_user_id: SARAH_USER_ID,
    employee_name: 'Sarah Chen',
    agent_name: 'Weekly Pulse Check',
    status: 'active' as const,
    started_at: '2026-02-14T09:00:00Z',
    last_message_at: '2026-02-14T10:30:00Z',
    unread_count: 1,
    message_count: 4,
    messages: [
      { id: 'msg_001', sender_type: 'agent' as const, content: "Hi Sarah! How's your week going so far?", created_at: '2026-02-14T09:00:00Z' },
      { id: 'msg_002', sender_type: 'employee' as const, content: "A bit heavy, but manageable. The sprint has been intense.", created_at: '2026-02-14T09:15:00Z' },
      { id: 'msg_003', sender_type: 'agent' as const, content: "Thanks for sharing. Is there anything blocking you or causing extra stress?", created_at: '2026-02-14T09:16:00Z' },
      { id: 'msg_004', sender_type: 'employee' as const, content: "The deadline for the API migration feels tight. Might need to discuss with the team.", created_at: '2026-02-14T10:30:00Z' },
    ],
    summary: {
      sentiment: 'neutral' as const,
      sentiment_score: 0.15,
      tags: ['workload', 'deadlines', 'team_collaboration'],
      action_items: ['Follow up on API migration deadline', 'Check team capacity'],
    },
  },
  // David Kim's pulse check
  {
    id: 'conv_002',
    company_id: DEMO_COMPANY_ID,
    agent_instance_id: 'inst_001',
    employee_id: 'emp_002',
    participant_user_id: 'user_002',
    employee_name: 'David Kim',
    agent_name: 'Weekly Pulse Check',
    status: 'completed' as const,
    started_at: '2026-02-14T09:00:00Z',
    last_message_at: '2026-02-14T09:45:00Z',
    unread_count: 0,
    message_count: 5,
    messages: [
      { id: 'msg_005', sender_type: 'agent' as const, content: "Hi David! How's your week going so far?", created_at: '2026-02-14T09:00:00Z' },
      { id: 'msg_006', sender_type: 'employee' as const, content: "Really good! Just finished the new design system components.", created_at: '2026-02-14T09:10:00Z' },
      { id: 'msg_007', sender_type: 'agent' as const, content: "That's awesome! How are you feeling about the team dynamics lately?", created_at: '2026-02-14T09:11:00Z' },
      { id: 'msg_008', sender_type: 'employee' as const, content: "Great actually. The new PM has been super collaborative.", created_at: '2026-02-14T09:30:00Z' },
      { id: 'msg_009', sender_type: 'agent' as const, content: "Wonderful to hear! Keep up the great work. 🎨", created_at: '2026-02-14T09:45:00Z' },
    ],
    summary: {
      sentiment: 'positive' as const,
      sentiment_score: 0.85,
      tags: ['positive_feedback', 'team_collaboration', 'productivity'],
      action_items: [],
    },
  },
  // Maria Lopez's pulse check with escalation
  {
    id: 'conv_003',
    company_id: DEMO_COMPANY_ID,
    agent_instance_id: 'inst_001',
    employee_id: 'emp_003',
    participant_user_id: 'user_003',
    employee_name: 'Maria Lopez',
    agent_name: 'Weekly Pulse Check',
    status: 'escalated' as const,
    started_at: '2026-02-13T14:00:00Z',
    last_message_at: '2026-02-13T14:30:00Z',
    unread_count: 0,
    message_count: 3,
    messages: [
      { id: 'msg_010', sender_type: 'agent' as const, content: "Hi Maria! How are things going this week?", created_at: '2026-02-13T14:00:00Z' },
      { id: 'msg_011', sender_type: 'employee' as const, content: "Honestly, not great. I've been feeling really overwhelmed and anxious about everything.", created_at: '2026-02-13T14:15:00Z' },
      { id: 'msg_012', sender_type: 'system' as const, content: "This conversation has been escalated to HR for follow-up.", created_at: '2026-02-13T14:30:00Z' },
    ],
    summary: {
      sentiment: 'negative' as const,
      sentiment_score: -0.65,
      tags: ['mental_health', 'stress', 'workload'],
      action_items: ['HR follow-up required', 'Check workload distribution'],
      escalated: true,
    },
  },
  // Mike Johnson's onboarding conversation
  {
    id: 'conv_004',
    company_id: DEMO_COMPANY_ID,
    agent_instance_id: 'inst_002',
    employee_id: 'emp_004',
    participant_user_id: 'user_004',
    employee_name: 'Mike Johnson',
    agent_name: 'New Hire Onboarding',
    status: 'completed' as const,
    started_at: '2026-02-10T10:00:00Z',
    last_message_at: '2026-02-10T11:00:00Z',
    unread_count: 0,
    message_count: 6,
    messages: [
      { id: 'msg_013', sender_type: 'agent' as const, content: "Welcome Mike! How's your first week going?", created_at: '2026-02-10T10:00:00Z' },
      { id: 'msg_014', sender_type: 'employee' as const, content: "Great so far! Everyone has been super welcoming.", created_at: '2026-02-10T10:10:00Z' },
      { id: 'msg_015', sender_type: 'agent' as const, content: "Wonderful! Do you have everything you need - laptop, accounts, etc.?", created_at: '2026-02-10T10:11:00Z' },
      { id: 'msg_016', sender_type: 'employee' as const, content: "Yes, IT set everything up on day one. Just waiting on AWS access.", created_at: '2026-02-10T10:30:00Z' },
      { id: 'msg_017', sender_type: 'agent' as const, content: "Got it! I'll flag that for IT. Anything else on your mind?", created_at: '2026-02-10T10:31:00Z' },
      { id: 'msg_018', sender_type: 'employee' as const, content: "All good for now, thanks!", created_at: '2026-02-10T11:00:00Z' },
    ],
    summary: {
      sentiment: 'positive' as const,
      sentiment_score: 0.75,
      tags: ['onboarding', 'tooling', 'culture'],
      action_items: ['Follow up on AWS access'],
    },
  },
]

// =============================================================================
// STATIC FEEDBACK SUMMARIES (for analytics dashboard)
// =============================================================================

export const STATIC_FEEDBACK_SUMMARIES = [
  {
    id: 'sum_001',
    conversation_id: 'conv_001',
    agent_instance_id: 'inst_001',
    employee_id: 'emp_001',
    summary: 'Employee reports manageable but heavy workload. Concern about API migration deadline.',
    sentiment: 'neutral' as const,
    sentiment_score: 0.15,
    tags: ['workload', 'deadlines', 'team_collaboration'],
    action_items: [
      { text: 'Follow up on API migration deadline', confidence: 0.9, priority: 'high' },
      { text: 'Check team capacity for sprint', confidence: 0.7, priority: 'medium' },
    ],
    escalated: false,
    created_at: '2026-02-14T10:35:00Z',
  },
  {
    id: 'sum_002',
    conversation_id: 'conv_002',
    agent_instance_id: 'inst_001',
    employee_id: 'emp_002',
    summary: 'Employee very positive about work progress and team dynamics. Design system work completed.',
    sentiment: 'positive' as const,
    sentiment_score: 0.85,
    tags: ['positive_feedback', 'team_collaboration', 'productivity'],
    action_items: [],
    escalated: false,
    created_at: '2026-02-14T09:50:00Z',
  },
  {
    id: 'sum_003',
    conversation_id: 'conv_003',
    agent_instance_id: 'inst_001',
    employee_id: 'emp_003',
    summary: 'Employee expressing significant distress and anxiety. Escalated for HR intervention.',
    sentiment: 'negative' as const,
    sentiment_score: -0.65,
    tags: ['mental_health', 'stress', 'workload'],
    action_items: [
      { text: 'HR follow-up required immediately', confidence: 0.95, priority: 'critical' },
      { text: 'Review workload distribution', confidence: 0.8, priority: 'high' },
    ],
    escalated: true,
    created_at: '2026-02-13T14:35:00Z',
  },
  {
    id: 'sum_004',
    conversation_id: 'conv_004',
    agent_instance_id: 'inst_002',
    employee_id: 'emp_004',
    summary: 'New hire settling in well. Positive onboarding experience. Minor IT issue pending.',
    sentiment: 'positive' as const,
    sentiment_score: 0.75,
    tags: ['onboarding', 'tooling', 'culture'],
    action_items: [
      { text: 'Follow up on AWS access for new hire', confidence: 0.85, priority: 'medium' },
    ],
    escalated: false,
    created_at: '2026-02-10T11:05:00Z',
  },
]

// =============================================================================
// AGGREGATED ANALYTICS (computed from above)
// =============================================================================

export function getAgentAnalytics(agentInstanceId?: string) {
  const relevantSummaries = agentInstanceId
    ? STATIC_FEEDBACK_SUMMARIES.filter(s => s.agent_instance_id === agentInstanceId)
    : STATIC_FEEDBACK_SUMMARIES

  const relevantConversations = agentInstanceId
    ? STATIC_CONVERSATIONS.filter(c => c.agent_instance_id === agentInstanceId)
    : STATIC_CONVERSATIONS

  // Sentiment breakdown
  const sentimentCounts = {
    positive: relevantSummaries.filter(s => s.sentiment === 'positive').length,
    neutral: relevantSummaries.filter(s => s.sentiment === 'neutral').length,
    negative: relevantSummaries.filter(s => s.sentiment === 'negative').length,
  }

  // Average sentiment score
  const avgSentiment = relevantSummaries.length > 0
    ? relevantSummaries.reduce((sum, s) => sum + s.sentiment_score, 0) / relevantSummaries.length
    : 0

  // Tag frequency
  const tagCounts: Record<string, number> = {}
  for (const summary of relevantSummaries) {
    for (const tag of summary.tags) {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1
    }
  }

  // Sort tags by frequency
  const topTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([tag, count]) => ({ tag, count }))

  // Action items
  const allActionItems = relevantSummaries.flatMap(s =>
    s.action_items.map(a => ({ ...a, conversationId: s.conversation_id, employeeId: s.employee_id }))
  )

  // Escalations
  const escalations = relevantSummaries.filter(s => s.escalated)

  return {
    totalConversations: relevantConversations.length,
    activeConversations: relevantConversations.filter(c => c.status === 'active').length,
    completedConversations: relevantConversations.filter(c => c.status === 'completed').length,
    escalatedConversations: relevantConversations.filter(c => c.status === 'escalated').length,
    sentimentCounts,
    avgSentimentScore: avgSentiment,
    topTags,
    actionItems: allActionItems,
    escalations: escalations.map(s => ({
      conversationId: s.conversation_id,
      employeeId: s.employee_id,
      summary: s.summary,
      createdAt: s.created_at,
    })),
    participationRate: STATIC_EMPLOYEES.length > 0
      ? relevantConversations.length / STATIC_EMPLOYEES.length
      : 0,
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Filter employees by search query
 */
export function searchStaticEmployees(query: string, limit: number = 10): typeof STATIC_EMPLOYEES {
  if (!query || query.length < 2) return []

  const q = query.toLowerCase()

  return STATIC_EMPLOYEES
    .filter(emp =>
      emp.name.toLowerCase().includes(q) ||
      emp.email.toLowerCase().includes(q) ||
      emp.department.toLowerCase().includes(q)
    )
    .slice(0, limit)
}

/**
 * Get conversations for a specific user (RBAC-aware)
 */
export function getConversationsForUser(userId: string, isAdmin: boolean): typeof STATIC_CONVERSATIONS {
  if (isAdmin) {
    // Admin sees all conversations
    return STATIC_CONVERSATIONS
  }

  // Employee only sees their own conversations
  return STATIC_CONVERSATIONS.filter(c => c.participant_user_id === userId)
}

/**
 * Get conversation by ID (RBAC-aware)
 */
export function getConversationById(
  conversationId: string,
  userId: string,
  isAdmin: boolean
): typeof STATIC_CONVERSATIONS[0] | null {
  const conv = STATIC_CONVERSATIONS.find(c => c.id === conversationId)
  if (!conv) return null

  // Check access
  if (!isAdmin && conv.participant_user_id !== userId) {
    return null // Access denied
  }

  return conv
}

/**
 * Get agent instance by ID
 */
export function getAgentInstanceById(instanceId: string) {
  return STATIC_AGENT_INSTANCES.find(i => i.id === instanceId)
}

/**
 * Get all agent instances for admin dashboard
 */
export function getAllAgentInstances() {
  return STATIC_AGENT_INSTANCES
}
