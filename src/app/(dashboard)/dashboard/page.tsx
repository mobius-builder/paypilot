'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Users,
  DollarSign,
  Clock,
  Calendar,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { CompanyPulse } from '@/components/company-pulse'

interface DashboardData {
  user: {
    id: string
    email: string
    name: string
  }
  company: {
    id: string
    name: string
    slug: string
  } | null
  membership?: {
    role: string
    department: string
    jobTitle: string
  }
  stats: {
    totalEmployees: number
    nextPayrollAmount: number
    nextPayrollDate?: string
    pendingPtoRequests: number
    avgHoursPerWeek: number
  }
  pendingApprovals: Array<{
    id: string
    name: string
    type: string
    details: string
    avatar: string
    leaveType?: string
  }>
  upcomingPayroll: {
    date: string
    employees: number
    grossPay: number
    taxes: number
    deductions: number
    netPay: number
  } | null
  recentActivity: Array<{
    id: string
    type: string
    action: string
    time: string
    status: string
  }>
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-6">
        <Skeleton className="col-span-2 h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/dashboard')
      if (response.ok) {
        const dashboardData = await response.json()
        setData(dashboardData)
      } else {
        console.error('Failed to fetch dashboard')
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    setProcessingId(id)
    const item = data?.pendingApprovals.find(a => a.id === id)

    try {
      const response = await fetch(`/api/leave-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      })

      if (response.ok) {
        setData(prev => prev ? {
          ...prev,
          pendingApprovals: prev.pendingApprovals.filter(a => a.id !== id),
          stats: { ...prev.stats, pendingPtoRequests: prev.stats.pendingPtoRequests - 1 }
        } : null)
        toast.success(`${item?.type} for ${item?.name} approved!`)
      } else {
        toast.error('Failed to approve request')
      }
    } catch (error) {
      toast.error('Failed to approve request')
    } finally {
      setProcessingId(null)
    }
  }

  const handleDeny = async (id: string) => {
    setProcessingId(id)
    const item = data?.pendingApprovals.find(a => a.id === id)

    try {
      const response = await fetch(`/api/leave-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'denied' }),
      })

      if (response.ok) {
        setData(prev => prev ? {
          ...prev,
          pendingApprovals: prev.pendingApprovals.filter(a => a.id !== id),
          stats: { ...prev.stats, pendingPtoRequests: prev.stats.pendingPtoRequests - 1 }
        } : null)
        toast.error(`${item?.type} for ${item?.name} denied`)
      } else {
        toast.error('Failed to deny request')
      }
    } catch (error) {
      toast.error('Failed to deny request')
    } finally {
      setProcessingId(null)
    }
  }

  if (isLoading) {
    return <LoadingSkeleton />
  }

  // Default values if no data
  const userName = data?.user?.name?.split(' ')[0] || 'there'
  const stats = data?.stats || { totalEmployees: 0, nextPayrollAmount: 0, pendingPtoRequests: 0, avgHoursPerWeek: 40 }
  const pendingApprovals = data?.pendingApprovals || []
  const upcomingPayroll = data?.upcomingPayroll
  const companyName = data?.company?.name || 'your company'

  // Build stats cards dynamically
  const statsCards = [
    {
      name: 'Total Employees',
      value: stats.totalEmployees.toString(),
      icon: Users,
      bgColor: 'bg-accent',
      iconColor: 'text-primary'
    },
    {
      name: 'Next Payroll',
      value: stats.nextPayrollAmount > 0 ? `$${stats.nextPayrollAmount.toLocaleString()}` : '-',
      subtext: stats.nextPayrollDate ? new Date(stats.nextPayrollDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Not scheduled',
      icon: DollarSign,
      bgColor: 'bg-emerald-100',
      iconColor: 'text-emerald-600'
    },
    {
      name: 'Pending PTO',
      value: stats.pendingPtoRequests.toString(),
      subtext: 'requests',
      icon: Calendar,
      bgColor: 'bg-violet-100',
      iconColor: 'text-violet-600'
    },
    {
      name: 'Avg Hours/Week',
      value: stats.avgHoursPerWeek.toFixed(1),
      icon: Clock,
      bgColor: 'bg-amber-100',
      iconColor: 'text-amber-600'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Good morning, {userName}!</h1>
          <p className="text-slate-600">Here&apos;s what&apos;s happening with {companyName} today.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchDashboard}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            View Calendar
          </Button>
          <Link href="/payroll">
            <Button className="bg-primary hover:bg-primary/90">
              Run Payroll
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat) => (
          <Card key={stat.name} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.bgColor}`}>
                  <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-sm text-slate-500">{stat.subtext || stat.name}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Payroll */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Upcoming Payroll</CardTitle>
              <CardDescription>
                {upcomingPayroll ? `Next pay date: ${upcomingPayroll.date}` : 'No payroll scheduled'}
              </CardDescription>
            </div>
            <Link href="/payroll">
              <Button variant="ghost" size="sm">
                View Details
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {upcomingPayroll ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-500">Gross Pay</p>
                    <p className="text-xl font-semibold text-slate-900">
                      ${upcomingPayroll.grossPay.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-500">Taxes</p>
                    <p className="text-xl font-semibold text-red-600">
                      -${upcomingPayroll.taxes.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-500">Deductions</p>
                    <p className="text-xl font-semibold text-amber-600">
                      -${upcomingPayroll.deductions.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-lg">
                    <p className="text-sm text-emerald-600">Net Pay</p>
                    <p className="text-xl font-semibold text-emerald-700">
                      ${upcomingPayroll.netPay.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between p-4 bg-accent rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center border border-border">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{upcomingPayroll.employees} employees</p>
                      <p className="text-sm text-slate-500">will be paid on {upcomingPayroll.date}</p>
                    </div>
                  </div>
                  <Link href="/payroll">
                    <Button>Review & Approve</Button>
                  </Link>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <DollarSign className="w-12 h-12 text-slate-300 mb-3" />
                <p className="font-medium text-slate-900">No payroll scheduled</p>
                <p className="text-sm text-slate-500 mb-4">Set up your first payroll run</p>
                <Link href="/payroll/run">
                  <Button>Schedule Payroll</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Approvals */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Pending Approvals</CardTitle>
              <CardDescription>
                {pendingApprovals.length === 0
                  ? 'All items processed'
                  : `${pendingApprovals.length} item${pendingApprovals.length !== 1 ? 's' : ''} need${pendingApprovals.length === 1 ? 's' : ''} attention`}
              </CardDescription>
            </div>
            {pendingApprovals.length > 0 && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                <AlertCircle className="w-3 h-3 mr-1" />
                {pendingApprovals.length}
              </Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingApprovals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-3" />
                <p className="font-medium text-slate-900">All caught up!</p>
                <p className="text-sm text-slate-500">No pending approvals</p>
              </div>
            ) : (
              pendingApprovals.map((item) => (
                <div key={item.id} className={`flex items-center gap-3 p-3 bg-slate-50 rounded-lg transition-opacity ${processingId === item.id ? 'opacity-50' : ''}`}>
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-accent text-primary text-sm">{item.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{item.name}</p>
                    <p className="text-sm text-slate-500">{item.type} - {item.details}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeny(item.id)}
                      disabled={processingId !== null}
                    >
                      Deny
                    </Button>
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => handleApprove(item.id)}
                      disabled={processingId !== null}
                    >
                      {processingId === item.id ? 'Processing...' : 'Approve'}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Company Pulse Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CompanyPulse />

        {/* AI Assistant Quick Access */}
        <Card className="bg-foreground text-white">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <CardTitle className="text-white">AI Assistant</CardTitle>
            </div>
            <CardDescription className="text-slate-300">
              Ask me anything about HR
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {[
                'How many PTO days does Sarah have?',
                'Show me the payroll summary',
                'Who is on leave this week?'
              ].map((question, i) => (
                <Link key={i} href="/ai">
                  <button
                    className="w-full text-left p-3 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white/90 transition-colors"
                  >
                    {question}
                  </button>
                </Link>
              ))}
            </div>
            <Link href="/ai">
              <Button className="w-full bg-white text-slate-900 hover:bg-slate-100">
                <Sparkles className="w-4 h-4 mr-2" />
                Open AI Assistant
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick stats footer */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            <div>
              <p className="text-sm text-slate-500">Active Employees</p>
              <p className="text-lg font-semibold text-slate-900">{stats.totalEmployees}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm text-slate-500">Departments</p>
              <p className="text-lg font-semibold text-slate-900">5</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-violet-500" />
            <div>
              <p className="text-sm text-slate-500">Avg Hours/Week</p>
              <p className="text-lg font-semibold text-slate-900">{stats.avgHoursPerWeek}h</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-amber-500" />
            <div>
              <p className="text-sm text-slate-500">Pending PTO</p>
              <p className="text-lg font-semibold text-slate-900">{stats.pendingPtoRequests}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
