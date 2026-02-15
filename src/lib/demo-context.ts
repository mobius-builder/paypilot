// Demo mode context for when real Supabase auth is not available
// This provides consistent demo data for local development and demos

export const DEMO_COMPANY_ID = '00000000-0000-0000-0000-000000000001'
export const DEMO_USER_ID = '00000000-0000-0000-0000-000000000002'
export const SARAH_USER_ID = '00000000-0000-0000-0000-000000000010' // Sarah Chen's auth user ID

export type DemoRole = 'owner' | 'admin' | 'hr_manager' | 'manager' | 'employee' | 'member'

export interface DemoContext {
  userId: string
  companyId: string
  role: DemoRole
  email: string
  fullName: string
  companyName: string
  isAdmin: boolean
}

// Admin demo user (HR Manager/Owner view)
export const DEMO_CONTEXT: DemoContext = {
  userId: DEMO_USER_ID,
  companyId: DEMO_COMPANY_ID,
  role: 'owner',
  email: 'demo@acme.com',
  fullName: 'Demo Admin',
  companyName: 'Acme Technologies',
  isAdmin: true,
}

// Sarah Chen - Employee view (for demonstrating employee experience)
export const SARAH_CONTEXT: DemoContext = {
  userId: SARAH_USER_ID,
  companyId: DEMO_COMPANY_ID,
  role: 'member',
  email: 'sarah.chen@acme.com',
  fullName: 'Sarah Chen',
  companyName: 'Acme Technologies',
  isAdmin: false,
}

// Map of demo users by email
export const DEMO_USERS: Record<string, DemoContext> = {
  'demo@acme.com': DEMO_CONTEXT,
  'demo@paypilot.com': DEMO_CONTEXT, // Legacy support
  'sarah.chen@acme.com': SARAH_CONTEXT,
  'sarah@acme.com': SARAH_CONTEXT, // Alias
}

// Get demo context by email
export function getDemoContextByEmail(email: string): DemoContext | null {
  return DEMO_USERS[email.toLowerCase()] || null
}

// Check if role is admin-level
export function isAdminRole(role: DemoRole): boolean {
  return ['owner', 'admin', 'hr_manager'].includes(role)
}

// Demo employees for the employee picker
export const DEMO_EMPLOYEES = [
  { id: '00000000-0000-0000-0000-000000000010', full_name: 'Sarah Chen', email: 'sarah.chen@acme.com', department: 'Engineering', job_title: 'Senior Engineer' },
  { id: '00000000-0000-0000-0000-000000000011', full_name: 'Mike Johnson', email: 'mike.johnson@acme.com', department: 'Engineering', job_title: 'Tech Lead' },
  { id: '00000000-0000-0000-0000-000000000012', full_name: 'Emily Davis', email: 'emily.davis@acme.com', department: 'Product', job_title: 'Product Manager' },
  { id: '00000000-0000-0000-0000-000000000013', full_name: 'Tom Wilson', email: 'tom.wilson@acme.com', department: 'Sales', job_title: 'Account Executive' },
  { id: '00000000-0000-0000-0000-000000000014', full_name: 'Lisa Park', email: 'lisa.park@acme.com', department: 'Finance', job_title: 'Financial Analyst' },
  { id: '00000000-0000-0000-0000-000000000015', full_name: 'Alex Wong', email: 'alex.wong@acme.com', department: 'Engineering', job_title: 'Backend Developer' },
  { id: '00000000-0000-0000-0000-000000000016', full_name: 'Jennifer Lee', email: 'jennifer.lee@acme.com', department: 'HR', job_title: 'HR Manager' },
  { id: '00000000-0000-0000-0000-000000000017', full_name: 'David Brown', email: 'david.brown@acme.com', department: 'Marketing', job_title: 'Marketing Manager' },
  { id: '00000000-0000-0000-0000-000000000018', full_name: 'Rachel Green', email: 'rachel.green@acme.com', department: 'Customer Success', job_title: 'CS Lead' },
  { id: '00000000-0000-0000-0000-000000000019', full_name: 'Chris Martin', email: 'chris.martin@acme.com', department: 'Engineering', job_title: 'Frontend Developer' },
  { id: '00000000-0000-0000-0000-000000000020', full_name: 'Amanda White', email: 'amanda.white@acme.com', department: 'Legal', job_title: 'General Counsel' },
  { id: '00000000-0000-0000-0000-000000000021', full_name: 'Kevin Taylor', email: 'kevin.taylor@acme.com', department: 'Operations', job_title: 'Ops Manager' },
  { id: '00000000-0000-0000-0000-000000000022', full_name: 'Michelle Garcia', email: 'michelle.garcia@acme.com', department: 'Design', job_title: 'UX Designer' },
  { id: '00000000-0000-0000-0000-000000000023', full_name: 'James Wilson', email: 'james.wilson@acme.com', department: 'Sales', job_title: 'Sales Director' },
  { id: '00000000-0000-0000-0000-000000000024', full_name: 'Nicole Anderson', email: 'nicole.anderson@acme.com', department: 'Engineering', job_title: 'QA Engineer' },
]

// Demo agent instances
export const DEMO_AGENT_INSTANCES = [
  {
    id: '00000000-0000-0000-0000-000000000101',
    name: 'Weekly Pulse Check',
    agent_type: 'pulse_check',
    status: 'active',
    agents: {
      name: 'Pulse Check Agent',
      agent_type: 'pulse_check',
      description: 'Regular check-ins to understand employee sentiment',
    },
  },
  {
    id: '00000000-0000-0000-0000-000000000102',
    name: 'New Hire Onboarding',
    agent_type: 'onboarding',
    status: 'active',
    agents: {
      name: 'Onboarding Agent',
      agent_type: 'onboarding',
      description: 'Helps new employees get settled',
    },
  },
]

// Demo conversations - each user has their own conversations
// Admin can see all, employees only see their own
export const DEMO_CONVERSATIONS = [
  // Demo Admin's conversations (visible to admin only in their view, admin can see all)
  {
    id: '00000000-0000-0000-0000-000000000201',
    company_id: DEMO_COMPANY_ID,
    agent_instance_id: '00000000-0000-0000-0000-000000000101',
    participant_user_id: DEMO_USER_ID,
    status: 'active',
    unread_count: 1,
    message_count: 3,
    last_message_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    agent_instances: {
      id: '00000000-0000-0000-0000-000000000101',
      name: 'Weekly Pulse Check',
      agents: {
        name: 'Pulse Check Agent',
        agent_type: 'pulse_check',
      },
    },
  },
  {
    id: '00000000-0000-0000-0000-000000000202',
    company_id: DEMO_COMPANY_ID,
    agent_instance_id: '00000000-0000-0000-0000-000000000102',
    participant_user_id: DEMO_USER_ID,
    status: 'active',
    unread_count: 0,
    message_count: 5,
    last_message_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    agent_instances: {
      id: '00000000-0000-0000-0000-000000000102',
      name: 'New Hire Onboarding',
      agents: {
        name: 'Onboarding Agent',
        agent_type: 'onboarding',
      },
    },
  },
  // Sarah Chen's conversation (she only sees this when logged in as Sarah)
  {
    id: '00000000-0000-0000-0000-000000000203',
    company_id: DEMO_COMPANY_ID,
    agent_instance_id: '00000000-0000-0000-0000-000000000101',
    participant_user_id: SARAH_USER_ID,
    status: 'active',
    unread_count: 1,
    message_count: 1,
    last_message_at: new Date(Date.now() - 60000).toISOString(), // 1 minute ago
    agent_instances: {
      id: '00000000-0000-0000-0000-000000000101',
      name: 'Weekly Pulse Check',
      agents: {
        name: 'Pulse Check Agent',
        agent_type: 'pulse_check',
      },
    },
  },
]

// Filter conversations by user (for employee view)
export function getConversationsForUser(userId: string, isAdmin: boolean): typeof DEMO_CONVERSATIONS {
  if (isAdmin) {
    // Admin sees all conversations in the company
    return DEMO_CONVERSATIONS
  }
  // Employee only sees their own conversations
  return DEMO_CONVERSATIONS.filter(c => c.participant_user_id === userId)
}

// Demo messages for conversations
export const DEMO_MESSAGES: Record<string, Array<{
  id: string
  conversation_id: string
  content: string
  sender_type: 'agent' | 'employee' | 'system'
  content_type: string
  created_at: string
  is_read: boolean
}>> = {
  '00000000-0000-0000-0000-000000000201': [
    {
      id: '00000000-0000-0000-0000-000000000301',
      conversation_id: '00000000-0000-0000-0000-000000000201',
      content: "Hey! Quick check-in - how's your week going so far?",
      sender_type: 'agent',
      content_type: 'text',
      created_at: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
      is_read: true,
    },
    {
      id: '00000000-0000-0000-0000-000000000302',
      conversation_id: '00000000-0000-0000-0000-000000000201',
      content: "It's been pretty good! Busy but manageable.",
      sender_type: 'employee',
      content_type: 'text',
      created_at: new Date(Date.now() - 5400000).toISOString(), // 1.5 hours ago
      is_read: true,
    },
    {
      id: '00000000-0000-0000-0000-000000000303',
      conversation_id: '00000000-0000-0000-0000-000000000201',
      content: "That's great to hear! Anything specific that made it good?",
      sender_type: 'agent',
      content_type: 'text',
      created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      is_read: false,
    },
  ],
  '00000000-0000-0000-0000-000000000202': [
    {
      id: '00000000-0000-0000-0000-000000000304',
      conversation_id: '00000000-0000-0000-0000-000000000202',
      content: "Welcome! I'm here to help you get settled. How's your first week going?",
      sender_type: 'agent',
      content_type: 'text',
      created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      is_read: true,
    },
    {
      id: '00000000-0000-0000-0000-000000000305',
      conversation_id: '00000000-0000-0000-0000-000000000202',
      content: "Great! Everyone has been super helpful.",
      sender_type: 'employee',
      content_type: 'text',
      created_at: new Date(Date.now() - 172000000).toISOString(),
      is_read: true,
    },
    {
      id: '00000000-0000-0000-0000-000000000306',
      conversation_id: '00000000-0000-0000-0000-000000000202',
      content: "Awesome! Do you have everything you need to get started? Laptop, accounts, etc.?",
      sender_type: 'agent',
      content_type: 'text',
      created_at: new Date(Date.now() - 171000000).toISOString(),
      is_read: true,
    },
    {
      id: '00000000-0000-0000-0000-000000000307',
      conversation_id: '00000000-0000-0000-0000-000000000202',
      content: "Yes, IT set everything up on day one. Still waiting on Slack access though.",
      sender_type: 'employee',
      content_type: 'text',
      created_at: new Date(Date.now() - 90000000).toISOString(),
      is_read: true,
    },
    {
      id: '00000000-0000-0000-0000-000000000308',
      conversation_id: '00000000-0000-0000-0000-000000000202',
      content: "Got it! I'll flag that for IT. They should have you set up within the hour. Anything else on your mind?",
      sender_type: 'agent',
      content_type: 'text',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      is_read: true,
    },
  ],
  // Sarah Chen's conversation messages
  '00000000-0000-0000-0000-000000000203': [
    {
      id: '00000000-0000-0000-0000-000000000309',
      conversation_id: '00000000-0000-0000-0000-000000000203',
      content: "Hey Sarah! Quick check-in - how's your week going so far? 🙂",
      sender_type: 'agent',
      content_type: 'text',
      created_at: new Date(Date.now() - 60000).toISOString(), // 1 minute ago
      is_read: false,
    },
  ],
}

// In-memory storage for demo mode messages (for real-time feel)
const demoMessageStore: Record<string, typeof DEMO_MESSAGES[string]> = { ...DEMO_MESSAGES }

// In-memory storage for dynamically created conversations (from Run button)
const dynamicConversationStore: Map<string, typeof DEMO_CONVERSATIONS[0]> = new Map()

// Add a dynamically created conversation (called from Run button)
export function addDynamicDemoConversation(conversation: typeof DEMO_CONVERSATIONS[0]) {
  dynamicConversationStore.set(conversation.id, conversation)
}

// Get all dynamically created conversations
export function getDynamicDemoConversations(): typeof DEMO_CONVERSATIONS {
  return Array.from(dynamicConversationStore.values())
}

// Get all demo conversations (base + dynamic) for a user
export function getAllDemoConversations(userId: string, isAdmin: boolean): typeof DEMO_CONVERSATIONS {
  // Get base conversations filtered by user
  const baseConversations = getConversationsForUser(userId, isAdmin)

  // Get dynamic conversations filtered by user
  const dynamicConversations = getDynamicDemoConversations()
  const filteredDynamic = isAdmin
    ? dynamicConversations
    : dynamicConversations.filter(c => c.participant_user_id === userId)

  // Merge avoiding duplicates
  const baseIds = new Set(baseConversations.map(c => c.id))
  const merged = [...baseConversations]
  for (const dyn of filteredDynamic) {
    if (!baseIds.has(dyn.id)) {
      merged.push(dyn)
    }
  }

  return merged
}

export function getDemoConversation(conversationId: string) {
  // Check base conversations first
  const base = DEMO_CONVERSATIONS.find(c => c.id === conversationId)
  if (base) return base
  // Check dynamic conversations
  return dynamicConversationStore.get(conversationId) || null
}

export function getDemoMessages(conversationId: string) {
  if (!demoMessageStore[conversationId]) {
    demoMessageStore[conversationId] = []
  }
  return demoMessageStore[conversationId]
}

export function addDemoMessage(
  conversationId: string,
  content: string,
  senderType: 'agent' | 'employee',
): typeof DEMO_MESSAGES[string][0] {
  const message = {
    id: `demo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    conversation_id: conversationId,
    content,
    sender_type: senderType,
    content_type: 'text',
    created_at: new Date().toISOString(),
    is_read: true,
  }

  if (!demoMessageStore[conversationId]) {
    demoMessageStore[conversationId] = []
  }
  demoMessageStore[conversationId].push(message)

  return message
}

// Search employees with relevance ranking
export function searchDemoEmployees(query: string, limit: number = 15): typeof DEMO_EMPLOYEES {
  if (!query || query.length < 2) {
    return []
  }

  const q = query.toLowerCase()

  // Score employees by relevance
  const scored = DEMO_EMPLOYEES.map(emp => {
    const name = emp.full_name.toLowerCase()
    const email = emp.email.toLowerCase()

    let score = 0

    // Prefix match on name = highest score
    if (name.startsWith(q)) {
      score = 100
    }
    // First name prefix match
    else if (name.split(' ').some(part => part.startsWith(q))) {
      score = 80
    }
    // Substring match on name
    else if (name.includes(q)) {
      score = 60
    }
    // Email prefix match
    else if (email.startsWith(q)) {
      score = 40
    }
    // Email substring match
    else if (email.includes(q)) {
      score = 20
    }

    return { ...emp, score }
  })

  // Filter out non-matches and sort by score desc, then by name
  return scored
    .filter(emp => emp.score > 0)
    .sort((a, b) => b.score - a.score || a.full_name.localeCompare(b.full_name))
    .slice(0, limit)
    .map(({ score, ...emp }) => emp)
}
