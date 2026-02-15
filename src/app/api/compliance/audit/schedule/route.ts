import { NextRequest, NextResponse } from 'next/server'

// In-memory store for scheduled audits
let scheduledAudits: Array<{
  id: string
  vendor: string
  date: string
  type: string
  status: 'scheduled' | 'confirmed' | 'completed'
  createdAt: string
}> = [
  {
    id: 'audit_001',
    vendor: 'Deloitte',
    date: '2026-03-15',
    type: 'Annual Financial Audit',
    status: 'confirmed',
    createdAt: '2026-01-10T10:00:00Z',
  },
]

export function getScheduledAudits() {
  return scheduledAudits
}

// POST /api/compliance/audit/schedule - Schedule a new audit
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { vendor, date, type } = body

  // Default values
  const auditVendor = vendor || 'External Auditor'
  const auditDate = date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const auditType = type || 'Compliance Audit'

  const newAudit = {
    id: `audit_${Date.now()}`,
    vendor: auditVendor,
    date: auditDate,
    type: auditType,
    status: 'scheduled' as const,
    createdAt: new Date().toISOString(),
  }

  scheduledAudits.push(newAudit)

  return NextResponse.json({
    success: true,
    audit: newAudit,
    message: `Audit scheduled with ${auditVendor} for ${auditDate}`,
  })
}

// GET /api/compliance/audit/schedule - List scheduled audits
export async function GET() {
  return NextResponse.json({
    audits: scheduledAudits,
    upcomingCount: scheduledAudits.filter(a => a.status === 'scheduled' || a.status === 'confirmed').length,
  })
}
