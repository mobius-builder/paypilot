'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Info, Shield, User } from 'lucide-react'
import { toast } from 'sonner'
import { PayPilotLogo } from '@/components/logo'
import { createClient } from '@/lib/supabase/client'

// Real demo credentials (must be seeded in Supabase)
const DEMO_USERS = {
  admin: {
    email: 'demo@acme.com',
    password: 'demo123',
    name: 'Demo Admin',
    role: 'owner',
    description: 'Full access: create & run agents',
  },
  employee: {
    email: 'sarah.chen@acme.com',
    password: 'demo123',
    name: 'Sarah Chen',
    role: 'member',
    description: 'Employee view: messages only',
  },
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('Login error:', error)
        toast.error(error.message || 'Invalid credentials')
        setLoading(false)
        return
      }

      if (data.user) {
        toast.success('Welcome back!')
        // Redirect based on user - employees go to messages, admins go to dashboard
        if (email === DEMO_USERS.employee.email) {
          router.push('/messages')
        } else {
          router.push('/dashboard')
        }
      }
    } catch (err) {
      console.error('Login error:', err)
      toast.error('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  const handleDemoLogin = (type: 'admin' | 'employee') => {
    const creds = DEMO_USERS[type]
    setEmail(creds.email)
    setPassword(creds.password)
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
        <div className="bg-accent border border-border rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3 mb-3">
            <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">Try Demo Mode</p>
              <p className="text-sm text-muted-foreground">
                Click a role to fill credentials, then sign in
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('admin')}
              className="flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-background hover:bg-secondary transition-colors text-sm"
            >
              <Shield className="w-4 h-4 text-primary" />
              <div className="text-left">
                <div className="font-medium">{DEMO_USERS.admin.name}</div>
                <div className="text-xs text-muted-foreground">{DEMO_USERS.admin.description}</div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('employee')}
              className="flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-background hover:bg-secondary transition-colors text-sm"
            >
              <User className="w-4 h-4 text-green-500" />
              <div className="text-left">
                <div className="font-medium">{DEMO_USERS.employee.name}</div>
                <div className="text-xs text-muted-foreground">{DEMO_USERS.employee.description}</div>
              </div>
            </button>
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
                  placeholder="you@company.com"
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
                  placeholder="••••••••"
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
