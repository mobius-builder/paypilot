import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Rich demo data for when database is empty or unavailable
function getDemoData(user: { id: string; email?: string; user_metadata?: { full_name?: string } }) {
  const nextPayDate = new Date()
  nextPayDate.setDate(nextPayDate.getDate() + 5)

  return {
    user: {
      id: user.id,
      email: user.email || 'demo@acme.com',
      name: user.user_metadata?.full_name || 'Alex Chen',
    },
    company: {
      id: 'demo-company',
      name: 'Acme Corporation',
      slug: 'acme',
    },
    membership: {
      role: 'admin',
      department: 'Human Resources',
      jobTitle: 'HR Director',
    },
    stats: {
      totalEmployees: 47,
      nextPayrollAmount: 127450,
      nextPayrollDate: nextPayDate.toISOString(),
      pendingPtoRequests: 5,
      avgHoursPerWeek: 38.5,
    },
    pendingApprovals: [
      {
        id: 'pto-001',
        name: 'Sarah Chen',
        type: 'PTO Request',
        details: 'Feb 20-22 (3 days)',
        avatar: 'SC',
        leaveType: 'vacation',
      },
      {
        id: 'pto-002',
        name: 'Marcus Johnson',
        type: 'PTO Request',
        details: 'Feb 25 (1 day)',
        avatar: 'MJ',
        leaveType: 'personal',
      },
      {
        id: 'pto-003',
        name: 'Emily Rodriguez',
        type: 'Sick Leave',
        details: 'Feb 18-19 (2 days)',
        avatar: 'ER',
        leaveType: 'sick',
      },
      {
        id: 'pto-004',
        name: 'David Kim',
        type: 'PTO Request',
        details: 'Mar 1-5 (5 days)',
        avatar: 'DK',
        leaveType: 'vacation',
      },
      {
        id: 'pto-005',
        name: 'Rachel Wong',
        type: 'PTO Request',
        details: 'Feb 28 (1 day)',
        avatar: 'RW',
        leaveType: 'personal',
      },
    ],
    upcomingPayroll: {
      date: nextPayDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      employees: 47,
      grossPay: 168500,
      taxes: 42125,
      deductions: 12450,
      netPay: 113925,
    },
    recentActivity: [
      {
        id: 'act-1',
        type: 'employee',
        action: 'New employee onboarded: James Wilson',
        time: '2 hours ago',
        status: 'completed',
      },
      {
        id: 'act-2',
        type: 'payroll',
        action: 'Payroll run completed - 47 employees paid',
        time: '5 hours ago',
        status: 'completed',
      },
      {
        id: 'act-3',
        type: 'leave',
        action: 'PTO approved for Lisa Park',
        time: 'Yesterday',
        status: 'completed',
      },
      {
        id: 'act-4',
        type: 'benefits',
        action: 'Benefits enrollment updated - 12 changes',
        time: 'Yesterday',
        status: 'completed',
      },
      {
        id: 'act-5',
        type: 'compliance',
        action: 'Q4 tax filings submitted',
        time: '2 days ago',
        status: 'completed',
      },
    ],
  }
}

export async function GET() {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's company membership
    const { data: membership, error: membershipError } = await supabase
      .from('company_members')
      .select(`
        id,
        role,
        department,
        job_title,
        company_id,
        companies (
          id,
          name,
          slug
        )
      `)
      .eq('user_id', user.id)
      .single()

    if (membershipError || !membership) {
      // Return rich demo data if no membership found
      return NextResponse.json(getDemoData(user))
    }

    const companyId = membership.company_id

    // Fetch stats in parallel
    const [
      employeeCountResult,
      pendingPtoResult,
      recentPayrollResult,
      pendingApprovalsResult,
      recentActivityResult,
    ] = await Promise.all([
      // Total employees count
      supabase
        .from('company_members')
        .select('id', { count: 'exact' })
        .eq('company_id', companyId)
        .eq('status', 'active'),

      // Pending PTO requests count
      supabase
        .from('leave_requests')
        .select('id', { count: 'exact' })
        .eq('company_id', companyId)
        .eq('status', 'pending'),

      // Most recent payroll run
      supabase
        .from('payroll_runs')
        .select('*')
        .eq('company_id', companyId)
        .order('pay_date', { ascending: false })
        .limit(1),

      // Pending approvals (PTO requests)
      supabase
        .from('leave_requests')
        .select(`
          id,
          leave_type,
          start_date,
          end_date,
          total_days,
          created_at,
          company_members!leave_requests_employee_id_fkey (
            id,
            profiles!company_members_user_id_fkey (
              full_name
            )
          )
        `)
        .eq('company_id', companyId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(5),

      // Recent activity (combination of recent actions)
      supabase
        .from('audit_logs')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(10),
    ])

    // Calculate next payroll (upcoming, not completed)
    const lastPayroll = recentPayrollResult.data?.[0]
    const nextPayrollDate = lastPayroll
      ? new Date(new Date(lastPayroll.pay_date).getTime() + 14 * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    // Format pending approvals
    const pendingApprovals = (pendingApprovalsResult.data || []).map((req) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const member = req.company_members as any
      const profile = member?.profiles?.[0] || member?.profiles || null
      const name = profile?.full_name || 'Unknown'
      const initials = name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()

      return {
        id: req.id,
        name,
        type: 'PTO Request',
        details: `${req.start_date} - ${req.end_date} (${req.total_days} days)`,
        avatar: initials,
        leaveType: req.leave_type,
      }
    })

    // If no real data found, return demo data for a full dashboard
    const hasRealData = (employeeCountResult.count && employeeCountResult.count > 0) || lastPayroll

    if (!hasRealData) {
      // Return demo data merged with real user info
      const demoData = getDemoData(user)
      return NextResponse.json({
        ...demoData,
        user: {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || demoData.user.name,
        },
        company: membership.companies || demoData.company,
        membership: {
          role: membership.role || demoData.membership.role,
          department: membership.department || demoData.membership.department,
          jobTitle: membership.job_title || demoData.membership.jobTitle,
        },
      })
    }

    // Format response with real data
    const response = {
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || 'User',
      },
      company: membership.companies,
      membership: {
        role: membership.role,
        department: membership.department,
        jobTitle: membership.job_title,
      },
      stats: {
        totalEmployees: employeeCountResult.count || 0,
        nextPayrollAmount: lastPayroll ? lastPayroll.total_net_cents / 100 : 0,
        nextPayrollDate: nextPayrollDate.toISOString(),
        pendingPtoRequests: pendingPtoResult.count || 0,
        avgHoursPerWeek: 40, // Would calculate from time_entries
      },
      pendingApprovals,
      upcomingPayroll: lastPayroll ? {
        date: nextPayrollDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        employees: employeeCountResult.count || 0,
        grossPay: lastPayroll.total_gross_cents / 100,
        taxes: Math.round(lastPayroll.total_gross_cents * 0.25) / 100, // Estimate
        deductions: lastPayroll.total_deductions_cents / 100,
        netPay: lastPayroll.total_net_cents / 100,
      } : null,
      recentActivity: (recentActivityResult.data || []).map(log => ({
        id: log.id,
        type: log.target_type,
        action: log.action,
        time: new Date(log.created_at).toLocaleString(),
        status: 'completed',
      })),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
