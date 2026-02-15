'use client'

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import {
  Users,
  Calculator,
  Clock,
  Shield,
  MessageSquare,
  Zap,
  ChevronRight,
  Check,
  Sparkles,
  TrendingDown,
  DollarSign
} from "lucide-react"

// Animated counter component
function AnimatedCounter({ value, suffix = '' }: { value: string; suffix?: string }) {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  // Extract numeric value
  const numericValue = parseInt(value.replace(/[^0-9]/g, '')) || 0
  const prefix = value.match(/^[^0-9]*/)?.[0] || ''
  const valueSuffix = value.match(/[^0-9]*$/)?.[0] || ''

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [isVisible])

  useEffect(() => {
    if (!isVisible) return

    const duration = 1500
    const steps = 60
    const increment = numericValue / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= numericValue) {
        setCount(numericValue)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [isVisible, numericValue])

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString()}{valueSuffix}{suffix}
    </span>
  )
}

const features = [
  {
    icon: Users,
    title: "Employee Management",
    description: "Onboard, manage, and offboard employees with ease. Track all HR data in one place."
  },
  {
    icon: Calculator,
    title: "Automated Payroll",
    description: "Run payroll in minutes with automatic tax calculations, deductions, and direct deposits."
  },
  {
    icon: Clock,
    title: "Time & Attendance",
    description: "Track hours, manage PTO requests, and sync time data directly to payroll."
  },
  {
    icon: Shield,
    title: "Benefits Admin",
    description: "Manage health, dental, vision, and 401(k) benefits with easy enrollment."
  },
  {
    icon: MessageSquare,
    title: "AI HR Assistant",
    description: "Employees get instant answers about policies, PTO, benefits, and more."
  },
  {
    icon: Zap,
    title: "Compliance Built-In",
    description: "Stay compliant with automatic tax forms, audit trails, and regulatory updates."
  }
]

const pricingPlans = [
  {
    name: "Starter",
    price: 40,
    description: "For small teams getting started",
    features: [
      "Up to 10 employees",
      "Full payroll processing",
      "Basic HR tools",
      "Email support"
    ]
  },
  {
    name: "Growth",
    price: 80,
    description: "For growing businesses",
    popular: true,
    features: [
      "Up to 50 employees",
      "Everything in Starter",
      "Benefits administration",
      "AI HR Assistant",
      "Priority support"
    ]
  },
  {
    name: "Enterprise",
    price: 150,
    description: "For larger organizations",
    features: [
      "Unlimited employees",
      "Everything in Growth",
      "Custom integrations",
      "Dedicated account manager",
      "Advanced analytics"
    ]
  }
]

// ROI Calculator Component
function ROICalculator() {
  const [employees, setEmployees] = useState([25])
  const [hoursPerWeek, setHoursPerWeek] = useState([8])

  const numEmployees = employees[0]
  const hrHours = hoursPerWeek[0]
  const hrHourlyRate = 45 // Average HR hourly rate

  // Calculations
  const weeklyHRCost = hrHours * hrHourlyRate
  const monthlyHRCost = weeklyHRCost * 4.33
  const yearlyHRCost = monthlyHRCost * 12

  // PayPilot reduces HR time by 60%
  const timeSavedPercent = 0.6
  const timeSavedHours = hrHours * timeSavedPercent * 52 // yearly
  const moneySaved = yearlyHRCost * timeSavedPercent

  // PayPilot cost
  const baseCost = numEmployees <= 10 ? 40 : numEmployees <= 50 ? 80 : 150
  const perEmployeeCost = 6
  const paypilotMonthlyCost = baseCost + (numEmployees * perEmployeeCost)
  const paypilotYearlyCost = paypilotMonthlyCost * 12

  // Net savings
  const netSavings = moneySaved - paypilotYearlyCost
  const roi = ((netSavings / paypilotYearlyCost) * 100).toFixed(0)

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-emerald-50 to-teal-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-emerald-100 border border-emerald-200 rounded-full px-4 py-2 mb-6">
            <Calculator className="w-4 h-4 text-emerald-600" />
            <span className="text-sm text-emerald-700 font-medium">ROI Calculator</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            See how much you could save
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Calculate your potential savings with PayPilot&apos;s AI-powered automation.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Inputs */}
          <Card className="border-0 shadow-xl">
            <CardContent className="p-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Your Company</h3>

              <div className="space-y-8">
                <div>
                  <div className="flex justify-between mb-3">
                    <label className="text-sm font-medium text-slate-700">Number of Employees</label>
                    <span className="text-sm font-bold text-blue-600">{numEmployees}</span>
                  </div>
                  <Slider
                    value={employees}
                    onValueChange={setEmployees}
                    min={5}
                    max={200}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between mt-1 text-xs text-slate-400">
                    <span>5</span>
                    <span>200</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-3">
                    <label className="text-sm font-medium text-slate-700">Hours spent on HR/week</label>
                    <span className="text-sm font-bold text-blue-600">{hrHours} hrs</span>
                  </div>
                  <Slider
                    value={hoursPerWeek}
                    onValueChange={setHoursPerWeek}
                    min={2}
                    max={40}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between mt-1 text-xs text-slate-400">
                    <span>2 hrs</span>
                    <span>40 hrs</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-slate-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Current yearly HR cost</span>
                  <span className="text-lg font-bold text-slate-900">${yearlyHRCost.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white">
            <CardContent className="p-8">
              <h3 className="text-lg font-semibold text-emerald-100 mb-6">Your Savings with PayPilot</h3>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-emerald-100 text-sm">Time saved per year</p>
                    <p className="text-3xl font-bold">{timeSavedHours.toFixed(0)} hours</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <TrendingDown className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-emerald-100 text-sm">HR cost reduction</p>
                    <p className="text-3xl font-bold">60%</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-emerald-100 text-sm">Net yearly savings</p>
                    <p className="text-3xl font-bold">${netSavings > 0 ? netSavings.toLocaleString() : 0}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-white/10 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-emerald-100">PayPilot cost</span>
                  <span className="font-medium">${paypilotYearlyCost.toLocaleString()}/year</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-emerald-100">ROI</span>
                  <span className="font-bold text-xl">{Number(roi) > 0 ? `${roi}%` : 'Positive'}</span>
                </div>
              </div>

              <Link href="/signup" className="block mt-6">
                <Button className="w-full bg-white text-emerald-700 hover:bg-emerald-50 font-semibold">
                  Start Saving Now
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
                PayPilot
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-sm text-slate-600 hover:text-slate-900">Features</Link>
              <Link href="#pricing" className="text-sm text-slate-600 hover:text-slate-900">Pricing</Link>
              <Link href="#ai" className="text-sm text-slate-600 hover:text-slate-900">AI Assistant</Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost">Log in</Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-700 font-medium">AI-Native HR Platform</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight">
            Payroll & HR that
            <br />
            <span className="animate-gradient">
              runs itself
            </span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10">
            The modern HR platform with AI at its core. Automate payroll, manage benefits,
            track time, and let employees get instant answers to any HR question.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg px-8">
                Start Free Trial
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Watch Demo
              </Button>
            </Link>
          </div>
          <p className="text-sm text-slate-500 mt-4">
            No credit card required - 14-day free trial - Cancel anytime
          </p>

          {/* Stats Bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { value: '10000', label: 'Employees Managed', suffix: '+' },
              { value: '500', label: 'Companies', suffix: '+' },
              { value: '99', label: 'Uptime', suffix: '.9%' },
              { value: '4', label: 'Customer Rating', suffix: '.9/5' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="px-4 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-b from-slate-900 to-slate-800 rounded-2xl p-2 shadow-2xl animate-float">
            <div className="bg-white rounded-xl overflow-hidden">
              <div className="bg-slate-100 px-4 py-2 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="p-6 bg-gradient-to-br from-slate-50 to-white">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
                    <CardContent className="p-6">
                      <p className="text-blue-100 text-sm">Total Employees</p>
                      <p className="text-3xl font-bold mt-1">47</p>
                      <p className="text-blue-200 text-sm mt-2">+3 this month</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
                    <CardContent className="p-6">
                      <p className="text-emerald-100 text-sm">Next Payroll</p>
                      <p className="text-3xl font-bold mt-1">$124,850</p>
                      <p className="text-emerald-200 text-sm mt-2">Feb 20, 2026</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-violet-500 to-violet-600 text-white border-0">
                    <CardContent className="p-6">
                      <p className="text-violet-100 text-sm">PTO Requests</p>
                      <p className="text-3xl font-bold mt-1">5</p>
                      <p className="text-violet-200 text-sm mt-2">Pending approval</p>
                    </CardContent>
                  </Card>
                </div>
                <div className="bg-slate-100 rounded-lg p-4 flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-600 text-sm">AI Assistant</p>
                    <p className="text-slate-900">Ask me anything about HR, payroll, or benefits...</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Sparkles className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Everything you need to manage HR
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              From hiring to retiring, PayPilot handles it all with intelligent automation.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <Card key={feature.title} className="border-0 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-slate-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ROI Calculator Section */}
      <ROICalculator />

      {/* AI Section */}
      <section id="ai" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-2 mb-6">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span className="text-sm text-indigo-700 font-medium">AI-Powered</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                Your AI HR assistant that never sleeps
              </h2>
              <p className="text-xl text-slate-600 mb-8">
                Employees can ask natural language questions about their PTO balance,
                benefits, company policies, and more. Instant answers, 24/7.
              </p>
              <div className="space-y-4">
                {[
                  "How many PTO days do I have left?",
                  "What's the company remote work policy?",
                  "When is the next payroll date?",
                  "How do I enroll in the 401(k) plan?"
                ].map((question) => (
                  <div key={question} className="flex items-center gap-3 text-slate-700">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    &quot;{question}&quot;
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                    <span className="text-sm text-white">JS</span>
                  </div>
                  <div className="bg-slate-700 rounded-lg rounded-tl-none px-4 py-2 text-white">
                    How many PTO days do I have left this year?
                  </div>
                </div>
                <div className="flex gap-3 justify-end">
                  <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg rounded-tr-none px-4 py-2 text-white max-w-sm">
                    Hi John! You have <strong>12 days (96 hours)</strong> of PTO remaining for 2026.
                    You&apos;ve used 3 days so far this year. Would you like to request time off?
                  </div>
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                    <span className="text-sm text-white">JS</span>
                  </div>
                  <div className="bg-slate-700 rounded-lg rounded-tl-none px-4 py-2 text-white">
                    Yes, I&apos;d like to take Feb 24-28 off
                  </div>
                </div>
                <div className="flex gap-3 justify-end">
                  <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg rounded-tr-none px-4 py-2 text-white max-w-sm">
                    I&apos;ve created a PTO request for Feb 24-28 (5 days). It&apos;s been sent to your manager Sarah for approval.
                    You&apos;ll get notified once it&apos;s reviewed!
                  </div>
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Loved by HR teams everywhere
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              See what our customers have to say about PayPilot.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "PayPilot cut our payroll processing time by 75%. What used to take me all day now takes under an hour.",
                author: "Sarah Chen",
                role: "HR Director",
                company: "TechFlow Inc.",
                avatar: "SC"
              },
              {
                quote: "The AI assistant is a game-changer. Employees stopped asking me basic questions because they get instant answers.",
                author: "Marcus Johnson",
                role: "People Operations",
                company: "StartupXYZ",
                avatar: "MJ"
              },
              {
                quote: "Finally, an HR platform that doesn't feel like it was built in 2005. My team actually enjoys using it.",
                author: "Emily Rodriguez",
                role: "VP of HR",
                company: "GrowthCo",
                avatar: "ER"
              }
            ].map((testimonial, i) => (
              <Card key={i} className="border-0 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[1,2,3,4,5].map((star) => (
                      <svg key={star} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                      </svg>
                    ))}
                  </div>
                  <p className="text-slate-700 mb-6">&quot;{testimonial.quote}&quot;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{testimonial.author}</p>
                      <p className="text-sm text-slate-500">{testimonial.role}, {testimonial.company}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-12 flex justify-center items-center gap-8 text-slate-400">
            <p className="text-sm">Trusted by teams at</p>
            <div className="flex gap-8 items-center">
              {['Acme Corp', 'TechFlow', 'StartupXYZ', 'GrowthCo', 'InnovateLabs'].map((company) => (
                <span key={company} className="font-semibold text-slate-300">{company}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Start free, scale as you grow. No hidden fees.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan) => (
              <Card
                key={plan.name}
                className={`border-2 transition-all duration-300 hover:-translate-y-1 ${plan.popular ? 'border-blue-500 shadow-xl scale-105' : 'border-slate-200 hover:border-blue-300 hover:shadow-lg'}`}
              >
                <CardContent className="p-6">
                  {plan.popular && (
                    <div className="bg-blue-500 text-white text-sm font-medium px-3 py-1 rounded-full w-fit mb-4">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-2xl font-bold text-slate-900">{plan.name}</h3>
                  <p className="text-slate-600 mt-1">{plan.description}</p>
                  <div className="mt-6 mb-6">
                    <span className="text-4xl font-bold text-slate-900">${plan.price}</span>
                    <span className="text-slate-600">/month base + $6/employee</span>
                  </div>
                  <Link href="/signup">
                    <Button
                      className={`w-full ${plan.popular ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700' : ''}`}
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      Get Started
                    </Button>
                  </Link>
                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-slate-600">
                        <Check className="w-5 h-5 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Frequently asked questions
            </h2>
            <p className="text-xl text-slate-600">
              Everything you need to know about PayPilot.
            </p>
          </div>
          <div className="space-y-4">
            {[
              {
                q: "How long does it take to get started?",
                a: "Most companies are up and running in under 30 minutes. Our onboarding wizard guides you through importing employees, setting up payroll, and configuring benefits."
              },
              {
                q: "Can I migrate from my current payroll provider?",
                a: "Absolutely! We provide free data migration from Gusto, ADP, Paychex, and most major providers. Our team handles the heavy lifting so you don't have to."
              },
              {
                q: "Is my data secure?",
                a: "Yes. PayPilot uses bank-level encryption (AES-256), SOC 2 Type II certified infrastructure, and we never sell your data. We're fully GDPR and CCPA compliant."
              },
              {
                q: "What if I need help?",
                a: "Our support team is available via chat, email, and phone. Growth and Enterprise plans include dedicated account managers. Most questions are answered in under 2 hours."
              },
              {
                q: "Can I try before I buy?",
                a: "Yes! We offer a 14-day free trial with no credit card required. You'll have full access to all features so you can see exactly how PayPilot works for your team."
              }
            ].map((faq, i) => (
              <Card key={i} className="border">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-slate-900 mb-2">{faq.q}</h3>
                  <p className="text-slate-600">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to transform your HR?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of companies using PayPilot to simplify HR and payroll.
          </p>
          <Link href="/signup">
            <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 text-lg px-8 font-semibold">
              Start Your Free Trial
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
                PayPilot
              </span>
            </div>
            <p className="text-slate-500 text-sm">
              2026 PayPilot. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
