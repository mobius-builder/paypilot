'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Users,
  Search,
  Building2,
  Mail,
  Briefcase,
  Calendar,
  UserPlus,
  Grid3X3,
  List,
  ChevronRight,
  ChevronDown,
} from 'lucide-react'
import Link from 'next/link'

interface Employee {
  id: string
  name: string
  email: string
  jobTitle: string | null
  department: string | null
  hireDate: string | null
  status: string
  role: string
}

interface DepartmentGroup {
  name: string
  employees: Employee[]
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function EmployeeCard({ employee }: { employee: Employee }) {
  return (
    <Link href={`/employees/${employee.id}`}>
      <Card className="group hover:shadow-md transition-all duration-200 cursor-pointer border-border hover:border-primary/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="relative">
              <Avatar className="w-12 h-12 border-2 border-border">
                <AvatarFallback className="bg-accent text-primary font-medium">
                  {getInitials(employee.name)}
                </AvatarFallback>
              </Avatar>
              {employee.status === 'active' && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-primary border-2 border-white rounded-full"></span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                    {employee.name}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {employee.jobTitle || 'Team Member'}
                  </p>
                </div>
                <Badge variant="secondary" className="shrink-0 bg-secondary text-secondary-foreground">
                  {employee.department || 'General'}
                </Badge>
              </div>

              <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {employee.email.split('@')[0]}
                </span>
                {employee.hireDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(employee.hireDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                )}
              </div>
            </div>

            <ChevronRight className="w-5 h-5 text-muted-foreground/50 group-hover:text-primary transition-colors shrink-0" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function EmployeeListItem({ employee }: { employee: Employee }) {
  return (
    <Link href={`/employees/${employee.id}`}>
      <div className="group flex items-center gap-4 p-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer border border-transparent hover:border-border">
        <div className="relative">
          <Avatar className="w-10 h-10 border border-border">
            <AvatarFallback className="bg-accent text-primary text-sm font-medium">
              {getInitials(employee.name)}
            </AvatarFallback>
          </Avatar>
          {employee.status === 'active' && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-primary border-2 border-white rounded-full"></span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
            {employee.name}
          </h3>
          <p className="text-sm text-muted-foreground truncate">
            {employee.jobTitle || 'Team Member'}
          </p>
        </div>

        <div className="hidden sm:block text-sm text-muted-foreground">
          {employee.email}
        </div>

        <Badge variant="outline" className="shrink-0 border-border text-muted-foreground">
          {employee.department || 'General'}
        </Badge>

        <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
      </div>
    </Link>
  )
}

function DepartmentSection({ group, viewMode, defaultExpanded = true }: {
  group: DepartmentGroup
  viewMode: 'grid' | 'list'
  defaultExpanded?: boolean
}) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  return (
    <div className="space-y-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-3 w-full group"
      >
        <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center border border-border">
          <Building2 className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 text-left">
          <h2 className="text-base font-semibold text-foreground">{group.name}</h2>
          <p className="text-sm text-muted-foreground">
            {group.employees.length} team member{group.employees.length !== 1 ? 's' : ''}
          </p>
        </div>
        {expanded ? (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className={viewMode === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pl-[52px]'
          : 'space-y-1 pl-[52px]'
        }>
          {group.employees.map(employee => (
            viewMode === 'grid'
              ? <EmployeeCard key={employee.id} employee={employee} />
              : <EmployeeListItem key={employee.id} employee={employee} />
          ))}
        </div>
      )}
    </div>
  )
}

function StatCard({ icon: Icon, label, value }: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
}) {
  return (
    <Card className="border-border">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-12" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-border">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pl-[52px]">
                {[...Array(3)].map((_, j) => (
                  <Card key={j} className="border-border">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <Skeleton className="w-12 h-12 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function EmptyState() {
  return (
    <Card className="border-dashed border-2 border-border">
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mb-4">
          <Users className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">No team members yet</h3>
        <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
          Add employees to your organization to see them appear in the org chart.
        </p>
        <Link href="/employees?add=true">
          <Button className="bg-primary hover:bg-primary/90">
            <UserPlus className="w-4 h-4 mr-2" />
            Add Employee
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

export default function OrgChartPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    async function fetchEmployees() {
      try {
        const response = await fetch('/api/employees')
        if (response.ok) {
          const data = await response.json()
          setEmployees(data.employees || [])
        }
      } catch (error) {
        console.error('Failed to fetch employees:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEmployees()
  }, [])

  // Filter employees by search
  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (emp.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (emp.department?.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  // Group by department
  const departmentGroups: DepartmentGroup[] = Object.entries(
    filteredEmployees.reduce((acc, emp) => {
      const dept = emp.department || 'General'
      if (!acc[dept]) acc[dept] = []
      acc[dept].push(emp)
      return acc
    }, {} as Record<string, Employee[]>)
  ).map(([name, employees]) => ({
    name,
    employees: employees.sort((a, b) => a.name.localeCompare(b.name)),
  })).sort((a, b) => a.name.localeCompare(b.name))

  // Stats
  const totalEmployees = employees.length
  const activeEmployees = employees.filter(e => e.status === 'active').length
  const departments = new Set(employees.map(e => e.department).filter(Boolean)).size
  const newHires = employees.filter(e => {
    if (!e.hireDate) return false
    const hireDate = new Date(e.hireDate)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return hireDate >= thirtyDaysAgo
  }).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Team Directory</h1>
          <p className="text-muted-foreground">View and manage your organization structure</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 lg:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 border-border"
            />
          </div>
          <div className="flex rounded-lg border border-border p-1 bg-card">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="px-3"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="px-3"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : employees.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={Users} label="Total Employees" value={totalEmployees} />
            <StatCard icon={Briefcase} label="Active" value={activeEmployees} />
            <StatCard icon={Building2} label="Departments" value={departments} />
            <StatCard icon={UserPlus} label="New Hires (30d)" value={newHires} />
          </div>

          {/* Departments */}
          {departmentGroups.length === 0 ? (
            <Card className="border-border">
              <CardContent className="py-12 text-center">
                <Search className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground">No employees match your search</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Building2 className="w-5 h-5 text-primary" />
                  Organization Structure
                </CardTitle>
                <CardDescription>
                  {filteredEmployees.length} team member{filteredEmployees.length !== 1 ? 's' : ''} across {departmentGroups.length} department{departmentGroups.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {departmentGroups.map((group, i) => (
                  <DepartmentSection
                    key={group.name}
                    group={group}
                    viewMode={viewMode}
                    defaultExpanded={i < 3}
                  />
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
