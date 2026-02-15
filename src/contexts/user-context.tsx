'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { getDemoContextByEmail, isAdminRole, type DemoContext, DEMO_CONTEXT, SARAH_CONTEXT } from '@/lib/demo-context'

export interface UserSession {
  userId: string
  email: string
  fullName: string
  role: 'owner' | 'admin' | 'hr_manager' | 'manager' | 'employee' | 'member'
  companyId: string
  companyName: string
  isAdmin: boolean
  avatarUrl?: string
  initials: string
  employeeId?: string // For linking to employee record
}

interface UserContextType {
  user: UserSession | null
  isLoading: boolean
  isAdmin: boolean
  logout: () => void
  refreshUser: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

// Get stored demo session from cookie
function getDemoSessionFromCookie(): DemoContext | null {
  if (typeof document === 'undefined') return null

  const cookies = document.cookie.split(';').reduce((acc, c) => {
    const [key, value] = c.trim().split('=')
    acc[key] = value
    return acc
  }, {} as Record<string, string>)

  const demoEmail = cookies['paypilot_demo_email']
  if (demoEmail) {
    return getDemoContextByEmail(decodeURIComponent(demoEmail))
  }

  // Legacy localStorage check
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem('paypilot_demo_session')
    if (stored) {
      try {
        const session = JSON.parse(stored)
        return getDemoContextByEmail(session.user?.email)
      } catch {
        // Ignore parse errors
      }
    }
  }

  return null
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = async () => {
    setIsLoading(true)
    try {
      // First check for demo mode
      const demoContext = getDemoSessionFromCookie()

      if (demoContext) {
        // Create user session from demo context
        const initials = demoContext.fullName
          .split(' ')
          .map(n => n[0])
          .join('')
          .substring(0, 2)
          .toUpperCase()

        setUser({
          userId: demoContext.userId,
          email: demoContext.email,
          fullName: demoContext.fullName,
          role: demoContext.role,
          companyId: demoContext.companyId,
          companyName: demoContext.companyName,
          isAdmin: demoContext.isAdmin,
          initials,
          // Link to employee ID for non-admin users
          employeeId: !demoContext.isAdmin ? 'emp_001' : undefined, // Sarah is emp_001
        })
        setIsLoading(false)
        return
      }

      // Try API call for real auth
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        if (data.user) {
          const initials = (data.user.name || data.user.email || 'U')
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .substring(0, 2)
            .toUpperCase()

          setUser({
            userId: data.user.id,
            email: data.user.email,
            fullName: data.user.name || data.user.email?.split('@')[0] || 'User',
            role: data.membership?.role || 'employee',
            companyId: data.company?.id || '',
            companyName: data.company?.name || '',
            isAdmin: isAdminRole(data.membership?.role || 'employee'),
            initials,
            employeeId: data.employee?.id,
          })
        }
      } else {
        // Default to demo admin if no auth
        const initials = DEMO_CONTEXT.fullName
          .split(' ')
          .map(n => n[0])
          .join('')
          .substring(0, 2)
          .toUpperCase()

        setUser({
          userId: DEMO_CONTEXT.userId,
          email: DEMO_CONTEXT.email,
          fullName: DEMO_CONTEXT.fullName,
          role: DEMO_CONTEXT.role,
          companyId: DEMO_CONTEXT.companyId,
          companyName: DEMO_CONTEXT.companyName,
          isAdmin: DEMO_CONTEXT.isAdmin,
          initials,
        })
      }
    } catch (error) {
      console.error('Error fetching user:', error)
      // Default to demo admin on error
      setUser({
        userId: DEMO_CONTEXT.userId,
        email: DEMO_CONTEXT.email,
        fullName: DEMO_CONTEXT.fullName,
        role: DEMO_CONTEXT.role,
        companyId: DEMO_CONTEXT.companyId,
        companyName: DEMO_CONTEXT.companyName,
        isAdmin: DEMO_CONTEXT.isAdmin,
        initials: 'DA',
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshUser()
  }, [])

  const logout = () => {
    // Clear cookies
    document.cookie = 'paypilot_demo_mode=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    document.cookie = 'paypilot_demo_email=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    localStorage.removeItem('paypilot_demo_session')
    setUser(null)
  }

  return (
    <UserContext.Provider
      value={{
        user,
        isLoading,
        isAdmin: user?.isAdmin ?? false,
        logout,
        refreshUser,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

// Convenience hook for checking admin status
export function useIsAdmin(): boolean {
  const { isAdmin } = useUser()
  return isAdmin
}
