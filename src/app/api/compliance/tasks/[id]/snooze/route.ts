import { NextRequest, NextResponse } from 'next/server'
import { getComplianceTaskById, updateComplianceTask } from '../../route'

// POST /api/compliance/tasks/:id/snooze - Snooze task by N days
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const { days } = body

  if (!days || typeof days !== 'number' || days < 1 || days > 90) {
    return NextResponse.json(
      { error: 'Invalid days. Must be a number between 1 and 90' },
      { status: 400 }
    )
  }

  const task = getComplianceTaskById(id)
  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  }

  // Calculate new due date
  const currentDueDate = new Date(task.dueDate)
  currentDueDate.setDate(currentDueDate.getDate() + days)
  const newDueDate = currentDueDate.toISOString().split('T')[0]

  const updated = updateComplianceTask(id, {
    dueDate: newDueDate,
    status: 'upcoming', // Reset to upcoming when snoozed
    snoozedUntil: newDueDate,
  })

  return NextResponse.json({
    success: true,
    task: updated,
    message: `Task snoozed by ${days} days. New due date: ${newDueDate}`,
    newDueDate,
  })
}
