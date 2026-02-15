import { NextRequest, NextResponse } from 'next/server'
import { getComplianceTasks } from '../tasks/route'

// GET /api/compliance/report?format=pdf|csv|json - Generate compliance report
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const format = searchParams.get('format') || 'json'

  const tasks = getComplianceTasks()
  const now = new Date()
  const generatedAt = now.toISOString()

  const stats = {
    total: tasks.length,
    compliant: tasks.filter(t => t.status === 'compliant').length,
    pending: tasks.filter(t => t.status === 'pending').length,
    overdue: tasks.filter(t => t.status === 'overdue').length,
    upcoming: tasks.filter(t => t.status === 'upcoming').length,
  }

  const complianceScore = Math.round((stats.compliant / stats.total) * 100)

  const report = {
    title: 'PayPilot Compliance Summary Report',
    generatedAt,
    period: `Q1 2026`,
    companyName: 'TechCorp Inc.',
    complianceScore,
    stats,
    tasksByCategory: {
      tax: tasks.filter(t => t.category === 'tax').length,
      employment: tasks.filter(t => t.category === 'employment').length,
      benefits: tasks.filter(t => t.category === 'benefits').length,
      safety: tasks.filter(t => t.category === 'safety').length,
      reporting: tasks.filter(t => t.category === 'reporting').length,
    },
    overdueTasks: tasks.filter(t => t.status === 'overdue').map(t => ({
      title: t.title,
      dueDate: t.dueDate,
      assignee: t.assignee,
      priority: t.priority,
    })),
    upcomingTasks: tasks.filter(t => t.status === 'upcoming').map(t => ({
      title: t.title,
      dueDate: t.dueDate,
      assignee: t.assignee,
      priority: t.priority,
    })),
    completedTasks: tasks.filter(t => t.status === 'compliant').map(t => ({
      title: t.title,
      completedDate: t.completedDate,
      assignee: t.assignee,
    })),
  }

  if (format === 'csv') {
    // Generate CSV report
    const lines = [
      'PayPilot Compliance Summary Report',
      `Generated: ${generatedAt}`,
      `Period: Q1 2026`,
      `Company: TechCorp Inc.`,
      '',
      `Compliance Score: ${complianceScore}%`,
      `Total Tasks: ${stats.total}`,
      `Compliant: ${stats.compliant}`,
      `Pending: ${stats.pending}`,
      `Overdue: ${stats.overdue}`,
      `Upcoming: ${stats.upcoming}`,
      '',
      'ALL TASKS',
      'ID,Title,Category,Status,Due Date,Assignee,Priority,Completed Date',
      ...tasks.map(t =>
        `"${t.id}","${t.title}","${t.category}","${t.status}","${t.dueDate}","${t.assignee}","${t.priority}","${t.completedDate || ''}"`
      ),
    ]

    return new NextResponse(lines.join('\n'), {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="compliance_report_${now.toISOString().split('T')[0]}.csv"`,
      },
    })
  }

  if (format === 'pdf') {
    // For PDF, we'll return a text-based report that could be rendered as PDF
    // In production, you'd use a PDF library like puppeteer or react-pdf
    const pdfContent = `
═══════════════════════════════════════════════════════════════════
                 PAYPILOT COMPLIANCE SUMMARY REPORT
═══════════════════════════════════════════════════════════════════

Generated: ${generatedAt}
Period: Q1 2026
Company: TechCorp Inc.

═══════════════════════════════════════════════════════════════════
                        COMPLIANCE SCORE
═══════════════════════════════════════════════════════════════════

                            ${complianceScore}%

    Total Tasks: ${stats.total}
    ✓ Compliant: ${stats.compliant}
    ○ Pending: ${stats.pending}
    ✗ Overdue: ${stats.overdue}
    ◷ Upcoming: ${stats.upcoming}

═══════════════════════════════════════════════════════════════════
                        OVERDUE ITEMS
═══════════════════════════════════════════════════════════════════
${report.overdueTasks.length === 0 ? 'No overdue items' : report.overdueTasks.map(t =>
  `• ${t.title}
    Due: ${t.dueDate} | Priority: ${t.priority.toUpperCase()} | Assigned: ${t.assignee}`
).join('\n\n')}

═══════════════════════════════════════════════════════════════════
                        UPCOMING DEADLINES
═══════════════════════════════════════════════════════════════════
${report.upcomingTasks.map(t =>
  `• ${t.title}
    Due: ${t.dueDate} | Priority: ${t.priority.toUpperCase()} | Assigned: ${t.assignee}`
).join('\n\n')}

═══════════════════════════════════════════════════════════════════
                        COMPLETED ITEMS
═══════════════════════════════════════════════════════════════════
${report.completedTasks.map(t =>
  `✓ ${t.title}
    Completed: ${t.completedDate} | By: ${t.assignee}`
).join('\n\n')}

═══════════════════════════════════════════════════════════════════
                        END OF REPORT
═══════════════════════════════════════════════════════════════════
`

    return new NextResponse(pdfContent, {
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename="compliance_report_${now.toISOString().split('T')[0]}.txt"`,
      },
    })
  }

  // Default: JSON
  return new NextResponse(JSON.stringify(report, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="compliance_report_${now.toISOString().split('T')[0]}.json"`,
    },
  })
}
