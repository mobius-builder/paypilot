'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  CheckCircle2,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Calculator,
  Users,
  DollarSign,
  FileCheck,
  Send,
  Sparkles
} from 'lucide-react'
import { toast } from 'sonner'

const steps = [
  { id: 1, name: 'Select Pay Period', icon: Calculator },
  { id: 2, name: 'Review Employees', icon: Users },
  { id: 3, name: 'Calculate Payroll', icon: DollarSign },
  { id: 4, name: 'Review & Submit', icon: FileCheck }
]

const employees = [
  { id: '1', name: 'Sarah Chen', avatar: 'SC', department: 'Engineering', hours: 80, rate: 6962, grossPay: 0, taxes: 0, deductions: 0, netPay: 0 },
  { id: '2', name: 'Mike Johnson', avatar: 'MJ', department: 'Engineering', hours: 80, rate: 4567, grossPay: 0, taxes: 0, deductions: 0, netPay: 0 },
  { id: '3', name: 'Emily Davis', avatar: 'ED', department: 'Design', hours: 80, rate: 5288, grossPay: 0, taxes: 0, deductions: 0, netPay: 0 },
  { id: '4', name: 'Tom Wilson', avatar: 'TW', department: 'Sales', hours: 80, rate: 4087, grossPay: 0, taxes: 0, deductions: 0, netPay: 0 },
  { id: '5', name: 'Lisa Park', avatar: 'LP', department: 'Sales', hours: 80, rate: 6250, grossPay: 0, taxes: 0, deductions: 0, netPay: 0 },
  { id: '6', name: 'Alex Wong', avatar: 'AW', department: 'Marketing', hours: 80, rate: 3606, grossPay: 0, taxes: 0, deductions: 0, netPay: 0 },
]

export default function RunPayrollPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isCalculating, setIsCalculating] = useState(false)
  const [calculationProgress, setCalculationProgress] = useState(0)
  const [calculatedEmployees, setCalculatedEmployees] = useState(employees)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const payPeriod = {
    start: 'Feb 16, 2026',
    end: 'Mar 1, 2026',
    payDate: 'Mar 6, 2026'
  }

  const calculatePayroll = async () => {
    setIsCalculating(true)
    setCalculationProgress(0)

    // Simulate calculating each employee
    const updated = [...employees]
    for (let i = 0; i < updated.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 400))

      const emp = updated[i]
      const grossPay = Math.round((emp.rate / 26) * 100) / 100 // Biweekly rate
      const taxes = Math.round(grossPay * 0.25 * 100) / 100 // 25% taxes
      const deductions = Math.round(grossPay * 0.15 * 100) / 100 // 15% deductions
      const netPay = Math.round((grossPay - taxes - deductions) * 100) / 100

      updated[i] = { ...emp, grossPay, taxes, deductions, netPay }
      setCalculatedEmployees([...updated])
      setCalculationProgress(((i + 1) / updated.length) * 100)
    }

    await new Promise(resolve => setTimeout(resolve, 500))
    setIsCalculating(false)
    toast.success('Payroll calculated successfully!')
    setCurrentStep(4)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    toast.success('Payroll submitted for approval!')
    router.push('/payroll')
  }

  const totalGross = calculatedEmployees.reduce((sum, emp) => sum + emp.grossPay, 0)
  const totalTaxes = calculatedEmployees.reduce((sum, emp) => sum + emp.taxes, 0)
  const totalDeductions = calculatedEmployees.reduce((sum, emp) => sum + emp.deductions, 0)
  const totalNet = calculatedEmployees.reduce((sum, emp) => sum + emp.netPay, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push('/payroll')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Run Payroll</h1>
          <p className="text-slate-600">Create a new payroll run for your team</p>
        </div>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center gap-3 ${currentStep >= step.id ? 'text-blue-600' : 'text-slate-400'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep > step.id ? 'bg-emerald-100' :
                    currentStep === step.id ? 'bg-accent' : 'bg-slate-100'
                  }`}>
                    {currentStep > step.id ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <step.icon className={`w-5 h-5 ${currentStep === step.id ? 'text-primary' : 'text-slate-400'}`} />
                    )}
                  </div>
                  <span className={`hidden sm:block text-sm font-medium ${
                    currentStep >= step.id ? 'text-slate-900' : 'text-slate-400'
                  }`}>
                    {step.name}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`w-12 lg:w-24 h-1 mx-4 rounded ${
                    currentStep > step.id ? 'bg-emerald-500' : 'bg-slate-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Pay Period</CardTitle>
            <CardDescription>Choose the pay period for this payroll run</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border-2 border-primary rounded-lg bg-accent">
                <Badge className="bg-accent text-primary mb-2 border border-border">Current Period</Badge>
                <p className="font-semibold text-slate-900">{payPeriod.start} - {payPeriod.end}</p>
                <p className="text-sm text-slate-500">Pay Date: {payPeriod.payDate}</p>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setCurrentStep(2)}>
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Review Employees</CardTitle>
            <CardDescription>{employees.length} employees will be included in this payroll</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mb-6">
              {employees.map(emp => (
                <div key={emp.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-accent text-primary">{emp.avatar}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-slate-900">{emp.name}</p>
                      <p className="text-sm text-slate-500">{emp.department}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{emp.hours} hours</p>
                    <p className="text-sm text-slate-500">Regular time</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button onClick={() => setCurrentStep(3)}>
                Continue to Calculate
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Calculate Payroll</CardTitle>
            <CardDescription>Computing pay, taxes, and deductions for all employees</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isCalculating && calculationProgress === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calculator className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Ready to Calculate</h3>
                <p className="text-slate-600 mb-6">Click the button below to calculate payroll for {employees.length} employees</p>
                <Button size="lg" onClick={calculatePayroll} className="bg-primary hover:bg-primary/90">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Calculate Payroll
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">
                    {isCalculating ? 'Calculating...' : 'Complete!'}
                  </span>
                  <span className="text-sm text-slate-500">{Math.round(calculationProgress)}%</span>
                </div>
                <Progress value={calculationProgress} className="h-3" />

                <div className="space-y-2 mt-6">
                  {calculatedEmployees.map(emp => (
                    <div key={emp.id} className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                      emp.netPay > 0 ? 'bg-emerald-50' : 'bg-slate-50'
                    }`}>
                      <div className="flex items-center gap-3">
                        {emp.netPay > 0 ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
                        )}
                        <span className="font-medium text-slate-900">{emp.name}</span>
                      </div>
                      {emp.netPay > 0 && (
                        <span className="font-semibold text-emerald-600">
                          ${emp.netPay.toLocaleString()}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!isCalculating && calculationProgress === 0 && (
              <div className="flex justify-between pt-4 border-t">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {currentStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Review & Submit</CardTitle>
            <CardDescription>Review the payroll summary before submitting</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500">Gross Pay</p>
                <p className="text-2xl font-bold text-slate-900">${totalGross.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-red-600">Taxes</p>
                <p className="text-2xl font-bold text-red-700">-${totalTaxes.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg">
                <p className="text-sm text-amber-600">Deductions</p>
                <p className="text-2xl font-bold text-amber-700">-${totalDeductions.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-lg">
                <p className="text-sm text-emerald-600">Net Pay</p>
                <p className="text-2xl font-bold text-emerald-700">${totalNet.toLocaleString()}</p>
              </div>
            </div>

            <div className="p-4 bg-accent rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center border border-border">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{employees.length} Employees</p>
                  <p className="text-sm text-slate-600">Pay Date: {payPeriod.payDate}</p>
                </div>
              </div>
              <Badge className="bg-accent text-primary border border-border">Ready to Submit</Badge>
            </div>

            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline" onClick={() => setCurrentStep(3)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-emerald-600 to-emerald-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit for Approval
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
