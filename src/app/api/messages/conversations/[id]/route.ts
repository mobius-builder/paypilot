import { NextRequest, NextResponse } from 'next/server'
import { getConversationById } from '../route'

// GET /api/messages/conversations/:id - Get conversation details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const conversation = getConversationById(id)

  if (!conversation) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
  }

  return NextResponse.json({ conversation })
}
