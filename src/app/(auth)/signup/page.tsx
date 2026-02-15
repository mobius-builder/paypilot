'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Building2, Info, CheckCircle2, PartyPopper } from 'lucide-react'
import { toast } from 'sonner'
import { PayPilotLogo } from '@/components/logo'

function SignupContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Check for successful Stripe checkout
  useEffect(() => {
    const success = searchParams.get('success')
    const sessionId = searchParams.get('session_id')

    if (success === 'true' && sessionId) {
      setShowSuccess(true)
      toast.success('Payment successful! Welcome to PayPilot!')

      // Auto-redirect to dashboard after 3 seconds
      setTimeout(() => {
        // Create demo session
        localStorage.setItem('paypilot_demo_session', JSON.stringify({
          user: {
            id: 'stripe-user-' + Date.now(),
            email: 'subscriber@paypilot.com',
            name: 'New Subscriber',
            role: 'company_admin',
            company: 'My Company',
            stripeSessionId: sessionId
          },
          expiresAt: Date.now() + 24 * 60 * 60 * 1000
        }))
        router.push('/dashboard')
      }, 3000)
    }
  }, [searchParams, router])

  // Step 1: Account info
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')

  // Step 2: Company info
  const [companyName, setCompanyName] = useState('')
  const [companySize, setCompanySize] = useState('')

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (step === 1) {
      // Validate step 1
      if (!fullName || !email || !password) {
        toast.error('Please fill in all fields')
        return
      }
      if (password.length < 6) {
        toast.error('Password must be at least 6 characters')
        return
      }
      setStep(2)
      return
    }

    setLoading(true)

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Demo mode: create session in localStorage
    localStorage.setItem('paypilot_demo_session', JSON.stringify({
      user: {
        id: 'new-user-' + Date.now(),
        email: email,
        name: fullName,
        role: 'company_admin',
        company: companyName
      },
      expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    }))

    toast.success('Account created! Welcome to PayPilot!')
    router.push('/dashboard')
  }

  // Show success screen after Stripe checkout
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <CheckCircle2 className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome to PayPilot! <PartyPopper className="inline w-8 h-8" />
            </h1>
            <p className="text-lg text-muted-foreground">
              Your 14-day trial has started
            </p>
          </div>

          <Card className="border border-border mb-6">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
                  <span className="text-primary font-medium">Payment confirmed</span>
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                </div>
                <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
                  <span className="text-primary font-medium">Account created</span>
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                </div>
                <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                  <span className="text-foreground font-medium">Setting up your workspace...</span>
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                </div>
              </div>
            </CardContent>
          </Card>

          <p className="text-muted-foreground">
            Redirecting to your dashboard...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <PayPilotLogo className="w-10 h-10" />
            <span className="text-2xl font-bold text-foreground">
              PayPilot
            </span>
          </Link>
        </div>

        {/* Demo notice */}
        <div className="bg-accent border border-border rounded-lg p-4 mb-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">Demo Mode</p>
            <p className="text-sm text-muted-foreground">
              This is a demo. Your data won&apos;t be saved permanently. Or{' '}
              <Link href="/login" className="underline font-medium text-primary">login with demo credentials</Link>.
            </p>
          </div>
        </div>

        <Card className="border border-border">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              {step === 1 ? 'Create your account' : 'Tell us about your company'}
            </CardTitle>
            <CardDescription className="text-center">
              {step === 1
                ? 'Start your 14-day free trial'
                : 'This helps us personalize your experience'}
            </CardDescription>
            {/* Progress indicator */}
            <div className="flex justify-center gap-2 pt-4">
              <div className={`w-16 h-1 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-secondary'}`} />
              <div className={`w-16 h-1 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-secondary'}`} />
            </div>
          </CardHeader>
          <form onSubmit={handleSignup}>
            <CardContent className="space-y-4">
              {step === 1 ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Smith"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="border-border focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Work Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="border-border focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a strong password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      minLength={6}
                      required
                      className="border-border focus:ring-primary"
                    />
                    <p className="text-xs text-muted-foreground">Must be at least 6 characters</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="companyName"
                        type="text"
                        className="pl-10 border-border focus:ring-primary"
                        placeholder="Acme Inc."
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companySize">Company Size</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {['1-10', '11-50', '51-200', '201-500', '500+'].map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setCompanySize(size)}
                          className={`p-3 border rounded-lg text-sm font-medium transition-all ${
                            companySize === size
                              ? 'border-primary bg-accent text-primary'
                              : 'border-border hover:border-primary/50 text-foreground'
                          }`}
                        >
                          {size} employees
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <div className="flex gap-2 w-full">
                {step === 2 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1 border-border hover:bg-secondary"
                  >
                    Back
                  </Button>
                )}
                <Button
                  type="submit"
                  className={`bg-primary text-primary-foreground hover:bg-primary/90 ${step === 1 ? 'w-full' : 'flex-1'}`}
                  disabled={loading || (step === 2 && !companySize)}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating account...
                    </>
                  ) : step === 1 ? (
                    'Continue'
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </div>
              <p className="text-sm text-center text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="text-primary hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          By signing up, you agree to our{' '}
          <Link href="/terms" className="underline hover:text-foreground">Terms of Service</Link>
          {' '}and{' '}
          <Link href="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>
        </p>
      </div>
    </div>
  )
}

// Wrap in Suspense for useSearchParams
export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <SignupContent />
    </Suspense>
  )
}
