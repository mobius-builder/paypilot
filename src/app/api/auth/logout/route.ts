import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// POST /api/auth/logout - Sign out and clear demo cookies
export async function POST() {
  try {
    // Clear demo cookies
    const cookieStore = await cookies()
    cookieStore.delete('paypilot_demo_mode')
    cookieStore.delete('paypilot_demo_email')

    // Sign out from Supabase if there's a session
    try {
      const supabase = await createClient()
      await supabase.auth.signOut()
    } catch {
      // Ignore Supabase errors - may not have a session
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 })
  }
}
