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
  ChevronRight
} from 'lucide-react'

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
  color: { bg: string; text: string; border: string; gradient: string }
}

const departmentColors: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
  'Executive': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', gradient: 'from-purple-500 to-purple-600' },
  'Engineering': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', gradient: 'from-blue-500 to-blue-600' },
  'Design': { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200', gradient: 'from-pink-500 to-pink-600' },
  'Sales': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', gradient: 'from-emerald-500 to-emerald-600' },
  'Marketing': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', gradient: 'from-orange-500 to-orange-600' },
  'Human Resources': { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', gradient: 'from-cyan-500 to-cyan-600' },
  'Product': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', gradient: 'from-indigo-500 to-indigo-600' },
  'Operations': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', gradient: 'from-amber-500 to-amber-600' },
  'Finance': { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', gradient: 'from-teal-500 to-teal-600' },
  'default': { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', gradient: 'from-slate-500 to-slate-600' },
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function getColor(department: string | null): typeof departmentColors['default'] {
  if (!department) return departmentColors['default']
  return departmentColors[department] || departmentColors['default']
}

function EmployeeCard({ employee, onClick }: { employee: Employee; onClick?: () => void }) {
  const colors = getColor(employee.department)

  return (
    <Card
      className={`group hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 ${colors.border} hover:scale-[1.02]`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className={`relative`}>
            <Avatar className={`w-14 h-14 ring-2 ring-offset-2 ${colors.border}`}>
              <AvatarFallback className={`bg-gradient-to-br ${colors.gradient} text-white font-semibold text-lg`}>
                {getInitials(employee.name)}
              </AvatarFallback>
            </Avatar>
            {employee.status === 'active' && (
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-slate-900 truncate">{employee.name}</h3>
                <p className="text-sm text-slate-500 truncate">{employee.jobTitle || 'Team Member'}</p>
              </div>
              <Badge variant="secondary" className={`shrink-0 ${colors.bg} ${colors.text}`}>
                {employee.department || 'General'}
              </Badge>
            </div>

            <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
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

          <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
        </div>
      </CardContent>
    </Card>
  )
}

function DepartmentSection({ group, viewMode }: { group: DepartmentGroup; viewMode: 'grid' | 'list' }) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div className="space-y-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-3 w-full group"
      >
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${group.color.gradient} flex items-center justify-center shadow-sm`}>
          <Building2 className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 text-left">
          <h2 className="text-lg font-semibold text-slate-900">{group.name}</h2>
          <p className="text-sm text-slate-500">{group.employees.length} team member{group.employees.length !== 1 ? 's' : ''}</p>
        </div>
        <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </button>

      {expanded && (
        <div className={viewMode === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'
          : 'space-y-3'
        }>
          {group.employees.map(employee => (
            <EmployeeCard key={employee.id} employee={employee} />
          ))}
        </div>
      )}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number; color: string }) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-center">
          <div className={`w-16 h-16 bg-gradient-to-br ${color} flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="px-4">
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-sm text-slate-500">{label}</p>
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
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-10 w-48" />
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {[...Array(3)].map((_, j) => (
                <Skeleton key={j} className="h-24 rounded-xl" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <Users className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-1">No team members yet</h3>
        <p className="text-sm text-slate-500 text-center max-w-sm mb-4">
          Add employees to your organization to see them appear in the org chart.
        </p>
        <Button>
          <UserPlus className="w-4 h-4 mr-2" />
          Add Employee
        </Button>
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
    color: getColor(name)
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
          <h1 className="text-2xl font-bold text-slate-900">Team Directory</h1>
          <p className="text-slate-500">View and manage your organization structure</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 lg:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by name, email, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex rounded-lg border p-1 bg-slate-50">
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
            <StatCard icon={Users} label="Total Employees" value={totalEmployees} color="from-blue-500 to-blue-600" />
            <StatCard icon={Briefcase} label="Active" value={activeEmployees} color="from-emerald-500 to-emerald-600" />
            <StatCard icon={Building2} label="Departments" value={departments} color="from-purple-500 to-purple-600" />
            <StatCard icon={UserPlus} label="New Hires (30d)" value={newHires} color="from-orange-500 to-orange-600" />
          </div>

          {/* Departments */}
          {departmentGroups.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No employees match your search</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Organization Structure
                </CardTitle>
                <CardDescription>
                  {filteredEmployees.length} team member{filteredEmployees.length !== 1 ? 's' : ''} across {departmentGroups.length} department{departmentGroups.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {departmentGroups.map(group => (
                  <DepartmentSection key={group.name} group={group} viewMode={viewMode} />
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
