import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAuthContext } from '@/lib/api-auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const limitParam = searchParams.get('limit')
    const limit = Math.min(parseInt(limitParam || '15', 10) || 15, 15)

    // Require at least 2 characters to search (prevents directory dump)
    if (query.length < 2) {
      return NextResponse.json({ employees: [] })
    }

    const auth = await getAuthContext()

    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()

    // Query employees in the user's company
    // Using ilike for case-insensitive partial matching
    const { data: employees, error } = await supabase
      .from('company_members')
      .select('user_id, department, job_title, profiles!inner(id, full_name, email)')
      .eq('company_id', auth.companyId)
      .eq('status', 'active')
      .or(`profiles.full_name.ilike.%${query}%,profiles.email.ilike.%${query}%`)
      .limit(limit * 2) // Fetch extra for ranking

    if (error) {
      console.error('[Employee Search] Query error:', {
        companyId: auth.companyId,
        query,
        error: error.message,
        code: error.code,
      })
      return NextResponse.json({ error: 'Search failed' }, { status: 500 })
    }

    // Transform and rank results
    const q = query.toLowerCase()
    const scored = (employees || []).map((emp) => {
      const profile = emp.profiles as unknown as { id: string; full_name: string; email: string }
      const name = profile.full_name?.toLowerCase() || ''
      const email = profile.email?.toLowerCase() || ''

      let score = 0

      // Prefix match on name = highest score
      if (name.startsWith(q)) {
        score = 100
      }
      // First name prefix match
      else if (name.split(' ').some(part => part.startsWith(q))) {
        score = 80
      }
      // Substring match on name
      else if (name.includes(q)) {
        score = 60
      }
      // Email prefix match
      else if (email.startsWith(q)) {
        score = 40
      }
      // Email substring match
      else if (email.includes(q)) {
        score = 20
      }

      return {
        id: profile.id,
        full_name: profile.full_name,
        email: profile.email,
        department: emp.department,
        job_title: emp.job_title,
        score,
      }
    })

    // Sort by relevance score desc, then by name
    const results = scored
      .sort((a, b) => b.score - a.score || a.full_name.localeCompare(b.full_name))
      .slice(0, limit)
      .map(({ score, ...emp }) => emp)

    return NextResponse.json({ employees: results })
  } catch (error) {
    console.error('[Employee Search] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
