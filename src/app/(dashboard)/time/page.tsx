'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Calendar } from '@/components/ui/calendar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Clock,
  Calendar as CalendarIcon,
  Plus,
  CheckCircle2,
  XCircle,
  Hourglass,
  Sun,
  Plane,
  Stethoscope,
  Users,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import { canTransitionPTO, type PTOStatus } from '@/lib/state-machines'

// Demo PTO requests - initial data
const initialPtoRequests = [
  { id: '1', employee: 'Sarah Chen', employeeId: 'e1', avatar: 'SC', type: 'pto', startDate: 'Feb 24, 2026', endDate: 'Feb 26, 2026', hours: 24, hoursAvailable: 96, reason: 'Family vacation', status: 'pending' as PTOStatus },
  { id: '2', employee: 'Tom Wilson', employeeId: 'e4', avatar: 'TW', type: 'pto', startDate: 'Mar 3, 2026', endDate: 'Mar 7, 2026', hours: 40, hoursAvailable: 72, reason: 'Spring break trip', status: 'pending' as PTOStatus },
  { id: '3', employee: 'Emily Davis', employeeId: 'e3', avatar: 'ED', type: 'sick', startDate: 'Feb 10, 2026', endDate: 'Feb 10, 2026', hours: 8, hoursAvailable: 32, reason: 'Doctor appointment', status: 'approved' as PTOStatus },
  { id: '4', employee: 'Lisa Park', employeeId: 'e5', avatar: 'LP', type: 'pto', startDate: 'Jan 20, 2026', endDate: 'Jan 24, 2026', hours: 40, hoursAvailable: 80, reason: 'Personal time', status: 'approved' as PTOStatus },
  { id: '5', employee: 'Alex Wong', employeeId: 'e6', avatar: 'AW', type: 'pto', startDate: 'Feb 1, 2026', endDate: 'Feb 2, 2026', hours: 16, hoursAvailable: 112, reason: 'Moving to new apartment', status: 'denied' as PTOStatus },
]

// Demo time entries for current week
const initialTimeEntries = [
  { day: 'Mon', date: 'Feb 10', clockIn: '9:00 AM', clockOut: '5:30 PM', breakMin: 30, totalHours: 8.0 },
  { day: 'Tue', date: 'Feb 11', clockIn: '8:45 AM', clockOut: '6:00 PM', breakMin: 45, totalHours: 8.5 },
  { day: 'Wed', date: 'Feb 12', clockIn: '9:15 AM', clockOut: '5:45 PM', breakMin: 30, totalHours: 8.0 },
  { day: 'Thu', date: 'Feb 13', clockIn: '9:00 AM', clockOut: '6:30 PM', breakMin: 60, totalHours: 8.5 },
  { day: 'Fri', date: 'Feb 14', clockIn: '9:00 AM', clockOut: '-', breakMin: 0, totalHours: 4.0 },
]

// Employee PTO balances
const ptoBalances = [
  { id: '1', name: 'Sarah Chen', avatar: 'SC', ptoBalance: 96, ptoUsed: 24, sickBalance: 32, sickUsed: 8 },
  { id: '2', name: 'Mike Johnson', avatar: 'MJ', ptoBalance: 120, ptoUsed: 0, sickBalance: 40, sickUsed: 0 },
  { id: '3', name: 'Emily Davis', avatar: 'ED', ptoBalance: 88, ptoUsed: 32, sickBalance: 32, sickUsed: 8 },
  { id: '4', name: 'Tom Wilson', avatar: 'TW', ptoBalance: 72, ptoUsed: 48, sickBalance: 24, sickUsed: 16 },
  { id: '5', name: 'Lisa Park', avatar: 'LP', ptoBalance: 80, ptoUsed: 40, sickBalance: 40, sickUsed: 0 },
]

export default function TimePage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [requestDialogOpen, setRequestDialogOpen] = useState(false)
  const [ptoRequests, setPtoRequests] = useState(initialPtoRequests)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isClockedIn, setIsClockedIn] = useState(true) // Today (Friday) they're clocked in
  const [clockInTime, setClockInTime] = useState('9:00 AM')
  const [timeEntries, setTimeEntries] = useState(initialTimeEntries)
  const [requestForm, setRequestForm] = useState({
    type: '',
    startDate: '',
    endDate: '',
    reason: ''
  })

  const handleClockToggle = () => {
    if (isClockedIn) {
      // Clock out
      const now = new Date()
      const clockOutTime = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })

      // Update today's entry (Friday)
      setTimeEntries(prev => prev.map((entry, idx) => {
        if (idx === prev.length - 1) {
          // Calculate hours worked
          const hoursWorked = (now.getHours() - 9) + (now.getMinutes() / 60)
          return { ...entry, clockOut: clockOutTime, totalHours: Math.round(hoursWorked * 10) / 10 }
        }
        return entry
      }))

      setIsClockedIn(false)
      toast.success('Clocked out!', {
        description: `Clocked out at ${clockOutTime}`
      })
    } else {
      // Clock in
      const now = new Date()
      const newClockInTime = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
      setClockInTime(newClockInTime)
      setIsClockedIn(true)
      toast.success('Clocked in!', {
        description: `Clocked in at ${newClockInTime}`
      })
    }
  }

  const resetRequestForm = () => {
    setRequestForm({ type: '', startDate: '', endDate: '', reason: '' })
  }

  const calculateHours = (startDate: string, endDate: string): number => {
    if (!startDate || !endDate) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return diffDays * 8 // 8 hours per day
  }

  const handleSubmitRequest = async () => {
    if (!requestForm.type || !requestForm.startDate || !requestForm.endDate) {
      toast.error('Please fill in all required fields')
      return
    }

    if (new Date(requestForm.startDate) > new Date(requestForm.endDate)) {
      toast.error('End date must be after start date')
      return
    }

    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 1500))

    const hours = calculateHours(requestForm.startDate, requestForm.endDate)
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }

    const newRequest = {
      id: `pto-${Date.now()}`,
      employee: 'John Doe',
      employeeId: 'current-user',
      avatar: 'JD',
      type: requestForm.type,
      startDate: formatDate(requestForm.startDate),
      endDate: formatDate(requestForm.endDate),
      hours,
      hoursAvailable: 96,
      reason: requestForm.reason || 'Time off request',
      status: 'pending' as PTOStatus
    }

    setPtoRequests(prev => [newRequest, ...prev])

    // Send email notification to manager (async, don't block UI)
    fetch('/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        template: 'ptoApprovalNeeded',
        to: 'manager@acme.com', // In production, this would be the actual manager's email
        data: {
          managerName: 'Sarah Wilson',
          employeeName: 'John Doe',
          requestType: requestForm.type === 'pto' ? 'PTO' : requestForm.type === 'sick' ? 'Sick Leave' : 'Time Off',
          dates: `${formatDate(requestForm.startDate)} - ${formatDate(requestForm.endDate)}`,
          hours
        }
      })
    }).catch(console.error)

    // Send confirmation email to employee
    fetch('/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        template: 'ptoRequestSubmitted',
        to: 'john.doe@acme.com',
        data: {
          employeeName: 'John',
          requestType: requestForm.type === 'pto' ? 'PTO' : requestForm.type === 'sick' ? 'Sick Leave' : 'Time Off',
          dates: `${formatDate(requestForm.startDate)} - ${formatDate(requestForm.endDate)}`,
          managerName: 'Sarah Wilson'
        }
      })
    }).catch(console.error)

    setIsSubmitting(false)
    setRequestDialogOpen(false)
    resetRequestForm()
    toast.success('Time off request submitted!', {
      description: `Requested ${hours} hours from ${formatDate(requestForm.startDate)} to ${formatDate(requestForm.endDate)}`
    })
  }

  // Handle PTO approval with state machine validation
  const handleApprove = (requestId: string) => {
    const request = ptoRequests.find(r => r.id === requestId)
    if (!request) return

    const result = canTransitionPTO(request.status, 'approved', {
      requestId,
      requesterId: request.employeeId,
      actorId: 'admin-user-id', // Current user (admin in demo)
      actorRole: 'admin',
      hoursRequested: request.hours,
      hoursAvailable: request.hoursAvailable,
    })

    if (!result.allowed) {
      toast.error(`Cannot approve: ${result.reason}`)
      return
    }

    setPtoRequests(prev => prev.map(r =>
      r.id === requestId ? { ...r, status: 'approved' as PTOStatus } : r
    ))

    // Send approval email to employee (async)
    fetch('/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        template: 'ptoApproved',
        to: `${request.employee.toLowerCase().replace(' ', '.')}@acme.com`,
        data: {
          employeeName: request.employee.split(' ')[0],
          dates: `${request.startDate} - ${request.endDate}`,
          approverName: 'John Doe (HR Admin)'
        }
      })
    }).catch(console.error)

    toast.success(`Approved ${request.employee}'s ${request.type.toUpperCase()} request`)
  }

  // Handle PTO denial with state machine validation
  const handleDeny = (requestId: string) => {
    const request = ptoRequests.find(r => r.id === requestId)
    if (!request) return

    const result = canTransitionPTO(request.status, 'denied', {
      requestId,
      actorRole: 'admin',
    })

    if (!result.allowed) {
      toast.error(`Cannot deny: ${result.reason}`)
      return
    }

    setPtoRequests(prev => prev.map(r =>
      r.id === requestId ? { ...r, status: 'denied' as PTOStatus } : r
    ))

    // Send denial email to employee (async)
    fetch('/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        template: 'ptoDenied',
        to: `${request.employee.toLowerCase().replace(' ', '.')}@acme.com`,
        data: {
          employeeName: request.employee.split(' ')[0],
          dates: `${request.startDate} - ${request.endDate}`,
          reason: 'Please speak with your manager about alternative dates.'
        }
      })
    }).catch(console.error)

    toast.success(`Denied ${request.employee}'s request`)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-700"><Hourglass className="w-3 h-3 mr-1" />Pending</Badge>
      case 'approved':
        return <Badge className="bg-emerald-100 text-emerald-700"><CheckCircle2 className="w-3 h-3 mr-1" />Approved</Badge>
      case 'denied':
        return <Badge className="bg-red-100 text-red-700"><XCircle className="w-3 h-3 mr-1" />Denied</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pto':
        return <Plane className="w-4 h-4 text-primary" />
      case 'sick':
        return <Stethoscope className="w-4 h-4 text-red-500" />
      default:
        return <Sun className="w-4 h-4 text-amber-500" />
    }
  }

  const pendingRequests = ptoRequests.filter(r => r.status === 'pending')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Time & PTO</h1>
          <p className="text-slate-600">Track time, manage PTO requests, and view balances</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={isClockedIn ? "default" : "outline"}
            onClick={handleClockToggle}
            className={isClockedIn ? "bg-emerald-600 hover:bg-emerald-700" : ""}
          >
            <Clock className="w-4 h-4 mr-2" />
            {isClockedIn ? 'Clock Out' : 'Clock In'}
          </Button>
          <Dialog open={requestDialogOpen} onOpenChange={(open) => { setRequestDialogOpen(open); if (!open) resetRequestForm(); }}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Request Time Off
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Request Time Off</DialogTitle>
                <DialogDescription>
                  Submit a new PTO or leave request for approval.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Request Type *</Label>
                  <Select
                    value={requestForm.type}
                    onValueChange={(value) => setRequestForm(prev => ({ ...prev, type: value }))}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pto">PTO (Vacation)</SelectItem>
                      <SelectItem value="sick">Sick Leave</SelectItem>
                      <SelectItem value="unpaid">Unpaid Leave</SelectItem>
                      <SelectItem value="bereavement">Bereavement</SelectItem>
                      <SelectItem value="jury_duty">Jury Duty</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={requestForm.startDate}
                      onChange={(e) => setRequestForm(prev => ({ ...prev, startDate: e.target.value }))}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={requestForm.endDate}
                      onChange={(e) => setRequestForm(prev => ({ ...prev, endDate: e.target.value }))}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason (Optional)</Label>
                  <Textarea
                    id="reason"
                    placeholder="Brief description..."
                    value={requestForm.reason}
                    onChange={(e) => setRequestForm(prev => ({ ...prev, reason: e.target.value }))}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="bg-accent p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-primary">
                      <strong>Your PTO Balance:</strong> 96 hours (12 days) remaining
                    </p>
                    {requestForm.startDate && requestForm.endDate && (
                      <Badge className="bg-accent text-primary border border-border">
                        {calculateHours(requestForm.startDate, requestForm.endDate)}h requested
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setRequestDialogOpen(false); resetRequestForm(); }} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button
                  className="bg-primary hover:bg-primary/90"
                  onClick={handleSubmitRequest}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Request'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                <Sun className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">96</p>
                <p className="text-sm text-slate-500">PTO Hours Left</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">32</p>
                <p className="text-sm text-slate-500">Sick Hours Left</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Hourglass className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{pendingRequests.length}</p>
                <p className="text-sm text-slate-500">Pending Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {timeEntries.reduce((sum, e) => sum + e.totalHours, 0).toFixed(1)}
                </p>
                <p className="text-sm text-slate-500">Hours This Week</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Time Tracking & Requests */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="requests" className="space-y-4">
            <TabsList>
              <TabsTrigger value="requests">PTO Requests</TabsTrigger>
              <TabsTrigger value="timesheet">My Timesheet</TabsTrigger>
              <TabsTrigger value="balances">Team Balances</TabsTrigger>
            </TabsList>

            <TabsContent value="requests">
              <Card>
                <CardHeader>
                  <CardTitle>PTO Requests</CardTitle>
                  <CardDescription>Review and manage time off requests</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Dates</TableHead>
                        <TableHead>Hours</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ptoRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="bg-accent text-primary text-xs">
                                  {request.avatar}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{request.employee}</p>
                                <p className="text-xs text-slate-500">{request.reason}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getTypeIcon(request.type)}
                              <span className="capitalize">{request.type}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {request.startDate} - {request.endDate}
                            </span>
                          </TableCell>
                          <TableCell>{request.hours}h</TableCell>
                          <TableCell>{getStatusBadge(request.status)}</TableCell>
                          <TableCell>
                            {request.status === 'pending' && (
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={(e) => { e.stopPropagation(); handleDeny(request.id) }}
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  className="bg-emerald-600 hover:bg-emerald-700"
                                  onClick={(e) => { e.stopPropagation(); handleApprove(request.id) }}
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timesheet">
              <Card>
                <CardHeader>
                  <CardTitle>This Week&apos;s Timesheet</CardTitle>
                  <CardDescription>Feb 10 - Feb 14, 2026</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Day</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Clock In</TableHead>
                        <TableHead>Clock Out</TableHead>
                        <TableHead>Break</TableHead>
                        <TableHead className="text-right">Total Hours</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {timeEntries.map((entry, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{entry.day}</TableCell>
                          <TableCell>{entry.date}</TableCell>
                          <TableCell>{entry.clockIn}</TableCell>
                          <TableCell>{entry.clockOut}</TableCell>
                          <TableCell>{entry.breakMin > 0 ? `${entry.breakMin} min` : '-'}</TableCell>
                          <TableCell className="text-right font-medium">{entry.totalHours.toFixed(1)}h</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-slate-50">
                        <TableCell colSpan={5} className="font-semibold">Week Total</TableCell>
                        <TableCell className="text-right font-bold text-primary">37.0h</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="balances">
              <Card>
                <CardHeader>
                  <CardTitle>Team PTO Balances</CardTitle>
                  <CardDescription>View PTO and sick leave balances for all employees</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead className="text-right">PTO Balance</TableHead>
                        <TableHead className="text-right">PTO Used</TableHead>
                        <TableHead className="text-right">Sick Balance</TableHead>
                        <TableHead className="text-right">Sick Used</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ptoBalances.map((emp) => (
                        <TableRow key={emp.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="bg-accent text-primary text-xs">
                                  {emp.avatar}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{emp.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium text-primary">{emp.ptoBalance}h</TableCell>
                          <TableCell className="text-right text-slate-500">{emp.ptoUsed}h</TableCell>
                          <TableCell className="text-right font-medium text-red-600">{emp.sickBalance}h</TableCell>
                          <TableCell className="text-right text-slate-500">{emp.sickUsed}h</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Calendar Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Calendar</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex justify-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Who&apos;s Out</CardTitle>
              <CardDescription>Team members on leave this week</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 p-2 bg-amber-50 rounded-lg">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-amber-100 text-amber-700 text-xs">RK</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">Rachel Kim</p>
                  <p className="text-xs text-slate-500">On leave until Feb 21</p>
                </div>
              </div>
              <div className="text-center py-4 text-slate-500">
                <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">No other team members out</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
