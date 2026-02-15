'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Shield,
  Heart,
  Eye,
  Smile,
  PiggyBank,
  FileText,
  CheckCircle2,
  ExternalLink,
  Download,
  Users,
  Loader2,
  Plus
} from 'lucide-react'
import { toast } from 'sonner'
import { LucideIcon } from 'lucide-react'

interface Benefit {
  id: string
  name: string
  type: string
  provider: string
  icon: LucideIcon
  color: string
  coverage: string
  employeeCost: number
  employerCost: number
  status: string
  details: Record<string, string>
}

// Demo benefits data
const enrolledBenefits: Benefit[] = [
  {
    id: '1',
    name: 'Premium Health Plan',
    type: 'health',
    provider: 'Blue Cross',
    icon: Heart,
    color: 'red',
    coverage: 'Employee + Spouse',
    employeeCost: 15000, // cents
    employerCost: 45000,
    status: 'active',
    details: {
      deductible: '$500 individual / $1,000 family',
      copay: '$20 primary care / $40 specialist',
      outOfPocketMax: '$3,000 individual / $6,000 family'
    }
  },
  {
    id: '2',
    name: 'Basic Dental',
    type: 'dental',
    provider: 'Delta Dental',
    icon: Smile,
    color: 'blue',
    coverage: 'Employee Only',
    employeeCost: 2500,
    employerCost: 2500,
    status: 'active',
    details: {
      preventive: '100% covered',
      basic: '80% covered',
      major: '50% covered'
    }
  },
  {
    id: '3',
    name: 'Vision Plus',
    type: 'vision',
    provider: 'VSP',
    icon: Eye,
    color: 'violet',
    coverage: 'Employee Only',
    employeeCost: 1000,
    employerCost: 1000,
    status: 'active',
    details: {
      eyeExam: '1 per year, $10 copay',
      glasses: '$150 allowance per year',
      contacts: '$150 allowance per year'
    }
  },
  {
    id: '4',
    name: '401(k) Retirement',
    type: '401k',
    provider: 'Fidelity',
    icon: PiggyBank,
    color: 'emerald',
    coverage: 'N/A',
    employeeCost: 0,
    employerCost: 0,
    status: 'active',
    details: {
      match: '4% company match',
      vesting: 'Immediate',
      contribution: '6% of salary'
    }
  }
]

const availableBenefits = [
  {
    name: 'Life Insurance',
    description: '1x annual salary, company paid',
    icon: Shield,
    status: 'eligible'
  },
  {
    name: 'HSA Account',
    description: 'Health Savings Account with pre-tax contributions',
    icon: PiggyBank,
    status: 'eligible'
  }
]

const documents = [
  { name: 'Benefits Summary 2026', type: 'PDF', size: '245 KB' },
  { name: 'Health Plan Details', type: 'PDF', size: '1.2 MB' },
  { name: '401(k) Enrollment Guide', type: 'PDF', size: '890 KB' },
  { name: 'FSA Information', type: 'PDF', size: '156 KB' },
]

export default function BenefitsPage() {
  const [availableBenefitsList, setAvailableBenefitsList] = useState(availableBenefits)
  const [enrolledBenefitsList, setEnrolledBenefitsList] = useState(enrolledBenefits)
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false)
  const [selectedBenefit, setSelectedBenefit] = useState<typeof availableBenefits[0] | null>(null)
  const [isEnrolling, setIsEnrolling] = useState(false)
  const [coverageLevel, setCoverageLevel] = useState('')

  const totalMonthlyEmployeeCost = enrolledBenefitsList.reduce((acc, b) => acc + b.employeeCost, 0) / 100
  const totalMonthlyEmployerCost = enrolledBenefitsList.reduce((acc, b) => acc + b.employerCost, 0) / 100

  const handleEnrollClick = (benefit: typeof availableBenefits[0]) => {
    setSelectedBenefit(benefit)
    setCoverageLevel('')
    setEnrollDialogOpen(true)
  }

  const handleEnroll = async () => {
    if (!selectedBenefit || !coverageLevel) {
      toast.error('Please select a coverage level')
      return
    }

    setIsEnrolling(true)
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Add to enrolled benefits
    const newBenefit: Benefit = {
      id: `new-${Date.now()}`,
      name: selectedBenefit.name,
      type: selectedBenefit.name.toLowerCase().replace(' ', '_'),
      provider: selectedBenefit.name === 'Life Insurance' ? 'MetLife' : 'HealthEquity',
      icon: selectedBenefit.icon,
      color: selectedBenefit.name === 'Life Insurance' ? 'blue' : 'emerald',
      coverage: coverageLevel,
      employeeCost: selectedBenefit.name === 'Life Insurance' ? 0 : 5000,
      employerCost: selectedBenefit.name === 'Life Insurance' ? 2500 : 2500,
      status: 'active',
      details: selectedBenefit.name === 'Life Insurance'
        ? { coverage: '1x Annual Salary', beneficiary: 'To be designated' }
        : { contributionLimit: '$3,850/year', rollover: 'Yes' }
    }

    setEnrolledBenefitsList(prev => [...prev, newBenefit])
    setAvailableBenefitsList(prev => prev.filter(b => b.name !== selectedBenefit.name))

    setIsEnrolling(false)
    setEnrollDialogOpen(false)
    toast.success(`Successfully enrolled in ${selectedBenefit.name}!`, {
      description: 'Your enrollment will be effective next pay period.'
    })
  }

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; icon: string }> = {
      red: { bg: 'bg-red-100', text: 'text-red-700', icon: 'text-red-600' },
      blue: { bg: 'bg-accent', text: 'text-primary', icon: 'text-primary' },
      violet: { bg: 'bg-violet-100', text: 'text-violet-700', icon: 'text-violet-600' },
      emerald: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: 'text-emerald-600' },
    }
    return colors[color] || colors.blue
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Benefits</h1>
          <p className="text-slate-600">Manage your benefits and view enrollment details</p>
        </div>
        <Button variant="outline">
          <FileText className="w-4 h-4 mr-2" />
          View All Documents
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{enrolledBenefitsList.length}</p>
                <p className="text-sm text-slate-500">Active Benefits</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <PiggyBank className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">${totalMonthlyEmployeeCost.toFixed(0)}</p>
                <p className="text-sm text-slate-500">Your Monthly Cost</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">${totalMonthlyEmployerCost.toFixed(0)}</p>
                <p className="text-sm text-slate-500">Employer Contribution</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enrolled Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>Your Enrolled Benefits</CardTitle>
          <CardDescription>Benefits you&apos;re currently enrolled in</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {enrolledBenefitsList.map((benefit) => {
            const colors = getColorClasses(benefit.color)
            return (
              <div key={benefit.id} className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center`}>
                    <benefit.icon className={`w-6 h-6 ${colors.icon}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900">{benefit.name}</h3>
                      <Badge className="bg-emerald-100 text-emerald-700">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500 mb-2">
                      {benefit.provider} • {benefit.coverage}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                      {Object.entries(benefit.details).map(([key, value]) => (
                        <div key={key} className="bg-slate-100 rounded px-2 py-1">
                          <span className="text-slate-500 capitalize">{key}: </span>
                          <span className="font-medium text-slate-700">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-slate-900">
                      ${(benefit.employeeCost / 100).toFixed(0)}/mo
                    </p>
                    <p className="text-xs text-slate-500">Your cost</p>
                    <Button variant="ghost" size="sm" className="mt-2">
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Details
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* 401(k) Summary */}
      <Card>
        <CardHeader>
          <CardTitle>401(k) Summary</CardTitle>
          <CardDescription>Your retirement savings progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">2026 Contribution Progress</span>
                <span className="text-sm font-medium">$4,800 / $23,000</span>
              </div>
              <Progress value={21} className="h-3 mb-4" />
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-sm text-slate-500">Your Contribution</p>
                  <p className="text-lg font-semibold">6%</p>
                  <p className="text-xs text-slate-500">$461/paycheck</p>
                </div>
                <div className="bg-emerald-50 rounded-lg p-3">
                  <p className="text-sm text-emerald-600">Company Match</p>
                  <p className="text-lg font-semibold text-emerald-700">4%</p>
                  <p className="text-xs text-emerald-600">$307/paycheck</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="font-medium text-slate-900 mb-3">Account Balance</h4>
              <p className="text-3xl font-bold text-slate-900 mb-1">$47,825.32</p>
              <p className="text-sm text-emerald-600 mb-4">+$2,450.00 this year</p>
              <Button variant="outline" className="w-full">
                <ExternalLink className="w-4 h-4 mr-2" />
                View in Fidelity
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Benefits & Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Benefits */}
        <Card>
          <CardHeader>
            <CardTitle>Available Benefits</CardTitle>
            <CardDescription>Benefits you can enroll in</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {availableBenefitsList.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-emerald-300" />
                <p>You&apos;re enrolled in all available benefits!</p>
              </div>
            ) : (
              availableBenefitsList.map((benefit, i) => (
                <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                    <benefit.icon className="w-5 h-5 text-slate-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{benefit.name}</p>
                    <p className="text-sm text-slate-500">{benefit.description}</p>
                  </div>
                  <Button size="sm" onClick={() => handleEnrollClick(benefit)}>Enroll</Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle>Benefits Documents</CardTitle>
            <CardDescription>Download important documents</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {documents.map((doc, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                <FileText className="w-5 h-5 text-slate-400" />
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{doc.name}</p>
                  <p className="text-xs text-slate-500">{doc.type} • {doc.size}</p>
                </div>
                <Button variant="ghost" size="sm">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Dependents Card */}
      <Card>
        <CardHeader>
          <CardTitle>Dependents</CardTitle>
          <CardDescription>Family members covered under your benefits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 p-4 border rounded-lg">
            <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-pink-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-slate-900">Jane Doe</p>
              <p className="text-sm text-slate-500">Spouse • Covered under Health Plan</p>
            </div>
            <Button variant="outline" size="sm">Edit</Button>
          </div>
          <Button variant="outline" className="mt-4">
            <Users className="w-4 h-4 mr-2" />
            Add Dependent
          </Button>
        </CardContent>
      </Card>

      {/* Enrollment Dialog */}
      <Dialog open={enrollDialogOpen} onOpenChange={setEnrollDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enroll in {selectedBenefit?.name}</DialogTitle>
            <DialogDescription>
              {selectedBenefit?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="coverage">Coverage Level</Label>
              <Select value={coverageLevel} onValueChange={setCoverageLevel} disabled={isEnrolling}>
                <SelectTrigger>
                  <SelectValue placeholder="Select coverage level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Employee Only">Employee Only</SelectItem>
                  <SelectItem value="Employee + Spouse">Employee + Spouse</SelectItem>
                  <SelectItem value="Employee + Children">Employee + Children</SelectItem>
                  <SelectItem value="Employee + Family">Employee + Family</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="bg-accent p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {selectedBenefit && <selectedBenefit.icon className="w-5 h-5 text-primary" />}
                <span className="font-medium text-foreground">{selectedBenefit?.name}</span>
              </div>
              <p className="text-sm text-primary">
                {selectedBenefit?.name === 'Life Insurance'
                  ? 'Coverage: 1x your annual salary. Company paid - no cost to you.'
                  : 'HSA contribution limit: $3,850/year. Pre-tax contributions reduce your taxable income.'}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEnrollDialogOpen(false)} disabled={isEnrolling}>
              Cancel
            </Button>
            <Button onClick={handleEnroll} disabled={isEnrolling}>
              {isEnrolling ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enrolling...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Confirm Enrollment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
