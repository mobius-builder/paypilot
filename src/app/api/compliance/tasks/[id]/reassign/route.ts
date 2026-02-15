import { NextRequest, NextResponse } from 'next/server'
import { getComplianceTaskById, updateComplianceTask } from '../../route'

const TEAM_ASSIGNEES: Record<string, string> = {
  HR: 'HR Team',
  Finance: 'Finance Team',
  Benefits: 'Benefits Admin',
  Payroll: 'Payroll Team',
  Legal: 'Legal Team',
}

// POST /api/compliance/tasks/:id/reassign - Reassign task to a team
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const { team } = body

  const validTeams = ['HR', 'Finance', 'Benefits', 'Payroll', 'Legal']
  if (!team || !validTeams.includes(team)) {
    return NextResponse.json(
      { error: `Invalid team. Must be one of: ${validTeams.join(', ')}` },
      { status: 400 }
    )
  }

  const task = getComplianceTaskById(id)
  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  }

  const updated = updateComplianceTask(id, {
    assigneeTeam: team as 'HR' | 'Finance' | 'Benefits' | 'Payroll' | 'Legal',
    assignee: TEAM_ASSIGNEES[team],
  })

  return NextResponse.json({
    success: true,
    task: updated,
    message: `Task reassigned to ${team}`,
  })
}
