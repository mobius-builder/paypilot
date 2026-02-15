import { NextRequest, NextResponse } from 'next/server'
import { getComplianceTaskById } from '../../route'

// GET /api/compliance/tasks/:id/export - Export task as JSON or CSV
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { searchParams } = new URL(request.url)
  const format = searchParams.get('format') || 'json'

  const task = getComplianceTaskById(id)
  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  }

  if (format === 'csv') {
    const headers = Object.keys(task).join(',')
    const values = Object.values(task)
      .map(v => {
        if (v === undefined || v === null) return ''
        if (Array.isArray(v)) return `"${v.join('; ')}"`
        return `"${String(v).replace(/"/g, '""')}"`
      })
      .join(',')

    const csv = `${headers}\n${values}`

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="compliance_task_${id}.csv"`,
      },
    })
  }

  // Default: JSON
  return new NextResponse(JSON.stringify(task, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="compliance_task_${id}.json"`,
    },
  })
}
