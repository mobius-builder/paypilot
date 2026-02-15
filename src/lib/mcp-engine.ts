/**
 * MCP Engine - Simulated Multi-Channel Orchestration Engine
 *
 * This module handles agent execution in demo mode.
 * Architecture is designed to be replaced with real LLM streaming later.
 */

import { DEMO_COMPANY_ID, DEMO_EMPLOYEES, addDemoMessage } from './demo-context'
import { STATIC_FEEDBACK_SUMMARIES } from './agent-demo-data'

// Agent instance type
export interface AgentInstance {
  id: string
  company_id: string
  agent_id: string
  name: string
  tone: string
  audience_type: 'all' | 'department' | 'specific'
  config: Record<string, unknown>
  status: 'active' | 'paused' | 'draft'
  created_by: string
  created_at: string
}

// Agent target - who receives the agent
export interface AgentTarget {
  id: string
  agent_instance_id: string
  employee_id: string
}

// Agent schedule
export interface AgentSchedule {
  id: string
  agent_instance_id: string
  cadence: 'once' | 'daily' | 'weekly' | 'biweekly' | 'monthly'
  cron_expression?: string
  timezone: string
  next_run_at: string
  last_run_at?: string
}

// Conversation
export interface Conversation {
  id: string
  company_id: string
  agent_instance_id: string
  employee_id: string
  participant_user_id: string
  status: 'active' | 'completed' | 'escalated'
  started_at: string
  last_message_at: string
  unread_count: number
  message_count: number
}

// Base prompts for different agent types
const AGENT_BASE_PROMPTS: Record<string, string> = {
  pulse_check: "You are a friendly HR assistant conducting a pulse check. Ask about workload, wellbeing, and any blockers. Keep responses short and empathetic.",
  onboarding: "You are a welcoming onboarding assistant helping new employees get settled. Ask about their experience, equipment needs, and team integration.",
  exit_interview: "You are conducting a thoughtful exit interview. Ask about reasons for leaving, feedback on management, and suggestions for improvement.",
  manager_coaching: "You are a supportive coaching assistant for managers. Discuss team dynamics, leadership challenges, and development opportunities.",
}

// First message templates by agent type and tone
const FIRST_MESSAGES: Record<string, Record<string, string>> = {
  pulse_check: {
    poke_lite: "Hey! Quick check - how's your week going? 🙂",
    friendly_peer: "Hi there! Just wanted to check in - how are things going for you this week?",
    professional_hr: "Good day! I'm reaching out to understand how your week has been going. How are you feeling about your workload?",
    witty_but_safe: "Hey! Time for our weekly vibe check. On a scale of 'living the dream' to 'send coffee', where are we today?",
  },
  onboarding: {
    poke_lite: "Welcome aboard! How's your first day going? 🎉",
    friendly_peer: "Hey, welcome to the team! How are you settling in so far?",
    professional_hr: "Welcome to the company! I'm here to help you get started. How has your onboarding experience been?",
    witty_but_safe: "Welcome to the crew! Ready to change the world (or at least get your laptop working)?",
  },
  exit_interview: {
    poke_lite: "Hey, sorry to see you go! Mind sharing what led to your decision?",
    friendly_peer: "Hi there. I know you're moving on, and I wanted to chat about your experience here. What's been on your mind?",
    professional_hr: "Thank you for taking the time to speak with me. As you transition, I'd like to understand your experience. What factors contributed to your decision to leave?",
    witty_but_safe: "So, you're breaking up with us... We promise not to cry. What made you swipe left?",
  },
  manager_coaching: {
    poke_lite: "Hey! How's the team doing? Any wins or challenges lately?",
    friendly_peer: "Hi! Just checking in on how things are going with your team. What's top of mind for you?",
    professional_hr: "Hello! I'd like to discuss your team's progress. What leadership challenges or opportunities are you currently navigating?",
    witty_but_safe: "Captain! How's the ship sailing? Any mutinies we should know about? 🏴‍☠️",
  },
}

// Generate a unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Get employee by ID
function getEmployeeById(employeeId: string) {
  return DEMO_EMPLOYEES.find(e => e.id === employeeId)
}

// In-memory stores for demo mode
const agentInstanceStore: Map<string, AgentInstance> = new Map()
const agentTargetStore: Map<string, AgentTarget[]> = new Map()
const agentScheduleStore: Map<string, AgentSchedule> = new Map()
const conversationStore: Map<string, Conversation> = new Map()

/**
 * Create a new agent instance
 */
export function createAgentInstance(params: {
  agent_id: string
  name: string
  tone: string
  audience_type: 'all' | 'department' | 'specific'
  target_employee_ids?: string[]
  target_department?: string
  config?: Record<string, unknown>
  created_by: string
  schedule?: {
    cadence: 'once' | 'daily' | 'weekly' | 'biweekly' | 'monthly'
    timezone?: string
  }
}): AgentInstance {
  const instanceId = `inst-${generateId()}`
  const now = new Date().toISOString()

  const instance: AgentInstance = {
    id: instanceId,
    company_id: DEMO_COMPANY_ID,
    agent_id: params.agent_id,
    name: params.name,
    tone: params.tone,
    audience_type: params.audience_type,
    config: params.config || {},
    status: 'active',
    created_by: params.created_by,
    created_at: now,
  }

  agentInstanceStore.set(instanceId, instance)

  // Create agent targets
  let targetEmployeeIds: string[] = []

  if (params.audience_type === 'all') {
    targetEmployeeIds = DEMO_EMPLOYEES.map(e => e.id)
  } else if (params.audience_type === 'department' && params.target_department) {
    targetEmployeeIds = DEMO_EMPLOYEES
      .filter(e => e.department === params.target_department)
      .map(e => e.id)
  } else if (params.audience_type === 'specific' && params.target_employee_ids) {
    targetEmployeeIds = params.target_employee_ids
  }

  const targets: AgentTarget[] = targetEmployeeIds.map(empId => ({
    id: `target-${generateId()}`,
    agent_instance_id: instanceId,
    employee_id: empId,
  }))

  agentTargetStore.set(instanceId, targets)

  // Create schedule if provided
  if (params.schedule) {
    const schedule: AgentSchedule = {
      id: `sched-${generateId()}`,
      agent_instance_id: instanceId,
      cadence: params.schedule.cadence,
      timezone: params.schedule.timezone || 'America/Los_Angeles',
      next_run_at: getNextRunTime(params.schedule.cadence),
    }
    agentScheduleStore.set(instanceId, schedule)
  }

  return instance
}

/**
 * Run an agent instance - creates conversations for all targets
 */
export function runAgentInstance(agentInstanceId: string): Conversation[] {
  const instance = agentInstanceStore.get(agentInstanceId)
  if (!instance) {
    throw new Error(`Agent instance not found: ${agentInstanceId}`)
  }

  const targets = agentTargetStore.get(agentInstanceId) || []
  const createdConversations: Conversation[] = []
  const now = new Date().toISOString()

  for (const target of targets) {
    const employee = getEmployeeById(target.employee_id)
    if (!employee) continue

    // Check for existing active conversation
    const existingConv = Array.from(conversationStore.values()).find(
      c => c.agent_instance_id === agentInstanceId &&
           c.employee_id === target.employee_id &&
           c.status === 'active'
    )

    if (existingConv) {
      // Don't create duplicate conversation
      continue
    }

    const conversationId = `conv-${generateId()}`

    const conversation: Conversation = {
      id: conversationId,
      company_id: DEMO_COMPANY_ID,
      agent_instance_id: agentInstanceId,
      employee_id: target.employee_id,
      participant_user_id: target.employee_id, // Employee is the participant
      status: 'active',
      started_at: now,
      last_message_at: now,
      unread_count: 1,
      message_count: 1,
    }

    conversationStore.set(conversationId, conversation)

    // Generate first message based on agent type and tone
    const agentType = instance.agent_id
    const tone = instance.tone || 'friendly_peer'
    const firstMessage = FIRST_MESSAGES[agentType]?.[tone] ||
                         FIRST_MESSAGES.pulse_check.friendly_peer

    // Add the first message
    addDemoMessage(conversationId, firstMessage, 'agent')

    createdConversations.push(conversation)
  }

  // Update schedule last_run_at
  const schedule = agentScheduleStore.get(agentInstanceId)
  if (schedule) {
    schedule.last_run_at = now
    schedule.next_run_at = getNextRunTime(schedule.cadence)
    agentScheduleStore.set(agentInstanceId, schedule)
  }

  return createdConversations
}

/**
 * Get all agent instances for a company
 */
export function getAgentInstances(companyId: string): AgentInstance[] {
  return Array.from(agentInstanceStore.values())
    .filter(i => i.company_id === companyId)
}

/**
 * Get conversations for a user (admin sees all, employee sees own)
 */
export function getConversations(params: {
  companyId: string
  userId: string
  isAdmin: boolean
}): Conversation[] {
  return Array.from(conversationStore.values())
    .filter(c => {
      if (c.company_id !== params.companyId) return false
      if (params.isAdmin) return true
      return c.participant_user_id === params.userId || c.employee_id === params.userId
    })
    .sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime())
}

/**
 * Get agent metrics for dashboard
 */
export function getAgentMetrics(agentInstanceId: string): {
  totalConversations: number
  activeConversations: number
  completedConversations: number
  avgSentimentScore: number
  escalationsCount: number
  participationRate: number
} {
  const conversations = Array.from(conversationStore.values())
    .filter(c => c.agent_instance_id === agentInstanceId)

  const targets = agentTargetStore.get(agentInstanceId) || []

  // Get summaries for sentiment
  const summaries = STATIC_FEEDBACK_SUMMARIES.filter(
    s => s.agent_instance_id === agentInstanceId
  )

  const avgSentiment = summaries.length > 0
    ? summaries.reduce((sum, s) => sum + s.sentiment_score, 0) / summaries.length
    : 0

  const escalations = summaries.filter(s => s.escalated).length

  return {
    totalConversations: conversations.length,
    activeConversations: conversations.filter(c => c.status === 'active').length,
    completedConversations: conversations.filter(c => c.status === 'completed').length,
    avgSentimentScore: avgSentiment,
    escalationsCount: escalations,
    participationRate: targets.length > 0 ? conversations.length / targets.length : 0,
  }
}

// Helper to calculate next run time
function getNextRunTime(cadence: string): string {
  const now = new Date()
  switch (cadence) {
    case 'daily':
      now.setDate(now.getDate() + 1)
      break
    case 'weekly':
      now.setDate(now.getDate() + 7)
      break
    case 'biweekly':
      now.setDate(now.getDate() + 14)
      break
    case 'monthly':
      now.setMonth(now.getMonth() + 1)
      break
    default:
      // 'once' - no next run
      break
  }
  return now.toISOString()
}

/**
 * Update agent instance status
 */
export function updateAgentInstanceStatus(
  instanceId: string,
  status: 'active' | 'paused' | 'draft'
): AgentInstance | null {
  const instance = agentInstanceStore.get(instanceId)
  if (!instance) return null

  instance.status = status
  agentInstanceStore.set(instanceId, instance)
  return instance
}

/**
 * Get agent targets for an instance
 */
export function getAgentTargets(agentInstanceId: string): AgentTarget[] {
  return agentTargetStore.get(agentInstanceId) || []
}

/**
 * Get schedule for an instance
 */
export function getAgentSchedule(agentInstanceId: string): AgentSchedule | null {
  return agentScheduleStore.get(agentInstanceId) || null
}
