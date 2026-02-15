import { NextRequest, NextResponse } from 'next/server'
import { getComplianceTaskById } from '../route'

// GET /api/compliance/tasks/:id - Get task details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const task = getComplianceTaskById(id)

  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  }

  return NextResponse.json({ task })
}
