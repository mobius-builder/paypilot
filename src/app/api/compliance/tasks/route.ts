import { NextResponse } from 'next/server'

// =============================================================================
// IN-MEMORY COMPLIANCE STORE
// Module-level state that persists during server runtime for demo mode
// =============================================================================

export interface ComplianceTask {
  id: string
  title: string
  category: 'tax' | 'employment' | 'benefits' | 'safety' | 'reporting'
  status: 'compliant' | 'pending' | 'overdue' | 'upcoming'
  dueDate: string
  description: string
  assignee: string
  assigneeTeam: 'HR' | 'Finance' | 'Benefits' | 'Payroll' | 'Legal'
  priority: 'low' | 'medium' | 'high' | 'critical'
  frequency: 'one-time' | 'monthly' | 'quarterly' | 'annual'
  completedDate?: string
  documents?: string[]
  snoozedUntil?: string
  notes?: string
}

// This is our "database" for demo mode - persists in memory during server runtime
let complianceTasks: ComplianceTask[] = [
  {
    id: 'task_001',
    title: 'Form 941 - Quarterly Federal Tax Return',
    category: 'tax',
    status: 'upcoming',
    dueDate: '2026-04-30',
    description: 'File quarterly federal tax return reporting wages paid to employees',
    assignee: 'John Smith',
    assigneeTeam: 'Payroll',
    priority: 'high',
    frequency: 'quarterly',
  },
  {
    id: 'task_002',
    title: 'I-9 Employment Verification',
    category: 'employment',
    status: 'pending',
    dueDate: '2026-02-18',
    description: 'Complete I-9 forms for 3 new hires from January batch',
    assignee: 'Sarah Chen',
    assigneeTeam: 'HR',
    priority: 'high',
    frequency: 'one-time',
  },
  {
    id: 'task_003',
    title: 'OSHA 300A Posting',
    category: 'safety',
    status: 'compliant',
    dueDate: '2026-02-01',
    description: 'Post OSHA Form 300A summary of work-related injuries',
    assignee: 'Mike Johnson',
    assigneeTeam: 'HR',
    priority: 'medium',
    frequency: 'annual',
    completedDate: '2026-01-28',
    documents: ['OSHA_300A_2025.pdf'],
  },
  {
    id: 'task_004',
    title: 'W-2 Distribution',
    category: 'tax',
    status: 'compliant',
    dueDate: '2026-01-31',
    description: 'Distribute W-2 forms to all employees',
    assignee: 'Payroll Team',
    assigneeTeam: 'Payroll',
    priority: 'critical',
    frequency: 'annual',
    completedDate: '2026-01-29',
    documents: ['W2_batch_2025.pdf'],
  },
  {
    id: 'task_005',
    title: '401(k) ADP/ACP Testing',
    category: 'benefits',
    status: 'pending',
    dueDate: '2026-03-15',
    description: 'Complete annual discrimination testing for 401(k) plan',
    assignee: 'Benefits Admin',
    assigneeTeam: 'Benefits',
    priority: 'high',
    frequency: 'annual',
  },
  {
    id: 'task_006',
    title: 'State Unemployment Tax Filing',
    category: 'tax',
    status: 'overdue',
    dueDate: '2026-02-10',
    description: 'File quarterly state unemployment tax returns (CA, NY, TX)',
    assignee: 'John Smith',
    assigneeTeam: 'Payroll',
    priority: 'critical',
    frequency: 'quarterly',
  },
  {
    id: 'task_007',
    title: 'EEO-1 Report',
    category: 'reporting',
    status: 'upcoming',
    dueDate: '2026-05-31',
    description: 'Submit annual EEO-1 Component 1 data collection',
    assignee: 'HR Team',
    assigneeTeam: 'HR',
    priority: 'medium',
    frequency: 'annual',
  },
  {
    id: 'task_008',
    title: 'Benefits Enrollment Audit',
    category: 'benefits',
    status: 'compliant',
    dueDate: '2026-01-15',
    description: 'Verify all employee benefit elections are properly recorded',
    assignee: 'Benefits Admin',
    assigneeTeam: 'Benefits',
    priority: 'medium',
    frequency: 'annual',
    completedDate: '2026-01-12',
  },
  {
    id: 'task_009',
    title: 'Harassment Prevention Training',
    category: 'employment',
    status: 'pending',
    dueDate: '2026-03-31',
    description: 'Complete mandatory harassment prevention training for all CA employees',
    assignee: 'HR Team',
    assigneeTeam: 'HR',
    priority: 'high',
    frequency: 'annual',
  },
  {
    id: 'task_010',
    title: 'Workers Comp Insurance Audit',
    category: 'safety',
    status: 'upcoming',
    dueDate: '2026-04-15',
    description: 'Complete annual workers compensation insurance audit',
    assignee: 'Finance Team',
    assigneeTeam: 'Finance',
    priority: 'medium',
    frequency: 'annual',
  },
]

// Export for use in other route handlers
export function getComplianceTasks(): ComplianceTask[] {
  return complianceTasks
}

export function getComplianceTaskById(id: string): ComplianceTask | undefined {
  return complianceTasks.find(t => t.id === id)
}

export function updateComplianceTask(id: string, updates: Partial<ComplianceTask>): ComplianceTask | undefined {
  const index = complianceTasks.findIndex(t => t.id === id)
  if (index === -1) return undefined

  complianceTasks[index] = { ...complianceTasks[index], ...updates }
  return complianceTasks[index]
}

// GET /api/compliance/tasks - List all tasks
export async function GET() {
  return NextResponse.json({
    tasks: complianceTasks,
    stats: {
      total: complianceTasks.length,
      compliant: complianceTasks.filter(t => t.status === 'compliant').length,
      pending: complianceTasks.filter(t => t.status === 'pending').length,
      overdue: complianceTasks.filter(t => t.status === 'overdue').length,
      upcoming: complianceTasks.filter(t => t.status === 'upcoming').length,
    },
  })
}
