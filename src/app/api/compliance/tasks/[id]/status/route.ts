import { NextRequest, NextResponse } from 'next/server'
import { getComplianceTaskById, updateComplianceTask } from '../../route'

// POST /api/compliance/tasks/:id/status - Update task status
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const { status } = body

  if (!status || !['compliant', 'pending', 'overdue', 'upcoming'].includes(status)) {
    return NextResponse.json(
      { error: 'Invalid status. Must be one of: compliant, pending, overdue, upcoming' },
      { status: 400 }
    )
  }

  const task = getComplianceTaskById(id)
  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  }

  const updates: Record<string, string | undefined> = { status }

  // If marking as compliant, set completion date
  if (status === 'compliant') {
    updates.completedDate = new Date().toISOString().split('T')[0]
  } else {
    updates.completedDate = undefined
  }

  const updated = updateComplianceTask(id, updates)

  return NextResponse.json({
    success: true,
    task: updated,
    message: `Task status updated to ${status}`,
  })
}
