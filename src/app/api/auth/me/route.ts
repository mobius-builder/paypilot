import { NextResponse } from 'next/server'
import { getAuthContext } from '@/lib/api-auth'

// GET /api/auth/me - Get current user's auth context
export async function GET() {
  try {
    const authContext = await getAuthContext()

    if (!authContext) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({
      userId: authContext.userId,
      companyId: authContext.companyId,
      role: authContext.role,
      isAdmin: authContext.isAdmin,
      isDemo: authContext.isDemo,
      fullName: authContext.fullName,
      email: authContext.email,
    })
  } catch (error) {
    console.error('Auth me error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
