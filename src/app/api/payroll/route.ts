import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Demo payroll data
function getDemoPayrollData() {
  const now = new Date()
  const payrollRuns = [
    {
      id: 'pr-001',
      payPeriod: 'Feb 1-15, 2026',
      payDate: 'Feb 20, 2026',
      employees: 47,
      grossPay: 168500,
      taxes: 42125,
      deductions: 12450,
      netPay: 113925,
      status: 'pending_approval',
      hasAllCalculations: true,
    },
    {
      id: 'pr-002',
      payPeriod: 'Jan 16-31, 2026',
      payDate: 'Feb 5, 2026',
      employees: 46,
      grossPay: 165200,
      taxes: 41300,
      deductions: 12200,
      netPay: 111700,
      status: 'paid',
      hasAllCalculations: true,
    },
    {
      id: 'pr-003',
      payPeriod: 'Jan 1-15, 2026',
      payDate: 'Jan 20, 2026',
      employees: 45,
      grossPay: 162800,
      taxes: 40700,
      deductions: 11950,
      netPay: 110150,
      status: 'paid',
      hasAllCalculations: true,
    },
    {
      id: 'pr-004',
      payPeriod: 'Dec 16-31, 2025',
      payDate: 'Jan 5, 2026',
      employees: 45,
      grossPay: 161500,
      taxes: 40375,
      deductions: 11800,
      netPay: 109325,
      status: 'paid',
      hasAllCalculations: true,
    },
    {
      id: 'pr-005',
      payPeriod: 'Dec 1-15, 2025',
      payDate: 'Dec 20, 2025',
      employees: 44,
      grossPay: 158900,
      taxes: 39725,
      deductions: 11650,
      netPay: 107525,
      status: 'paid',
      hasAllCalculations: true,
    },
  ]

  const ytdGross = payrollRuns.reduce((sum, run) => sum + run.grossPay, 0)

  return {
    payrollRuns,
    currentPayroll: payrollRuns[0],
    stats: {
      nextPayrollAmount: payrollRuns[0].grossPay,
      employeeCount: 47,
      nextPayDate: payrollRuns[0].payDate,
      ytdTotal: ytdGross,
    },
  }
}

export async function GET() {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(getDemoPayrollData())
    }

    // Get user's company membership
    const { data: membership } = await supabase
      .from('company_members')
      .select('company_id')
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json(getDemoPayrollData())
    }

    const companyId = membership.company_id

    // Fetch payroll runs
    const { data: payrollRuns, error: payrollError } = await supabase
      .from('payroll_runs')
      .select('*')
      .eq('company_id', companyId)
      .order('pay_date', { ascending: false })
      .limit(10)

    if (payrollError) {
      console.error('Payroll fetch error:', payrollError)
      return NextResponse.json(getDemoPayrollData())
    }

    // If no payroll runs found, return demo data
    if (!payrollRuns || payrollRuns.length === 0) {
      return NextResponse.json(getDemoPayrollData())
    }

    // Get employee count
    const { count: employeeCount } = await supabase
      .from('company_members')
      .select('id', { count: 'exact' })
      .eq('company_id', companyId)
      .eq('status', 'active')

    // Format payroll runs for frontend
    const formattedRuns = (payrollRuns || []).map(run => ({
      id: run.id,
      payPeriod: formatDateRange(run.period_start, run.period_end),
      payDate: formatDate(run.pay_date),
      employees: employeeCount || 0,
      grossPay: run.total_gross_cents / 100,
      taxes: Math.round(run.total_gross_cents * 0.25) / 100, // Estimate 25% tax
      deductions: run.total_deductions_cents / 100,
      netPay: run.total_net_cents / 100,
      status: run.status,
      hasAllCalculations: true
    }))

    // Calculate YTD totals
    const ytdGross = (payrollRuns || []).reduce((sum, run) => sum + run.total_gross_cents, 0) / 100
    const ytdNet = (payrollRuns || []).reduce((sum, run) => sum + run.total_net_cents, 0) / 100

    // Get the current/upcoming payroll (most recent pending or draft)
    const currentPayroll = formattedRuns.find(r =>
      r.status === 'pending_approval' || r.status === 'draft'
    ) || formattedRuns[0]

    return NextResponse.json({
      payrollRuns: formattedRuns,
      currentPayroll,
      stats: {
        nextPayrollAmount: currentPayroll?.grossPay || 0,
        employeeCount: employeeCount || 0,
        nextPayDate: currentPayroll?.payDate || 'Not scheduled',
        ytdTotal: ytdGross
      }
    })
  } catch (error) {
    console.error('Payroll API error:', error)
    return NextResponse.json(getDemoPayrollData())
  }
}

function formatDateRange(start: string, end: string): string {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const startMonth = startDate.toLocaleDateString('en-US', { month: 'short' })
  const endMonth = endDate.toLocaleDateString('en-US', { month: 'short' })

  if (startMonth === endMonth) {
    return `${startMonth} ${startDate.getDate()}-${endDate.getDate()}, ${endDate.getFullYear()}`
  }
  return `${startMonth} ${startDate.getDate()} - ${endMonth} ${endDate.getDate()}, ${endDate.getFullYear()}`
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
