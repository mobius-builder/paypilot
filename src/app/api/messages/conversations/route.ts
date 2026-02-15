import { NextRequest, NextResponse } from 'next/server'
import {
  STATIC_CONVERSATIONS,
  STATIC_AGENT_INSTANCES,
  STATIC_EMPLOYEES,
  type Conversation,
  type Message,
} from '@/lib/static-demo-data'

// In-memory store for new conversations (created during session)
let dynamicConversations: Conversation[] = []

// Helper to get all conversations (static + dynamic)
function getAllConversations(): Conversation[] {
  return [...STATIC_CONVERSATIONS, ...dynamicConversations]
}

// GET /api/messages/conversations - List all conversations
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const employeeId = searchParams.get('employeeId')
  const isAdmin = searchParams.get('isAdmin') === 'true'

  const allConversations = getAllConversations()

  // Filter based on role
  const filtered = isAdmin
    ? allConversations
    : allConversations.filter(c => c.employeeId === employeeId)

  // Sort by last message date
  const sorted = filtered.sort((a, b) =>
    new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
  )

  return NextResponse.json({
    conversations: sorted,
    total: sorted.length,
  })
}

// POST /api/messages/conversations - Create a new conversation
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { employeeId, agentInstanceId, mode, seedMessage } = body

  // Validate required fields
  if (!employeeId) {
    return NextResponse.json({ error: 'employeeId is required' }, { status: 400 })
  }

  // Find employee
  const employee = STATIC_EMPLOYEES.find(e => e.id === employeeId)
  if (!employee) {
    return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
  }

  // Find or default agent instance
  let agentInstance = STATIC_AGENT_INSTANCES.find(a => a.id === agentInstanceId)
  if (!agentInstance) {
    // Use first active agent as default
    agentInstance = STATIC_AGENT_INSTANCES.find(a => a.status === 'active')
  }

  if (!agentInstance) {
    return NextResponse.json({ error: 'No active agent instance available' }, { status: 400 })
  }

  // Generate unique ID
  const conversationId = `conv_new_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const now = new Date().toISOString()

  // Create initial messages
  const messages: Message[] = []

  // Agent greeting
  const greetingMessage: Message = {
    id: `msg_${conversationId}_001`,
    conversationId,
    senderType: 'agent',
    content: getAgentGreeting(agentInstance.agentType, employee.name.split(' ')[0]),
    createdAt: now,
  }
  messages.push(greetingMessage)

  // Optional seed message from employee
  if (seedMessage && seedMessage.trim()) {
    const seedMsg: Message = {
      id: `msg_${conversationId}_002`,
      conversationId,
      senderType: 'employee',
      content: seedMessage.trim(),
      createdAt: new Date(Date.now() + 1000).toISOString(),
    }
    messages.push(seedMsg)
  }

  // Create conversation
  const newConversation: Conversation = {
    id: conversationId,
    agentInstanceId: agentInstance.id,
    employeeId: employee.id,
    employeeName: employee.name,
    startedAt: now,
    lastMessageAt: messages[messages.length - 1].createdAt,
    status: 'active',
    messages,
    summary: {
      sentiment: 'neutral',
      sentimentScore: 0,
      engagementScore: 0,
      tags: [],
      actionItems: [],
      riskLevel: 'low',
    },
  }

  // Add to dynamic store
  dynamicConversations.push(newConversation)

  return NextResponse.json({
    success: true,
    conversation: newConversation,
    message: `Conversation started with ${employee.name}`,
  })
}

// Helper to generate agent greeting based on type
function getAgentGreeting(agentType: string, firstName: string): string {
  const greetings: Record<string, string> = {
    pulse_check: `Hi ${firstName}! 👋 I'm checking in to see how things are going. How's your week been so far?`,
    onboarding: `Welcome ${firstName}! I'm here to help you get settled in. How are you finding your first days so far?`,
    exit_interview: `Hi ${firstName}, thank you for taking the time to chat with me. I'd love to hear about your experience here.`,
    manager_360: `Hi ${firstName}! I'm collecting some feedback to help support your team. Your input is confidential and valued.`,
    chat_agent: `Hi ${firstName}! 👋 I'm your HR assistant. Feel free to ask me anything about policies, benefits, or just chat about how things are going.`,
  }

  return greetings[agentType] || `Hi ${firstName}! How can I help you today?`
}

// Export for use in other routes
export function getConversationById(id: string): Conversation | undefined {
  return getAllConversations().find(c => c.id === id)
}

export function addMessageToConversation(conversationId: string, message: Message): Conversation | undefined {
  // Check dynamic conversations first
  const dynIndex = dynamicConversations.findIndex(c => c.id === conversationId)
  if (dynIndex !== -1) {
    dynamicConversations[dynIndex].messages.push(message)
    dynamicConversations[dynIndex].lastMessageAt = message.createdAt
    return dynamicConversations[dynIndex]
  }

  // Note: Static conversations are immutable, but we handle this gracefully
  return undefined
}
