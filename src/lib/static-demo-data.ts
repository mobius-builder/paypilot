/**
 * STATIC DEMO DATA - Fully Instantiated In-Memory System
 *
 * CRITICAL: This is 100% static and in-memory.
 * - No database, No Supabase, No backend fetch
 * - Everything fully instantiated at compile time
 * - All messages inline within conversations
 * - All summaries inline within conversations
 */

// =============================================================================
// CONSTANTS
// =============================================================================

export const DEMO_COMPANY_ID = 'company_001'
export const ADMIN_USER_ID = 'user_admin_001'
export const SARAH_USER_ID = 'user_emp_001' // Sarah Chen - demo employee

// =============================================================================
// TYPES
// =============================================================================

export interface Employee {
  id: string
  userId: string
  name: string
  email: string
  department: string
  title: string
  managerId: string | null
  location: string
  tenureMonths: number
  performanceRating: number
}

export interface AgentInstance {
  id: string
  companyId: string
  agentType: string
  name: string
  tone: string
  audienceType: string
  createdAt: string
  lastRunAt: string
  status: 'active' | 'paused'
  conversationsCount: number
  responseRate: number
  avgSentiment: number
}

export interface Message {
  id: string
  conversationId: string
  senderType: 'agent' | 'employee' | 'system'
  content: string
  createdAt: string
}

export interface Summary {
  sentiment: 'positive' | 'neutral' | 'negative' | 'mixed'
  sentimentScore: number
  engagementScore: number
  tags: string[]
  actionItems: string[]
  riskLevel: 'low' | 'moderate' | 'high'
}

export interface Conversation {
  id: string
  agentInstanceId: string
  employeeId: string
  employeeName: string
  startedAt: string
  lastMessageAt: string
  status: 'active' | 'completed' | 'escalated'
  messages: Message[]
  summary: Summary
}

// =============================================================================
// STATIC EMPLOYEES (15 employees)
// =============================================================================

export const STATIC_EMPLOYEES: Employee[] = [
  {
    id: 'emp_001',
    userId: SARAH_USER_ID,
    name: 'Sarah Chen',
    email: 'sarah.chen@acme.com',
    department: 'Engineering',
    title: 'Senior Software Engineer',
    managerId: 'emp_004',
    location: 'San Francisco, CA',
    tenureMonths: 28,
    performanceRating: 4.2,
  },
  {
    id: 'emp_002',
    userId: 'user_emp_002',
    name: 'David Kim',
    email: 'david.kim@acme.com',
    department: 'Design',
    title: 'Senior UX Designer',
    managerId: 'emp_005',
    location: 'New York, NY',
    tenureMonths: 36,
    performanceRating: 4.5,
  },
  {
    id: 'emp_003',
    userId: 'user_emp_003',
    name: 'Maria Lopez',
    email: 'maria.lopez@acme.com',
    department: 'Sales',
    title: 'Account Executive',
    managerId: 'emp_006',
    location: 'Austin, TX',
    tenureMonths: 14,
    performanceRating: 3.8,
  },
  {
    id: 'emp_004',
    userId: 'user_emp_004',
    name: 'Mike Johnson',
    email: 'mike.johnson@acme.com',
    department: 'Engineering',
    title: 'Engineering Manager',
    managerId: null,
    location: 'San Francisco, CA',
    tenureMonths: 48,
    performanceRating: 4.6,
  },
  {
    id: 'emp_005',
    userId: 'user_emp_005',
    name: 'Emily Davis',
    email: 'emily.davis@acme.com',
    department: 'Design',
    title: 'Design Director',
    managerId: null,
    location: 'New York, NY',
    tenureMonths: 42,
    performanceRating: 4.4,
  },
  {
    id: 'emp_006',
    userId: 'user_emp_006',
    name: 'Tom Wilson',
    email: 'tom.wilson@acme.com',
    department: 'Sales',
    title: 'Sales Director',
    managerId: null,
    location: 'Chicago, IL',
    tenureMonths: 56,
    performanceRating: 4.3,
  },
  {
    id: 'emp_007',
    userId: 'user_emp_007',
    name: 'Lisa Park',
    email: 'lisa.park@acme.com',
    department: 'Finance',
    title: 'Financial Analyst',
    managerId: 'emp_012',
    location: 'Boston, MA',
    tenureMonths: 18,
    performanceRating: 4.0,
  },
  {
    id: 'emp_008',
    userId: 'user_emp_008',
    name: 'Alex Wong',
    email: 'alex.wong@acme.com',
    department: 'Engineering',
    title: 'Backend Developer',
    managerId: 'emp_004',
    location: 'Seattle, WA',
    tenureMonths: 8,
    performanceRating: 3.9,
  },
  {
    id: 'emp_009',
    userId: 'user_emp_009',
    name: 'Jennifer Lee',
    email: 'jennifer.lee@acme.com',
    department: 'HR',
    title: 'HR Business Partner',
    managerId: null,
    location: 'San Francisco, CA',
    tenureMonths: 32,
    performanceRating: 4.1,
  },
  {
    id: 'emp_010',
    userId: 'user_emp_010',
    name: 'Chris Martin',
    email: 'chris.martin@acme.com',
    department: 'Engineering',
    title: 'Frontend Developer',
    managerId: 'emp_004',
    location: 'Denver, CO',
    tenureMonths: 22,
    performanceRating: 4.0,
  },
  {
    id: 'emp_011',
    userId: 'user_emp_011',
    name: 'Rachel Green',
    email: 'rachel.green@acme.com',
    department: 'Customer Success',
    title: 'Customer Success Manager',
    managerId: 'emp_015',
    location: 'Miami, FL',
    tenureMonths: 26,
    performanceRating: 4.3,
  },
  {
    id: 'emp_012',
    userId: 'user_emp_012',
    name: 'Kevin Taylor',
    email: 'kevin.taylor@acme.com',
    department: 'Finance',
    title: 'Finance Manager',
    managerId: null,
    location: 'Boston, MA',
    tenureMonths: 44,
    performanceRating: 4.2,
  },
  {
    id: 'emp_013',
    userId: 'user_emp_013',
    name: 'Amanda White',
    email: 'amanda.white@acme.com',
    department: 'Marketing',
    title: 'Content Marketing Manager',
    managerId: 'emp_014',
    location: 'Los Angeles, CA',
    tenureMonths: 15,
    performanceRating: 3.7,
  },
  {
    id: 'emp_014',
    userId: 'user_emp_014',
    name: 'James Wilson',
    email: 'james.wilson@acme.com',
    department: 'Marketing',
    title: 'VP of Marketing',
    managerId: null,
    location: 'Los Angeles, CA',
    tenureMonths: 38,
    performanceRating: 4.4,
  },
  {
    id: 'emp_015',
    userId: 'user_emp_015',
    name: 'Nicole Anderson',
    email: 'nicole.anderson@acme.com',
    department: 'Customer Success',
    title: 'VP of Customer Success',
    managerId: null,
    tenureMonths: 52,
    location: 'Miami, FL',
    performanceRating: 4.5,
  },
]

// =============================================================================
// AGENT TEMPLATES (4 types)
// =============================================================================

export const AGENT_TEMPLATES = [
  {
    id: 'pulse_check',
    name: 'Pulse Check',
    description: 'Regular check-ins to understand employee sentiment and wellbeing',
    icon: '💬',
    color: 'bg-blue-500',
  },
  {
    id: 'onboarding',
    name: 'Onboarding Assistant',
    description: 'Helps new employees get settled and answers common questions',
    icon: '👋',
    color: 'bg-green-500',
  },
  {
    id: 'exit_interview',
    name: 'Exit Interview',
    description: 'Conducts thoughtful exit interviews to gather feedback',
    icon: '🚪',
    color: 'bg-orange-500',
  },
  {
    id: 'manager_360',
    name: 'Manager 360 Feedback',
    description: 'Collects anonymous feedback about managers from their reports',
    icon: '🎯',
    color: 'bg-purple-500',
  },
]

// =============================================================================
// AGENT INSTANCES (8 instances across 4 types)
// =============================================================================

export const STATIC_AGENT_INSTANCES: AgentInstance[] = [
  {
    id: 'inst_001',
    companyId: DEMO_COMPANY_ID,
    agentType: 'pulse_check',
    name: 'Weekly Pulse Check',
    tone: 'friendly_peer',
    audienceType: 'all_employees',
    createdAt: '2025-12-01T10:00:00Z',
    lastRunAt: '2026-02-14T09:00:00Z',
    status: 'active',
    conversationsCount: 156,
    responseRate: 0.78,
    avgSentiment: 0.42,
  },
  {
    id: 'inst_002',
    companyId: DEMO_COMPANY_ID,
    agentType: 'onboarding',
    name: 'New Hire Welcome',
    tone: 'professional_hr',
    audienceType: 'new_hires',
    createdAt: '2025-11-15T14:00:00Z',
    lastRunAt: '2026-02-10T10:00:00Z',
    status: 'active',
    conversationsCount: 24,
    responseRate: 0.92,
    avgSentiment: 0.68,
  },
  {
    id: 'inst_003',
    companyId: DEMO_COMPANY_ID,
    agentType: 'exit_interview',
    name: 'Departure Feedback',
    tone: 'professional_hr',
    audienceType: 'departing',
    createdAt: '2025-12-10T11:00:00Z',
    lastRunAt: '2026-02-01T09:00:00Z',
    status: 'active',
    conversationsCount: 8,
    responseRate: 0.88,
    avgSentiment: -0.15,
  },
  {
    id: 'inst_004',
    companyId: DEMO_COMPANY_ID,
    agentType: 'manager_360',
    name: 'Q1 Manager Feedback',
    tone: 'professional_hr',
    audienceType: 'direct_reports',
    createdAt: '2026-01-05T09:00:00Z',
    lastRunAt: '2026-02-12T09:00:00Z',
    status: 'active',
    conversationsCount: 32,
    responseRate: 0.72,
    avgSentiment: 0.35,
  },
  {
    id: 'inst_005',
    companyId: DEMO_COMPANY_ID,
    agentType: 'pulse_check',
    name: 'Engineering Team Pulse',
    tone: 'witty_casual',
    audienceType: 'engineering',
    createdAt: '2026-01-10T10:00:00Z',
    lastRunAt: '2026-02-13T09:00:00Z',
    status: 'active',
    conversationsCount: 48,
    responseRate: 0.85,
    avgSentiment: 0.52,
  },
  {
    id: 'inst_006',
    companyId: DEMO_COMPANY_ID,
    agentType: 'pulse_check',
    name: 'Sales Team Check-in',
    tone: 'friendly_peer',
    audienceType: 'sales',
    createdAt: '2026-01-12T10:00:00Z',
    lastRunAt: '2026-02-14T09:00:00Z',
    status: 'active',
    conversationsCount: 36,
    responseRate: 0.65,
    avgSentiment: 0.28,
  },
  {
    id: 'inst_007',
    companyId: DEMO_COMPANY_ID,
    agentType: 'onboarding',
    name: '30-Day Check-in',
    tone: 'friendly_peer',
    audienceType: 'new_hires_30d',
    createdAt: '2026-01-20T14:00:00Z',
    lastRunAt: '2026-02-08T10:00:00Z',
    status: 'paused',
    conversationsCount: 12,
    responseRate: 0.83,
    avgSentiment: 0.55,
  },
  {
    id: 'inst_008',
    companyId: DEMO_COMPANY_ID,
    agentType: 'manager_360',
    name: 'Leadership Feedback',
    tone: 'professional_hr',
    audienceType: 'all_employees',
    createdAt: '2026-02-01T09:00:00Z',
    lastRunAt: '2026-02-11T09:00:00Z',
    status: 'paused',
    conversationsCount: 18,
    responseRate: 0.61,
    avgSentiment: 0.22,
  },
]

// =============================================================================
// STATIC CONVERSATIONS - Part 1: Sarah Chen's conversations (3 total)
// =============================================================================

const SARAH_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv_001',
    agentInstanceId: 'inst_001',
    employeeId: 'emp_001',
    employeeName: 'Sarah Chen',
    startedAt: '2026-02-14T09:00:00Z',
    lastMessageAt: '2026-02-14T10:30:00Z',
    status: 'active',
    messages: [
      { id: 'msg_001_01', conversationId: 'conv_001', senderType: 'agent', content: "Hi Sarah! How's your week going so far? Anything on your mind?", createdAt: '2026-02-14T09:00:00Z' },
      { id: 'msg_001_02', conversationId: 'conv_001', senderType: 'employee', content: "Hey! Honestly, it's been pretty intense. We're pushing hard for the API migration deadline.", createdAt: '2026-02-14T09:15:00Z' },
      { id: 'msg_001_03', conversationId: 'conv_001', senderType: 'agent', content: "I hear you - deadlines can be stressful. How's the team holding up? Is the workload distributed evenly?", createdAt: '2026-02-14T09:16:00Z' },
      { id: 'msg_001_04', conversationId: 'conv_001', senderType: 'employee', content: "The team is solid. Alex has been stepping up, which helps. I'm just worried we might need to cut some corners on testing.", createdAt: '2026-02-14T09:45:00Z' },
      { id: 'msg_001_05', conversationId: 'conv_001', senderType: 'agent', content: "That's a valid concern. Have you had a chance to discuss timeline flexibility with Mike? Sometimes deadlines can be adjusted when quality is at stake.", createdAt: '2026-02-14T09:46:00Z' },
      { id: 'msg_001_06', conversationId: 'conv_001', senderType: 'employee', content: "Good point. I'll bring it up in our 1:1 tomorrow. Thanks for the nudge!", createdAt: '2026-02-14T10:30:00Z' },
    ],
    summary: {
      sentiment: 'neutral',
      sentimentScore: 0.15,
      engagementScore: 0.82,
      tags: ['workload', 'deadlines', 'team_collaboration', 'quality_concerns'],
      actionItems: ['Discuss timeline flexibility with manager', 'Review testing coverage'],
      riskLevel: 'low',
    },
  },
  {
    id: 'conv_002',
    agentInstanceId: 'inst_005',
    employeeId: 'emp_001',
    employeeName: 'Sarah Chen',
    startedAt: '2026-02-07T09:00:00Z',
    lastMessageAt: '2026-02-07T10:15:00Z',
    status: 'completed',
    messages: [
      { id: 'msg_002_01', conversationId: 'conv_002', senderType: 'agent', content: "Hey Sarah! Quick engineering pulse check. How's the sprint treating you?", createdAt: '2026-02-07T09:00:00Z' },
      { id: 'msg_002_02', conversationId: 'conv_002', senderType: 'employee', content: "Actually pretty good this week! We shipped the auth refactor and it went smoothly.", createdAt: '2026-02-07T09:20:00Z' },
      { id: 'msg_002_03', conversationId: 'conv_002', senderType: 'agent', content: "Nice! Smooth deploys are the best kind. How are you feeling about your growth here lately?", createdAt: '2026-02-07T09:21:00Z' },
      { id: 'msg_002_04', conversationId: 'conv_002', senderType: 'employee', content: "I've been thinking about that actually. Would love to take on more architecture work. Been here 2+ years and feel ready for more ownership.", createdAt: '2026-02-07T09:50:00Z' },
      { id: 'msg_002_05', conversationId: 'conv_002', senderType: 'agent', content: "That sounds like a great conversation to have with Mike! You've definitely earned it. Would you like me to flag this as a discussion topic?", createdAt: '2026-02-07T09:51:00Z' },
      { id: 'msg_002_06', conversationId: 'conv_002', senderType: 'employee', content: "Yeah, that would be helpful. I always forget to bring it up in 1:1s.", createdAt: '2026-02-07T10:15:00Z' },
    ],
    summary: {
      sentiment: 'positive',
      sentimentScore: 0.72,
      engagementScore: 0.88,
      tags: ['career_growth', 'positive_momentum', 'architecture', 'ownership'],
      actionItems: ['Schedule career growth discussion with manager'],
      riskLevel: 'low',
    },
  },
  {
    id: 'conv_003',
    agentInstanceId: 'inst_001',
    employeeId: 'emp_001',
    employeeName: 'Sarah Chen',
    startedAt: '2026-01-31T09:00:00Z',
    lastMessageAt: '2026-01-31T10:00:00Z',
    status: 'completed',
    messages: [
      { id: 'msg_003_01', conversationId: 'conv_003', senderType: 'agent', content: "Hi Sarah! End of January already. How are you feeling about Q1 so far?", createdAt: '2026-01-31T09:00:00Z' },
      { id: 'msg_003_02', conversationId: 'conv_003', senderType: 'employee', content: "Feeling optimistic! The team dynamics have improved a lot since we hired Alex.", createdAt: '2026-01-31T09:12:00Z' },
      { id: 'msg_003_03', conversationId: 'conv_003', senderType: 'agent', content: "That's great to hear! New team members can really shift the energy. Anything else contributing to the good vibes?", createdAt: '2026-01-31T09:13:00Z' },
      { id: 'msg_003_04', conversationId: 'conv_003', senderType: 'employee', content: "The new standup format is working better. Less status updates, more actual problem-solving.", createdAt: '2026-01-31T09:35:00Z' },
      { id: 'msg_003_05', conversationId: 'conv_003', senderType: 'agent', content: "Love it! Sounds like Mike is listening to the team feedback. Keep riding that momentum!", createdAt: '2026-01-31T10:00:00Z' },
    ],
    summary: {
      sentiment: 'positive',
      sentimentScore: 0.78,
      engagementScore: 0.75,
      tags: ['team_dynamics', 'process_improvement', 'positive_culture'],
      actionItems: [],
      riskLevel: 'low',
    },
  },
]

// =============================================================================
// STATIC CONVERSATIONS - Part 2: Other employee conversations
// =============================================================================

const OTHER_CONVERSATIONS: Conversation[] = [
  // David Kim - Positive designer
  {
    id: 'conv_004',
    agentInstanceId: 'inst_001',
    employeeId: 'emp_002',
    employeeName: 'David Kim',
    startedAt: '2026-02-14T09:00:00Z',
    lastMessageAt: '2026-02-14T09:45:00Z',
    status: 'completed',
    messages: [
      { id: 'msg_004_01', conversationId: 'conv_004', senderType: 'agent', content: "Hey David! How's your week going?", createdAt: '2026-02-14T09:00:00Z' },
      { id: 'msg_004_02', conversationId: 'conv_004', senderType: 'employee', content: "Really good actually! Just wrapped up the new design system components.", createdAt: '2026-02-14T09:10:00Z' },
      { id: 'msg_004_03', conversationId: 'conv_004', senderType: 'agent', content: "That's awesome! How's the collaboration with engineering been?", createdAt: '2026-02-14T09:11:00Z' },
      { id: 'msg_004_04', conversationId: 'conv_004', senderType: 'employee', content: "Chris has been great to work with. We finally have a good handoff process.", createdAt: '2026-02-14T09:30:00Z' },
      { id: 'msg_004_05', conversationId: 'conv_004', senderType: 'agent', content: "Cross-functional wins are the best. Keep it up!", createdAt: '2026-02-14T09:45:00Z' },
    ],
    summary: {
      sentiment: 'positive',
      sentimentScore: 0.85,
      engagementScore: 0.79,
      tags: ['design_system', 'cross_functional', 'collaboration'],
      actionItems: [],
      riskLevel: 'low',
    },
  },
  // Maria Lopez - Escalation case (HIGH RISK)
  {
    id: 'conv_005',
    agentInstanceId: 'inst_001',
    employeeId: 'emp_003',
    employeeName: 'Maria Lopez',
    startedAt: '2026-02-13T14:00:00Z',
    lastMessageAt: '2026-02-13T14:45:00Z',
    status: 'escalated',
    messages: [
      { id: 'msg_005_01', conversationId: 'conv_005', senderType: 'agent', content: "Hi Maria! How are things going this week?", createdAt: '2026-02-13T14:00:00Z' },
      { id: 'msg_005_02', conversationId: 'conv_005', senderType: 'employee', content: "Honestly, not great. I've been feeling really overwhelmed and anxious.", createdAt: '2026-02-13T14:15:00Z' },
      { id: 'msg_005_03', conversationId: 'conv_005', senderType: 'agent', content: "I'm sorry to hear that. Your wellbeing matters. Can you tell me more about what's causing the anxiety?", createdAt: '2026-02-13T14:16:00Z' },
      { id: 'msg_005_04', conversationId: 'conv_005', senderType: 'employee', content: "The quota pressure is intense. I missed target last month and Tom has been making comments. I don't know if I can do this anymore.", createdAt: '2026-02-13T14:30:00Z' },
      { id: 'msg_005_05', conversationId: 'conv_005', senderType: 'agent', content: "Thank you for being honest with me. What you're feeling is valid, and I want to make sure you get the support you need. I'm going to flag this for HR so someone can check in with you directly.", createdAt: '2026-02-13T14:31:00Z' },
      { id: 'msg_005_06', conversationId: 'conv_005', senderType: 'system', content: "This conversation has been escalated to HR for follow-up. A team member will reach out within 24 hours.", createdAt: '2026-02-13T14:45:00Z' },
    ],
    summary: {
      sentiment: 'negative',
      sentimentScore: -0.72,
      engagementScore: 0.65,
      tags: ['mental_health', 'stress', 'manager_relationship', 'quota_pressure', 'burnout_risk'],
      actionItems: ['HR follow-up required immediately', 'Review quota expectations', 'Manager coaching needed'],
      riskLevel: 'high',
    },
  },
  // Mike Johnson - Manager perspective
  {
    id: 'conv_006',
    agentInstanceId: 'inst_004',
    employeeId: 'emp_004',
    employeeName: 'Mike Johnson',
    startedAt: '2026-02-12T09:00:00Z',
    lastMessageAt: '2026-02-12T10:00:00Z',
    status: 'completed',
    messages: [
      { id: 'msg_006_01', conversationId: 'conv_006', senderType: 'agent', content: "Hi Mike! We're collecting feedback for Q1 manager reviews. How do you feel your team is doing?", createdAt: '2026-02-12T09:00:00Z' },
      { id: 'msg_006_02', conversationId: 'conv_006', senderType: 'employee', content: "The team is strong. Sarah and Chris are doing great work. Alex is ramping up faster than expected.", createdAt: '2026-02-12T09:15:00Z' },
      { id: 'msg_006_03', conversationId: 'conv_006', senderType: 'agent', content: "That's great to hear! Any challenges you're facing as a manager?", createdAt: '2026-02-12T09:16:00Z' },
      { id: 'msg_006_04', conversationId: 'conv_006', senderType: 'employee', content: "Balancing delivery pressure with team growth. I want to give Sarah more architecture work but we're stretched thin.", createdAt: '2026-02-12T09:40:00Z' },
      { id: 'msg_006_05', conversationId: 'conv_006', senderType: 'agent', content: "The classic manager dilemma. Have you talked to leadership about headcount?", createdAt: '2026-02-12T09:41:00Z' },
      { id: 'msg_006_06', conversationId: 'conv_006', senderType: 'employee', content: "It's on my list for the Q2 planning cycle. Need to make the case with data.", createdAt: '2026-02-12T10:00:00Z' },
    ],
    summary: {
      sentiment: 'neutral',
      sentimentScore: 0.35,
      engagementScore: 0.85,
      tags: ['team_management', 'headcount', 'career_development', 'resource_constraints'],
      actionItems: ['Prepare headcount business case for Q2'],
      riskLevel: 'low',
    },
  },
  // Emily Davis - Mixed feelings
  {
    id: 'conv_007',
    agentInstanceId: 'inst_001',
    employeeId: 'emp_005',
    employeeName: 'Emily Davis',
    startedAt: '2026-02-14T09:00:00Z',
    lastMessageAt: '2026-02-14T10:30:00Z',
    status: 'completed',
    messages: [
      { id: 'msg_007_01', conversationId: 'conv_007', senderType: 'agent', content: "Hi Emily! How's your week shaping up?", createdAt: '2026-02-14T09:00:00Z' },
      { id: 'msg_007_02', conversationId: 'conv_007', senderType: 'employee', content: "Mixed, honestly. The design work is going well but there's some org tension I'm navigating.", createdAt: '2026-02-14T09:20:00Z' },
      { id: 'msg_007_03', conversationId: 'conv_007', senderType: 'agent', content: "Org dynamics can be tricky. Want to share more about what's happening?", createdAt: '2026-02-14T09:21:00Z' },
      { id: 'msg_007_04', conversationId: 'conv_007', senderType: 'employee', content: "Marketing wants more say in design decisions. James and I have different views on brand direction. It's not hostile, just... exhausting to navigate.", createdAt: '2026-02-14T09:50:00Z' },
      { id: 'msg_007_05', conversationId: 'conv_007', senderType: 'agent', content: "Cross-functional alignment is one of the hardest parts of leadership. Have you considered proposing a formal design review process?", createdAt: '2026-02-14T09:51:00Z' },
      { id: 'msg_007_06', conversationId: 'conv_007', senderType: 'employee', content: "Actually, that's a good idea. Might help set clearer expectations.", createdAt: '2026-02-14T10:30:00Z' },
    ],
    summary: {
      sentiment: 'mixed',
      sentimentScore: 0.18,
      engagementScore: 0.78,
      tags: ['org_dynamics', 'cross_functional', 'leadership_challenges', 'process_improvement'],
      actionItems: ['Consider design review process proposal'],
      riskLevel: 'moderate',
    },
  },
  // Tom Wilson - Sales pressure (MODERATE RISK)
  {
    id: 'conv_008',
    agentInstanceId: 'inst_006',
    employeeId: 'emp_006',
    employeeName: 'Tom Wilson',
    startedAt: '2026-02-14T09:00:00Z',
    lastMessageAt: '2026-02-14T10:15:00Z',
    status: 'completed',
    messages: [
      { id: 'msg_008_01', conversationId: 'conv_008', senderType: 'agent', content: "Hey Tom! How's the sales team holding up this quarter?", createdAt: '2026-02-14T09:00:00Z' },
      { id: 'msg_008_02', conversationId: 'conv_008', senderType: 'employee', content: "We're behind target. The market's tough right now. I'm pushing the team hard but morale is shaky.", createdAt: '2026-02-14T09:18:00Z' },
      { id: 'msg_008_03', conversationId: 'conv_008', senderType: 'agent', content: "That sounds challenging. How are individual team members handling the pressure?", createdAt: '2026-02-14T09:19:00Z' },
      { id: 'msg_008_04', conversationId: 'conv_008', senderType: 'employee', content: "Most are grinding through it. Maria's struggling though. I need to figure out how to help without lowering standards.", createdAt: '2026-02-14T09:45:00Z' },
      { id: 'msg_008_05', conversationId: 'conv_008', senderType: 'agent', content: "Supporting underperformers while maintaining team standards is tough. Have you considered a development plan approach rather than just pressure?", createdAt: '2026-02-14T09:46:00Z' },
      { id: 'msg_008_06', conversationId: 'conv_008', senderType: 'employee', content: "You might be right. I'll think about how to reframe my approach.", createdAt: '2026-02-14T10:15:00Z' },
    ],
    summary: {
      sentiment: 'negative',
      sentimentScore: -0.25,
      engagementScore: 0.72,
      tags: ['sales_pressure', 'team_morale', 'quota_challenges', 'leadership_style'],
      actionItems: ['Review management approach for underperformers', 'Consider team morale initiatives'],
      riskLevel: 'moderate',
    },
  },
  // Lisa Park - Finance perspective
  {
    id: 'conv_009',
    agentInstanceId: 'inst_001',
    employeeId: 'emp_007',
    employeeName: 'Lisa Park',
    startedAt: '2026-02-13T09:00:00Z',
    lastMessageAt: '2026-02-13T09:45:00Z',
    status: 'completed',
    messages: [
      { id: 'msg_009_01', conversationId: 'conv_009', senderType: 'agent', content: "Hi Lisa! How's everything going?", createdAt: '2026-02-13T09:00:00Z' },
      { id: 'msg_009_02', conversationId: 'conv_009', senderType: 'employee', content: "Good! Month-end close was smooth. Kevin's been a great manager.", createdAt: '2026-02-13T09:12:00Z' },
      { id: 'msg_009_03', conversationId: 'conv_009', senderType: 'agent', content: "Smooth closes are always a win! What's making Kevin's management style work for you?", createdAt: '2026-02-13T09:13:00Z' },
      { id: 'msg_009_04', conversationId: 'conv_009', senderType: 'employee', content: "He gives me autonomy but is always available when I have questions. And he advocates for the team in leadership meetings.", createdAt: '2026-02-13T09:35:00Z' },
      { id: 'msg_009_05', conversationId: 'conv_009', senderType: 'agent', content: "That's the dream combo! Anything you'd like to see change?", createdAt: '2026-02-13T09:36:00Z' },
      { id: 'msg_009_06', conversationId: 'conv_009', senderType: 'employee', content: "More visibility into strategic decisions would be nice. But overall I'm happy.", createdAt: '2026-02-13T09:45:00Z' },
    ],
    summary: {
      sentiment: 'positive',
      sentimentScore: 0.68,
      engagementScore: 0.80,
      tags: ['good_management', 'autonomy', 'growth_opportunity'],
      actionItems: ['Consider more strategic visibility for team'],
      riskLevel: 'low',
    },
  },
  // Alex Wong - New hire onboarding
  {
    id: 'conv_010',
    agentInstanceId: 'inst_002',
    employeeId: 'emp_008',
    employeeName: 'Alex Wong',
    startedAt: '2026-02-10T10:00:00Z',
    lastMessageAt: '2026-02-10T11:00:00Z',
    status: 'completed',
    messages: [
      { id: 'msg_010_01', conversationId: 'conv_010', senderType: 'agent', content: "Welcome Alex! I'm here to help with your onboarding. How's your first month going?", createdAt: '2026-02-10T10:00:00Z' },
      { id: 'msg_010_02', conversationId: 'conv_010', senderType: 'employee', content: "Great so far! The team has been really welcoming. Sarah's been an amazing mentor.", createdAt: '2026-02-10T10:10:00Z' },
      { id: 'msg_010_03', conversationId: 'conv_010', senderType: 'agent', content: "That's wonderful! Do you have everything you need - access, equipment, documentation?", createdAt: '2026-02-10T10:11:00Z' },
      { id: 'msg_010_04', conversationId: 'conv_010', senderType: 'employee', content: "Almost everything. Still waiting on production database access.", createdAt: '2026-02-10T10:30:00Z' },
      { id: 'msg_010_05', conversationId: 'conv_010', senderType: 'agent', content: "Got it - I'll flag that for IT. Is there anything about the codebase or processes that's been confusing?", createdAt: '2026-02-10T10:31:00Z' },
      { id: 'msg_010_06', conversationId: 'conv_010', senderType: 'employee', content: "The deployment process is a bit unclear. Would love some documentation there.", createdAt: '2026-02-10T10:50:00Z' },
      { id: 'msg_010_07', conversationId: 'conv_010', senderType: 'agent', content: "Good feedback! I'll note that for the engineering team. Anything else?", createdAt: '2026-02-10T10:51:00Z' },
      { id: 'msg_010_08', conversationId: 'conv_010', senderType: 'employee', content: "All good for now! Really enjoying it here.", createdAt: '2026-02-10T11:00:00Z' },
    ],
    summary: {
      sentiment: 'positive',
      sentimentScore: 0.82,
      engagementScore: 0.90,
      tags: ['onboarding', 'good_mentorship', 'documentation_gaps', 'positive_culture'],
      actionItems: ['Request production DB access from IT', 'Create deployment documentation'],
      riskLevel: 'low',
    },
  },
  // Jennifer Lee - HR perspective
  {
    id: 'conv_011',
    agentInstanceId: 'inst_001',
    employeeId: 'emp_009',
    employeeName: 'Jennifer Lee',
    startedAt: '2026-02-12T09:00:00Z',
    lastMessageAt: '2026-02-12T10:00:00Z',
    status: 'completed',
    messages: [
      { id: 'msg_011_01', conversationId: 'conv_011', senderType: 'agent', content: "Hi Jennifer! As an HR partner, I'd love to hear how you're doing too. How's your week?", createdAt: '2026-02-12T09:00:00Z' },
      { id: 'msg_011_02', conversationId: 'conv_011', senderType: 'employee', content: "Busy but rewarding. We've had some challenging conversations lately but I feel like we're making progress.", createdAt: '2026-02-12T09:15:00Z' },
      { id: 'msg_011_03', conversationId: 'conv_011', senderType: 'agent', content: "HR work can be emotionally demanding. How do you recharge?", createdAt: '2026-02-12T09:16:00Z' },
      { id: 'msg_011_04', conversationId: 'conv_011', senderType: 'employee', content: "I try to set boundaries - no Slack after 7pm. And yoga helps. But honestly, some weeks are harder than others.", createdAt: '2026-02-12T09:45:00Z' },
      { id: 'msg_011_05', conversationId: 'conv_011', senderType: 'agent', content: "Those boundaries sound healthy. Is there anything the company could do to better support HR wellbeing?", createdAt: '2026-02-12T09:46:00Z' },
      { id: 'msg_011_06', conversationId: 'conv_011', senderType: 'employee', content: "Honestly, having this check-in is helpful. It's nice to be on the receiving end sometimes.", createdAt: '2026-02-12T10:00:00Z' },
    ],
    summary: {
      sentiment: 'positive',
      sentimentScore: 0.55,
      engagementScore: 0.85,
      tags: ['hr_wellbeing', 'work_life_balance', 'boundaries', 'emotional_labor'],
      actionItems: [],
      riskLevel: 'low',
    },
  },
  // Chris Martin - Frontend dev
  {
    id: 'conv_012',
    agentInstanceId: 'inst_005',
    employeeId: 'emp_010',
    employeeName: 'Chris Martin',
    startedAt: '2026-02-13T09:00:00Z',
    lastMessageAt: '2026-02-13T09:50:00Z',
    status: 'completed',
    messages: [
      { id: 'msg_012_01', conversationId: 'conv_012', senderType: 'agent', content: "Hey Chris! How's the frontend life treating you?", createdAt: '2026-02-13T09:00:00Z' },
      { id: 'msg_012_02', conversationId: 'conv_012', senderType: 'employee', content: "Can't complain! The new React 19 features are fun to work with.", createdAt: '2026-02-13T09:15:00Z' },
      { id: 'msg_012_03', conversationId: 'conv_012', senderType: 'agent', content: "Nice! How's the collaboration with the design team?", createdAt: '2026-02-13T09:16:00Z' },
      { id: 'msg_012_04', conversationId: 'conv_012', senderType: 'employee', content: "David and I have a great workflow now. Figma to code is smooth.", createdAt: '2026-02-13T09:40:00Z' },
      { id: 'msg_012_05', conversationId: 'conv_012', senderType: 'agent', content: "That's the dream! Keep building cool stuff!", createdAt: '2026-02-13T09:50:00Z' },
    ],
    summary: {
      sentiment: 'positive',
      sentimentScore: 0.72,
      engagementScore: 0.75,
      tags: ['technology', 'cross_functional', 'design_engineering'],
      actionItems: [],
      riskLevel: 'low',
    },
  },
  // Rachel Green - Customer success
  {
    id: 'conv_013',
    agentInstanceId: 'inst_001',
    employeeId: 'emp_011',
    employeeName: 'Rachel Green',
    startedAt: '2026-02-14T09:00:00Z',
    lastMessageAt: '2026-02-14T10:00:00Z',
    status: 'active',
    messages: [
      { id: 'msg_013_01', conversationId: 'conv_013', senderType: 'agent', content: "Hi Rachel! How's customer success this week?", createdAt: '2026-02-14T09:00:00Z' },
      { id: 'msg_013_02', conversationId: 'conv_013', senderType: 'employee', content: "Challenging. We lost a big account and I'm trying to understand why.", createdAt: '2026-02-14T09:20:00Z' },
      { id: 'msg_013_03', conversationId: 'conv_013', senderType: 'agent', content: "That's tough. Do you feel you had the support and resources to save it?", createdAt: '2026-02-14T09:21:00Z' },
      { id: 'msg_013_04', conversationId: 'conv_013', senderType: 'employee', content: "Honestly, we saw the warning signs but product couldn't ship the features they needed in time. It's frustrating.", createdAt: '2026-02-14T09:50:00Z' },
      { id: 'msg_013_05', conversationId: 'conv_013', senderType: 'agent', content: "Cross-functional alignment on customer needs is so important. Have you shared this feedback with leadership?", createdAt: '2026-02-14T09:51:00Z' },
      { id: 'msg_013_06', conversationId: 'conv_013', senderType: 'employee', content: "I will in our next all-hands. Someone needs to hear this.", createdAt: '2026-02-14T10:00:00Z' },
    ],
    summary: {
      sentiment: 'negative',
      sentimentScore: -0.35,
      engagementScore: 0.82,
      tags: ['churn', 'product_feedback', 'cross_functional', 'frustration'],
      actionItems: ['Share customer churn feedback with leadership', 'Improve product-CS alignment'],
      riskLevel: 'moderate',
    },
  },
  // Kevin Taylor - Finance manager
  {
    id: 'conv_014',
    agentInstanceId: 'inst_004',
    employeeId: 'emp_012',
    employeeName: 'Kevin Taylor',
    startedAt: '2026-02-11T09:00:00Z',
    lastMessageAt: '2026-02-11T09:45:00Z',
    status: 'completed',
    messages: [
      { id: 'msg_014_01', conversationId: 'conv_014', senderType: 'agent', content: "Hi Kevin! We're gathering manager feedback for Q1. How's your team doing?", createdAt: '2026-02-11T09:00:00Z' },
      { id: 'msg_014_02', conversationId: 'conv_014', senderType: 'employee', content: "Lisa is doing great - really growing into her role. She's ready for more responsibility.", createdAt: '2026-02-11T09:12:00Z' },
      { id: 'msg_014_03', conversationId: 'conv_014', senderType: 'agent', content: "That's wonderful! Any challenges on your end as a manager?", createdAt: '2026-02-11T09:13:00Z' },
      { id: 'msg_014_04', conversationId: 'conv_014', senderType: 'employee', content: "Budget season is always stressful. Lots of late nights. But we'll get through it.", createdAt: '2026-02-11T09:35:00Z' },
      { id: 'msg_014_05', conversationId: 'conv_014', senderType: 'agent', content: "Make sure you're taking care of yourself too. Leading by example on work-life balance matters!", createdAt: '2026-02-11T09:45:00Z' },
    ],
    summary: {
      sentiment: 'neutral',
      sentimentScore: 0.28,
      engagementScore: 0.70,
      tags: ['team_development', 'budget_season', 'work_life_balance'],
      actionItems: ['Consider promotion path for Lisa'],
      riskLevel: 'low',
    },
  },
  // Amanda White - Marketing, struggling
  {
    id: 'conv_015',
    agentInstanceId: 'inst_001',
    employeeId: 'emp_013',
    employeeName: 'Amanda White',
    startedAt: '2026-02-12T09:00:00Z',
    lastMessageAt: '2026-02-12T10:15:00Z',
    status: 'completed',
    messages: [
      { id: 'msg_015_01', conversationId: 'conv_015', senderType: 'agent', content: "Hi Amanda! How's everything going?", createdAt: '2026-02-12T09:00:00Z' },
      { id: 'msg_015_02', conversationId: 'conv_015', senderType: 'employee', content: "It's been a struggle honestly. I feel like my ideas keep getting shot down.", createdAt: '2026-02-12T09:18:00Z' },
      { id: 'msg_015_03', conversationId: 'conv_015', senderType: 'agent', content: "That sounds frustrating. Can you tell me more about what's happening?", createdAt: '2026-02-12T09:19:00Z' },
      { id: 'msg_015_04', conversationId: 'conv_015', senderType: 'employee', content: "James has a very specific vision for the brand. I get it, but sometimes I feel like I'm just executing his ideas, not contributing my own.", createdAt: '2026-02-12T09:45:00Z' },
      { id: 'msg_015_05', conversationId: 'conv_015', senderType: 'agent', content: "That's valid. Creative autonomy is important for motivation. Have you shared this feedback with James directly?", createdAt: '2026-02-12T09:46:00Z' },
      { id: 'msg_015_06', conversationId: 'conv_015', senderType: 'employee', content: "Not really. I'm worried it'll come across as complaining. Maybe I should though.", createdAt: '2026-02-12T10:15:00Z' },
    ],
    summary: {
      sentiment: 'negative',
      sentimentScore: -0.42,
      engagementScore: 0.75,
      tags: ['creative_autonomy', 'manager_relationship', 'disengagement_risk'],
      actionItems: ['Encourage direct feedback to manager', 'Monitor engagement'],
      riskLevel: 'moderate',
    },
  },
  // James Wilson - VP Marketing
  {
    id: 'conv_016',
    agentInstanceId: 'inst_004',
    employeeId: 'emp_014',
    employeeName: 'James Wilson',
    startedAt: '2026-02-10T09:00:00Z',
    lastMessageAt: '2026-02-10T09:50:00Z',
    status: 'completed',
    messages: [
      { id: 'msg_016_01', conversationId: 'conv_016', senderType: 'agent', content: "Hi James! We're collecting leadership feedback. How's marketing doing?", createdAt: '2026-02-10T09:00:00Z' },
      { id: 'msg_016_02', conversationId: 'conv_016', senderType: 'employee', content: "The rebrand is on track. Big launch coming up in March.", createdAt: '2026-02-10T09:15:00Z' },
      { id: 'msg_016_03', conversationId: 'conv_016', senderType: 'agent', content: "Exciting! How's the team handling the extra workload?", createdAt: '2026-02-10T09:16:00Z' },
      { id: 'msg_016_04', conversationId: 'conv_016', senderType: 'employee', content: "Amanda is stretched thin but delivering. I should probably check in on her more.", createdAt: '2026-02-10T09:40:00Z' },
      { id: 'msg_016_05', conversationId: 'conv_016', senderType: 'agent', content: "That awareness is valuable. Regular 1:1s can help catch issues early.", createdAt: '2026-02-10T09:50:00Z' },
    ],
    summary: {
      sentiment: 'neutral',
      sentimentScore: 0.32,
      engagementScore: 0.72,
      tags: ['rebrand', 'team_management', 'workload_awareness'],
      actionItems: ['Increase check-ins with Amanda'],
      riskLevel: 'low',
    },
  },
  // Nicole Anderson - QA Engineer
  {
    id: 'conv_017',
    agentInstanceId: 'inst_005',
    employeeId: 'emp_015',
    employeeName: 'Nicole Anderson',
    startedAt: '2026-02-13T09:00:00Z',
    lastMessageAt: '2026-02-13T10:00:00Z',
    status: 'completed',
    messages: [
      { id: 'msg_017_01', conversationId: 'conv_017', senderType: 'agent', content: "Hey Nicole! How's the QA life this sprint?", createdAt: '2026-02-13T09:00:00Z' },
      { id: 'msg_017_02', conversationId: 'conv_017', senderType: 'employee', content: "Busy! We're catching a lot of bugs before release, which is good.", createdAt: '2026-02-13T09:15:00Z' },
      { id: 'msg_017_03', conversationId: 'conv_017', senderType: 'agent', content: "That's the goal! Are you getting enough time for thorough testing?", createdAt: '2026-02-13T09:16:00Z' },
      { id: 'msg_017_04', conversationId: 'conv_017', senderType: 'employee', content: "Mostly. Though I wish we had more automated coverage. Manual testing everything is exhausting.", createdAt: '2026-02-13T09:45:00Z' },
      { id: 'msg_017_05', conversationId: 'conv_017', senderType: 'agent', content: "That's a common pain point. Have you raised the automation investment with Mike?", createdAt: '2026-02-13T09:46:00Z' },
      { id: 'msg_017_06', conversationId: 'conv_017', senderType: 'employee', content: "I've mentioned it. It's on the roadmap but keeps getting deprioritized.", createdAt: '2026-02-13T10:00:00Z' },
    ],
    summary: {
      sentiment: 'neutral',
      sentimentScore: 0.15,
      engagementScore: 0.78,
      tags: ['test_automation', 'workload', 'tooling_needs'],
      actionItems: ['Advocate for test automation investment'],
      riskLevel: 'low',
    },
  },
]

// =============================================================================
// HISTORICAL CONVERSATIONS (older, completed, spread over weeks)
// =============================================================================

const HISTORICAL_CONVERSATIONS: Conversation[] = [
  // Sarah Chen - 3 weeks ago
  {
    id: 'conv_018',
    agentInstanceId: 'inst_001',
    employeeId: 'emp_001',
    employeeName: 'Sarah Chen',
    startedAt: '2026-01-24T09:00:00Z',
    lastMessageAt: '2026-01-24T09:45:00Z',
    status: 'completed',
    messages: [
      { id: 'msg_018_01', conversationId: 'conv_018', senderType: 'agent', content: "Hi Sarah! Happy Friday! How was your week?", createdAt: '2026-01-24T09:00:00Z' },
      { id: 'msg_018_02', conversationId: 'conv_018', senderType: 'employee', content: "Pretty solid! We closed out the auth migration ahead of schedule.", createdAt: '2026-01-24T09:12:00Z' },
      { id: 'msg_018_03', conversationId: 'conv_018', senderType: 'agent', content: "Ahead of schedule? That's impressive! What made the difference?", createdAt: '2026-01-24T09:13:00Z' },
      { id: 'msg_018_04', conversationId: 'conv_018', senderType: 'employee', content: "We did a lot of prep work. And Mike gave us space to focus without too many meetings.", createdAt: '2026-01-24T09:35:00Z' },
      { id: 'msg_018_05', conversationId: 'conv_018', senderType: 'agent', content: "Protected focus time is golden. Enjoy your weekend!", createdAt: '2026-01-24T09:45:00Z' },
    ],
    summary: {
      sentiment: 'positive',
      sentimentScore: 0.75,
      engagementScore: 0.80,
      tags: ['productivity', 'good_management', 'focus_time'],
      actionItems: [],
      riskLevel: 'low',
    },
  },
  // David Kim - 2 weeks ago
  {
    id: 'conv_019',
    agentInstanceId: 'inst_001',
    employeeId: 'emp_002',
    employeeName: 'David Kim',
    startedAt: '2026-02-01T09:00:00Z',
    lastMessageAt: '2026-02-01T10:00:00Z',
    status: 'completed',
    messages: [
      { id: 'msg_019_01', conversationId: 'conv_019', senderType: 'agent', content: "Hey David! New month, new vibes. How are you starting February?", createdAt: '2026-02-01T09:00:00Z' },
      { id: 'msg_019_02', conversationId: 'conv_019', senderType: 'employee', content: "Energized! Got some cool projects lined up.", createdAt: '2026-02-01T09:20:00Z' },
      { id: 'msg_019_03', conversationId: 'conv_019', senderType: 'agent', content: "Love the energy! What's most exciting?", createdAt: '2026-02-01T09:21:00Z' },
      { id: 'msg_019_04', conversationId: 'conv_019', senderType: 'employee', content: "The mobile redesign. First time leading a project end-to-end.", createdAt: '2026-02-01T09:50:00Z' },
      { id: 'msg_019_05', conversationId: 'conv_019', senderType: 'agent', content: "That's a big step! Congrats on the growth opportunity.", createdAt: '2026-02-01T10:00:00Z' },
    ],
    summary: {
      sentiment: 'positive',
      sentimentScore: 0.82,
      engagementScore: 0.85,
      tags: ['career_growth', 'leadership', 'motivation'],
      actionItems: [],
      riskLevel: 'low',
    },
  },
  // Maria Lopez - before escalation
  {
    id: 'conv_020',
    agentInstanceId: 'inst_001',
    employeeId: 'emp_003',
    employeeName: 'Maria Lopez',
    startedAt: '2026-02-06T09:00:00Z',
    lastMessageAt: '2026-02-06T09:50:00Z',
    status: 'completed',
    messages: [
      { id: 'msg_020_01', conversationId: 'conv_020', senderType: 'agent', content: "Hi Maria! How's your week going?", createdAt: '2026-02-06T09:00:00Z' },
      { id: 'msg_020_02', conversationId: 'conv_020', senderType: 'employee', content: "Stressful. Pipeline is light and quarter-end is coming.", createdAt: '2026-02-06T09:15:00Z' },
      { id: 'msg_020_03', conversationId: 'conv_020', senderType: 'agent', content: "Sales cycles can be tough. How are you feeling about it?", createdAt: '2026-02-06T09:16:00Z' },
      { id: 'msg_020_04', conversationId: 'conv_020', senderType: 'employee', content: "Nervous. I really don't want to miss quota again.", createdAt: '2026-02-06T09:40:00Z' },
      { id: 'msg_020_05', conversationId: 'conv_020', senderType: 'agent', content: "That pressure is real. Is there any support you need from the team?", createdAt: '2026-02-06T09:50:00Z' },
    ],
    summary: {
      sentiment: 'negative',
      sentimentScore: -0.45,
      engagementScore: 0.68,
      tags: ['quota_pressure', 'anxiety', 'sales_cycle'],
      actionItems: ['Monitor stress levels', 'Consider pipeline support'],
      riskLevel: 'moderate',
    },
  },
  // Alex Wong - 30 day check-in
  {
    id: 'conv_021',
    agentInstanceId: 'inst_007',
    employeeId: 'emp_008',
    employeeName: 'Alex Wong',
    startedAt: '2026-01-20T10:00:00Z',
    lastMessageAt: '2026-01-20T11:00:00Z',
    status: 'completed',
    messages: [
      { id: 'msg_021_01', conversationId: 'conv_021', senderType: 'agent', content: "Hey Alex! You're 30 days in! How's it feeling?", createdAt: '2026-01-20T10:00:00Z' },
      { id: 'msg_021_02', conversationId: 'conv_021', senderType: 'employee', content: "Time flies! I feel like I'm finally getting the hang of things.", createdAt: '2026-01-20T10:15:00Z' },
      { id: 'msg_021_03', conversationId: 'conv_021', senderType: 'agent', content: "That's the spirit! What's been the biggest learning curve?", createdAt: '2026-01-20T10:16:00Z' },
      { id: 'msg_021_04', conversationId: 'conv_021', senderType: 'employee', content: "The codebase is massive. But Sarah's been patient explaining the architecture.", createdAt: '2026-01-20T10:40:00Z' },
      { id: 'msg_021_05', conversationId: 'conv_021', senderType: 'agent', content: "Good mentorship makes all the difference. What are you hoping to work on next?", createdAt: '2026-01-20T10:41:00Z' },
      { id: 'msg_021_06', conversationId: 'conv_021', senderType: 'employee', content: "Hoping to own a small feature soon. Ready to contribute!", createdAt: '2026-01-20T11:00:00Z' },
    ],
    summary: {
      sentiment: 'positive',
      sentimentScore: 0.72,
      engagementScore: 0.88,
      tags: ['onboarding_progress', 'mentorship', 'motivation'],
      actionItems: ['Assign first feature ownership'],
      riskLevel: 'low',
    },
  },
  // Rachel Green - Week 1
  {
    id: 'conv_022',
    agentInstanceId: 'inst_001',
    employeeId: 'emp_011',
    employeeName: 'Rachel Green',
    startedAt: '2026-02-07T09:00:00Z',
    lastMessageAt: '2026-02-07T09:45:00Z',
    status: 'completed',
    messages: [
      { id: 'msg_022_01', conversationId: 'conv_022', senderType: 'agent', content: "Hi Rachel! How was your week?", createdAt: '2026-02-07T09:00:00Z' },
      { id: 'msg_022_02', conversationId: 'conv_022', senderType: 'employee', content: "Solid! Renewed two enterprise accounts.", createdAt: '2026-02-07T09:12:00Z' },
      { id: 'msg_022_03', conversationId: 'conv_022', senderType: 'agent', content: "Nice wins! How's the relationship with product team?", createdAt: '2026-02-07T09:13:00Z' },
      { id: 'msg_022_04', conversationId: 'conv_022', senderType: 'employee', content: "Could be better. Sometimes I feel like customer feedback doesn't get prioritized.", createdAt: '2026-02-07T09:35:00Z' },
      { id: 'msg_022_05', conversationId: 'conv_022', senderType: 'agent', content: "That's valuable feedback. Have you considered a formal feedback loop?", createdAt: '2026-02-07T09:45:00Z' },
    ],
    summary: {
      sentiment: 'mixed',
      sentimentScore: 0.25,
      engagementScore: 0.75,
      tags: ['customer_success', 'product_feedback', 'cross_functional'],
      actionItems: ['Establish CS-Product feedback loop'],
      riskLevel: 'low',
    },
  },
  // Exit interview - departed employee
  {
    id: 'conv_023',
    agentInstanceId: 'inst_003',
    employeeId: 'emp_013',
    employeeName: 'Amanda White',
    startedAt: '2026-02-01T10:00:00Z',
    lastMessageAt: '2026-02-01T11:00:00Z',
    status: 'completed',
    messages: [
      { id: 'msg_023_01', conversationId: 'conv_023', senderType: 'agent', content: "Hi Robert. Thank you for taking time to share your thoughts before you leave. What prompted your decision to move on?", createdAt: '2026-02-01T10:00:00Z' },
      { id: 'msg_023_02', conversationId: 'conv_023', senderType: 'employee', content: "Honestly, I got a great offer elsewhere. But also, I felt my growth had stalled here.", createdAt: '2026-02-01T10:15:00Z' },
      { id: 'msg_023_03', conversationId: 'conv_023', senderType: 'agent', content: "I appreciate your honesty. Can you tell me more about the growth stalling?", createdAt: '2026-02-01T10:16:00Z' },
      { id: 'msg_023_04', conversationId: 'conv_023', senderType: 'employee', content: "I was in the same role for 3 years. Asked about promotion twice but got vague answers. Eventually stopped asking.", createdAt: '2026-02-01T10:40:00Z' },
      { id: 'msg_023_05', conversationId: 'conv_023', senderType: 'agent', content: "That's frustrating. Were there other factors?", createdAt: '2026-02-01T10:41:00Z' },
      { id: 'msg_023_06', conversationId: 'conv_023', senderType: 'employee', content: "The people are great. I'll miss the team. But I needed to make this move for my career.", createdAt: '2026-02-01T10:55:00Z' },
      { id: 'msg_023_07', conversationId: 'conv_023', senderType: 'agent', content: "Thank you for sharing. We wish you the best, and this feedback is valuable.", createdAt: '2026-02-01T11:00:00Z' },
    ],
    summary: {
      sentiment: 'negative',
      sentimentScore: -0.38,
      engagementScore: 0.90,
      tags: ['attrition', 'career_growth', 'promotion_path', 'retention'],
      actionItems: ['Review promotion criteria transparency', 'Career pathing improvements'],
      riskLevel: 'moderate',
    },
  },
  // Mike Johnson - older pulse
  {
    id: 'conv_024',
    agentInstanceId: 'inst_001',
    employeeId: 'emp_004',
    employeeName: 'Mike Johnson',
    startedAt: '2026-01-17T09:00:00Z',
    lastMessageAt: '2026-01-17T09:50:00Z',
    status: 'completed',
    messages: [
      { id: 'msg_024_01', conversationId: 'conv_024', senderType: 'agent', content: "Hey Mike! How's the engineering team kicking off the year?", createdAt: '2026-01-17T09:00:00Z' },
      { id: 'msg_024_02', conversationId: 'conv_024', senderType: 'employee', content: "Good energy! The team is motivated after the holiday break.", createdAt: '2026-01-17T09:15:00Z' },
      { id: 'msg_024_03', conversationId: 'conv_024', senderType: 'agent', content: "Great to hear! Any concerns going into Q1?", createdAt: '2026-01-17T09:16:00Z' },
      { id: 'msg_024_04', conversationId: 'conv_024', senderType: 'employee', content: "The API migration timeline is aggressive. We'll need to be careful about scope creep.", createdAt: '2026-01-17T09:40:00Z' },
      { id: 'msg_024_05', conversationId: 'conv_024', senderType: 'agent', content: "Smart to flag that early. Hopefully leadership stays aligned on priorities.", createdAt: '2026-01-17T09:50:00Z' },
    ],
    summary: {
      sentiment: 'positive',
      sentimentScore: 0.55,
      engagementScore: 0.75,
      tags: ['team_morale', 'planning', 'scope_management'],
      actionItems: ['Monitor API migration scope'],
      riskLevel: 'low',
    },
  },
]

// =============================================================================
// MORE CONVERSATIONS TO REACH 50+
// =============================================================================

const ADDITIONAL_CONVERSATIONS: Conversation[] = [
  // Tom Wilson - older
  {
    id: 'conv_025',
    agentInstanceId: 'inst_006',
    employeeId: 'emp_006',
    employeeName: 'Tom Wilson',
    startedAt: '2026-02-07T09:00:00Z',
    lastMessageAt: '2026-02-07T09:45:00Z',
    status: 'completed',
    messages: [
      { id: 'msg_025_01', conversationId: 'conv_025', senderType: 'agent', content: "Hey Tom! How's sales looking this week?", createdAt: '2026-02-07T09:00:00Z' },
      { id: 'msg_025_02', conversationId: 'conv_025', senderType: 'employee', content: "Pipeline is building. Got some promising enterprise leads.", createdAt: '2026-02-07T09:15:00Z' },
      { id: 'msg_025_03', conversationId: 'conv_025', senderType: 'agent', content: "Nice! Team morale holding up?", createdAt: '2026-02-07T09:16:00Z' },
      { id: 'msg_025_04', conversationId: 'conv_025', senderType: 'employee', content: "Mostly. Some pressure but that's sales life.", createdAt: '2026-02-07T09:35:00Z' },
      { id: 'msg_025_05', conversationId: 'conv_025', senderType: 'agent', content: "True! Let me know if you need any support.", createdAt: '2026-02-07T09:45:00Z' },
    ],
    summary: {
      sentiment: 'neutral',
      sentimentScore: 0.35,
      engagementScore: 0.72,
      tags: ['pipeline', 'enterprise_sales', 'team_morale'],
      actionItems: [],
      riskLevel: 'low',
    },
  },
  // Emily Davis - older
  {
    id: 'conv_026',
    agentInstanceId: 'inst_001',
    employeeId: 'emp_005',
    employeeName: 'Emily Davis',
    startedAt: '2026-02-07T09:00:00Z',
    lastMessageAt: '2026-02-07T09:50:00Z',
    status: 'completed',
    messages: [
      { id: 'msg_026_01', conversationId: 'conv_026', senderType: 'agent', content: "Hi Emily! How's the design team doing?", createdAt: '2026-02-07T09:00:00Z' },
      { id: 'msg_026_02', conversationId: 'conv_026', senderType: 'employee', content: "David is killing it. The design system is really coming together.", createdAt: '2026-02-07T09:15:00Z' },
      { id: 'msg_026_03', conversationId: 'conv_026', senderType: 'agent', content: "Great to hear! How's the collaboration with engineering?", createdAt: '2026-02-07T09:16:00Z' },
      { id: 'msg_026_04', conversationId: 'conv_026', senderType: 'employee', content: "Much better since we established the new handoff process.", createdAt: '2026-02-07T09:40:00Z' },
      { id: 'msg_026_05', conversationId: 'conv_026', senderType: 'agent', content: "Process improvements FTW!", createdAt: '2026-02-07T09:50:00Z' },
    ],
    summary: {
      sentiment: 'positive',
      sentimentScore: 0.72,
      engagementScore: 0.78,
      tags: ['design_system', 'process_improvement', 'collaboration'],
      actionItems: [],
      riskLevel: 'low',
    },
  },
  // Manager 360 - About Mike
  {
    id: 'conv_027',
    agentInstanceId: 'inst_004',
    employeeId: 'emp_001',
    employeeName: 'Sarah Chen',
    startedAt: '2026-02-11T09:00:00Z',
    lastMessageAt: '2026-02-11T09:45:00Z',
    status: 'completed',
    messages: [
      { id: 'msg_027_01', conversationId: 'conv_027', senderType: 'agent', content: "Hi Sarah! We're collecting anonymous feedback about your manager. How would you describe working with Mike?", createdAt: '2026-02-11T09:00:00Z' },
      { id: 'msg_027_02', conversationId: 'conv_027', senderType: 'employee', content: "Mike is great. He gives autonomy but is always available when needed.", createdAt: '2026-02-11T09:12:00Z' },
      { id: 'msg_027_03', conversationId: 'conv_027', senderType: 'agent', content: "That's wonderful. Any areas for improvement?", createdAt: '2026-02-11T09:13:00Z' },
      { id: 'msg_027_04', conversationId: 'conv_027', senderType: 'employee', content: "Sometimes decisions get made without enough team input. More transparency on roadmap prioritization would help.", createdAt: '2026-02-11T09:35:00Z' },
      { id: 'msg_027_05', conversationId: 'conv_027', senderType: 'agent', content: "Good constructive feedback. Thank you for sharing!", createdAt: '2026-02-11T09:45:00Z' },
    ],
    summary: {
      sentiment: 'positive',
      sentimentScore: 0.65,
      engagementScore: 0.82,
      tags: ['manager_feedback', 'autonomy', 'transparency'],
      actionItems: ['Share roadmap prioritization more openly'],
      riskLevel: 'low',
    },
  },
  // Nicole - older conversation
  {
    id: 'conv_028',
    agentInstanceId: 'inst_005',
    employeeId: 'emp_015',
    employeeName: 'Nicole Anderson',
    startedAt: '2026-02-06T09:00:00Z',
    lastMessageAt: '2026-02-06T09:50:00Z',
    status: 'completed',
    messages: [
      { id: 'msg_028_01', conversationId: 'conv_028', senderType: 'agent', content: "Hey Nicole! How's QA this week?", createdAt: '2026-02-06T09:00:00Z' },
      { id: 'msg_028_02', conversationId: 'conv_028', senderType: 'employee', content: "Caught some critical bugs before release!", createdAt: '2026-02-06T09:15:00Z' },
      { id: 'msg_028_03', conversationId: 'conv_028', senderType: 'agent', content: "Hero moment! How did the team react?", createdAt: '2026-02-06T09:16:00Z' },
      { id: 'msg_028_04', conversationId: 'conv_028', senderType: 'employee', content: "Sarah thanked me in standup. Felt good to be recognized.", createdAt: '2026-02-06T09:40:00Z' },
      { id: 'msg_028_05', conversationId: 'conv_028', senderType: 'agent', content: "Recognition matters! Keep catching those bugs!", createdAt: '2026-02-06T09:50:00Z' },
    ],
    summary: {
      sentiment: 'positive',
      sentimentScore: 0.78,
      engagementScore: 0.80,
      tags: ['recognition', 'quality', 'teamwork'],
      actionItems: [],
      riskLevel: 'low',
    },
  },
  // Jennifer Lee - older
  {
    id: 'conv_029',
    agentInstanceId: 'inst_001',
    employeeId: 'emp_009',
    employeeName: 'Jennifer Lee',
    startedAt: '2026-02-05T09:00:00Z',
    lastMessageAt: '2026-02-05T10:00:00Z',
    status: 'completed',
    messages: [
      { id: 'msg_029_01', conversationId: 'conv_029', senderType: 'agent', content: "Hi Jennifer! How's your week going?", createdAt: '2026-02-05T09:00:00Z' },
      { id: 'msg_029_02', conversationId: 'conv_029', senderType: 'employee', content: "Heavy. Had a difficult termination conversation yesterday.", createdAt: '2026-02-05T09:15:00Z' },
      { id: 'msg_029_03', conversationId: 'conv_029', senderType: 'agent', content: "Those are never easy. How are you processing it?", createdAt: '2026-02-05T09:16:00Z' },
      { id: 'msg_029_04', conversationId: 'conv_029', senderType: 'employee', content: "Talked it through with a colleague. It's part of the job but doesn't get easier.", createdAt: '2026-02-05T09:45:00Z' },
      { id: 'msg_029_05', conversationId: 'conv_029', senderType: 'agent', content: "Having support is important. You're doing hard but necessary work.", createdAt: '2026-02-05T10:00:00Z' },
    ],
    summary: {
      sentiment: 'negative',
      sentimentScore: -0.28,
      engagementScore: 0.75,
      tags: ['hr_challenges', 'emotional_labor', 'peer_support'],
      actionItems: [],
      riskLevel: 'low',
    },
  },
  // Chris Martin - older
  {
    id: 'conv_030',
    agentInstanceId: 'inst_005',
    employeeId: 'emp_010',
    employeeName: 'Chris Martin',
    startedAt: '2026-02-06T09:00:00Z',
    lastMessageAt: '2026-02-06T09:45:00Z',
    status: 'completed',
    messages: [
      { id: 'msg_030_01', conversationId: 'conv_030', senderType: 'agent', content: "Hey Chris! How was your week?", createdAt: '2026-02-06T09:00:00Z' },
      { id: 'msg_030_02', conversationId: 'conv_030', senderType: 'employee', content: "Productive! Shipped the new dashboard.", createdAt: '2026-02-06T09:12:00Z' },
      { id: 'msg_030_03', conversationId: 'conv_030', senderType: 'agent', content: "Nice ship! How'd it go?", createdAt: '2026-02-06T09:13:00Z' },
      { id: 'msg_030_04', conversationId: 'conv_030', senderType: 'employee', content: "Smooth! No rollbacks needed.", createdAt: '2026-02-06T09:35:00Z' },
      { id: 'msg_030_05', conversationId: 'conv_030', senderType: 'agent', content: "The best kind of deploy!", createdAt: '2026-02-06T09:45:00Z' },
    ],
    summary: {
      sentiment: 'positive',
      sentimentScore: 0.80,
      engagementScore: 0.75,
      tags: ['shipping', 'productivity', 'quality'],
      actionItems: [],
      riskLevel: 'low',
    },
  },
]

// Additional conversations to reach 50+
const MORE_CONVERSATIONS: Conversation[] = [
  // Lisa Park - older
  {
    id: 'conv_031',
    agentInstanceId: 'inst_001',
    employeeId: 'emp_007',
    employeeName: 'Lisa Park',
    startedAt: '2026-02-06T09:00:00Z',
    lastMessageAt: '2026-02-06T09:40:00Z',
    status: 'completed',
    messages: [
      { id: 'msg_031_01', conversationId: 'conv_031', senderType: 'agent', content: "Hi Lisa! How's finance treating you?", createdAt: '2026-02-06T09:00:00Z' },
      { id: 'msg_031_02', conversationId: 'conv_031', senderType: 'employee', content: "Busy with month-end but good!", createdAt: '2026-02-06T09:15:00Z' },
      { id: 'msg_031_03', conversationId: 'conv_031', senderType: 'agent', content: "Month-end grind! Any blockers?", createdAt: '2026-02-06T09:16:00Z' },
      { id: 'msg_031_04', conversationId: 'conv_031', senderType: 'employee', content: "Nope, just need to power through.", createdAt: '2026-02-06T09:35:00Z' },
      { id: 'msg_031_05', conversationId: 'conv_031', senderType: 'agent', content: "You got this!", createdAt: '2026-02-06T09:40:00Z' },
    ],
    summary: { sentiment: 'positive', sentimentScore: 0.55, engagementScore: 0.70, tags: ['finance', 'month_end'], actionItems: [], riskLevel: 'low' },
  },
  // Kevin Taylor - older
  {
    id: 'conv_032',
    agentInstanceId: 'inst_001',
    employeeId: 'emp_012',
    employeeName: 'Kevin Taylor',
    startedAt: '2026-02-04T09:00:00Z',
    lastMessageAt: '2026-02-04T09:45:00Z',
    status: 'completed',
    messages: [
      { id: 'msg_032_01', conversationId: 'conv_032', senderType: 'agent', content: "Hey Kevin! How's the start of February?", createdAt: '2026-02-04T09:00:00Z' },
      { id: 'msg_032_02', conversationId: 'conv_032', senderType: 'employee', content: "Planning mode. Budget season ramp up.", createdAt: '2026-02-04T09:15:00Z' },
      { id: 'msg_032_03', conversationId: 'conv_032', senderType: 'agent', content: "The eternal budget cycle. Team ready?", createdAt: '2026-02-04T09:16:00Z' },
      { id: 'msg_032_04', conversationId: 'conv_032', senderType: 'employee', content: "Lisa's been a huge help. She's ready for more responsibility.", createdAt: '2026-02-04T09:40:00Z' },
      { id: 'msg_032_05', conversationId: 'conv_032', senderType: 'agent', content: "Sounds like promotion conversation material!", createdAt: '2026-02-04T09:45:00Z' },
    ],
    summary: { sentiment: 'positive', sentimentScore: 0.62, engagementScore: 0.75, tags: ['budget', 'team_development'], actionItems: ['Consider Lisa promotion'], riskLevel: 'low' },
  },
  // Amanda White - earlier conversation
  {
    id: 'conv_033',
    agentInstanceId: 'inst_001',
    employeeId: 'emp_013',
    employeeName: 'Amanda White',
    startedAt: '2026-02-05T09:00:00Z',
    lastMessageAt: '2026-02-05T09:50:00Z',
    status: 'completed',
    messages: [
      { id: 'msg_033_01', conversationId: 'conv_033', senderType: 'agent', content: "Hi Amanda! How's marketing this week?", createdAt: '2026-02-05T09:00:00Z' },
      { id: 'msg_033_02', conversationId: 'conv_033', senderType: 'employee', content: "Cranking on the rebrand content. A lot of writing.", createdAt: '2026-02-05T09:15:00Z' },
      { id: 'msg_033_03', conversationId: 'conv_033', senderType: 'agent', content: "Rebrand is exciting! How's it feeling?", createdAt: '2026-02-05T09:16:00Z' },
      { id: 'msg_033_04', conversationId: 'conv_033', senderType: 'employee', content: "Good but I wish I had more creative input on the direction.", createdAt: '2026-02-05T09:40:00Z' },
      { id: 'msg_033_05', conversationId: 'conv_033', senderType: 'agent', content: "Have you shared that with James?", createdAt: '2026-02-05T09:50:00Z' },
    ],
    summary: { sentiment: 'neutral', sentimentScore: 0.22, engagementScore: 0.70, tags: ['rebrand', 'creative_autonomy'], actionItems: ['Encourage feedback to manager'], riskLevel: 'low' },
  },
  // James Wilson - older
  {
    id: 'conv_034',
    agentInstanceId: 'inst_001',
    employeeId: 'emp_014',
    employeeName: 'James Wilson',
    startedAt: '2026-02-03T09:00:00Z',
    lastMessageAt: '2026-02-03T09:45:00Z',
    status: 'completed',
    messages: [
      { id: 'msg_034_01', conversationId: 'conv_034', senderType: 'agent', content: "Hey James! How's the marketing machine?", createdAt: '2026-02-03T09:00:00Z' },
      { id: 'msg_034_02', conversationId: 'conv_034', senderType: 'employee', content: "Running hot! Big push for the rebrand.", createdAt: '2026-02-03T09:15:00Z' },
      { id: 'msg_034_03', conversationId: 'conv_034', senderType: 'agent', content: "Exciting times! Team holding up?", createdAt: '2026-02-03T09:16:00Z' },
      { id: 'msg_034_04', conversationId: 'conv_034', senderType: 'employee', content: "Everyone's working hard. March launch is on track.", createdAt: '2026-02-03T09:40:00Z' },
      { id: 'msg_034_05', conversationId: 'conv_034', senderType: 'agent', content: "Sounds like great momentum!", createdAt: '2026-02-03T09:45:00Z' },
    ],
    summary: { sentiment: 'positive', sentimentScore: 0.68, engagementScore: 0.72, tags: ['rebrand', 'team_momentum'], actionItems: [], riskLevel: 'low' },
  },
  // David Kim - 3 weeks ago
  {
    id: 'conv_035',
    agentInstanceId: 'inst_001',
    employeeId: 'emp_002',
    employeeName: 'David Kim',
    startedAt: '2026-01-24T09:00:00Z',
    lastMessageAt: '2026-01-24T09:50:00Z',
    status: 'completed',
    messages: [
      { id: 'msg_035_01', conversationId: 'conv_035', senderType: 'agent', content: "Hi David! End of January already. How's it going?", createdAt: '2026-01-24T09:00:00Z' },
      { id: 'msg_035_02', conversationId: 'conv_035', senderType: 'employee', content: "Good! Wrapping up some design debt before the new project.", createdAt: '2026-01-24T09:15:00Z' },
      { id: 'msg_035_03', conversationId: 'conv_035', senderType: 'agent', content: "Design debt cleanup is so satisfying. What's next?", createdAt: '2026-01-24T09:16:00Z' },
      { id: 'msg_035_04', conversationId: 'conv_035', senderType: 'employee', content: "Mobile redesign! Really excited about it.", createdAt: '2026-01-24T09:40:00Z' },
      { id: 'msg_035_05', conversationId: 'conv_035', senderType: 'agent', content: "Sounds like a great opportunity!", createdAt: '2026-01-24T09:50:00Z' },
    ],
    summary: { sentiment: 'positive', sentimentScore: 0.75, engagementScore: 0.78, tags: ['design_debt', 'mobile', 'motivation'], actionItems: [], riskLevel: 'low' },
  },
  // Rachel Green - 3 weeks ago
  {
    id: 'conv_036',
    agentInstanceId: 'inst_001',
    employeeId: 'emp_011',
    employeeName: 'Rachel Green',
    startedAt: '2026-01-31T09:00:00Z',
    lastMessageAt: '2026-01-31T09:45:00Z',
    status: 'completed',
    messages: [
      { id: 'msg_036_01', conversationId: 'conv_036', senderType: 'agent', content: "Hi Rachel! Last day of January. How's it feeling?", createdAt: '2026-01-31T09:00:00Z' },
      { id: 'msg_036_02', conversationId: 'conv_036', senderType: 'employee', content: "Good month! Hit renewal targets.", createdAt: '2026-01-31T09:15:00Z' },
      { id: 'msg_036_03', conversationId: 'conv_036', senderType: 'agent', content: "Amazing! What's the secret?", createdAt: '2026-01-31T09:16:00Z' },
      { id: 'msg_036_04', conversationId: 'conv_036', senderType: 'employee', content: "Being proactive. Reaching out before issues become problems.", createdAt: '2026-01-31T09:40:00Z' },
      { id: 'msg_036_05', conversationId: 'conv_036', senderType: 'agent', content: "Proactive CS is the best CS!", createdAt: '2026-01-31T09:45:00Z' },
    ],
    summary: { sentiment: 'positive', sentimentScore: 0.82, engagementScore: 0.80, tags: ['renewals', 'proactive_cs', 'success'], actionItems: [], riskLevel: 'low' },
  },
  // Exit interview 2
  {
    id: 'conv_037',
    agentInstanceId: 'inst_003',
    employeeId: 'emp_014',
    employeeName: 'James Wilson',
    startedAt: '2026-01-15T10:00:00Z',
    lastMessageAt: '2026-01-15T10:45:00Z',
    status: 'completed',
    messages: [
      { id: 'msg_037_01', conversationId: 'conv_037', senderType: 'agent', content: "Hi Michelle. Thank you for sharing feedback before you leave. What led to your decision?", createdAt: '2026-01-15T10:00:00Z' },
      { id: 'msg_037_02', conversationId: 'conv_037', senderType: 'employee', content: "Relocating for family reasons. It's bittersweet - I really liked working here.", createdAt: '2026-01-15T10:12:00Z' },
      { id: 'msg_037_03', conversationId: 'conv_037', senderType: 'agent', content: "That's understandable. What would you miss most?", createdAt: '2026-01-15T10:13:00Z' },
      { id: 'msg_037_04', conversationId: 'conv_037', senderType: 'employee', content: "The team culture. Everyone genuinely wants to help each other succeed.", createdAt: '2026-01-15T10:30:00Z' },
      { id: 'msg_037_05', conversationId: 'conv_037', senderType: 'agent', content: "That's wonderful to hear. Any suggestions for improvement?", createdAt: '2026-01-15T10:31:00Z' },
      { id: 'msg_037_06', conversationId: 'conv_037', senderType: 'employee', content: "More remote flexibility would have helped me stay longer.", createdAt: '2026-01-15T10:45:00Z' },
    ],
    summary: { sentiment: 'mixed', sentimentScore: 0.15, engagementScore: 0.85, tags: ['attrition', 'relocation', 'remote_work', 'culture'], actionItems: ['Review remote work policy'], riskLevel: 'low' },
  },
  // Sarah Chen - 4 weeks ago
  {
    id: 'conv_038',
    agentInstanceId: 'inst_001',
    employeeId: 'emp_001',
    employeeName: 'Sarah Chen',
    startedAt: '2026-01-17T09:00:00Z',
    lastMessageAt: '2026-01-17T09:50:00Z',
    status: 'completed',
    messages: [
      { id: 'msg_038_01', conversationId: 'conv_038', senderType: 'agent', content: "Hi Sarah! How's the new year treating you?", createdAt: '2026-01-17T09:00:00Z' },
      { id: 'msg_038_02', conversationId: 'conv_038', senderType: 'employee', content: "Excited! We have ambitious goals but I'm ready.", createdAt: '2026-01-17T09:15:00Z' },
      { id: 'msg_038_03', conversationId: 'conv_038', senderType: 'agent', content: "Love the energy! What's the biggest challenge ahead?", createdAt: '2026-01-17T09:16:00Z' },
      { id: 'msg_038_04', conversationId: 'conv_038', senderType: 'employee', content: "The API migration is massive. But the team is strong.", createdAt: '2026-01-17T09:40:00Z' },
      { id: 'msg_038_05', conversationId: 'conv_038', senderType: 'agent', content: "Strong teams make hard things possible. Good luck!", createdAt: '2026-01-17T09:50:00Z' },
    ],
    summary: { sentiment: 'positive', sentimentScore: 0.78, engagementScore: 0.85, tags: ['new_year', 'goals', 'team_strength'], actionItems: [], riskLevel: 'low' },
  },
  // Alex Wong - first week
  {
    id: 'conv_039',
    agentInstanceId: 'inst_002',
    employeeId: 'emp_008',
    employeeName: 'Alex Wong',
    startedAt: '2025-12-20T10:00:00Z',
    lastMessageAt: '2025-12-20T10:45:00Z',
    status: 'completed',
    messages: [
      { id: 'msg_039_01', conversationId: 'conv_039', senderType: 'agent', content: "Welcome to Acme, Alex! How's your first week going?", createdAt: '2025-12-20T10:00:00Z' },
      { id: 'msg_039_02', conversationId: 'conv_039', senderType: 'employee', content: "A bit overwhelming but in a good way! So much to learn.", createdAt: '2025-12-20T10:12:00Z' },
      { id: 'msg_039_03', conversationId: 'conv_039', senderType: 'agent', content: "That's totally normal! Do you have everything you need?", createdAt: '2025-12-20T10:13:00Z' },
      { id: 'msg_039_04', conversationId: 'conv_039', senderType: 'employee', content: "Laptop arrived, accounts are mostly set up. Team's been welcoming.", createdAt: '2025-12-20T10:35:00Z' },
      { id: 'msg_039_05', conversationId: 'conv_039', senderType: 'agent', content: "Glad to hear! Reach out if you need anything. Enjoy the holiday break!", createdAt: '2025-12-20T10:45:00Z' },
    ],
    summary: { sentiment: 'positive', sentimentScore: 0.68, engagementScore: 0.82, tags: ['onboarding', 'first_week', 'positive_start'], actionItems: [], riskLevel: 'low' },
  },
  // Tom Wilson - January
  {
    id: 'conv_040',
    agentInstanceId: 'inst_006',
    employeeId: 'emp_006',
    employeeName: 'Tom Wilson',
    startedAt: '2026-01-31T09:00:00Z',
    lastMessageAt: '2026-01-31T09:50:00Z',
    status: 'completed',
    messages: [
      { id: 'msg_040_01', conversationId: 'conv_040', senderType: 'agent', content: "Hey Tom! End of January - how did sales do?", createdAt: '2026-01-31T09:00:00Z' },
      { id: 'msg_040_02', conversationId: 'conv_040', senderType: 'employee', content: "Solid month. Team hit 95% of target.", createdAt: '2026-01-31T09:15:00Z' },
      { id: 'msg_040_03', conversationId: 'conv_040', senderType: 'agent', content: "Nearly there! What held you back from 100%?", createdAt: '2026-01-31T09:16:00Z' },
      { id: 'msg_040_04', conversationId: 'conv_040', senderType: 'employee', content: "One deal slipped to February. Should close this week.", createdAt: '2026-01-31T09:40:00Z' },
      { id: 'msg_040_05', conversationId: 'conv_040', senderType: 'agent', content: "Fingers crossed! February's off to a good start then.", createdAt: '2026-01-31T09:50:00Z' },
    ],
    summary: { sentiment: 'positive', sentimentScore: 0.58, engagementScore: 0.75, tags: ['sales_target', 'pipeline', 'Q1'], actionItems: [], riskLevel: 'low' },
  },
  // Maria Lopez - January (before trouble)
  {
    id: 'conv_041',
    agentInstanceId: 'inst_001',
    employeeId: 'emp_003',
    employeeName: 'Maria Lopez',
    startedAt: '2026-01-24T09:00:00Z',
    lastMessageAt: '2026-01-24T09:45:00Z',
    status: 'completed',
    messages: [
      { id: 'msg_041_01', conversationId: 'conv_041', senderType: 'agent', content: "Hi Maria! How's sales going?", createdAt: '2026-01-24T09:00:00Z' },
      { id: 'msg_041_02', conversationId: 'conv_041', senderType: 'employee', content: "Mixed. Some good leads but also some no-shows.", createdAt: '2026-01-24T09:15:00Z' },
      { id: 'msg_041_03', conversationId: 'conv_041', senderType: 'agent', content: "No-shows are frustrating. How do you handle them?", createdAt: '2026-01-24T09:16:00Z' },
      { id: 'msg_041_04', conversationId: 'conv_041', senderType: 'employee', content: "Try to reschedule, stay positive. It's just part of sales.", createdAt: '2026-01-24T09:40:00Z' },
      { id: 'msg_041_05', conversationId: 'conv_041', senderType: 'agent', content: "Resilience is key. Keep at it!", createdAt: '2026-01-24T09:45:00Z' },
    ],
    summary: { sentiment: 'neutral', sentimentScore: 0.25, engagementScore: 0.70, tags: ['sales', 'resilience', 'pipeline'], actionItems: [], riskLevel: 'low' },
  },
  // Emily Davis - January
  {
    id: 'conv_042',
    agentInstanceId: 'inst_001',
    employeeId: 'emp_005',
    employeeName: 'Emily Davis',
    startedAt: '2026-01-24T09:00:00Z',
    lastMessageAt: '2026-01-24T09:50:00Z',
    status: 'completed',
    messages: [
      { id: 'msg_042_01', conversationId: 'conv_042', senderType: 'agent', content: "Hi Emily! How's your week?", createdAt: '2026-01-24T09:00:00Z' },
      { id: 'msg_042_02', conversationId: 'conv_042', senderType: 'employee', content: "Productive! Design reviews are going well.", createdAt: '2026-01-24T09:15:00Z' },
      { id: 'msg_042_03', conversationId: 'conv_042', senderType: 'agent', content: "Great! Any cross-functional friction?", createdAt: '2026-01-24T09:16:00Z' },
      { id: 'msg_042_04', conversationId: 'conv_042', senderType: 'employee', content: "Less than before. The new process is helping.", createdAt: '2026-01-24T09:40:00Z' },
      { id: 'msg_042_05', conversationId: 'conv_042', senderType: 'agent', content: "Progress! Keep iterating.", createdAt: '2026-01-24T09:50:00Z' },
    ],
    summary: { sentiment: 'positive', sentimentScore: 0.65, engagementScore: 0.75, tags: ['design_reviews', 'process_improvement'], actionItems: [], riskLevel: 'low' },
  },
  // Mike Johnson - December
  {
    id: 'conv_043',
    agentInstanceId: 'inst_001',
    employeeId: 'emp_004',
    employeeName: 'Mike Johnson',
    startedAt: '2025-12-20T09:00:00Z',
    lastMessageAt: '2025-12-20T09:50:00Z',
    status: 'completed',
    messages: [
      { id: 'msg_043_01', conversationId: 'conv_043', senderType: 'agent', content: "Hey Mike! Year-end pulse check. How are you?", createdAt: '2025-12-20T09:00:00Z' },
      { id: 'msg_043_02', conversationId: 'conv_043', senderType: 'employee', content: "Tired but proud. The team delivered a lot this year.", createdAt: '2025-12-20T09:15:00Z' },
      { id: 'msg_043_03', conversationId: 'conv_043', senderType: 'agent', content: "Reflection is healthy. Any learnings for next year?", createdAt: '2025-12-20T09:16:00Z' },
      { id: 'msg_043_04', conversationId: 'conv_043', senderType: 'employee', content: "Better estimation. We overcommitted on a few things.", createdAt: '2025-12-20T09:40:00Z' },
      { id: 'msg_043_05', conversationId: 'conv_043', senderType: 'agent', content: "Good insight. Enjoy the break!", createdAt: '2025-12-20T09:50:00Z' },
    ],
    summary: { sentiment: 'neutral', sentimentScore: 0.42, engagementScore: 0.78, tags: ['year_end', 'reflection', 'estimation'], actionItems: [], riskLevel: 'low' },
  },
  // Jennifer Lee - December
  {
    id: 'conv_044',
    agentInstanceId: 'inst_001',
    employeeId: 'emp_009',
    employeeName: 'Jennifer Lee',
    startedAt: '2025-12-18T09:00:00Z',
    lastMessageAt: '2025-12-18T09:45:00Z',
    status: 'completed',
    messages: [
      { id: 'msg_044_01', conversationId: 'conv_044', senderType: 'agent', content: "Hi Jennifer! End of year - how are you feeling?", createdAt: '2025-12-18T09:00:00Z' },
      { id: 'msg_044_02', conversationId: 'conv_044', senderType: 'employee', content: "Ready for a break! It's been a demanding year for HR.", createdAt: '2025-12-18T09:15:00Z' },
      { id: 'msg_044_03', conversationId: 'conv_044', senderType: 'agent', content: "HR burnout is real. Any vacation planned?", createdAt: '2025-12-18T09:16:00Z' },
      { id: 'msg_044_04', conversationId: 'conv_044', senderType: 'employee', content: "Taking the whole week between Christmas and New Year.", createdAt: '2025-12-18T09:35:00Z' },
      { id: 'msg_044_05', conversationId: 'conv_044', senderType: 'agent', content: "Well deserved! Disconnect and recharge.", createdAt: '2025-12-18T09:45:00Z' },
    ],
    summary: { sentiment: 'neutral', sentimentScore: 0.35, engagementScore: 0.75, tags: ['hr_burnout', 'vacation', 'year_end'], actionItems: [], riskLevel: 'low' },
  },
  // Chris Martin - January
  {
    id: 'conv_045',
    agentInstanceId: 'inst_005',
    employeeId: 'emp_010',
    employeeName: 'Chris Martin',
    startedAt: '2026-01-30T09:00:00Z',
    lastMessageAt: '2026-01-30T09:45:00Z',
    status: 'completed',
    messages: [
      { id: 'msg_045_01', conversationId: 'conv_045', senderType: 'agent', content: "Hey Chris! How's frontend land?", createdAt: '2026-01-30T09:00:00Z' },
      { id: 'msg_045_02', conversationId: 'conv_045', senderType: 'employee', content: "Exciting! Working on some performance optimizations.", createdAt: '2026-01-30T09:15:00Z' },
      { id: 'msg_045_03', conversationId: 'conv_045', senderType: 'agent', content: "Speed is king! What metrics are you targeting?", createdAt: '2026-01-30T09:16:00Z' },
      { id: 'msg_045_04', conversationId: 'conv_045', senderType: 'employee', content: "LCP under 2 seconds. We're close!", createdAt: '2026-01-30T09:40:00Z' },
      { id: 'msg_045_05', conversationId: 'conv_045', senderType: 'agent', content: "Nice target! Ship it!", createdAt: '2026-01-30T09:45:00Z' },
    ],
    summary: { sentiment: 'positive', sentimentScore: 0.72, engagementScore: 0.78, tags: ['performance', 'frontend', 'LCP'], actionItems: [], riskLevel: 'low' },
  },
  // Nicole Anderson - January
  {
    id: 'conv_046',
    agentInstanceId: 'inst_005',
    employeeId: 'emp_015',
    employeeName: 'Nicole Anderson',
    startedAt: '2026-01-30T09:00:00Z',
    lastMessageAt: '2026-01-30T09:50:00Z',
    status: 'completed',
    messages: [
      { id: 'msg_046_01', conversationId: 'conv_046', senderType: 'agent', content: "Hey Nicole! QA update?", createdAt: '2026-01-30T09:00:00Z' },
      { id: 'msg_046_02', conversationId: 'conv_046', senderType: 'employee', content: "Good week! Test coverage is up to 78%.", createdAt: '2026-01-30T09:15:00Z' },
      { id: 'msg_046_03', conversationId: 'conv_046', senderType: 'agent', content: "Nice progress! What's the target?", createdAt: '2026-01-30T09:16:00Z' },
      { id: 'msg_046_04', conversationId: 'conv_046', senderType: 'employee', content: "85% by end of Q1. Doable if we stay focused.", createdAt: '2026-01-30T09:40:00Z' },
      { id: 'msg_046_05', conversationId: 'conv_046', senderType: 'agent', content: "You're on track. Keep pushing!", createdAt: '2026-01-30T09:50:00Z' },
    ],
    summary: { sentiment: 'positive', sentimentScore: 0.68, engagementScore: 0.75, tags: ['test_coverage', 'QA', 'goals'], actionItems: [], riskLevel: 'low' },
  },
  // Kevin Taylor - December
  {
    id: 'conv_047',
    agentInstanceId: 'inst_001',
    employeeId: 'emp_012',
    employeeName: 'Kevin Taylor',
    startedAt: '2025-12-19T09:00:00Z',
    lastMessageAt: '2025-12-19T09:45:00Z',
    status: 'completed',
    messages: [
      { id: 'msg_047_01', conversationId: 'conv_047', senderType: 'agent', content: "Hey Kevin! Year-end - how's finance wrapping up?", createdAt: '2025-12-19T09:00:00Z' },
      { id: 'msg_047_02', conversationId: 'conv_047', senderType: 'employee', content: "Busy with year-end close but we're on schedule.", createdAt: '2025-12-19T09:15:00Z' },
      { id: 'msg_047_03', conversationId: 'conv_047', senderType: 'agent', content: "Finance year-end is no joke. Team holding up?", createdAt: '2025-12-19T09:16:00Z' },
      { id: 'msg_047_04', conversationId: 'conv_047', senderType: 'employee', content: "Lisa has been a rockstar. Couldn't do it without her.", createdAt: '2025-12-19T09:40:00Z' },
      { id: 'msg_047_05', conversationId: 'conv_047', senderType: 'agent', content: "Great to have dependable team members. Enjoy the holidays!", createdAt: '2025-12-19T09:45:00Z' },
    ],
    summary: { sentiment: 'positive', sentimentScore: 0.62, engagementScore: 0.72, tags: ['year_end_close', 'team_recognition'], actionItems: [], riskLevel: 'low' },
  },
  // Lisa Park - December
  {
    id: 'conv_048',
    agentInstanceId: 'inst_001',
    employeeId: 'emp_007',
    employeeName: 'Lisa Park',
    startedAt: '2025-12-18T09:00:00Z',
    lastMessageAt: '2025-12-18T09:45:00Z',
    status: 'completed',
    messages: [
      { id: 'msg_048_01', conversationId: 'conv_048', senderType: 'agent', content: "Hi Lisa! Year-end push - how's it going?", createdAt: '2025-12-18T09:00:00Z' },
      { id: 'msg_048_02', conversationId: 'conv_048', senderType: 'employee', content: "Long hours but we're getting it done!", createdAt: '2025-12-18T09:15:00Z' },
      { id: 'msg_048_03', conversationId: 'conv_048', senderType: 'agent', content: "Year-end close is intense. Any support you need?", createdAt: '2025-12-18T09:16:00Z' },
      { id: 'msg_048_04', conversationId: 'conv_048', senderType: 'employee', content: "Kevin's been great. Learning a lot from him.", createdAt: '2025-12-18T09:40:00Z' },
      { id: 'msg_048_05', conversationId: 'conv_048', senderType: 'agent', content: "Good mentorship is invaluable. You'll get through it!", createdAt: '2025-12-18T09:45:00Z' },
    ],
    summary: { sentiment: 'positive', sentimentScore: 0.55, engagementScore: 0.75, tags: ['year_end_close', 'mentorship', 'learning'], actionItems: [], riskLevel: 'low' },
  },
  // David Kim - 360 feedback for Emily
  {
    id: 'conv_049',
    agentInstanceId: 'inst_004',
    employeeId: 'emp_002',
    employeeName: 'David Kim',
    startedAt: '2026-02-10T09:00:00Z',
    lastMessageAt: '2026-02-10T09:50:00Z',
    status: 'completed',
    messages: [
      { id: 'msg_049_01', conversationId: 'conv_049', senderType: 'agent', content: "Hi David! We're collecting feedback about your manager Emily. How would you describe working with her?", createdAt: '2026-02-10T09:00:00Z' },
      { id: 'msg_049_02', conversationId: 'conv_049', senderType: 'employee', content: "Emily is fantastic. She's a strong advocate for the design team.", createdAt: '2026-02-10T09:15:00Z' },
      { id: 'msg_049_03', conversationId: 'conv_049', senderType: 'agent', content: "Great to hear! Any areas for improvement?", createdAt: '2026-02-10T09:16:00Z' },
      { id: 'msg_049_04', conversationId: 'conv_049', senderType: 'employee', content: "Sometimes she takes on too much herself. Could delegate more.", createdAt: '2026-02-10T09:40:00Z' },
      { id: 'msg_049_05', conversationId: 'conv_049', senderType: 'agent', content: "Good constructive feedback. Thank you!", createdAt: '2026-02-10T09:50:00Z' },
    ],
    summary: { sentiment: 'positive', sentimentScore: 0.72, engagementScore: 0.80, tags: ['manager_feedback', 'advocacy', 'delegation'], actionItems: ['Consider delegation coaching for Emily'], riskLevel: 'low' },
  },
  // Rachel Green - 360 feedback for Nicole
  {
    id: 'conv_050',
    agentInstanceId: 'inst_004',
    employeeId: 'emp_011',
    employeeName: 'Rachel Green',
    startedAt: '2026-02-09T09:00:00Z',
    lastMessageAt: '2026-02-09T09:45:00Z',
    status: 'completed',
    messages: [
      { id: 'msg_050_01', conversationId: 'conv_050', senderType: 'agent', content: "Hi Rachel! We're gathering feedback about Nicole as a leader. Your thoughts?", createdAt: '2026-02-09T09:00:00Z' },
      { id: 'msg_050_02', conversationId: 'conv_050', senderType: 'employee', content: "Nicole is amazing. She really cares about customer outcomes.", createdAt: '2026-02-09T09:15:00Z' },
      { id: 'msg_050_03', conversationId: 'conv_050', senderType: 'agent', content: "That passion shows! Any growth areas?", createdAt: '2026-02-09T09:16:00Z' },
      { id: 'msg_050_04', conversationId: 'conv_050', senderType: 'employee', content: "She could be more decisive sometimes. Likes to get consensus but it slows things down.", createdAt: '2026-02-09T09:40:00Z' },
      { id: 'msg_050_05', conversationId: 'conv_050', senderType: 'agent', content: "Helpful insight. Thanks Rachel!", createdAt: '2026-02-09T09:45:00Z' },
    ],
    summary: { sentiment: 'positive', sentimentScore: 0.65, engagementScore: 0.78, tags: ['manager_feedback', 'customer_focus', 'decisiveness'], actionItems: ['Decisiveness coaching for Nicole'], riskLevel: 'low' },
  },
  // Alex Wong - 360 feedback for Mike
  {
    id: 'conv_051',
    agentInstanceId: 'inst_004',
    employeeId: 'emp_008',
    employeeName: 'Alex Wong',
    startedAt: '2026-02-10T09:00:00Z',
    lastMessageAt: '2026-02-10T09:45:00Z',
    status: 'completed',
    messages: [
      { id: 'msg_051_01', conversationId: 'conv_051', senderType: 'agent', content: "Hi Alex! As a newer team member, how's working with Mike as your manager?", createdAt: '2026-02-10T09:00:00Z' },
      { id: 'msg_051_02', conversationId: 'conv_051', senderType: 'employee', content: "Mike is great! Very supportive during onboarding.", createdAt: '2026-02-10T09:15:00Z' },
      { id: 'msg_051_03', conversationId: 'conv_051', senderType: 'agent', content: "Good to hear! Any room for improvement?", createdAt: '2026-02-10T09:16:00Z' },
      { id: 'msg_051_04', conversationId: 'conv_051', senderType: 'employee', content: "He's very busy so 1:1s sometimes get rescheduled. But understandable.", createdAt: '2026-02-10T09:40:00Z' },
      { id: 'msg_051_05', conversationId: 'conv_051', senderType: 'agent', content: "Thanks for sharing! Your feedback helps.", createdAt: '2026-02-10T09:45:00Z' },
    ],
    summary: { sentiment: 'positive', sentimentScore: 0.55, engagementScore: 0.75, tags: ['manager_feedback', 'onboarding_support', '1_on_1_consistency'], actionItems: ['Encourage consistent 1:1s'], riskLevel: 'low' },
  },
  // Maria Lopez - Even earlier (shows pattern of declining sentiment)
  {
    id: 'conv_052',
    agentInstanceId: 'inst_001',
    employeeId: 'emp_003',
    employeeName: 'Maria Lopez',
    startedAt: '2026-01-17T09:00:00Z',
    lastMessageAt: '2026-01-17T09:50:00Z',
    status: 'completed',
    messages: [
      { id: 'msg_052_01', conversationId: 'conv_052', senderType: 'agent', content: "Hi Maria! New year, new energy! How's sales?", createdAt: '2026-01-17T09:00:00Z' },
      { id: 'msg_052_02', conversationId: 'conv_052', senderType: 'employee', content: "Optimistic! Got some good leads in the pipeline.", createdAt: '2026-01-17T09:15:00Z' },
      { id: 'msg_052_03', conversationId: 'conv_052', senderType: 'agent', content: "Great energy! What's your strategy this quarter?", createdAt: '2026-01-17T09:16:00Z' },
      { id: 'msg_052_04', conversationId: 'conv_052', senderType: 'employee', content: "Focus on enterprise accounts. That's where the growth is.", createdAt: '2026-01-17T09:40:00Z' },
      { id: 'msg_052_05', conversationId: 'conv_052', senderType: 'agent', content: "Smart move! Good luck!", createdAt: '2026-01-17T09:50:00Z' },
    ],
    summary: { sentiment: 'positive', sentimentScore: 0.72, engagementScore: 0.80, tags: ['sales', 'enterprise', 'optimism'], actionItems: [], riskLevel: 'low' },
  },
]

// =============================================================================
// COMBINE ALL CONVERSATIONS
// =============================================================================

export const STATIC_CONVERSATIONS: Conversation[] = [
  ...SARAH_CONVERSATIONS,
  ...OTHER_CONVERSATIONS,
  ...HISTORICAL_CONVERSATIONS,
  ...ADDITIONAL_CONVERSATIONS,
  ...MORE_CONVERSATIONS,
]

// =============================================================================
// DEMO USER CONTEXTS
// =============================================================================

export type DemoRole = 'owner' | 'admin' | 'hr_manager' | 'manager' | 'employee' | 'member'

export interface DemoUserContext {
  userId: string
  employeeId: string | null
  companyId: string
  role: DemoRole
  email: string
  fullName: string
  companyName: string
  isAdmin: boolean
}

// Admin user (sees everything)
export const ADMIN_CONTEXT: DemoUserContext = {
  userId: ADMIN_USER_ID,
  employeeId: null, // Admin is not in STATIC_EMPLOYEES
  companyId: DEMO_COMPANY_ID,
  role: 'owner',
  email: 'demo@acme.com',
  fullName: 'Demo Admin',
  companyName: 'Acme Technologies',
  isAdmin: true,
}

// Sarah Chen - Employee view
export const SARAH_CONTEXT: DemoUserContext = {
  userId: SARAH_USER_ID,
  employeeId: 'emp_001',
  companyId: DEMO_COMPANY_ID,
  role: 'member',
  email: 'sarah.chen@acme.com',
  fullName: 'Sarah Chen',
  companyName: 'Acme Technologies',
  isAdmin: false,
}

// Map of demo users
export const DEMO_USERS: Record<string, DemoUserContext> = {
  'demo@acme.com': ADMIN_CONTEXT,
  'demo@paypilot.com': ADMIN_CONTEXT,
  'sarah.chen@acme.com': SARAH_CONTEXT,
  'sarah@acme.com': SARAH_CONTEXT,
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get demo context by email
 */
export function getDemoContextByEmail(email: string): DemoUserContext | null {
  return DEMO_USERS[email.toLowerCase()] || null
}

/**
 * Check if role is admin-level
 */
export function isAdminRole(role: DemoRole): boolean {
  return ['owner', 'admin', 'hr_manager'].includes(role)
}

/**
 * Get conversations for a specific user (RBAC-aware)
 * Admin sees ALL conversations
 * Employee sees ONLY their own conversations
 */
export function getConversationsForUser(userId: string, isAdmin: boolean): Conversation[] {
  if (isAdmin) {
    return STATIC_CONVERSATIONS
  }

  // Find employee by userId
  const employee = STATIC_EMPLOYEES.find(e => e.userId === userId)
  if (!employee) {
    return []
  }

  // Return only conversations for this employee
  return STATIC_CONVERSATIONS.filter(c => c.employeeId === employee.id)
}

/**
 * Get conversation by ID (RBAC-aware)
 */
export function getConversationById(
  conversationId: string,
  userId: string,
  isAdmin: boolean
): Conversation | null {
  const conv = STATIC_CONVERSATIONS.find(c => c.id === conversationId)
  if (!conv) return null

  // Admin can see everything
  if (isAdmin) return conv

  // Find employee by userId
  const employee = STATIC_EMPLOYEES.find(e => e.userId === userId)
  if (!employee) return null

  // Check if this conversation belongs to the employee
  if (conv.employeeId !== employee.id) {
    return null // Access denied
  }

  return conv
}

/**
 * Get messages for a conversation
 * Messages are inline in the conversation object - no separate lookup needed
 */
export function getMessagesForConversation(conversationId: string): Message[] {
  const conv = STATIC_CONVERSATIONS.find(c => c.id === conversationId)
  return conv?.messages || []
}

/**
 * Search employees by query
 */
export function searchEmployees(query: string, limit: number = 15): Employee[] {
  if (!query || query.length < 2) return []

  const q = query.toLowerCase()

  return STATIC_EMPLOYEES
    .filter(emp =>
      emp.name.toLowerCase().includes(q) ||
      emp.email.toLowerCase().includes(q) ||
      emp.department.toLowerCase().includes(q) ||
      emp.title.toLowerCase().includes(q)
    )
    .slice(0, limit)
}

/**
 * Get agent instance by ID
 */
export function getAgentInstanceById(instanceId: string): AgentInstance | undefined {
  return STATIC_AGENT_INSTANCES.find(i => i.id === instanceId)
}

/**
 * Get agent template for an instance
 */
export function getAgentTemplateForInstance(instance: AgentInstance) {
  return AGENT_TEMPLATES.find(t => t.id === instance.agentType)
}

/**
 * Get the last message content for a conversation (for preview)
 */
export function getLastMessagePreview(conversationId: string): string {
  const conv = STATIC_CONVERSATIONS.find(c => c.id === conversationId)
  if (!conv || conv.messages.length === 0) return 'No messages yet'
  return conv.messages[conv.messages.length - 1].content
}

// =============================================================================
// AGGREGATED ANALYTICS (hardcoded realistic data)
// =============================================================================

export interface AgentAnalytics {
  totalConversations: number
  activeConversations: number
  completedConversations: number
  escalatedConversations: number
  responseRate: number
  avgSentimentScore: number
  sentimentDistribution: {
    positive: number
    neutral: number
    negative: number
    mixed: number
  }
  topTags: Array<{ tag: string; count: number }>
  actionItemsCount: number
  riskDistribution: {
    low: number
    moderate: number
    high: number
  }
}

export function getAgentAnalytics(agentInstanceId?: string): AgentAnalytics {
  const relevantConversations = agentInstanceId
    ? STATIC_CONVERSATIONS.filter(c => c.agentInstanceId === agentInstanceId)
    : STATIC_CONVERSATIONS

  const sentimentDistribution = {
    positive: relevantConversations.filter(c => c.summary.sentiment === 'positive').length,
    neutral: relevantConversations.filter(c => c.summary.sentiment === 'neutral').length,
    negative: relevantConversations.filter(c => c.summary.sentiment === 'negative').length,
    mixed: relevantConversations.filter(c => c.summary.sentiment === 'mixed').length,
  }

  const riskDistribution = {
    low: relevantConversations.filter(c => c.summary.riskLevel === 'low').length,
    moderate: relevantConversations.filter(c => c.summary.riskLevel === 'moderate').length,
    high: relevantConversations.filter(c => c.summary.riskLevel === 'high').length,
  }

  // Count tags
  const tagCounts: Record<string, number> = {}
  for (const conv of relevantConversations) {
    for (const tag of conv.summary.tags) {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1
    }
  }

  const topTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([tag, count]) => ({ tag, count }))

  const avgSentiment = relevantConversations.length > 0
    ? relevantConversations.reduce((sum, c) => sum + c.summary.sentimentScore, 0) / relevantConversations.length
    : 0

  const totalActionItems = relevantConversations.reduce(
    (sum, c) => sum + c.summary.actionItems.length,
    0
  )

  return {
    totalConversations: relevantConversations.length,
    activeConversations: relevantConversations.filter(c => c.status === 'active').length,
    completedConversations: relevantConversations.filter(c => c.status === 'completed').length,
    escalatedConversations: relevantConversations.filter(c => c.status === 'escalated').length,
    responseRate: 0.78, // Hardcoded realistic value
    avgSentimentScore: avgSentiment,
    sentimentDistribution,
    topTags,
    actionItemsCount: totalActionItems,
    riskDistribution,
  }
}

/**
 * Get analytics for a specific agent instance
 */
export function getInstanceAnalytics(instanceId: string) {
  const instance = getAgentInstanceById(instanceId)
  if (!instance) return null

  const analytics = getAgentAnalytics(instanceId)

  return {
    instance,
    analytics,
    template: getAgentTemplateForInstance(instance),
  }
}

// =============================================================================
// HARDCODED AGENT PAGE STATS (non-zero realistic data)
// =============================================================================

export const AGENT_PAGE_STATS = {
  totalAgents: STATIC_AGENT_INSTANCES.length,
  activeAgents: STATIC_AGENT_INSTANCES.filter(i => i.status === 'active').length,
  pausedAgents: STATIC_AGENT_INSTANCES.filter(i => i.status === 'paused').length,
  totalConversations: STATIC_CONVERSATIONS.length,
  avgResponseRate: 0.78,
  avgSentiment: 0.42,
  thisWeekConversations: 24,
  lastWeekConversations: 31,
  conversationTrend: -22.5, // percent change
  escalationsThisMonth: 1,
  pendingActionItems: 12,
  topPerformingAgent: 'Weekly Pulse Check',
  agentTypeDistribution: {
    pulse_check: 3,
    onboarding: 2,
    exit_interview: 1,
    manager_360: 2,
  },
}
