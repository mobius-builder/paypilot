import { NextResponse, type NextRequest } from 'next/server'

// Demo mode middleware - doesn't require Supabase
// In production, this would use the Supabase middleware

export async function middleware(request: NextRequest) {
  // For demo mode, we just pass through all requests
  // Auth is handled client-side with localStorage

  // In production, uncomment:
  // import { updateSession } from '@/lib/supabase/middleware'
  // return await updateSession(request)

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
