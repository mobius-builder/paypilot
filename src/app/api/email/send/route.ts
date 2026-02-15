import { NextRequest, NextResponse } from 'next/server'
import { sendEmail, emailTemplates } from '@/lib/email'

// Type for email request
interface EmailRequest {
  template: keyof typeof emailTemplates
  to: string | string[]
  data: Record<string, unknown>
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as EmailRequest
    const { template, to, data } = body

    if (!template || !to) {
      return NextResponse.json(
        { error: 'Template and recipient are required' },
        { status: 400 }
      )
    }

    // Get the template function
    const templateFn = emailTemplates[template]
    if (!templateFn) {
      return NextResponse.json(
        { error: `Unknown template: ${template}` },
        { status: 400 }
      )
    }

    // Generate email content based on template
    let emailContent: { subject: string; html: string; text?: string }

    switch (template) {
      case 'welcome':
        emailContent = emailTemplates.welcome(
          data.name as string || 'there',
          data.companyName as string || 'your company'
        )
        break

      case 'payrollComplete':
        emailContent = emailTemplates.payrollComplete(
          data.employeeName as string || 'there',
          data.payDate as string || 'soon',
          data.netPay as string || '$0.00'
        )
        break

      case 'ptoRequestSubmitted':
        emailContent = emailTemplates.ptoRequestSubmitted(
          data.employeeName as string || 'there',
          data.requestType as string || 'PTO',
          data.dates as string || 'TBD',
          data.managerName as string || 'your manager'
        )
        break

      case 'ptoApproved':
        emailContent = emailTemplates.ptoApproved(
          data.employeeName as string || 'there',
          data.dates as string || 'your requested dates',
          data.approverName as string || 'your manager'
        )
        break

      case 'ptoDenied':
        emailContent = emailTemplates.ptoDenied(
          data.employeeName as string || 'there',
          data.dates as string || 'your requested dates',
          data.reason as string | undefined
        )
        break

      case 'ptoApprovalNeeded':
        emailContent = emailTemplates.ptoApprovalNeeded(
          data.managerName as string || 'Manager',
          data.employeeName as string || 'An employee',
          data.requestType as string || 'PTO',
          data.dates as string || 'TBD',
          data.hours as number || 0
        )
        break

      default:
        return NextResponse.json(
          { error: `Unsupported template: ${template}` },
          { status: 400 }
        )
    }

    // Send the email
    const result = await sendEmail({
      to,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send email' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      messageId: result.id,
      template,
      to
    })

  } catch (error) {
    console.error('[Email API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}
