import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getAuthContext } from '@/lib/api-auth'

// Demo agent templates
const DEMO_AGENTS = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'Pulse Check',
    slug: 'pulse_check',
    description: 'Weekly check-in to gauge team morale, workload, and identify concerns early',
    agent_type: 'pulse_check',
    is_system: true,
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    name: 'Onboarding Buddy',
    slug: 'onboarding',
    description: 'Guide new hires through their first 90 days with helpful tips and check-ins',
    agent_type: 'onboarding',
    is_system: true,
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    name: 'Exit Interview',
    slug: 'exit_interview',
    description: 'Gather candid feedback from departing employees to improve retention',
    agent_type: 'exit_interview',
    is_system: true,
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    name: 'Manager Coach',
    slug: 'manager_coaching',
    description: 'Provide coaching tips and feedback collection for people managers',
    agent_type: 'manager_coaching',
    is_system: true,
  },
]

const DEMO_TONE_PRESETS = [
  {
    id: '00000000-0000-0000-0000-000000000201',
    slug: 'poke_lite',
    name: 'Poke-lite',
    description: 'Short, playful, emoji-friendly. Max 240 chars per message.',
    is_system: true,
  },
  {
    id: '00000000-0000-0000-0000-000000000202',
    slug: 'friendly_peer',
    name: 'Friendly Peer',
    description: 'Warm and conversational, like a work friend checking in.',
    is_system: true,
  },
  {
    id: '00000000-0000-0000-0000-000000000203',
    slug: 'professional_hr',
    name: 'Professional HR',
    description: 'Formal and supportive, appropriate for sensitive topics.',
    is_system: true,
  },
  {
    id: '00000000-0000-0000-0000-000000000204',
    slug: 'witty_safe',
    name: 'Witty-but-safe',
    description: 'Light humor that stays workplace appropriate.',
    is_system: true,
  },
]

// GET /api/agents - List agent templates
export async function GET() {
  try {
    const auth = await getAuthContext()

    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()

    // Get system agent templates
    const { data: agents, error } = await supabase
      .from('agents')
      .select('*')
      .eq('is_system', true)
      .order('name')

    if (error) {
      console.error('[Agents] Error fetching:', error)
      return NextResponse.json({ error: 'Failed to fetch agents' }, { status: 500 })
    }

    // Get tone presets
    const { data: tonePresets } = await supabase
      .from('tone_presets')
      .select('*')
      .eq('is_system', true)

    return NextResponse.json({
      agents: agents || [],
      tonePresets: tonePresets || [],
    })
  } catch (error) {
    console.error('[Agents] API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
