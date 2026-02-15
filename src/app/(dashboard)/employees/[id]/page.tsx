'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Building2,
  User,
  Clock,
  Shield,
  FileText,
  Edit,
  MoreHorizontal,
  UserCheck,
  UserMinus,
  Palmtree,
  AlertTriangle
} from 'lucide-react'
import { toast } from 'sonner'
import { demoEmployees } from '@/lib/demo-data'
import { canTransitionEmployee, getEmployeeNextStates, type EmployeeStatus } from '@/lib/state-machines'

export default function EmployeeDetailPage() {
  const params = useParams()
  const employeeId = params.id as string

  // Find employee from demo data (in production, fetch from API)
  const initialEmployee = demoEmployees.find(e => e.id === employeeId) || demoEmployees[0]
  const [employee, setEmployee] = useState({
    ...initialEmployee,
    status: initialEmployee.status as EmployeeStatus
  })

  // Handle status change with state machine validation
  const handleStatusChange = (targetStatus: EmployeeStatus) => {
    const result = canTransitionEmployee(employee.status, targetStatus, {
      employeeId: employee.id,
      actorRole: 'admin',
      hasCompletedOnboarding: true, // Assume true for demo
      terminationReason: targetStatus === 'terminated' ? 'Voluntary resignation' : undefined,
    })

    if (!result.allowed) {
      toast.error(`Cannot change status: ${result.reason}`)
      return
    }

    setEmployee(prev => ({ ...prev, status: targetStatus }))

    const statusLabels: Record<EmployeeStatus, string> = {
      invited: 'Invited',
      onboarding: 'Onboarding',
      active: 'Active',
      on_leave: 'On Leave',
      terminated: 'Terminated'
    }

    toast.success(`${employee.name} is now ${statusLabels[targetStatus]}`)
  }

  // Get available transitions for current status
  const availableTransitions = getEmployeeNextStates(employee.status)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-emerald-100 text-emerald-700">Active</Badge>
      case 'onboarding':
        return <Badge className="bg-blue-100 text-blue-700">Onboarding</Badge>
      case 'on_leave':
        return <Badge className="bg-amber-100 text-amber-700">On Leave</Badge>
      case 'terminated':
        return <Badge className="bg-red-100 text-red-700">Terminated</Badge>
      case 'invited':
        return <Badge className="bg-slate-100 text-slate-700">Invited</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getTransitionIcon = (trigger: string) => {
    switch (trigger) {
      case 'COMPLETE_ONBOARDING':
        return <UserCheck className="w-4 h-4 mr-2" />
      case 'START_LEAVE':
        return <Palmtree className="w-4 h-4 mr-2" />
      case 'END_LEAVE':
        return <UserCheck className="w-4 h-4 mr-2" />
      case 'TERMINATE':
        return <UserMinus className="w-4 h-4 mr-2" />
      default:
        return null
    }
  }

  const getTransitionLabel = (trigger: string) => {
    switch (trigger) {
      case 'ACCEPT_INVITE':
        return 'Accept Invite'
      case 'COMPLETE_ONBOARDING':
        return 'Complete Onboarding'
      case 'START_LEAVE':
        return 'Start Leave'
      case 'END_LEAVE':
        return 'Return from Leave'
      case 'TERMINATE':
        return 'Terminate Employee'
      default:
        return trigger
    }
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link href="/employees">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Employees
        </Button>
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="w-20 h-20">
            <AvatarFallback className="bg-blue-100 text-blue-700 text-2xl">
              {employee.avatar}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">{employee.name}</h1>
              {getStatusBadge(employee.status)}
            </div>
            <p className="text-slate-600">{employee.jobTitle}</p>
            <p className="text-sm text-slate-500">{employee.department}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Mail className="w-4 h-4 mr-2" />
            Send Email
          </Button>
          <Button variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
          {availableTransitions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <MoreHorizontal className="w-4 h-4 mr-2" />
                  Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {availableTransitions.map((transition) => (
                  <DropdownMenuItem
                    key={transition.trigger}
                    onClick={() => handleStatusChange(transition.to)}
                    className={transition.to === 'terminated' ? 'text-red-600' : ''}
                  >
                    {getTransitionIcon(transition.trigger)}
                    {getTransitionLabel(transition.trigger)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900">
                  ${employee.salary.toLocaleString()}
                </p>
                <p className="text-xs text-slate-500">Annual Salary</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900">{employee.ptoBalance}h</p>
                <p className="text-xs text-slate-500">PTO Balance</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900">{employee.sickBalance}h</p>
                <p className="text-xs text-slate-500">Sick Leave</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900">
                  {new Date(employee.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </p>
                <p className="text-xs text-slate-500">Start Date</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="compensation">Compensation</TabsTrigger>
          <TabsTrigger value="time">Time & Attendance</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-500">Email</p>
                    <p className="font-medium">{employee.email}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-500">Phone</p>
                    <p className="font-medium">+1 (555) 123-4567</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-500">Location</p>
                    <p className="font-medium">San Francisco, CA</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Employment Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Employment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-500">Department</p>
                    <p className="font-medium">{employee.department}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-500">Manager</p>
                    <p className="font-medium">{employee.manager}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-500">Employment Type</p>
                    <p className="font-medium capitalize">{employee.employmentType.replace('_', ' ')}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-500">Start Date</p>
                    <p className="font-medium">
                      {new Date(employee.startDate).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Emergency Contact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="font-medium">Jane {employee.name.split(' ')[1]}</p>
                  <p className="text-sm text-slate-500">Spouse</p>
                  <p className="text-sm text-slate-600 mt-2">+1 (555) 987-6543</p>
                </div>
              </CardContent>
            </Card>

            {/* Benefits Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Benefits Enrolled</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: 'Health Insurance', plan: 'Premium Plan', status: 'active' },
                  { name: 'Dental', plan: 'Basic', status: 'active' },
                  { name: 'Vision', plan: 'Plus', status: 'active' },
                  { name: '401(k)', plan: '6% contribution', status: 'active' },
                ].map((benefit, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                    <div>
                      <p className="font-medium text-sm">{benefit.name}</p>
                      <p className="text-xs text-slate-500">{benefit.plan}</p>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700 text-xs">Active</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compensation">
          <Card>
            <CardHeader>
              <CardTitle>Compensation History</CardTitle>
              <CardDescription>Salary changes and adjustments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Current Salary</p>
                    <p className="text-sm text-slate-500">Effective Jan 1, 2026</p>
                  </div>
                  <p className="text-xl font-bold text-emerald-600">
                    ${employee.salary.toLocaleString()}/year
                  </p>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                  <div>
                    <p className="font-medium text-slate-600">Previous Salary</p>
                    <p className="text-sm text-slate-500">Jan 1, 2025 - Dec 31, 2025</p>
                  </div>
                  <p className="text-lg text-slate-600">
                    ${(employee.salary * 0.92).toLocaleString()}/year
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time">
          <Card>
            <CardHeader>
              <CardTitle>Time Off Summary</CardTitle>
              <CardDescription>PTO and sick leave balances</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-4">PTO Balance</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Annual Allowance</span>
                      <span className="font-medium">120 hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Used</span>
                      <span className="font-medium">{120 - employee.ptoBalance} hours</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="font-medium">Remaining</span>
                      <span className="font-bold text-blue-600">{employee.ptoBalance} hours</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-4">Sick Leave Balance</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Annual Allowance</span>
                      <span className="font-medium">40 hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Used</span>
                      <span className="font-medium">{40 - employee.sickBalance} hours</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="font-medium">Remaining</span>
                      <span className="font-bold text-red-600">{employee.sickBalance} hours</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Employee Documents</CardTitle>
              <CardDescription>Tax forms, contracts, and other documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { name: 'W-4 Form', date: 'Jan 15, 2026', type: 'Tax' },
                  { name: 'Employment Agreement', date: employee.startDate, type: 'Contract' },
                  { name: 'Direct Deposit Authorization', date: employee.startDate, type: 'Banking' },
                  { name: 'I-9 Form', date: employee.startDate, type: 'Compliance' },
                ].map((doc, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-xs text-slate-500">{doc.type} • {doc.date}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">View</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
