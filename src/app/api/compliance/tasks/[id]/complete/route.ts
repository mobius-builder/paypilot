import { NextRequest, NextResponse } from 'next/server'
import { getComplianceTaskById, updateComplianceTask } from '../../route'

// POST /api/compliance/tasks/:id/complete - Mark task as complete
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const task = getComplianceTaskById(id)
  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  }

  if (task.status === 'compliant') {
    return NextResponse.json({
      success: true,
      task,
      message: 'Task is already completed',
    })
  }

  const updated = updateComplianceTask(id, {
    status: 'compliant',
    completedDate: new Date().toISOString().split('T')[0],
  })

  return NextResponse.json({
    success: true,
    task: updated,
    message: 'Task marked as complete',
  })
}
