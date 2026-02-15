'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Users,
  Calendar,
  Download,
  ChevronRight,
  Bell,
  MoreVertical,
  Filter,
  Search,
  TrendingUp,
  Building2,
  Loader2,
  X,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ComplianceTask {
  id: string
  title: string
  category: 'tax' | 'employment' | 'benefits' | 'safety' | 'reporting'
  status: 'compliant' | 'pending' | 'overdue' | 'upcoming'
  dueDate: string
  description: string
  assignee: string
  assigneeTeam: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  frequency: 'one-time' | 'monthly' | 'quarterly' | 'annual'
  completedDate?: string
  documents?: string[]
  snoozedUntil?: string
}

interface TrainingStatus {
  overview: {
    totalEmployees: number
    completedCount: number
    inProgressCount: number
    notStartedCount: number
    completionRate: number
    dueDate: string
  }
  courses: Array<{
    id: string
    name: string
    required: boolean
    duration: string
    completedCount: number
    totalRequired: number
    dueDate: string | null
  }>
  byDepartment: Array<{
    department: string
    total: number
    completed: number
    completionRate: number
  }>
  pendingEmployees: Array<{
    id: string
    name: string
    department: string
    course: string
    status: string
    progress: number
  }>
}

interface ScheduledAudit {
  id: string
  vendor: string
  date: string
  type: string
  status: string
  createdAt: string
}

const STATUS_CONFIG = {
  compliant: { color: 'bg-primary', badge: 'bg-accent text-primary', label: 'Compliant' },
  pending: { color: 'bg-primary/60', badge: 'bg-accent text-primary', label: 'In Progress' },
  overdue: { color: 'bg-destructive', badge: 'bg-destructive/10 text-destructive', label: 'Overdue' },
  upcoming: { color: 'bg-primary/40', badge: 'bg-accent text-primary', label: 'Upcoming' },
}

const CATEGORY_CONFIG = {
  tax: { icon: FileText, color: 'bg-accent text-primary' },
  employment: { icon: Users, color: 'bg-accent text-primary' },
  benefits: { icon: Shield, color: 'bg-accent text-primary' },
  safety: { icon: AlertTriangle, color: 'bg-accent text-primary' },
  reporting: { icon: TrendingUp, color: 'bg-accent text-primary' },
}

const PRIORITY_CONFIG = {
  low: 'bg-accent/50 text-muted-foreground',
  medium: 'bg-accent text-primary',
  high: 'bg-accent text-primary',
  critical: 'bg-destructive/10 text-destructive',
}

export default function CompliancePage() {
  const [tasks, setTasks] = useState<ComplianceTask[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Detail drawer state
  const [selectedTask, setSelectedTask] = useState<ComplianceTask | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  // Status change dialog
  const [statusChangeTask, setStatusChangeTask] = useState<ComplianceTask | null>(null)

  // Training status panel
  const [isTrainingOpen, setIsTrainingOpen] = useState(false)
  const [trainingStatus, setTrainingStatus] = useState<TrainingStatus | null>(null)
  const [isLoadingTraining, setIsLoadingTraining] = useState(false)

  // Audit schedule dialog
  const [isAuditDialogOpen, setIsAuditDialogOpen] = useState(false)
  const [auditVendor, setAuditVendor] = useState('')
  const [auditDate, setAuditDate] = useState('')
  const [isSchedulingAudit, setIsSchedulingAudit] = useState(false)
  const [scheduledAudits, setScheduledAudits] = useState<ScheduledAudit[]>([])

  // Action loading states
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Fetch tasks on mount
  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/compliance/tasks')
      if (res.ok) {
        const data = await res.json()
        setTasks(data.tasks)
      } else {
        toast.error('Failed to load compliance tasks')
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
      toast.error('Failed to load compliance tasks')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || task.category === categoryFilter
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter
    return matchesSearch && matchesCategory && matchesStatus
  })

  const stats = {
    total: tasks.length,
    compliant: tasks.filter(t => t.status === 'compliant').length,
    pending: tasks.filter(t => t.status === 'pending').length,
    overdue: tasks.filter(t => t.status === 'overdue').length,
    upcoming: tasks.filter(t => t.status === 'upcoming').length,
  }

  const complianceScore = stats.total > 0 ? Math.round((stats.compliant / stats.total) * 100) : 0

  // ========== API ACTIONS ==========

  const handleMarkComplete = async (taskId: string) => {
    setActionLoading(taskId)
    try {
      const res = await fetch(`/api/compliance/tasks/${taskId}/complete`, {
        method: 'POST',
      })
      if (res.ok) {
        const data = await res.json()
        setTasks(prev => prev.map(t => t.id === taskId ? data.task : t))
        toast.success('Task marked as complete')
        setIsDetailOpen(false)
        setSelectedTask(null)
      } else {
        toast.error('Failed to complete task')
      }
    } catch (error) {
      console.error('Error completing task:', error)
      toast.error('Failed to complete task')
    } finally {
      setActionLoading(null)
    }
  }

  const handleSnooze = async (taskId: string, days: number) => {
    setActionLoading(taskId)
    try {
      const res = await fetch(`/api/compliance/tasks/${taskId}/snooze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days }),
      })
      if (res.ok) {
        const data = await res.json()
        setTasks(prev => prev.map(t => t.id === taskId ? data.task : t))
        toast.success(data.message)
      } else {
        toast.error('Failed to snooze task')
      }
    } catch (error) {
      console.error('Error snoozing task:', error)
      toast.error('Failed to snooze task')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReassign = async (taskId: string, team: string) => {
    setActionLoading(taskId)
    try {
      const res = await fetch(`/api/compliance/tasks/${taskId}/reassign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team }),
      })
      if (res.ok) {
        const data = await res.json()
        setTasks(prev => prev.map(t => t.id === taskId ? data.task : t))
        toast.success(data.message)
      } else {
        toast.error('Failed to reassign task')
      }
    } catch (error) {
      console.error('Error reassigning task:', error)
      toast.error('Failed to reassign task')
    } finally {
      setActionLoading(null)
    }
  }

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    setActionLoading(taskId)
    try {
      const res = await fetch(`/api/compliance/tasks/${taskId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        const data = await res.json()
        setTasks(prev => prev.map(t => t.id === taskId ? data.task : t))
        toast.success(data.message)
        setStatusChangeTask(null)
      } else {
        toast.error('Failed to update status')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    } finally {
      setActionLoading(null)
    }
  }

  const handleExportTask = async (taskId: string, format: 'json' | 'csv') => {
    try {
      const res = await fetch(`/api/compliance/tasks/${taskId}/export?format=${format}`)
      if (res.ok) {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `compliance_task_${taskId}.${format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success(`Task exported as ${format.toUpperCase()}`)
      } else {
        toast.error('Failed to export task')
      }
    } catch (error) {
      console.error('Error exporting task:', error)
      toast.error('Failed to export task')
    }
  }

  const handleGenerateReport = async (format: 'pdf' | 'csv' | 'json') => {
    try {
      toast.loading('Generating report...')
      const res = await fetch(`/api/compliance/report?format=${format}`)
      if (res.ok) {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        const ext = format === 'pdf' ? 'txt' : format
        a.download = `compliance_report_${new Date().toISOString().split('T')[0]}.${ext}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.dismiss()
        toast.success(`Report downloaded as ${format.toUpperCase()}`)
      } else {
        toast.dismiss()
        toast.error('Failed to generate report')
      }
    } catch (error) {
      console.error('Error generating report:', error)
      toast.dismiss()
      toast.error('Failed to generate report')
    }
  }

  const handleLoadTrainingStatus = async () => {
    setIsTrainingOpen(true)
    setIsLoadingTraining(true)
    try {
      const res = await fetch('/api/compliance/training/status')
      if (res.ok) {
        const data = await res.json()
        setTrainingStatus(data)
      } else {
        toast.error('Failed to load training status')
      }
    } catch (error) {
      console.error('Error loading training status:', error)
      toast.error('Failed to load training status')
    } finally {
      setIsLoadingTraining(false)
    }
  }

  const handleScheduleAudit = async () => {
    setIsSchedulingAudit(true)
    try {
      const res = await fetch('/api/compliance/audit/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendor: auditVendor || 'External Auditor',
          date: auditDate || undefined,
          type: 'Compliance Audit',
        }),
      })
      if (res.ok) {
        const data = await res.json()
        toast.success(data.message)
        setScheduledAudits(prev => [...prev, data.audit])
        setIsAuditDialogOpen(false)
        setAuditVendor('')
        setAuditDate('')
      } else {
        toast.error('Failed to schedule audit')
      }
    } catch (error) {
      console.error('Error scheduling audit:', error)
      toast.error('Failed to schedule audit')
    } finally {
      setIsSchedulingAudit(false)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Compliance Center
          </h1>
          <p className="text-muted-foreground">
            Track and manage HR compliance requirements
          </p>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleGenerateReport('json')}>
                <FileText className="w-4 h-4 mr-2" />
                Export as JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleGenerateReport('csv')}>
                <FileText className="w-4 h-4 mr-2" />
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleGenerateReport('pdf')}>
                <FileText className="w-4 h-4 mr-2" />
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={fetchTasks} variant="outline" size="icon">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Compliance Score Card */}
      <Card className="bg-accent/50 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-muted/30"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeDasharray={`${complianceScore * 2.51} 251`}
                    className={cn(
                      complianceScore >= 80 ? 'text-green-500' :
                      complianceScore >= 60 ? 'text-yellow-500' : 'text-red-500'
                    )}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">{complianceScore}%</span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Compliance Score</h3>
                <p className="text-muted-foreground">
                  {stats.compliant} of {stats.total} items complete
                </p>
                {stats.overdue > 0 && (
                  <p className="text-red-600 text-sm flex items-center gap-1 mt-1">
                    <AlertTriangle className="h-4 w-4" />
                    {stats.overdue} overdue item{stats.overdue > 1 ? 's' : ''} need attention
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-white/50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{stats.compliant}</p>
                <p className="text-sm text-muted-foreground">Compliant</p>
              </div>
              <div className="text-center p-3 bg-white/50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
              <div className="text-center p-3 bg-white/50 rounded-lg">
                <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
                <p className="text-sm text-muted-foreground">Overdue</p>
              </div>
              <div className="text-center p-3 bg-white/50 rounded-lg">
                <p className="text-2xl font-bold text-primary">{stats.upcoming}</p>
                <p className="text-sm text-muted-foreground">Upcoming</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search compliance items..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="tax">Tax</SelectItem>
            <SelectItem value="employment">Employment</SelectItem>
            <SelectItem value="benefits">Benefits</SelectItem>
            <SelectItem value="safety">Safety</SelectItem>
            <SelectItem value="reporting">Reporting</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="pending">In Progress</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="compliant">Compliant</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Compliance Items */}
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {filteredTasks.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No items found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filters
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredTasks.map((task, index) => {
              const CategoryIcon = CATEGORY_CONFIG[task.category].icon
              const daysUntil = getDaysUntilDue(task.dueDate)

              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className={cn(
                      "hover:shadow-md transition-shadow cursor-pointer",
                      task.status === 'overdue' && "border-red-200 bg-red-50/50"
                    )}
                    onClick={() => {
                      setSelectedTask(task)
                      setIsDetailOpen(true)
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          "p-2 rounded-lg flex-shrink-0",
                          CATEGORY_CONFIG[task.category].color
                        )}>
                          <CategoryIcon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <h3 className="font-medium">{task.title}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {task.description}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {/* Clickable Status Badge */}
                              <Badge
                                className={cn(STATUS_CONFIG[task.status].badge, "cursor-pointer hover:opacity-80")}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setStatusChangeTask(task)
                                }}
                              >
                                {STATUS_CONFIG[task.status].label}
                              </Badge>
                              {/* Kebab Menu */}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {task.status !== 'compliant' && (
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleMarkComplete(task.id)
                                      }}
                                      disabled={actionLoading === task.id}
                                    >
                                      <CheckCircle2 className="h-4 w-4 mr-2" />
                                      Mark Complete
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleSnooze(task.id, 7)
                                    }}
                                    disabled={actionLoading === task.id}
                                  >
                                    <Clock className="h-4 w-4 mr-2" />
                                    Snooze 7 Days
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleReassign(task.id, 'HR')
                                    }}
                                    disabled={actionLoading === task.id}
                                  >
                                    <Users className="h-4 w-4 mr-2" />
                                    Reassign to HR
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleReassign(task.id, 'Finance')
                                    }}
                                    disabled={actionLoading === task.id}
                                  >
                                    <Users className="h-4 w-4 mr-2" />
                                    Reassign to Finance
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleReassign(task.id, 'Benefits')
                                    }}
                                    disabled={actionLoading === task.id}
                                  >
                                    <Users className="h-4 w-4 mr-2" />
                                    Reassign to Benefits
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleExportTask(task.id, 'json')
                                    }}
                                  >
                                    <Download className="h-4 w-4 mr-2" />
                                    Export as JSON
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleExportTask(task.id, 'csv')
                                    }}
                                  >
                                    <Download className="h-4 w-4 mr-2" />
                                    Export as CSV
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                          <div className="flex items-center flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              {task.status === 'compliant' ? (
                                <span>Completed {formatDate(task.completedDate!)}</span>
                              ) : (
                                <span className={cn(daysUntil < 0 && 'text-red-600 font-medium')}>
                                  Due {formatDate(task.dueDate)}
                                  {daysUntil < 0 && ` (${Math.abs(daysUntil)} days overdue)`}
                                  {daysUntil >= 0 && daysUntil <= 7 && ` (${daysUntil} days left)`}
                                </span>
                              )}
                            </div>
                            <Badge variant="secondary" className={PRIORITY_CONFIG[task.priority]}>
                              {task.priority}
                            </Badge>
                            <span className="text-muted-foreground capitalize">
                              {task.frequency}
                            </span>
                            <span className="text-muted-foreground">
                              Assigned: {task.assignee}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })
          )}
        </TabsContent>

        <TabsContent value="calendar">
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Calendar View Coming Soon</h3>
              <p className="text-muted-foreground">
                Visualize your compliance deadlines on a calendar
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => handleGenerateReport('csv')}
        >
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-accent">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">Generate Report</h3>
              <p className="text-sm text-muted-foreground">
                Download compliance summary
              </p>
            </div>
          </CardContent>
        </Card>
        <Card
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => setIsAuditDialogOpen(true)}
        >
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-accent">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">Compliance Audit</h3>
              <p className="text-sm text-muted-foreground">
                Schedule external audit
              </p>
            </div>
          </CardContent>
        </Card>
        <Card
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={handleLoadTrainingStatus}
        >
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-accent">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">Training Status</h3>
              <p className="text-sm text-muted-foreground">
                View employee training progress
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task Detail Drawer */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedTask && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className={cn(
                    "p-2 rounded-lg",
                    CATEGORY_CONFIG[selectedTask.category].color
                  )}>
                    {(() => {
                      const Icon = CATEGORY_CONFIG[selectedTask.category].icon
                      return <Icon className="h-5 w-5" />
                    })()}
                  </div>
                  <Badge className={STATUS_CONFIG[selectedTask.status].badge}>
                    {STATUS_CONFIG[selectedTask.status].label}
                  </Badge>
                </div>
                <SheetTitle>{selectedTask.title}</SheetTitle>
                <SheetDescription>{selectedTask.description}</SheetDescription>
              </SheetHeader>

              <div className="space-y-6 py-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Due Date</p>
                    <p className="font-medium">{formatDate(selectedTask.dueDate)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Priority</p>
                    <Badge className={PRIORITY_CONFIG[selectedTask.priority]}>
                      {selectedTask.priority}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Frequency</p>
                    <p className="font-medium capitalize">{selectedTask.frequency}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Assigned To</p>
                    <p className="font-medium">{selectedTask.assignee}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Team</p>
                    <p className="font-medium">{selectedTask.assigneeTeam}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Category</p>
                    <p className="font-medium capitalize">{selectedTask.category}</p>
                  </div>
                </div>

                {selectedTask.documents && selectedTask.documents.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Documents</p>
                    <div className="space-y-2">
                      {selectedTask.documents.map((doc, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 bg-accent rounded">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm flex-1">{doc}</span>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedTask.completedDate && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg text-green-700">
                    <CheckCircle2 className="h-5 w-5" />
                    <span>Completed on {formatDate(selectedTask.completedDate)}</span>
                  </div>
                )}

                <div className="flex gap-2">
                  {selectedTask.status !== 'compliant' && (
                    <Button
                      onClick={() => handleMarkComplete(selectedTask.id)}
                      disabled={actionLoading === selectedTask.id}
                      className="flex-1"
                    >
                      {actionLoading === selectedTask.id ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                      )}
                      Mark Complete
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => handleExportTask(selectedTask.id, 'json')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Status Change Dialog */}
      <Dialog open={!!statusChangeTask} onOpenChange={() => setStatusChangeTask(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Change Status</DialogTitle>
            <DialogDescription>
              Select a new status for this task
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2 py-4">
            {(['upcoming', 'pending', 'compliant', 'overdue'] as const).map((status) => (
              <Button
                key={status}
                variant={statusChangeTask?.status === status ? 'default' : 'outline'}
                className="justify-start"
                onClick={() => statusChangeTask && handleStatusChange(statusChangeTask.id, status)}
                disabled={actionLoading === statusChangeTask?.id}
              >
                {STATUS_CONFIG[status].label}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Training Status Sheet */}
      <Sheet open={isTrainingOpen} onOpenChange={setIsTrainingOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Training Status</SheetTitle>
            <SheetDescription>
              Employee training completion across all required courses
            </SheetDescription>
          </SheetHeader>

          {isLoadingTraining ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : trainingStatus ? (
            <div className="space-y-6 py-6">
              {/* Overview */}
              <div className="p-4 bg-accent/50 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-2xl font-bold">{trainingStatus.overview.completionRate}%</p>
                    <p className="text-sm text-muted-foreground">Overall Completion</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{trainingStatus.overview.completedCount}/{trainingStatus.overview.totalEmployees}</p>
                    <p className="text-sm text-muted-foreground">Employees Complete</p>
                  </div>
                </div>
                <Progress value={trainingStatus.overview.completionRate} className="h-3" />
                <p className="text-xs text-muted-foreground mt-2">
                  Due: {formatDate(trainingStatus.overview.dueDate)}
                </p>
              </div>

              {/* By Department */}
              <div>
                <h4 className="font-medium mb-3">By Department</h4>
                <div className="space-y-3">
                  {trainingStatus.byDepartment.map((dept) => (
                    <div key={dept.department}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{dept.department}</span>
                        <span className="text-muted-foreground">
                          {dept.completed}/{dept.total} ({dept.completionRate}%)
                        </span>
                      </div>
                      <Progress value={dept.completionRate} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Pending Employees */}
              <div>
                <h4 className="font-medium mb-3">Pending Completion ({trainingStatus.pendingEmployees.length})</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {trainingStatus.pendingEmployees.map((emp) => (
                    <div key={emp.id} className="flex items-center justify-between p-2 bg-accent/30 rounded">
                      <div>
                        <p className="font-medium text-sm">{emp.name}</p>
                        <p className="text-xs text-muted-foreground">{emp.department}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={emp.progress} className="w-16 h-2" />
                        <span className="text-xs text-muted-foreground w-8">{emp.progress}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>

      {/* Schedule Audit Dialog */}
      <Dialog open={isAuditDialogOpen} onOpenChange={setIsAuditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Compliance Audit</DialogTitle>
            <DialogDescription>
              Schedule an external compliance audit with a vendor
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Vendor/Auditor</label>
              <Input
                placeholder="e.g., Deloitte, KPMG, Internal Audit"
                value={auditVendor}
                onChange={(e) => setAuditVendor(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Preferred Date</label>
              <Input
                type="date"
                value={auditDate}
                onChange={(e) => setAuditDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            {scheduledAudits.length > 0 && (
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-2">Scheduled Audits</h4>
                <div className="space-y-2">
                  {scheduledAudits.map((audit) => (
                    <div key={audit.id} className="flex items-center justify-between p-2 bg-accent rounded text-sm">
                      <span>{audit.vendor}</span>
                      <span className="text-muted-foreground">{formatDate(audit.date)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAuditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleScheduleAudit} disabled={isSchedulingAudit}>
              {isSchedulingAudit ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Scheduling...
                </>
              ) : (
                'Schedule Audit'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
