import { createClient } from '@/lib/supabase/server'
import { DEMO_CONTEXT, SARAH_CONTEXT, getDemoContextByEmail, isAdminRole, DemoRole } from '@/lib/demo-context'
import { cookies } from 'next/headers'

export interface AuthContext {
  userId: string
  companyId: string
  role: string
  isDemo: boolean
  isAdmin: boolean // True for owner, admin, hr_manager
  fullName?: string
  email?: string
}

/**
 * Get authentication context for API routes.
 * Supports both real Supabase auth and demo mode.
 *
 * Returns null if not authenticated.
 */
export async function getAuthContext(): Promise<AuthContext | null> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (!authError && user) {
      // Real authenticated user - look up their company membership
      const { data: membership, error: membershipError } = await supabase
        .from('company_members')
        .select('company_id, role')
        .eq('user_id', user.id)
        .single()

      if (membershipError) {
        console.log('[Auth] Membership lookup failed:', {
          userId: user.id,
          error: membershipError.code,
          message: membershipError.message
        })
      }

      if (membership) {
        return {
          userId: user.id,
          companyId: membership.company_id,
          role: membership.role,
          isDemo: false,
          isAdmin: isAdminRole(membership.role as DemoRole),
          email: user.email,
        }
      }

      // User exists but has no company membership
      // Check if it's a known demo email
      if (user.email) {
        const demoContext = getDemoContextByEmail(user.email)
        if (demoContext) {
          console.log('[Auth] Demo user detected:', user.email)
          return {
            userId: demoContext.userId,
            companyId: demoContext.companyId,
            role: demoContext.role,
            isDemo: true,
            isAdmin: demoContext.isAdmin,
            fullName: demoContext.fullName,
            email: demoContext.email,
          }
        }
      }

      console.log('[Auth] Authenticated user has no company membership:', user.id)
      return null
    }

    // No Supabase auth - check for demo mode cookie
    const cookieStore = await cookies()
    const demoSession = cookieStore.get('paypilot_demo_mode')
    const demoEmail = cookieStore.get('paypilot_demo_email')

    if (demoSession?.value === 'true') {
      // Get demo context for specific user if email cookie is set
      if (demoEmail?.value) {
        const demoContext = getDemoContextByEmail(demoEmail.value)
        if (demoContext) {
          return {
            userId: demoContext.userId,
            companyId: demoContext.companyId,
            role: demoContext.role,
            isDemo: true,
            isAdmin: demoContext.isAdmin,
            fullName: demoContext.fullName,
            email: demoContext.email,
          }
        }
      }

      // Default to admin demo user
      return {
        userId: DEMO_CONTEXT.userId,
        companyId: DEMO_CONTEXT.companyId,
        role: DEMO_CONTEXT.role,
        isDemo: true,
        isAdmin: DEMO_CONTEXT.isAdmin,
        fullName: DEMO_CONTEXT.fullName,
        email: DEMO_CONTEXT.email,
      }
    }

    // Default to demo mode for development if no auth is present
    if (process.env.NODE_ENV === 'development' || process.env.PAYPILOT_DEMO_MODE === 'true') {
      console.log('[Auth] No auth detected, falling back to demo mode')
      return {
        userId: DEMO_CONTEXT.userId,
        companyId: DEMO_CONTEXT.companyId,
        role: DEMO_CONTEXT.role,
        isDemo: true,
        isAdmin: DEMO_CONTEXT.isAdmin,
        fullName: DEMO_CONTEXT.fullName,
        email: DEMO_CONTEXT.email,
      }
    }

    return null
  } catch (error) {
    console.error('[Auth] Error getting auth context:', error)

    // Fallback to demo mode on error in development
    if (process.env.NODE_ENV === 'development') {
      return {
        userId: DEMO_CONTEXT.userId,
        companyId: DEMO_CONTEXT.companyId,
        role: DEMO_CONTEXT.role,
        isDemo: true,
        isAdmin: DEMO_CONTEXT.isAdmin,
        fullName: DEMO_CONTEXT.fullName,
        email: DEMO_CONTEXT.email,
      }
    }

    return null
  }
}

/**
 * Require authentication - returns context or throws
 */
export async function requireAuth(): Promise<AuthContext> {
  const context = await getAuthContext()
  if (!context) {
    throw new Error('Unauthorized')
  }
  return context
}

/**
 * Require admin role (owner, admin, hr_manager)
 */
export async function requireAdmin(): Promise<AuthContext> {
  const context = await requireAuth()
  if (!context.isAdmin) {
    throw new Error('Forbidden: Admin access required')
  }
  return context
}

/**
 * Check if user has required role
 */
export function hasRole(context: AuthContext, requiredRoles: string[]): boolean {
  return requiredRoles.includes(context.role)
}

/**
 * Check if user is admin
 */
export function checkAdmin(context: AuthContext): boolean {
  return context.isAdmin
}
