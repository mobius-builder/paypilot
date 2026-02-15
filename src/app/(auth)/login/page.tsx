'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Info } from 'lucide-react'
import { toast } from 'sonner'
import { PayPilotLogo } from '@/components/logo'

// Demo mode - works without Supabase
const DEMO_CREDENTIALS = {
  email: 'demo@acme.com',
  password: 'demo123'
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800))

    // Demo mode: accept demo credentials or any valid-looking input
    if (
      (email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) ||
      (email.includes('@') && password.length >= 4)
    ) {
      // Store demo session in localStorage
      localStorage.setItem('paypilot_demo_session', JSON.stringify({
        user: {
          id: 'demo-user-001',
          email: email,
          name: 'John Doe',
          role: 'company_admin',
          company: 'Acme Technologies'
        },
        expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
      }))

      toast.success('Welcome back!')
      router.push('/dashboard')
    } else {
      toast.error('Invalid credentials. Try demo@acme.com / demo123')
      setLoading(false)
    }
  }

  const handleDemoLogin = () => {
    setEmail(DEMO_CREDENTIALS.email)
    setPassword(DEMO_CREDENTIALS.password)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
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
              Use <button onClick={handleDemoLogin} className="font-mono underline text-primary">demo@acme.com</button> / <span className="font-mono">demo123</span> or any email with 4+ char password.
            </p>
          </div>
        </div>

        <Card className="border border-border">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="demo@acme.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-border focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="demo123"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-border focus:ring-primary"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full border-border hover:bg-secondary"
                onClick={handleDemoLogin}
              >
                Fill Demo Credentials
              </Button>
              <p className="text-sm text-center text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="text-primary hover:underline font-medium">
                  Sign up
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          By signing in, you agree to our{' '}
          <Link href="/terms" className="underline hover:text-foreground">Terms of Service</Link>
          {' '}and{' '}
          <Link href="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>
        </p>
      </div>
    </div>
  )
}
