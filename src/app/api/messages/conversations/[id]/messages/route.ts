import { NextRequest, NextResponse } from 'next/server'
import { getConversationById, addMessageToConversation } from '../../route'
import type { Message } from '@/lib/static-demo-data'

// GET /api/messages/conversations/:id/messages - Get messages in a conversation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const conversation = getConversationById(id)

  if (!conversation) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
  }

  return NextResponse.json({
    messages: conversation.messages,
    total: conversation.messages.length,
  })
}

// POST /api/messages/conversations/:id/messages - Send a message
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const { content, senderType } = body

  if (!content || !content.trim()) {
    return NextResponse.json({ error: 'Message content is required' }, { status: 400 })
  }

  const conversation = getConversationById(id)
  if (!conversation) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
  }

  const messageId = `msg_${id}_${Date.now()}`
  const now = new Date().toISOString()

  const newMessage: Message = {
    id: messageId,
    conversationId: id,
    senderType: senderType || 'employee',
    content: content.trim(),
    createdAt: now,
  }

  // Try to add to dynamic conversations
  const updated = addMessageToConversation(id, newMessage)

  return NextResponse.json({
    success: true,
    message: newMessage,
    conversationUpdated: !!updated,
  })
}
