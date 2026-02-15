import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { DEMO_CONTEXT, SARAH_CONTEXT, getDemoContextByEmail, isAdminRole } from '@/lib/demo-context'

export interface AuthContext {
  userId: string
  companyId: string
  role: string
  isAdmin: boolean // True for owner, admin, hr_manager
  fullName?: string
  email?: string
  isDemo?: boolean
}

// Admin roles that can manage agents
const ADMIN_ROLES = ['owner', 'admin', 'hr_manager']

/**
 * Get demo context from cookies (server-side)
 */
async function getDemoContextFromCookies(): Promise<AuthContext | null> {
  try {
    const cookieStore = await cookies()
    const demoMode = cookieStore.get('paypilot_demo_mode')?.value
    const demoEmail = cookieStore.get('paypilot_demo_email')?.value

    if (demoMode === 'true' && demoEmail) {
      const demoContext = getDemoContextByEmail(decodeURIComponent(demoEmail))
      if (demoContext) {
        return {
          userId: demoContext.userId,
          companyId: demoContext.companyId,
          role: demoContext.role,
          isAdmin: demoContext.isAdmin,
          fullName: demoContext.fullName,
          email: demoContext.email,
          isDemo: true,
        }
      }
    }
    return null
  } catch {
    return null
  }
}

/**
 * Get authentication context for API routes.
 * Checks for demo mode first, then falls back to real Supabase auth.
 *
 * Returns null if not authenticated.
 */
export async function getAuthContext(): Promise<AuthContext | null> {
  try {
    // Check for demo mode first
    const demoContext = await getDemoContextFromCookies()
    if (demoContext) {
      return demoContext
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.log('[Auth] No authenticated user')
      return null
    }

    // Look up company membership
    const { data: membership, error: membershipError } = await supabase
      .from('company_members')
      .select('company_id, role, job_title')
      .eq('user_id', user.id)
      .single()

    if (membershipError) {
      console.log('[Auth] Membership lookup failed:', {
        userId: user.id,
        error: membershipError.code,
        message: membershipError.message
      })
      return null
    }

    if (!membership) {
      console.log('[Auth] User has no company membership:', user.id)
      return null
    }

    // Get profile for full name
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    return {
      userId: user.id,
      companyId: membership.company_id,
      role: membership.role,
      isAdmin: ADMIN_ROLES.includes(membership.role),
      email: user.email,
      fullName: profile?.full_name,
      isDemo: false,
    }
  } catch (error) {
    console.error('[Auth] Error getting auth context:', error)
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
