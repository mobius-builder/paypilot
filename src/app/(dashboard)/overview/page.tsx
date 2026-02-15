'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
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
  MessageCircle,
  CalendarDays,
  Heart,
} from 'lucide-react'
import Link from 'next/link'
import { useUser } from '@/contexts/user-context'

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

// Employee-specific data (when logged in as Sarah or another employee)
const EMPLOYEE_STATS = {
  ptoRemaining: 12,
  ptoUsed: 8,
  sickLeave: 5,
  nextPayDate: 'Feb 20, 2026',
  nextPayAmount: 4250,
  pendingRequests: 1,
  upcomingMeetings: 3,
  unreadMessages: 2,
}

const EMPLOYEE_TASKS = [
  { id: '1', task: 'Complete Q1 self-review', due: 'Feb 28', priority: 'high' },
  { id: '2', task: 'Submit expense report', due: 'Feb 22', priority: 'medium' },
  { id: '3', task: 'Update emergency contacts', due: 'Mar 15', priority: 'low' },
]

export default function OverviewPage() {
  const { user, isAdmin, isLoading } = useUser()
  const [approvedItems, setApprovedItems] = useState<string[]>([])

  const handleApprove = (id: string, name: string, type: string) => {
    setApprovedItems((prev) => [...prev, id])
    toast.success(`${type} approved!`, {
      description: `${name}'s request has been approved and they've been notified.`,
    })
  }

  const pendingApprovals = PENDING_APPROVALS.filter((item) => !approvedItems.includes(item.id))

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const firstName = user?.fullName?.split(' ')[0] || 'there'

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } }
  }

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } }
  }

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Welcome header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{getGreeting()}, {firstName}!</h1>
          <p className="text-muted-foreground">
            {isAdmin
              ? `Here's what's happening at ${user?.companyName || 'your company'} today.`
              : 'Here\'s your personal dashboard.'
            }
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className={isAdmin
              ? "text-primary border-primary/20 bg-primary/5"
              : "text-secondary-foreground border-secondary bg-secondary/50"
            }>
              {isAdmin ? 'Admin' : 'Employee'}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {isAdmin ? 'HR Director • Human Resources' : user?.role || 'Team Member'}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {isAdmin ? (
            <>
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
            </>
          ) : (
            <>
              <Link href="/time">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <CalendarDays className="w-4 h-4" />
                  Request Time Off
                </Button>
              </Link>
              <Link href="/messages">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <MessageCircle className="w-4 h-4" />
                  Messages
                  {EMPLOYEE_STATS.unreadMessages > 0 && (
                    <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                      {EMPLOYEE_STATS.unreadMessages}
                    </Badge>
                  )}
                </Button>
              </Link>
              <Link href="/benefits">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Heart className="w-4 h-4" />
                  Benefits
                </Button>
              </Link>
            </>
          )}
        </div>
      </motion.div>

      {/* Stats grid - Admin vs Employee view */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isAdmin ? (
          <>
            <motion.div variants={cardVariants}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-accent">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <Badge variant="outline" className="text-primary border-primary/20 bg-accent">
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                      +3
                    </Badge>
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-bold text-foreground">{STATS.totalEmployees}</p>
                    <p className="text-sm text-muted-foreground">Total Employees</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-accent">
                      <DollarSign className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-bold text-foreground">${STATS.nextPayrollAmount.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">{STATS.nextPayDate}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-accent">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-bold text-foreground">{STATS.pendingPto}</p>
                    <p className="text-sm text-muted-foreground">Pending PTO</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        ) : (
          <>
            {/* Employee-specific stats */}
            <motion.div variants={cardVariants}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-accent">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-bold text-foreground">{EMPLOYEE_STATS.ptoRemaining}</p>
                    <p className="text-sm text-muted-foreground">PTO Days Remaining</p>
                    <p className="text-xs text-muted-foreground mt-1">{EMPLOYEE_STATS.ptoUsed} used this year</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-accent">
                      <DollarSign className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-bold text-foreground">${EMPLOYEE_STATS.nextPayAmount.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Next Paycheck</p>
                    <p className="text-xs text-muted-foreground mt-1">{EMPLOYEE_STATS.nextPayDate}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-accent">
                      <MessageCircle className="w-5 h-5 text-primary" />
                    </div>
                    {EMPLOYEE_STATS.unreadMessages > 0 && (
                      <Badge variant="destructive">
                        {EMPLOYEE_STATS.unreadMessages} new
                      </Badge>
                    )}
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-bold text-foreground">{EMPLOYEE_STATS.unreadMessages}</p>
                    <p className="text-sm text-muted-foreground">Unread Messages</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}

        <motion.div variants={cardVariants}>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-accent">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <Badge variant="outline" className="text-primary border-primary/20 bg-accent">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                +2.1%
              </Badge>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-foreground">{STATS.retentionRate}%</p>
              <p className="text-sm text-muted-foreground">Retention Rate</p>
            </div>
          </CardContent>
        </Card>
        </motion.div>
      </motion.div>

      {/* Main content grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
              <div className="p-4 bg-accent/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Gross Pay</p>
                <p className="text-xl font-semibold text-foreground">
                  ${PAYROLL.grossPay.toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-accent/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Taxes</p>
                <p className="text-xl font-semibold text-red-600">
                  -${PAYROLL.taxes.toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-accent/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Deductions</p>
                <p className="text-xl font-semibold text-muted-foreground">
                  -${PAYROLL.deductions.toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-accent rounded-lg">
                <p className="text-sm text-primary">Net Pay</p>
                <p className="text-xl font-semibold text-primary">
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
                  <p className="font-medium text-foreground">{PAYROLL.employees} employees</p>
                  <p className="text-sm text-muted-foreground">will be paid on {PAYROLL.date}</p>
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
              <Badge variant="secondary" className="bg-accent text-primary">
                <AlertCircle className="w-3 h-3 mr-1" />
                {pendingApprovals.length}
              </Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingApprovals.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-primary" />
                <p className="font-medium">All approvals complete!</p>
                <p className="text-sm">Great job staying on top of requests.</p>
              </div>
            ) : (
              pendingApprovals.slice(0, 4).map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-accent text-primary text-sm">{item.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.type} - {item.details}</p>
                  </div>
                  <Button
                    size="sm"
                    className="bg-primary hover:bg-primary/90"
                    onClick={() => handleApprove(item.id, item.name, item.type)}
                  >
                    Approve
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Organization Insights */}
      <motion.div variants={itemVariants}>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Organization at a Glance</CardTitle>
          <CardDescription>Real-time workforce insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            <div className="flex flex-col items-center p-3 bg-accent/50 rounded-lg">
              <Users className="w-5 h-5 text-primary mb-2" />
              <p className="text-xl font-bold text-foreground">{STATS.totalEmployees}</p>
              <p className="text-xs text-muted-foreground text-center">Employees</p>
            </div>
            <div className="flex flex-col items-center p-3 bg-accent/50 rounded-lg">
              <Building2 className="w-5 h-5 text-primary mb-2" />
              <p className="text-xl font-bold text-foreground">{STATS.departments}</p>
              <p className="text-xs text-muted-foreground text-center">Departments</p>
            </div>
            <div className="flex flex-col items-center p-3 bg-accent/50 rounded-lg">
              <Briefcase className="w-5 h-5 text-primary mb-2" />
              <p className="text-xl font-bold text-foreground">{STATS.openPositions}</p>
              <p className="text-xs text-muted-foreground text-center">Open Roles</p>
            </div>
            <div className="flex flex-col items-center p-3 bg-accent rounded-lg">
              <TrendingUp className="w-5 h-5 text-primary mb-2" />
              <p className="text-xl font-bold text-primary">{STATS.retentionRate}%</p>
              <p className="text-xs text-muted-foreground text-center">Retention</p>
            </div>
            <div className="flex flex-col items-center p-3 bg-accent/50 rounded-lg">
              <Home className="w-5 h-5 text-primary mb-2" />
              <p className="text-xl font-bold text-foreground">{STATS.remoteToday}</p>
              <p className="text-xs text-muted-foreground text-center">Remote Today</p>
            </div>
            <div className="flex flex-col items-center p-3 bg-accent/50 rounded-lg">
              <Calendar className="w-5 h-5 text-muted-foreground mb-2" />
              <p className="text-xl font-bold text-foreground">{STATS.onLeaveToday}</p>
              <p className="text-xs text-muted-foreground text-center">On Leave</p>
            </div>
            <div className="flex flex-col items-center p-3 bg-accent/50 rounded-lg">
              <Gift className="w-5 h-5 text-primary mb-2" />
              <p className="text-xl font-bold text-foreground">{STATS.birthdaysThisWeek}</p>
              <p className="text-xs text-muted-foreground text-center">Birthdays</p>
            </div>
            <div className="flex flex-col items-center p-3 bg-accent/50 rounded-lg">
              <Award className="w-5 h-5 text-primary mb-2" />
              <p className="text-xl font-bold text-foreground">{STATS.anniversaries}</p>
              <p className="text-xs text-muted-foreground text-center">Anniversaries</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Badge variant="outline" className="text-primary border-primary/20 bg-accent">
              <UserPlus className="w-3 h-3 mr-1" />
              +3 this month
            </Badge>
            <Badge variant="outline" className="text-primary border-primary/20 bg-accent">
              <Clock className="w-3 h-3 mr-1" />
              Avg tenure: 2.4 years
            </Badge>
            <Badge variant="outline" className="text-primary border-primary/20 bg-accent">
              <Clock className="w-3 h-3 mr-1" />
              {STATS.avgHoursPerWeek}h avg/week
            </Badge>
          </div>
        </CardContent>
      </Card>
      </motion.div>

      {/* Company Pulse & AI Assistant */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Pulse */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Company Pulse</CardTitle>
                <CardDescription>Employee sentiment this week</CardDescription>
              </div>
              <Badge variant="outline" className="text-primary border-primary/20 bg-accent">
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
                  <span className="text-2xl font-bold text-foreground">{PULSE_DATA.moodScore}</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground mb-2">Top Topics</p>
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
            <CardDescription className="text-muted-foreground">
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
              <Button className="w-full bg-white text-foreground hover:bg-accent">
                <Sparkles className="w-4 h-4 mr-2" />
                Open AI Assistant
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>

      {/* Employee Spotlight - Celebrations */}
      <motion.div variants={itemVariants}>
      <Card className="border-2 border-dashed border-primary/20 bg-accent/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PartyPopper className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Celebrations</CardTitle>
            </div>
            <Badge variant="outline" className="text-primary border-primary/20 bg-accent">
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
                className="flex-shrink-0 w-40 p-4 bg-white rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow text-center"
              >
                <div className="text-2xl mb-2">{celebration.emoji}</div>
                <Avatar className="w-12 h-12 mx-auto mb-2">
                  <AvatarFallback className={`text-sm font-medium ${
                    celebration.type === 'birthday' ? 'bg-accent text-primary' :
                    celebration.type === 'anniversary' ? 'bg-accent text-primary' :
                    'bg-accent text-primary'
                  }`}>
                    {celebration.avatar}
                  </AvatarFallback>
                </Avatar>
                <p className="font-medium text-foreground text-sm truncate">{celebration.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {celebration.type === 'birthday' && <span className="flex items-center justify-center gap-1"><Cake className="w-3 h-3" /> {celebration.detail}</span>}
                  {celebration.type === 'anniversary' && <span className="flex items-center justify-center gap-1"><Star className="w-3 h-3" /> {celebration.detail}</span>}
                  {celebration.type === 'new_hire' && <span className="flex items-center justify-center gap-1"><UserPlus className="w-3 h-3" /> {celebration.detail}</span>}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      </motion.div>

      {/* Recent Activity */}
      <motion.div variants={itemVariants}>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
          <CardDescription>Latest updates across your organization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {RECENT_ACTIVITY.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'employee' ? 'bg-primary' :
                  activity.type === 'payroll' ? 'bg-primary' :
                  activity.type === 'leave' ? 'bg-primary/60' :
                  activity.type === 'benefits' ? 'bg-primary/80' :
                  'bg-muted-foreground'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
                <CheckCircle2 className="w-4 h-4 text-primary" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      </motion.div>
    </motion.div>
  )
}
