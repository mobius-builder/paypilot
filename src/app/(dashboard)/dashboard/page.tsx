'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
  ArrowDownRight,
  CheckCircle2
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

// Demo data
const stats = [
  {
    name: 'Total Employees',
    value: '47',
    change: '+3',
    changeType: 'positive',
    icon: Users,
    bgColor: 'bg-accent',
    iconColor: 'text-primary'
  },
  {
    name: 'Next Payroll',
    value: '$124,850',
    subtext: 'Feb 20, 2026',
    icon: DollarSign,
    bgColor: 'bg-emerald-100',
    iconColor: 'text-emerald-600'
  },
  {
    name: 'Pending PTO',
    value: '5',
    subtext: 'requests',
    icon: Calendar,
    bgColor: 'bg-violet-100',
    iconColor: 'text-violet-600'
  },
  {
    name: 'Avg Hours/Week',
    value: '41.2',
    change: '+1.5',
    changeType: 'neutral',
    icon: Clock,
    bgColor: 'bg-amber-100',
    iconColor: 'text-amber-600'
  }
]

const recentActivity = [
  { id: 1, type: 'pto', user: 'Sarah Chen', action: 'requested 3 days PTO', time: '2 hours ago', status: 'pending' },
  { id: 2, type: 'hire', user: 'Mike Johnson', action: 'completed onboarding', time: '5 hours ago', status: 'completed' },
  { id: 3, type: 'payroll', user: 'System', action: 'Payroll run completed', time: '1 day ago', status: 'completed' },
  { id: 4, type: 'pto', user: 'Emily Davis', action: 'requested sick leave', time: '1 day ago', status: 'approved' },
  { id: 5, type: 'benefits', user: 'Alex Wong', action: 'enrolled in 401(k)', time: '2 days ago', status: 'completed' },
]

const upcomingPayroll = {
  date: 'February 20, 2026',
  employees: 47,
  grossPay: 124850,
  taxes: 31212,
  deductions: 18727,
  netPay: 74911,
}

const initialPendingApprovals = [
  { id: 1, name: 'Sarah Chen', type: 'PTO Request', details: 'Feb 24-26 (3 days)', avatar: 'SC' },
  { id: 2, name: 'Tom Wilson', type: 'PTO Request', details: 'Mar 3-7 (5 days)', avatar: 'TW' },
  { id: 3, name: 'Lisa Park', type: 'Expense Report', details: '$342.50', avatar: 'LP' },
]

export default function DashboardPage() {
  const [pendingApprovals, setPendingApprovals] = useState(initialPendingApprovals)
  const [processingId, setProcessingId] = useState<number | null>(null)

  const handleApprove = async (id: number) => {
    setProcessingId(id)
    const item = pendingApprovals.find(a => a.id === id)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))

    setPendingApprovals(prev => prev.filter(a => a.id !== id))
    setProcessingId(null)
    toast.success(`${item?.type} for ${item?.name} approved!`)
  }

  const handleDeny = async (id: number) => {
    setProcessingId(id)
    const item = pendingApprovals.find(a => a.id === id)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))

    setPendingApprovals(prev => prev.filter(a => a.id !== id))
    setProcessingId(null)
    toast.error(`${item?.type} for ${item?.name} denied`)
  }

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Good morning, John!</h1>
          <p className="text-slate-600">Here&apos;s what&apos;s happening with your team today.</p>
        </div>
        <div className="flex gap-2">
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
        {stats.map((stat) => (
          <Card key={stat.name} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.bgColor}`}>
                  <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
                {stat.change && (
                  <Badge variant={stat.changeType === 'positive' ? 'default' : 'secondary'} className="text-xs">
                    {stat.changeType === 'positive' ? (
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 mr-1" />
                    )}
                    {stat.change}
                  </Badge>
                )}
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
              <CardDescription>Next pay date: {upcomingPayroll.date}</CardDescription>
            </div>
            <Link href="/payroll">
              <Button variant="ghost" size="sm">
                View Details
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
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

      {/* Activity and AI Assistant */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates from your team</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.status === 'pending' ? 'bg-amber-500' :
                    activity.status === 'approved' ? 'bg-emerald-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-900">
                      <span className="font-medium">{activity.user}</span>
                      {' '}{activity.action}
                    </p>
                    <p className="text-xs text-slate-500">{activity.time}</p>
                  </div>
                  <Badge variant="secondary" className={
                    activity.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                    activity.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-accent text-primary'
                  }>
                    {activity.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

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
                <button
                  key={i}
                  className="w-full text-left p-3 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white/90 transition-colors"
                >
                  {question}
                </button>
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
              <p className="text-sm text-slate-500">Retention Rate</p>
              <p className="text-lg font-semibold text-slate-900">94.2%</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm text-slate-500">New Hires (Q1)</p>
              <p className="text-lg font-semibold text-slate-900">8</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-violet-500" />
            <div>
              <p className="text-sm text-slate-500">Avg Time to Fill</p>
              <p className="text-lg font-semibold text-slate-900">18 days</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <DollarSign className="w-5 h-5 text-amber-500" />
            <div>
              <p className="text-sm text-slate-500">YTD Payroll</p>
              <p className="text-lg font-semibold text-slate-900">$487K</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
