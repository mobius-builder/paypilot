'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'
import {
  Users,
  DollarSign,
  Clock,
  Calendar,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Building2,
  Briefcase,
  Gift,
  Home,
  UserPlus,
  Award,
  ArrowUpRight,
  Cake,
  PartyPopper,
  Star,
  Calculator,
  FileText,
  Bot,
  Plus,
} from 'lucide-react'
import Link from 'next/link'

// All hardcoded data - no API calls
const STATS = {
  totalEmployees: 47,
  departments: 8,
  openPositions: 3,
  retentionRate: 94.2,
  nextPayrollAmount: 116090,
  nextPayDate: 'Feb 20, 2026',
  pendingPto: 5,
  avgHoursPerWeek: 38.5,
  remoteToday: 18,
  onLeaveToday: 2,
  birthdaysThisWeek: 2,
  anniversaries: 4,
}

const PAYROLL = {
  date: 'February 20, 2026',
  employees: 47,
  grossPay: 171731,
  taxes: 42933,
  deductions: 12708,
  netPay: 116090,
}

const PENDING_APPROVALS = [
  { id: '1', name: 'Sarah Chen', type: 'PTO Request', details: 'Feb 20 - Feb 22 (3 days)', avatar: 'SC' },
  { id: '2', name: 'Marcus Johnson', type: 'PTO Request', details: 'Feb 25 (1 day)', avatar: 'MJ' },
  { id: '3', name: 'Emily Rodriguez', type: 'Sick Leave', details: 'Feb 18 - Feb 19 (2 days)', avatar: 'ER' },
  { id: '4', name: 'David Kim', type: 'PTO Request', details: 'Mar 1 - Mar 5 (5 days)', avatar: 'DK' },
  { id: '5', name: 'Rachel Wong', type: 'PTO Request', details: 'Feb 28 (1 day)', avatar: 'RW' },
]

const RECENT_ACTIVITY = [
  { id: '1', type: 'employee', action: 'New employee onboarded: James Wilson', time: '2 hours ago' },
  { id: '2', type: 'payroll', action: 'Payroll run completed - 47 employees paid', time: '5 hours ago' },
  { id: '3', type: 'leave', action: 'PTO approved for Lisa Park', time: 'Yesterday' },
  { id: '4', type: 'benefits', action: 'Benefits enrollment updated - 12 changes', time: 'Yesterday' },
  { id: '5', type: 'compliance', action: 'Q4 2025 tax filings submitted', time: '3 days ago' },
  { id: '6', type: 'employee', action: 'Performance review completed for Engineering team', time: '4 days ago' },
]

const PULSE_DATA = {
  moodScore: 82,
  trend: '+5%',
  topTopics: ['Work-life balance', 'Career growth', 'Team collaboration', 'Benefits', 'Remote work'],
}

const CELEBRATIONS = [
  { id: '1', type: 'birthday', name: 'Lisa Park', detail: 'Today!', avatar: 'LP', emoji: '🎂' },
  { id: '2', type: 'anniversary', name: 'Michael Torres', detail: '3 years', avatar: 'MT', emoji: '🎉' },
  { id: '3', type: 'new_hire', name: 'James Wilson', detail: 'Started Feb 14', avatar: 'JW', emoji: '👋' },
  { id: '4', type: 'birthday', name: 'Emma Davis', detail: 'Tomorrow', avatar: 'ED', emoji: '🎂' },
  { id: '5', type: 'anniversary', name: 'David Kim', detail: '5 years', avatar: 'DK', emoji: '⭐' },
]

export default function OverviewPage() {
  const [approvedItems, setApprovedItems] = useState<string[]>([])

  const handleApprove = (id: string, name: string, type: string) => {
    setApprovedItems((prev) => [...prev, id])
    toast.success(`${type} approved!`, {
      description: `${name}'s request has been approved and they've been notified.`,
    })
  }

  const pendingApprovals = PENDING_APPROVALS.filter((item) => !approvedItems.includes(item.id))

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Good morning, Alex!</h1>
          <p className="text-slate-600">Here&apos;s what&apos;s happening at Acme Corporation today.</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">
              Admin
            </Badge>
            <span className="text-sm text-slate-500">HR Director • Human Resources</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/employees?add=true">
            <Button variant="outline" size="sm" className="gap-1.5">
              <UserPlus className="w-4 h-4" />
              Add Employee
            </Button>
          </Link>
          <Link href="/payroll/run">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Calculator className="w-4 h-4" />
              Run Payroll
            </Button>
          </Link>
          <Link href="/agents">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Bot className="w-4 h-4" />
              Launch Agent
            </Button>
          </Link>
          <Link href="/reports">
            <Button variant="outline" size="sm" className="gap-1.5">
              <FileText className="w-4 h-4" />
              Reports
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-accent">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                +3
              </Badge>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-slate-900">{STATS.totalEmployees}</p>
              <p className="text-sm text-slate-500">Total Employees</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-emerald-100">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-slate-900">${STATS.nextPayrollAmount.toLocaleString()}</p>
              <p className="text-sm text-slate-500">{STATS.nextPayDate}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-violet-100">
                <Calendar className="w-5 h-5 text-violet-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-slate-900">{STATS.pendingPto}</p>
              <p className="text-sm text-slate-500">Pending PTO</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-amber-100">
                <TrendingUp className="w-5 h-5 text-amber-600" />
              </div>
              <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                +2.1%
              </Badge>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-slate-900">{STATS.retentionRate}%</p>
              <p className="text-sm text-slate-500">Retention Rate</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Payroll */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Upcoming Payroll</CardTitle>
              <CardDescription>Next pay date: {PAYROLL.date}</CardDescription>
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
                  ${PAYROLL.grossPay.toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500">Taxes</p>
                <p className="text-xl font-semibold text-red-600">
                  -${PAYROLL.taxes.toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500">Deductions</p>
                <p className="text-xl font-semibold text-amber-600">
                  -${PAYROLL.deductions.toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-lg">
                <p className="text-sm text-emerald-600">Net Pay</p>
                <p className="text-xl font-semibold text-emerald-700">
                  ${PAYROLL.netPay.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between p-4 bg-accent rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center border border-border">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">{PAYROLL.employees} employees</p>
                  <p className="text-sm text-slate-500">will be paid on {PAYROLL.date}</p>
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
                {pendingApprovals.length > 0
                  ? `${pendingApprovals.length} items need attention`
                  : 'All caught up!'}
              </CardDescription>
            </div>
            {pendingApprovals.length > 0 && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                <AlertCircle className="w-3 h-3 mr-1" />
                {pendingApprovals.length}
              </Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingApprovals.length === 0 ? (
              <div className="text-center py-6 text-slate-500">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-500" />
                <p className="font-medium">All approvals complete!</p>
                <p className="text-sm">Great job staying on top of requests.</p>
              </div>
            ) : (
              pendingApprovals.slice(0, 4).map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-accent text-primary text-sm">{item.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{item.name}</p>
                    <p className="text-sm text-slate-500">{item.type} - {item.details}</p>
                  </div>
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => handleApprove(item.id, item.name, item.type)}
                  >
                    Approve
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Organization Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Organization at a Glance</CardTitle>
          <CardDescription>Real-time workforce insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            <div className="flex flex-col items-center p-3 bg-slate-50 rounded-lg">
              <Users className="w-5 h-5 text-primary mb-2" />
              <p className="text-xl font-bold text-slate-900">{STATS.totalEmployees}</p>
              <p className="text-xs text-slate-500 text-center">Employees</p>
            </div>
            <div className="flex flex-col items-center p-3 bg-slate-50 rounded-lg">
              <Building2 className="w-5 h-5 text-violet-500 mb-2" />
              <p className="text-xl font-bold text-slate-900">{STATS.departments}</p>
              <p className="text-xs text-slate-500 text-center">Departments</p>
            </div>
            <div className="flex flex-col items-center p-3 bg-slate-50 rounded-lg">
              <Briefcase className="w-5 h-5 text-amber-500 mb-2" />
              <p className="text-xl font-bold text-slate-900">{STATS.openPositions}</p>
              <p className="text-xs text-slate-500 text-center">Open Roles</p>
            </div>
            <div className="flex flex-col items-center p-3 bg-emerald-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-emerald-500 mb-2" />
              <p className="text-xl font-bold text-emerald-700">{STATS.retentionRate}%</p>
              <p className="text-xs text-slate-500 text-center">Retention</p>
            </div>
            <div className="flex flex-col items-center p-3 bg-slate-50 rounded-lg">
              <Home className="w-5 h-5 text-blue-500 mb-2" />
              <p className="text-xl font-bold text-slate-900">{STATS.remoteToday}</p>
              <p className="text-xs text-slate-500 text-center">Remote Today</p>
            </div>
            <div className="flex flex-col items-center p-3 bg-slate-50 rounded-lg">
              <Calendar className="w-5 h-5 text-red-400 mb-2" />
              <p className="text-xl font-bold text-slate-900">{STATS.onLeaveToday}</p>
              <p className="text-xs text-slate-500 text-center">On Leave</p>
            </div>
            <div className="flex flex-col items-center p-3 bg-slate-50 rounded-lg">
              <Gift className="w-5 h-5 text-pink-500 mb-2" />
              <p className="text-xl font-bold text-slate-900">{STATS.birthdaysThisWeek}</p>
              <p className="text-xs text-slate-500 text-center">Birthdays</p>
            </div>
            <div className="flex flex-col items-center p-3 bg-slate-50 rounded-lg">
              <Award className="w-5 h-5 text-amber-500 mb-2" />
              <p className="text-xl font-bold text-slate-900">{STATS.anniversaries}</p>
              <p className="text-xs text-slate-500 text-center">Anniversaries</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">
              <UserPlus className="w-3 h-3 mr-1" />
              +3 this month
            </Badge>
            <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
              <Clock className="w-3 h-3 mr-1" />
              Avg tenure: 2.4 years
            </Badge>
            <Badge variant="outline" className="text-violet-600 border-violet-200 bg-violet-50">
              <Clock className="w-3 h-3 mr-1" />
              {STATS.avgHoursPerWeek}h avg/week
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Company Pulse & AI Assistant */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Pulse */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Company Pulse</CardTitle>
                <CardDescription>Employee sentiment this week</CardDescription>
              </div>
              <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">
                {PULSE_DATA.trend} vs last week
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6 mb-6">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle cx="48" cy="48" r="40" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                  <circle
                    cx="48" cy="48" r="40" fill="none" stroke="#3A7139" strokeWidth="8"
                    strokeDasharray={`${PULSE_DATA.moodScore * 2.51} 251`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-slate-900">{PULSE_DATA.moodScore}</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-700 mb-2">Top Topics</p>
                <div className="flex flex-wrap gap-2">
                  {PULSE_DATA.topTopics.map((topic, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <Link href="/admin/insights">
              <Button variant="outline" className="w-full">
                View Full Insights
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
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
                <Link key={i} href="/ai">
                  <button className="w-full text-left p-3 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white/90 transition-colors">
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

      {/* Employee Spotlight - Celebrations */}
      <Card className="border-2 border-dashed border-amber-200 bg-gradient-to-r from-amber-50/50 to-pink-50/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PartyPopper className="w-5 h-5 text-amber-500" />
              <CardTitle className="text-lg">Celebrations</CardTitle>
            </div>
            <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
              {CELEBRATIONS.length} this week
            </Badge>
          </div>
          <CardDescription>Birthdays, work anniversaries, and new team members</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {CELEBRATIONS.map((celebration) => (
              <div
                key={celebration.id}
                className="flex-shrink-0 w-40 p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow text-center"
              >
                <div className="text-2xl mb-2">{celebration.emoji}</div>
                <Avatar className="w-12 h-12 mx-auto mb-2">
                  <AvatarFallback className={`text-sm font-medium ${
                    celebration.type === 'birthday' ? 'bg-pink-100 text-pink-700' :
                    celebration.type === 'anniversary' ? 'bg-amber-100 text-amber-700' :
                    'bg-emerald-100 text-emerald-700'
                  }`}>
                    {celebration.avatar}
                  </AvatarFallback>
                </Avatar>
                <p className="font-medium text-slate-900 text-sm truncate">{celebration.name}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {celebration.type === 'birthday' && <span className="flex items-center justify-center gap-1"><Cake className="w-3 h-3" /> {celebration.detail}</span>}
                  {celebration.type === 'anniversary' && <span className="flex items-center justify-center gap-1"><Star className="w-3 h-3" /> {celebration.detail}</span>}
                  {celebration.type === 'new_hire' && <span className="flex items-center justify-center gap-1"><UserPlus className="w-3 h-3" /> {celebration.detail}</span>}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
          <CardDescription>Latest updates across your organization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {RECENT_ACTIVITY.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'employee' ? 'bg-primary' :
                  activity.type === 'payroll' ? 'bg-emerald-500' :
                  activity.type === 'leave' ? 'bg-violet-500' :
                  activity.type === 'benefits' ? 'bg-amber-500' :
                  'bg-slate-400'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">{activity.action}</p>
                  <p className="text-xs text-slate-500">{activity.time}</p>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
