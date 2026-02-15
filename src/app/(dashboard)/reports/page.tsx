'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Clock,
  Calendar,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  LineChart,
  Target,
  Briefcase,
  Loader2,
  FileText,
  CheckCircle2
} from 'lucide-react'
import { toast } from 'sonner'

// Demo analytics data
const kpiCards = [
  {
    title: 'Total Headcount',
    value: '47',
    change: '+6.8%',
    trend: 'up',
    period: 'vs last quarter',
    icon: Users,
    bgColor: 'bg-accent',
    iconColor: 'text-primary'
  },
  {
    title: 'Avg. Salary',
    value: '$98,500',
    change: '+4.2%',
    trend: 'up',
    period: 'vs last year',
    icon: DollarSign,
    bgColor: 'bg-emerald-100',
    iconColor: 'text-emerald-600'
  },
  {
    title: 'Turnover Rate',
    value: '5.8%',
    change: '-2.1%',
    trend: 'down',
    period: 'vs last quarter',
    icon: TrendingDown,
    bgColor: 'bg-amber-100',
    iconColor: 'text-amber-600'
  },
  {
    title: 'Time to Fill',
    value: '18 days',
    change: '-5 days',
    trend: 'down',
    period: 'vs last quarter',
    icon: Clock,
    bgColor: 'bg-violet-100',
    iconColor: 'text-violet-600'
  }
]

const departmentBreakdown = [
  { name: 'Engineering', count: 18, percentage: 38, color: 'bg-blue-500' },
  { name: 'Sales', count: 12, percentage: 26, color: 'bg-emerald-500' },
  { name: 'Marketing', count: 6, percentage: 13, color: 'bg-orange-500' },
  { name: 'Design', count: 5, percentage: 11, color: 'bg-pink-500' },
  { name: 'HR', count: 3, percentage: 6, color: 'bg-cyan-500' },
  { name: 'Finance', count: 3, percentage: 6, color: 'bg-violet-500' }
]

const monthlyPayroll = [
  { month: 'Aug', amount: 235000 },
  { month: 'Sep', amount: 242000 },
  { month: 'Oct', amount: 248000 },
  { month: 'Nov', amount: 256000 },
  { month: 'Dec', amount: 312000 },
  { month: 'Jan', amount: 249000 },
  { month: 'Feb', amount: 250000 }
]

const ptoAnalytics = [
  { type: 'PTO Used', hours: 1840, percentage: 65 },
  { type: 'Sick Leave Used', hours: 312, percentage: 35 },
  { type: 'PTO Remaining', hours: 960, percentage: 45 },
]

const hiringFunnel = [
  { stage: 'Applications', count: 245 },
  { stage: 'Screened', count: 89 },
  { stage: 'Interviewed', count: 34 },
  { stage: 'Offered', count: 12 },
  { stage: 'Hired', count: 8 }
]

const recentReports = [
  { name: 'Q4 2025 Payroll Summary', date: 'Jan 15, 2026', type: 'Payroll' },
  { name: 'Annual Compensation Report', date: 'Jan 10, 2026', type: 'Compensation' },
  { name: 'Diversity & Inclusion Report', date: 'Jan 5, 2026', type: 'HR' },
  { name: 'Benefits Utilization Q4', date: 'Dec 31, 2025', type: 'Benefits' },
  { name: 'Turnover Analysis 2025', date: 'Dec 28, 2025', type: 'HR' }
]

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState('quarter')
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false)
  const [reportType, setReportType] = useState('')
  const [reportPeriod, setReportPeriod] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [reports, setReports] = useState(recentReports)

  const handleGenerateReport = async () => {
    if (!reportType || !reportPeriod) {
      toast.error('Please select report type and period')
      return
    }

    setIsGenerating(true)
    await new Promise(resolve => setTimeout(resolve, 2000))

    const today = new Date()
    const newReport = {
      name: `${reportType} Report - ${reportPeriod}`,
      date: today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      type: reportType.split(' ')[0]
    }

    setReports(prev => [newReport, ...prev])
    setIsGenerating(false)
    setGenerateDialogOpen(false)
    setReportType('')
    setReportPeriod('')
    toast.success('Report generated!', {
      description: `${newReport.name} is ready to download`
    })
  }

  const handleDownload = (reportName: string) => {
    toast.success(`Downloading ${reportName}`, {
      description: 'Your report will download shortly'
    })
  }

  const maxPayroll = Math.max(...monthlyPayroll.map(m => m.amount))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports & Analytics</h1>
          <p className="text-slate-600">Insights into your workforce and HR operations</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[150px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.title} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${kpi.bgColor}`}>
                  <kpi.icon className={`w-5 h-5 ${kpi.iconColor}`} />
                </div>
                <Badge
                  variant={kpi.trend === 'up' ? 'default' : 'secondary'}
                  className={kpi.trend === 'up' ? 'bg-emerald-100 text-emerald-700' : 'bg-accent text-primary'}
                >
                  {kpi.trend === 'up' ? (
                    <ArrowUpRight className="w-3 h-3 mr-1" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3 mr-1" />
                  )}
                  {kpi.change}
                </Badge>
              </div>
              <p className="text-2xl font-bold text-slate-900">{kpi.value}</p>
              <p className="text-sm text-slate-500">{kpi.title}</p>
              <p className="text-xs text-slate-400 mt-1">{kpi.period}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payroll Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="w-5 h-5 text-primary" />
                  Payroll Trend
                </CardTitle>
                <CardDescription>Monthly payroll expenses over time</CardDescription>
              </div>
              <Badge variant="secondary" className="text-lg font-semibold">
                $1.79M YTD
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-48">
              {monthlyPayroll.map((month, idx) => (
                <div key={month.month} className="flex-1 flex flex-col items-center">
                  <div
                    className={`w-full rounded-t transition-all ${
                      idx === monthlyPayroll.length - 1 ? 'bg-primary' : 'bg-accent'
                    }`}
                    style={{ height: `${(month.amount / maxPayroll) * 100}%` }}
                  />
                  <span className="text-xs text-slate-500 mt-2">{month.month}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm text-slate-500">This Month</p>
                <p className="text-lg font-semibold text-slate-900">$249,700</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Avg Monthly</p>
                <p className="text-lg font-semibold text-slate-900">$256,000</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Peak (Dec)</p>
                <p className="text-lg font-semibold text-slate-900">$312,000</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Department Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-violet-600" />
              Headcount by Department
            </CardTitle>
            <CardDescription>47 total employees</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {departmentBreakdown.map((dept) => (
              <div key={dept.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-700">{dept.name}</span>
                  <span className="text-sm text-slate-500">{dept.count} ({dept.percentage}%)</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${dept.color} rounded-full transition-all`}
                    style={{ width: `${dept.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Second Row Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hiring Funnel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-600" />
              Hiring Funnel
            </CardTitle>
            <CardDescription>Q1 2026 recruitment pipeline</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {hiringFunnel.map((stage, idx) => {
                const width = (stage.count / hiringFunnel[0].count) * 100
                return (
                  <div key={stage.stage} className="flex items-center gap-4">
                    <div className="w-24 text-sm text-slate-600">{stage.stage}</div>
                    <div className="flex-1 h-8 bg-slate-100 rounded-lg overflow-hidden relative">
                      <div
                        className={`h-full transition-all ${
                          idx === 0 ? 'bg-slate-400' :
                          idx === 1 ? 'bg-primary/60' :
                          idx === 2 ? 'bg-primary/80' :
                          idx === 3 ? 'bg-violet-400' :
                          'bg-emerald-500'
                        }`}
                        style={{ width: `${width}%` }}
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-sm font-medium text-slate-700">
                        {stage.count}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-6 flex items-center justify-between p-4 bg-emerald-50 rounded-lg">
              <div>
                <p className="font-medium text-emerald-800">Conversion Rate</p>
                <p className="text-sm text-emerald-600">Applications to Hire</p>
              </div>
              <p className="text-2xl font-bold text-emerald-700">3.3%</p>
            </div>
          </CardContent>
        </Card>

        {/* Time Off Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              Time Off Analytics
            </CardTitle>
            <CardDescription>PTO and sick leave usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="p-4 bg-accent rounded-lg text-center">
                <p className="text-3xl font-bold text-primary">1,840</p>
                <p className="text-sm text-primary">PTO Hours Used</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg text-center">
                <p className="text-3xl font-bold text-amber-700">312</p>
                <p className="text-sm text-amber-600">Sick Hours Used</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-slate-600">PTO Utilization Rate</span>
                  <span className="text-sm font-medium">65%</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: '65%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-slate-600">Sick Leave Utilization</span>
                  <span className="text-sm font-medium">35%</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '35%' }} />
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600">Average PTO days per employee</p>
              <p className="text-2xl font-bold text-slate-900">12.5 days</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-slate-600" />
                Recent Reports
              </CardTitle>
              <CardDescription>Download and view generated reports</CardDescription>
            </div>
            <Button onClick={() => setGenerateDialogOpen(true)}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {reports.map((report, idx) => (
              <div
                key={`${report.name}-${idx}`}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-lg border flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{report.name}</p>
                    <p className="text-sm text-slate-500">{report.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">{report.type}</Badge>
                  <Button variant="ghost" size="sm" onClick={() => handleDownload(report.name)}>
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Generate Report Dialog */}
      <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Report</DialogTitle>
            <DialogDescription>
              Create a new report for your records
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={setReportType} disabled={isGenerating}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Payroll Summary">Payroll Summary</SelectItem>
                  <SelectItem value="Compensation Analysis">Compensation Analysis</SelectItem>
                  <SelectItem value="Headcount Report">Headcount Report</SelectItem>
                  <SelectItem value="PTO Utilization">PTO Utilization</SelectItem>
                  <SelectItem value="Benefits Enrollment">Benefits Enrollment</SelectItem>
                  <SelectItem value="Turnover Analysis">Turnover Analysis</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Time Period</Label>
              <Select value={reportPeriod} onValueChange={setReportPeriod} disabled={isGenerating}>
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Q1 2026">Q1 2026</SelectItem>
                  <SelectItem value="Q4 2025">Q4 2025</SelectItem>
                  <SelectItem value="Full Year 2025">Full Year 2025</SelectItem>
                  <SelectItem value="January 2026">January 2026</SelectItem>
                  <SelectItem value="February 2026">February 2026</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {reportType && reportPeriod && (
              <div className="bg-blue-50 p-3 rounded-lg flex items-center gap-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-800">{reportType} Report</p>
                  <p className="text-xs text-blue-600">Period: {reportPeriod}</p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGenerateDialogOpen(false)} disabled={isGenerating}>
              Cancel
            </Button>
            <Button onClick={handleGenerateReport} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Generate
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
