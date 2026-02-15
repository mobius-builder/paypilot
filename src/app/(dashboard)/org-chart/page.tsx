'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Users,
  ZoomIn,
  ZoomOut,
  Download,
  ChevronDown,
  ChevronRight,
  Building2,
  Mail,
  Phone
} from 'lucide-react'

// Demo org data
interface Employee {
  id: string
  name: string
  avatar: string
  title: string
  department: string
  email: string
  directReports?: Employee[]
}

const orgData: Employee = {
  id: 'ceo',
  name: 'John Doe',
  avatar: 'JD',
  title: 'CEO & Founder',
  department: 'Executive',
  email: 'john.doe@acme.com',
  directReports: [
    {
      id: 'vpe',
      name: 'Sarah Chen',
      avatar: 'SC',
      title: 'VP of Engineering',
      department: 'Engineering',
      email: 'sarah.chen@acme.com',
      directReports: [
        {
          id: 'em1',
          name: 'Mike Johnson',
          avatar: 'MJ',
          title: 'Software Engineer',
          department: 'Engineering',
          email: 'mike.johnson@acme.com'
        },
        {
          id: 'em2',
          name: 'Jordan Lee',
          avatar: 'JL',
          title: 'DevOps Engineer',
          department: 'Engineering',
          email: 'jordan.lee@acme.com'
        },
        {
          id: 'em3',
          name: 'David Kim',
          avatar: 'DK',
          title: 'Frontend Developer',
          department: 'Engineering',
          email: 'david.kim@acme.com'
        }
      ]
    },
    {
      id: 'vpd',
      name: 'Emily Davis',
      avatar: 'ED',
      title: 'Head of Design',
      department: 'Design',
      email: 'emily.davis@acme.com',
      directReports: [
        {
          id: 'des1',
          name: 'Chris Wang',
          avatar: 'CW',
          title: 'UX Designer',
          department: 'Design',
          email: 'chris.wang@acme.com'
        }
      ]
    },
    {
      id: 'vps',
      name: 'Lisa Park',
      avatar: 'LP',
      title: 'VP of Sales',
      department: 'Sales',
      email: 'lisa.park@acme.com',
      directReports: [
        {
          id: 'sales1',
          name: 'Tom Wilson',
          avatar: 'TW',
          title: 'Account Executive',
          department: 'Sales',
          email: 'tom.wilson@acme.com'
        },
        {
          id: 'sales2',
          name: 'Anna Martinez',
          avatar: 'AM',
          title: 'Sales Development Rep',
          department: 'Sales',
          email: 'anna.martinez@acme.com'
        }
      ]
    },
    {
      id: 'vpm',
      name: 'Alex Wong',
      avatar: 'AW',
      title: 'Marketing Lead',
      department: 'Marketing',
      email: 'alex.wong@acme.com',
      directReports: [
        {
          id: 'mkt1',
          name: 'Sam Brown',
          avatar: 'SB',
          title: 'Content Specialist',
          department: 'Marketing',
          email: 'sam.brown@acme.com'
        }
      ]
    },
    {
      id: 'vphr',
      name: 'Rachel Kim',
      avatar: 'RK',
      title: 'HR Director',
      department: 'HR',
      email: 'rachel.kim@acme.com'
    }
  ]
}

const departmentColors: Record<string, { bg: string; text: string; border: string }> = {
  'Executive': { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
  'Engineering': { bg: 'bg-accent', text: 'text-primary', border: 'border-primary' },
  'Design': { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-300' },
  'Sales': { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300' },
  'Marketing': { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
  'HR': { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-300' },
}

function OrgNode({ employee, level = 0 }: { employee: Employee; level?: number }) {
  const [expanded, setExpanded] = useState(level < 2)
  const [hovered, setHovered] = useState(false)
  const hasReports = employee.directReports && employee.directReports.length > 0
  const colors = departmentColors[employee.department] || departmentColors['Executive']

  return (
    <div className="flex flex-col items-center">
      {/* Employee Card */}
      <div
        className={`relative group transition-all duration-200 ${hovered ? 'z-10' : ''}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Card className={`w-56 hover:shadow-lg transition-all cursor-pointer border-2 ${colors.border}`}>
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center">
              <Avatar className={`w-16 h-16 mb-3 ${colors.bg}`}>
                <AvatarFallback className={`${colors.bg} ${colors.text} text-lg font-semibold`}>
                  {employee.avatar}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-semibold text-slate-900">{employee.name}</h3>
              <p className="text-sm text-slate-600">{employee.title}</p>
              <Badge className={`mt-2 ${colors.bg} ${colors.text}`}>
                {employee.department}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Hover tooltip with contact info */}
        {hovered && (
          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-64 bg-white border rounded-lg shadow-xl p-4 z-20">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="text-slate-600">{employee.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-slate-400" />
                <span className="text-slate-600">+1 (555) 123-4567</span>
              </div>
              {hasReports && (
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">{employee.directReports!.length} direct reports</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Expand/Collapse button */}
      {hasReports && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 p-1 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-slate-600" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-600" />
          )}
        </button>
      )}

      {/* Connecting line */}
      {hasReports && expanded && (
        <div className="w-px h-6 bg-slate-300" />
      )}

      {/* Direct Reports */}
      {hasReports && expanded && (
        <div className="relative">
          {/* Horizontal connector line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px bg-slate-300"
               style={{ width: `${(employee.directReports!.length - 1) * 240}px` }} />

          <div className="flex gap-6 pt-6">
            {employee.directReports!.map((report, idx) => (
              <div key={report.id} className="relative">
                {/* Vertical connector line */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-6 bg-slate-300 -mt-6" />
                <OrgNode employee={report} level={level + 1} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function OrgChartPage() {
  const [zoom, setZoom] = useState(100)
  const [selectedDepartment, setSelectedDepartment] = useState('All')

  const departments = ['All', 'Executive', 'Engineering', 'Design', 'Sales', 'Marketing', 'HR']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Organization Chart</h1>
          <p className="text-slate-600">View your team structure and reporting hierarchy</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-[150px]">
              <Building2 className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map(dept => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1 border rounded-lg px-2">
            <Button variant="ghost" size="icon" onClick={() => setZoom(Math.max(50, zoom - 10))}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm text-slate-600 min-w-[3rem] text-center">{zoom}%</span>
            <Button variant="ghost" size="icon" onClick={() => setZoom(Math.min(150, zoom + 10))}>
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        {Object.entries(departmentColors).map(([dept, colors]) => (
          <Card key={dept} className={`${colors.border} border-2`}>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${colors.bg.replace('100', '500')}`} />
                <div>
                  <p className={`text-xs ${colors.text}`}>{dept}</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {dept === 'Executive' ? 1 :
                     dept === 'Engineering' ? 4 :
                     dept === 'Design' ? 2 :
                     dept === 'Sales' ? 3 :
                     dept === 'Marketing' ? 2 : 1}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Org Chart */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Team Structure</CardTitle>
          <CardDescription>Click on employee cards for contact info. Use + / - to expand or collapse teams.</CardDescription>
        </CardHeader>
        <CardContent className="p-8 overflow-auto">
          <div
            className="flex justify-center min-w-fit"
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
          >
            <OrgNode employee={orgData} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
