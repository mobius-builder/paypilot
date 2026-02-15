'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  Mail,
  Phone,
  Building2,
  Calendar,
  DollarSign,
  Users,
  UserPlus,
  Download,
  Loader2,
  CheckCircle2
} from 'lucide-react'
import { toast } from 'sonner'

interface Employee {
  id: string
  name: string
  email: string
  avatar: string
  department: string
  jobTitle: string
  employmentType: string
  startDate: string
  salary: number
  status: string
  manager: string
}

// Demo employee data - IDs match demo-data.ts for detail page
const initialEmployees: Employee[] = [
  {
    id: 'e0000000-0000-0000-0000-000000000001',
    name: 'Sarah Chen',
    email: 'sarah.chen@acme.com',
    avatar: 'SC',
    department: 'Engineering',
    jobTitle: 'Senior Software Engineer',
    employmentType: 'full_time',
    startDate: '2023-03-15',
    salary: 145000,
    status: 'active',
    manager: 'John Doe'
  },
  {
    id: 'e0000000-0000-0000-0000-000000000002',
    name: 'Mike Johnson',
    email: 'mike.johnson@acme.com',
    avatar: 'MJ',
    department: 'Engineering',
    jobTitle: 'Software Engineer',
    employmentType: 'full_time',
    startDate: '2026-01-08',
    salary: 95000,
    status: 'onboarding',
    manager: 'Sarah Chen'
  },
  {
    id: 'e0000000-0000-0000-0000-000000000003',
    name: 'Emily Davis',
    email: 'emily.davis@acme.com',
    avatar: 'ED',
    department: 'Design',
    jobTitle: 'Product Designer',
    employmentType: 'full_time',
    startDate: '2024-06-01',
    salary: 110000,
    status: 'active',
    manager: 'John Doe'
  },
  {
    id: 'e0000000-0000-0000-0000-000000000004',
    name: 'Tom Wilson',
    email: 'tom.wilson@acme.com',
    avatar: 'TW',
    department: 'Sales',
    jobTitle: 'Account Executive',
    employmentType: 'full_time',
    startDate: '2024-09-15',
    salary: 85000,
    status: 'active',
    manager: 'Lisa Park'
  },
  {
    id: 'e0000000-0000-0000-0000-000000000005',
    name: 'Lisa Park',
    email: 'lisa.park@acme.com',
    avatar: 'LP',
    department: 'Sales',
    jobTitle: 'Sales Manager',
    employmentType: 'full_time',
    startDate: '2022-11-01',
    salary: 130000,
    status: 'active',
    manager: 'John Doe'
  },
  {
    id: 'e0000000-0000-0000-0000-000000000006',
    name: 'Alex Wong',
    email: 'alex.wong@acme.com',
    avatar: 'AW',
    department: 'Marketing',
    jobTitle: 'Marketing Specialist',
    employmentType: 'full_time',
    startDate: '2025-02-01',
    salary: 75000,
    status: 'active',
    manager: 'John Doe'
  },
  {
    id: 'e0000000-0000-0000-0000-000000000007',
    name: 'Jordan Lee',
    email: 'jordan.lee@acme.com',
    avatar: 'JL',
    department: 'Engineering',
    jobTitle: 'DevOps Engineer',
    employmentType: 'contractor',
    startDate: '2025-06-01',
    salary: 120000,
    status: 'active',
    manager: 'Sarah Chen'
  },
  {
    id: 'e0000000-0000-0000-0000-000000000008',
    name: 'Rachel Kim',
    email: 'rachel.kim@acme.com',
    avatar: 'RK',
    department: 'HR',
    jobTitle: 'HR Coordinator',
    employmentType: 'full_time',
    startDate: '2024-01-15',
    salary: 65000,
    status: 'on_leave',
    manager: 'John Doe'
  }
]

const departments = ['All', 'Engineering', 'Design', 'Sales', 'Marketing', 'HR', 'Finance']
const statuses = ['All', 'active', 'invited', 'onboarding', 'on_leave', 'terminated']

const generateId = () => `e${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees)
  const [searchQuery, setSearchQuery] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    department: '',
    jobTitle: '',
    startDate: '',
    salary: '',
    employmentType: ''
  })

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      department: '',
      jobTitle: '',
      startDate: '',
      salary: '',
      employmentType: ''
    })
  }

  const handleAddEmployee = async () => {
    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.department) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    const newEmployee: Employee = {
      id: generateId(),
      name: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      avatar: `${formData.firstName[0]}${formData.lastName[0]}`.toUpperCase(),
      department: formData.department,
      jobTitle: formData.jobTitle || 'Team Member',
      employmentType: formData.employmentType || 'full_time',
      startDate: formData.startDate || new Date().toISOString().split('T')[0],
      salary: parseInt(formData.salary) || 50000,
      status: 'invited',
      manager: 'John Doe'
    }

    setEmployees(prev => [newEmployee, ...prev])
    setIsSubmitting(false)
    setAddDialogOpen(false)
    resetForm()

    toast.success(`Invite sent to ${newEmployee.name}!`, {
      description: `${newEmployee.email} will receive an onboarding email shortly.`,
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />
    })
  }

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         emp.jobTitle.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDepartment = departmentFilter === 'All' || emp.department === departmentFilter
    const matchesStatus = statusFilter === 'All' || emp.status === statusFilter
    return matchesSearch && matchesDepartment && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Active</Badge>
      case 'onboarding':
        return <Badge className="bg-accent text-primary hover:bg-accent">Onboarding</Badge>
      case 'on_leave':
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">On Leave</Badge>
      case 'terminated':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Terminated</Badge>
      case 'invited':
        return <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-100">Invited</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatEmploymentType = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Employees</h1>
          <p className="text-slate-600">Manage your team members and their information</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Add New Employee</DialogTitle>
                <DialogDescription>
                  Enter the details for the new team member. They&apos;ll receive an invite email.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department">Department *</Label>
                    <Select
                      value={formData.department}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.filter(d => d !== 'All').map(dept => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input
                      id="jobTitle"
                      placeholder="Software Engineer"
                      value={formData.jobTitle}
                      onChange={(e) => setFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salary">Annual Salary</Label>
                    <Input
                      id="salary"
                      type="number"
                      placeholder="75000"
                      value={formData.salary}
                      onChange={(e) => setFormData(prev => ({ ...prev, salary: e.target.value }))}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employmentType">Employment Type</Label>
                  <Select
                    value={formData.employmentType}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, employmentType: value }))}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_time">Full Time</SelectItem>
                      <SelectItem value="part_time">Part Time</SelectItem>
                      <SelectItem value="contractor">Contractor</SelectItem>
                      <SelectItem value="intern">Intern</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setAddDialogOpen(false); resetForm(); }} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button
                  className="bg-primary hover:bg-primary/90"
                  onClick={handleAddEmployee}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Send Invite
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{employees.length}</p>
                <p className="text-sm text-slate-500">Total Employees</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {employees.filter(e => e.status === 'onboarding' || e.status === 'invited').length}
                </p>
                <p className="text-sm text-slate-500">New Hires</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {employees.filter(e => e.status === 'on_leave').length}
                </p>
                <p className="text-sm text-slate-500">On Leave</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {new Set(employees.map(e => e.department)).size}
                </p>
                <p className="text-sm text-slate-500">Departments</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search employees..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map(status => (
                    <SelectItem key={status} value={status}>
                      {status === 'All' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Job Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Salary</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => window.location.href = `/employees/${employee.id}`}>
                  <TableCell>
                    <Link href={`/employees/${employee.id}`} className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-accent text-primary">
                          {employee.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-slate-900">{employee.name}</p>
                        <p className="text-sm text-slate-500">{employee.email}</p>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>{employee.jobTitle}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {formatEmploymentType(employee.employmentType)}
                    </Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(employee.status)}</TableCell>
                  <TableCell className="text-right font-medium">
                    ${employee.salary.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>View Profile</DropdownMenuItem>
                        <DropdownMenuItem>Edit Details</DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="w-4 h-4 mr-2" />
                          Send Email
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          Terminate
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredEmployees.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">No employees found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
