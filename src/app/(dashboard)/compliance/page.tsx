'use client'

import { useState } from 'react'
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
  XCircle,
  MoreVertical,
  Filter,
  Search,
  TrendingUp,
  Building2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ComplianceItem {
  id: string
  title: string
  category: 'tax' | 'employment' | 'benefits' | 'safety' | 'reporting'
  status: 'compliant' | 'pending' | 'overdue' | 'upcoming'
  dueDate: string
  description: string
  assignee: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  frequency: 'one-time' | 'monthly' | 'quarterly' | 'annual'
  completedDate?: string
  documents?: string[]
}

const COMPLIANCE_ITEMS: ComplianceItem[] = [
  {
    id: '1',
    title: 'Form 941 - Quarterly Federal Tax Return',
    category: 'tax',
    status: 'upcoming',
    dueDate: '2026-04-30',
    description: 'File quarterly federal tax return reporting wages paid to employees',
    assignee: 'John Smith',
    priority: 'high',
    frequency: 'quarterly',
  },
  {
    id: '2',
    title: 'I-9 Employment Verification',
    category: 'employment',
    status: 'pending',
    dueDate: '2026-02-18',
    description: 'Complete I-9 forms for 3 new hires from January batch',
    assignee: 'Sarah Chen',
    priority: 'high',
    frequency: 'one-time',
  },
  {
    id: '3',
    title: 'OSHA 300A Posting',
    category: 'safety',
    status: 'compliant',
    dueDate: '2026-02-01',
    description: 'Post OSHA Form 300A summary of work-related injuries',
    assignee: 'Mike Johnson',
    priority: 'medium',
    frequency: 'annual',
    completedDate: '2026-01-28',
    documents: ['OSHA_300A_2025.pdf'],
  },
  {
    id: '4',
    title: 'W-2 Distribution',
    category: 'tax',
    status: 'compliant',
    dueDate: '2026-01-31',
    description: 'Distribute W-2 forms to all employees',
    assignee: 'Payroll Team',
    priority: 'critical',
    frequency: 'annual',
    completedDate: '2026-01-29',
    documents: ['W2_batch_2025.pdf'],
  },
  {
    id: '5',
    title: '401(k) ADP/ACP Testing',
    category: 'benefits',
    status: 'pending',
    dueDate: '2026-03-15',
    description: 'Complete annual discrimination testing for 401(k) plan',
    assignee: 'Benefits Admin',
    priority: 'high',
    frequency: 'annual',
  },
  {
    id: '6',
    title: 'State Unemployment Tax Filing',
    category: 'tax',
    status: 'overdue',
    dueDate: '2026-02-10',
    description: 'File quarterly state unemployment tax returns (CA, NY, TX)',
    assignee: 'John Smith',
    priority: 'critical',
    frequency: 'quarterly',
  },
  {
    id: '7',
    title: 'EEO-1 Report',
    category: 'reporting',
    status: 'upcoming',
    dueDate: '2026-05-31',
    description: 'Submit annual EEO-1 Component 1 data collection',
    assignee: 'HR Team',
    priority: 'medium',
    frequency: 'annual',
  },
  {
    id: '8',
    title: 'Benefits Enrollment Audit',
    category: 'benefits',
    status: 'compliant',
    dueDate: '2026-01-15',
    description: 'Verify all employee benefit elections are properly recorded',
    assignee: 'Benefits Admin',
    priority: 'medium',
    frequency: 'annual',
    completedDate: '2026-01-12',
  },
  {
    id: '9',
    title: 'Harassment Prevention Training',
    category: 'employment',
    status: 'pending',
    dueDate: '2026-03-31',
    description: 'Complete mandatory harassment prevention training for all CA employees',
    assignee: 'HR Team',
    priority: 'high',
    frequency: 'annual',
  },
  {
    id: '10',
    title: 'Workers Comp Insurance Audit',
    category: 'safety',
    status: 'upcoming',
    dueDate: '2026-04-15',
    description: 'Complete annual workers compensation insurance audit',
    assignee: 'Finance Team',
    priority: 'medium',
    frequency: 'annual',
  },
]

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
  const [items, setItems] = useState<ComplianceItem[]>(COMPLIANCE_ITEMS)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedItem, setSelectedItem] = useState<ComplianceItem | null>(null)

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    return matchesSearch && matchesCategory && matchesStatus
  })

  const stats = {
    total: items.length,
    compliant: items.filter(i => i.status === 'compliant').length,
    pending: items.filter(i => i.status === 'pending').length,
    overdue: items.filter(i => i.status === 'overdue').length,
    upcoming: items.filter(i => i.status === 'upcoming').length,
  }

  const complianceScore = Math.round((stats.compliant / stats.total) * 100)

  const handleMarkComplete = (id: string) => {
    setItems(prev => prev.map(item =>
      item.id === id
        ? { ...item, status: 'compliant' as const, completedDate: new Date().toISOString().split('T')[0] }
        : item
    ))
    toast.success('Item marked as complete')
    setSelectedItem(null)
  }

  const handleSnooze = (id: string, days: number) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const newDate = new Date(item.dueDate)
        newDate.setDate(newDate.getDate() + days)
        return { ...item, dueDate: newDate.toISOString().split('T')[0], status: 'upcoming' as const }
      }
      return item
    }))
    toast.success(`Deadline extended by ${days} days`)
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
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <Bell className="w-4 h-4 mr-2" />
            Set Reminders
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
          {filteredItems.length === 0 ? (
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
            filteredItems.map((item, index) => {
              const CategoryIcon = CATEGORY_CONFIG[item.category].icon
              const daysUntil = getDaysUntilDue(item.dueDate)

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className={cn(
                      "hover:shadow-md transition-shadow cursor-pointer",
                      item.status === 'overdue' && "border-red-200 bg-red-50/50"
                    )}
                    onClick={() => setSelectedItem(item)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          "p-2 rounded-lg flex-shrink-0",
                          CATEGORY_CONFIG[item.category].color
                        )}>
                          <CategoryIcon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <h3 className="font-medium">{item.title}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {item.description}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Badge className={STATUS_CONFIG[item.status].badge}>
                                {STATUS_CONFIG[item.status].label}
                              </Badge>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {item.status !== 'compliant' && (
                                    <DropdownMenuItem onClick={(e) => {
                                      e.stopPropagation()
                                      handleMarkComplete(item.id)
                                    }}>
                                      <CheckCircle2 className="h-4 w-4 mr-2" />
                                      Mark Complete
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation()
                                    handleSnooze(item.id, 7)
                                  }}>
                                    <Clock className="h-4 w-4 mr-2" />
                                    Snooze 7 Days
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                    <FileText className="h-4 w-4 mr-2" />
                                    View Documents
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                          <div className="flex items-center flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              {item.status === 'compliant' ? (
                                <span>Completed {formatDate(item.completedDate!)}</span>
                              ) : (
                                <span className={cn(daysUntil < 0 && 'text-red-600 font-medium')}>
                                  Due {formatDate(item.dueDate)}
                                  {daysUntil < 0 && ` (${Math.abs(daysUntil)} days overdue)`}
                                  {daysUntil >= 0 && daysUntil <= 7 && ` (${daysUntil} days left)`}
                                </span>
                              )}
                            </div>
                            <Badge variant="secondary" className={PRIORITY_CONFIG[item.priority]}>
                              {item.priority}
                            </Badge>
                            <span className="text-muted-foreground capitalize">
                              {item.frequency}
                            </span>
                            <span className="text-muted-foreground">
                              Assigned: {item.assignee}
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
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
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
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
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
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
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

      {/* Detail Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-lg">
          {selectedItem && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className={cn(
                    "p-2 rounded-lg",
                    CATEGORY_CONFIG[selectedItem.category].color
                  )}>
                    {(() => {
                      const Icon = CATEGORY_CONFIG[selectedItem.category].icon
                      return <Icon className="h-5 w-5" />
                    })()}
                  </div>
                  <Badge className={STATUS_CONFIG[selectedItem.status].badge}>
                    {STATUS_CONFIG[selectedItem.status].label}
                  </Badge>
                </div>
                <DialogTitle>{selectedItem.title}</DialogTitle>
                <DialogDescription>{selectedItem.description}</DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Due Date</p>
                    <p className="font-medium">{formatDate(selectedItem.dueDate)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Priority</p>
                    <Badge className={PRIORITY_CONFIG[selectedItem.priority]}>
                      {selectedItem.priority}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Frequency</p>
                    <p className="font-medium capitalize">{selectedItem.frequency}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Assigned To</p>
                    <p className="font-medium">{selectedItem.assignee}</p>
                  </div>
                </div>

                {selectedItem.documents && selectedItem.documents.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Documents</p>
                    <div className="space-y-2">
                      {selectedItem.documents.map((doc, i) => (
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

                {selectedItem.completedDate && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg text-green-700">
                    <CheckCircle2 className="h-5 w-5" />
                    <span>Completed on {formatDate(selectedItem.completedDate)}</span>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedItem(null)}>
                  Close
                </Button>
                {selectedItem.status !== 'compliant' && (
                  <Button onClick={() => handleMarkComplete(selectedItem.id)}>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Mark Complete
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
