import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Demo employees data
function getDemoEmployees() {
  const departments = ['Engineering', 'Product', 'Design', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations']
  const jobTitles: Record<string, string[]> = {
    Engineering: ['Senior Engineer', 'Staff Engineer', 'Engineering Manager', 'Software Engineer', 'DevOps Engineer'],
    Product: ['Product Manager', 'Senior PM', 'Product Lead'],
    Design: ['Product Designer', 'Senior Designer', 'UX Researcher'],
    Marketing: ['Marketing Manager', 'Content Strategist', 'Growth Lead'],
    Sales: ['Account Executive', 'Sales Manager', 'SDR'],
    HR: ['HR Director', 'HR Manager', 'Recruiter', 'People Operations'],
    Finance: ['Finance Manager', 'Accountant', 'Financial Analyst'],
    Operations: ['Operations Manager', 'Office Manager', 'Executive Assistant'],
  }

  const employees = [
    { name: 'Alex Chen', department: 'HR', jobTitle: 'HR Director', hireDate: '2021-03-15' },
    { name: 'Sarah Martinez', department: 'Engineering', jobTitle: 'Engineering Manager', hireDate: '2021-06-01' },
    { name: 'Marcus Johnson', department: 'Engineering', jobTitle: 'Senior Engineer', hireDate: '2021-08-15' },
    { name: 'Emily Rodriguez', department: 'Product', jobTitle: 'Product Manager', hireDate: '2022-01-10' },
    { name: 'David Kim', department: 'Engineering', jobTitle: 'Staff Engineer', hireDate: '2021-04-20' },
    { name: 'Lisa Park', department: 'Design', jobTitle: 'Product Designer', hireDate: '2022-03-01' },
    { name: 'James Wilson', department: 'Sales', jobTitle: 'Account Executive', hireDate: '2022-05-15' },
    { name: 'Rachel Wong', department: 'Engineering', jobTitle: 'Software Engineer', hireDate: '2022-07-01' },
    { name: 'Michael Brown', department: 'Marketing', jobTitle: 'Marketing Manager', hireDate: '2021-11-01' },
    { name: 'Jennifer Lee', department: 'Finance', jobTitle: 'Finance Manager', hireDate: '2021-09-15' },
    { name: 'Kevin Thompson', department: 'Engineering', jobTitle: 'DevOps Engineer', hireDate: '2022-02-01' },
    { name: 'Amanda Garcia', department: 'HR', jobTitle: 'Recruiter', hireDate: '2022-08-01' },
    { name: 'Robert Taylor', department: 'Sales', jobTitle: 'Sales Manager', hireDate: '2021-07-15' },
    { name: 'Nicole Anderson', department: 'Product', jobTitle: 'Senior PM', hireDate: '2022-04-01' },
    { name: 'Christopher Lee', department: 'Engineering', jobTitle: 'Software Engineer', hireDate: '2022-09-01' },
    { name: 'Jessica White', department: 'Design', jobTitle: 'UX Researcher', hireDate: '2022-06-15' },
    { name: 'Daniel Harris', department: 'Operations', jobTitle: 'Operations Manager', hireDate: '2021-10-01' },
    { name: 'Stephanie Clark', department: 'Marketing', jobTitle: 'Content Strategist', hireDate: '2022-10-01' },
    { name: 'Andrew Moore', department: 'Engineering', jobTitle: 'Senior Engineer', hireDate: '2022-01-15' },
    { name: 'Michelle Jackson', department: 'Finance', jobTitle: 'Accountant', hireDate: '2022-11-01' },
    { name: 'Ryan Miller', department: 'Sales', jobTitle: 'SDR', hireDate: '2023-01-15' },
    { name: 'Lauren Davis', department: 'HR', jobTitle: 'People Operations', hireDate: '2023-02-01' },
    { name: 'Brandon Scott', department: 'Engineering', jobTitle: 'Software Engineer', hireDate: '2023-03-01' },
    { name: 'Megan Robinson', department: 'Product', jobTitle: 'Product Lead', hireDate: '2023-01-01' },
    { name: 'Tyler Young', department: 'Engineering', jobTitle: 'Software Engineer', hireDate: '2023-04-15' },
  ]

  const formattedEmployees = employees.map((emp, i) => {
    const initials = emp.name.split(' ').map(n => n[0]).join('').toUpperCase()
    const baseSalary = emp.department === 'Engineering' ? 145000 :
                       emp.department === 'Product' ? 135000 :
                       emp.department === 'Sales' ? 95000 :
                       emp.department === 'Design' ? 120000 : 100000
    const salary = baseSalary + (Math.random() * 30000 - 15000)

    return {
      id: `emp-${String(i + 1).padStart(3, '0')}`,
      name: emp.name,
      email: emp.name.toLowerCase().replace(' ', '.') + '@acme.com',
      phone: `+1 (555) ${String(100 + i).padStart(3, '0')}-${String(1000 + i * 7).slice(-4)}`,
      avatarUrl: null,
      initials,
      role: i === 0 ? 'admin' : 'member',
      department: emp.department,
      jobTitle: emp.jobTitle,
      hireDate: emp.hireDate,
      employmentType: 'full_time',
      status: 'active',
      salary: {
        amount: Math.round(salary),
        currency: 'USD',
        frequency: 'yearly',
      },
      reportsTo: i === 0 ? null : 'emp-001',
    }
  })

  const departmentCounts: Record<string, number> = {}
  formattedEmployees.forEach(emp => {
    departmentCounts[emp.department] = (departmentCounts[emp.department] || 0) + 1
  })

  return {
    employees: formattedEmployees,
    stats: {
      total: formattedEmployees.length,
      byDepartment: departmentCounts,
      byEmploymentType: {
        fullTime: formattedEmployees.length,
        partTime: 0,
        contractor: 0,
      },
    },
  }
}

export async function GET() {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      // Return demo data for unauthenticated users
      return NextResponse.json(getDemoEmployees())
    }

    // Get user's company membership
    const { data: membership, error: membershipError } = await supabase
      .from('company_members')
      .select('company_id, role')
      .eq('user_id', user.id)
      .single()

    if (membershipError || !membership) {
      // Return demo data if no membership found
      return NextResponse.json(getDemoEmployees())
    }

    // Get all employees for the company
    const { data: employees, error: employeesError } = await supabase
      .from('company_members')
      .select(`
        id,
        role,
        department,
        job_title,
        hire_date,
        employment_type,
        status,
        salary_amount_cents,
        salary_currency,
        salary_frequency,
        reports_to,
        created_at,
        profiles!company_members_user_id_fkey (
          id,
          email,
          full_name,
          avatar_url,
          phone
        )
      `)
      .eq('company_id', membership.company_id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (employeesError) {
      console.error('Error fetching employees:', employeesError)
      return NextResponse.json(getDemoEmployees())
    }

    // If no employees found, return demo data
    if (!employees || employees.length === 0) {
      return NextResponse.json(getDemoEmployees())
    }

    // Format employees
    const formattedEmployees = (employees || []).map((emp) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const profileData = emp.profiles as any
      const profile = Array.isArray(profileData) ? profileData[0] : profileData
      const name = profile?.full_name || 'Unknown'
      const initials = name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()

      return {
        id: emp.id,
        name,
        email: profile?.email || '',
        phone: profile?.phone || '',
        avatarUrl: profile?.avatar_url,
        initials,
        role: emp.role,
        department: emp.department || 'Unassigned',
        jobTitle: emp.job_title || 'Employee',
        hireDate: emp.hire_date,
        employmentType: emp.employment_type,
        status: emp.status,
        salary: emp.salary_amount_cents ? {
          amount: emp.salary_amount_cents / 100,
          currency: emp.salary_currency,
          frequency: emp.salary_frequency,
        } : null,
        reportsTo: emp.reports_to,
      }
    })

    // Get department stats
    const departmentCounts: Record<string, number> = {}
    formattedEmployees.forEach(emp => {
      const dept = emp.department
      departmentCounts[dept] = (departmentCounts[dept] || 0) + 1
    })

    return NextResponse.json({
      employees: formattedEmployees,
      stats: {
        total: formattedEmployees.length,
        byDepartment: departmentCounts,
        byEmploymentType: {
          fullTime: formattedEmployees.filter(e => e.employmentType === 'full_time').length,
          partTime: formattedEmployees.filter(e => e.employmentType === 'part_time').length,
          contractor: formattedEmployees.filter(e => e.employmentType === 'contractor').length,
        },
      },
    })
  } catch (error) {
    console.error('Employees API error:', error)
    return NextResponse.json(getDemoEmployees())
  }
}
