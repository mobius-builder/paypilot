import { NextResponse } from 'next/server'

// GET /api/compliance/training/status - Get training completion stats
export async function GET() {
  // Realistic training completion data
  const trainingStatus = {
    overview: {
      totalEmployees: 47,
      completedCount: 38,
      inProgressCount: 5,
      notStartedCount: 4,
      completionRate: 81,
      dueDate: '2026-03-31',
    },
    courses: [
      {
        id: 'course_001',
        name: 'Harassment Prevention Training',
        required: true,
        duration: '2 hours',
        completedCount: 38,
        totalRequired: 47,
        dueDate: '2026-03-31',
      },
      {
        id: 'course_002',
        name: 'Workplace Safety Training',
        required: true,
        duration: '1 hour',
        completedCount: 42,
        totalRequired: 47,
        dueDate: '2026-02-28',
      },
      {
        id: 'course_003',
        name: 'Data Privacy & Security',
        required: true,
        duration: '1.5 hours',
        completedCount: 45,
        totalRequired: 47,
        dueDate: '2026-04-15',
      },
      {
        id: 'course_004',
        name: 'Diversity & Inclusion',
        required: false,
        duration: '1 hour',
        completedCount: 32,
        totalRequired: 47,
        dueDate: null,
      },
    ],
    byDepartment: [
      { department: 'Engineering', total: 15, completed: 13, completionRate: 87 },
      { department: 'Sales', total: 8, completed: 7, completionRate: 88 },
      { department: 'Marketing', total: 6, completed: 5, completionRate: 83 },
      { department: 'HR', total: 4, completed: 4, completionRate: 100 },
      { department: 'Finance', total: 5, completed: 4, completionRate: 80 },
      { department: 'Operations', total: 5, completed: 3, completionRate: 60 },
      { department: 'Customer Support', total: 4, completed: 2, completionRate: 50 },
    ],
    pendingEmployees: [
      { id: 'emp_012', name: 'Lisa Wang', department: 'Operations', course: 'Harassment Prevention Training', status: 'in_progress', progress: 65 },
      { id: 'emp_023', name: 'Tom Harris', department: 'Customer Support', course: 'Harassment Prevention Training', status: 'in_progress', progress: 30 },
      { id: 'emp_034', name: 'Nina Patel', department: 'Operations', course: 'Harassment Prevention Training', status: 'not_started', progress: 0 },
      { id: 'emp_041', name: 'James Lee', department: 'Customer Support', course: 'Harassment Prevention Training', status: 'not_started', progress: 0 },
      { id: 'emp_045', name: 'Emma Wilson', department: 'Engineering', course: 'Harassment Prevention Training', status: 'in_progress', progress: 80 },
      { id: 'emp_018', name: 'Chris Brown', department: 'Customer Support', course: 'Harassment Prevention Training', status: 'in_progress', progress: 45 },
      { id: 'emp_029', name: 'Sara Kim', department: 'Marketing', course: 'Harassment Prevention Training', status: 'in_progress', progress: 90 },
      { id: 'emp_037', name: 'David Chen', department: 'Operations', course: 'Harassment Prevention Training', status: 'not_started', progress: 0 },
      { id: 'emp_044', name: 'Rachel Green', department: 'Sales', course: 'Harassment Prevention Training', status: 'not_started', progress: 0 },
    ],
    recentCompletions: [
      { name: 'Sarah Chen', department: 'Engineering', course: 'Harassment Prevention Training', completedAt: '2026-02-14' },
      { name: 'Mike Johnson', department: 'HR', course: 'Harassment Prevention Training', completedAt: '2026-02-13' },
      { name: 'Alex Thompson', department: 'Engineering', course: 'Harassment Prevention Training', completedAt: '2026-02-12' },
      { name: 'Emily Davis', department: 'Marketing', course: 'Harassment Prevention Training', completedAt: '2026-02-11' },
      { name: 'John Smith', department: 'Finance', course: 'Harassment Prevention Training', completedAt: '2026-02-10' },
    ],
  }

  return NextResponse.json(trainingStatus)
}
