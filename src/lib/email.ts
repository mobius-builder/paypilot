import { Resend } from 'resend'

// Initialize Resend client
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

// Email sender - use verified domain in production
const FROM_EMAIL = process.env.EMAIL_FROM || 'PayPilot <noreply@resend.dev>'

// Types
interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
}

// Send email helper
export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!resend) {
    console.log('[Email] Resend not configured, logging email:', {
      to: options.to,
      subject: options.subject
    })
    return { success: true, id: 'demo-' + Date.now() }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text
    })

    if (error) {
      console.error('[Email] Failed to send:', error)
      return { success: false, error: error.message }
    }

    console.log('[Email] Sent successfully:', data?.id)
    return { success: true, id: data?.id }
  } catch (err) {
    console.error('[Email] Error:', err)
    return { success: false, error: 'Failed to send email' }
  }
}

// ============================================
// EMAIL TEMPLATES
// ============================================

export const emailTemplates = {
  // Welcome email for new signups
  welcome: (name: string, companyName: string) => ({
    subject: `Welcome to PayPilot, ${name}! 🎉`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to PayPilot</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); padding: 40px 40px 30px;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                Welcome to PayPilot! 🚀
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Hi ${name},
              </p>
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Welcome aboard! Your account for <strong>${companyName}</strong> is ready. PayPilot makes HR and payroll effortless with AI-powered assistance.
              </p>

              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                <strong>Here's what you can do:</strong>
              </p>

              <ul style="margin: 0 0 30px; padding-left: 20px; color: #374151; font-size: 16px; line-height: 1.8;">
                <li>Run payroll in minutes, not hours</li>
                <li>Track PTO and time off requests</li>
                <li>Manage employee benefits</li>
                <li>Ask our AI assistant any HR question</li>
              </ul>

              <a href="https://paypilot-one.vercel.app/dashboard" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Go to Dashboard →
              </a>

              <p style="margin: 30px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Need help getting started? Our AI assistant is available 24/7, or reply to this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px 40px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                PayPilot - AI-Native HR & Payroll
              </p>
              <p style="margin: 10px 0 0; color: #9ca3af; font-size: 12px;">
                You received this email because you signed up for PayPilot.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    text: `Welcome to PayPilot, ${name}!

Your account for ${companyName} is ready.

Here's what you can do:
- Run payroll in minutes, not hours
- Track PTO and time off requests
- Manage employee benefits
- Ask our AI assistant any HR question

Go to your dashboard: https://paypilot-one.vercel.app/dashboard

Need help? Reply to this email or use our AI assistant.

- PayPilot Team`
  }),

  // Payroll completion notification
  payrollComplete: (employeeName: string, payDate: string, netPay: string) => ({
    subject: `Your paycheck is on the way! 💰`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 40px 30px;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                Payday is here! 💰
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Hi ${employeeName},
              </p>
              <p style="margin: 0 0 30px; color: #374151; font-size: 16px; line-height: 1.6;">
                Great news! Your payroll has been processed and your payment is on the way.
              </p>

              <!-- Pay Summary Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0fdf4; border-radius: 12px; padding: 24px; margin-bottom: 30px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">Net Pay</p>
                    <p style="margin: 0 0 16px; color: #059669; font-size: 32px; font-weight: 700;">${netPay}</p>
                    <p style="margin: 0; color: #6b7280; font-size: 14px;">
                      Expected deposit: <strong style="color: #374151;">${payDate}</strong>
                    </p>
                  </td>
                </tr>
              </table>

              <a href="https://paypilot-one.vercel.app/payroll" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                View Pay Stub →
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px 40px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                PayPilot - AI-Native HR & Payroll
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    text: `Hi ${employeeName},

Great news! Your payroll has been processed.

Net Pay: ${netPay}
Expected deposit: ${payDate}

View your pay stub: https://paypilot-one.vercel.app/payroll

- PayPilot`
  }),

  // PTO request submitted
  ptoRequestSubmitted: (employeeName: string, requestType: string, dates: string, managerName: string) => ({
    subject: `PTO Request Submitted: ${dates}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 40px 40px 30px;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">
                📅 PTO Request Submitted
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px;">
                Hi ${employeeName},
              </p>
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px;">
                Your ${requestType} request has been submitted and is pending approval.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f3ff; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">Dates Requested</p>
                    <p style="margin: 0 0 16px; color: #7c3aed; font-size: 20px; font-weight: 600;">${dates}</p>
                    <p style="margin: 0; color: #6b7280; font-size: 14px;">
                      Pending approval from: <strong style="color: #374151;">${managerName}</strong>
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                You'll receive an email once your request is reviewed.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 40px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">PayPilot</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    text: `Hi ${employeeName},

Your ${requestType} request has been submitted.

Dates: ${dates}
Pending approval from: ${managerName}

You'll receive an email once your request is reviewed.

- PayPilot`
  }),

  // PTO request approved
  ptoApproved: (employeeName: string, dates: string, approverName: string) => ({
    subject: `✅ PTO Approved: ${dates}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 40px 30px;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">
                ✅ Time Off Approved!
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px;">
                Hi ${employeeName},
              </p>
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px;">
                Great news! Your time off request has been approved.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0fdf4; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">Approved Dates</p>
                    <p style="margin: 0 0 16px; color: #059669; font-size: 20px; font-weight: 600;">${dates}</p>
                    <p style="margin: 0; color: #6b7280; font-size: 14px;">
                      Approved by: <strong style="color: #374151;">${approverName}</strong>
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                Enjoy your time off! 🌴
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 40px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">PayPilot</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    text: `Hi ${employeeName},

Great news! Your time off request has been approved.

Approved Dates: ${dates}
Approved by: ${approverName}

Enjoy your time off! 🌴

- PayPilot`
  }),

  // PTO request denied
  ptoDenied: (employeeName: string, dates: string, reason?: string) => ({
    subject: `PTO Request Update: ${dates}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 40px 30px;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">
                PTO Request Update
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px;">
                Hi ${employeeName},
              </p>
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px;">
                Unfortunately, your time off request for <strong>${dates}</strong> could not be approved at this time.
              </p>

              ${reason ? `
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">Reason</p>
                    <p style="margin: 0; color: #92400e; font-size: 16px;">${reason}</p>
                  </td>
                </tr>
              </table>
              ` : ''}

              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                Please speak with your manager if you have questions or would like to discuss alternative dates.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 40px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">PayPilot</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    text: `Hi ${employeeName},

Unfortunately, your time off request for ${dates} could not be approved at this time.

${reason ? `Reason: ${reason}\n\n` : ''}Please speak with your manager if you have questions.

- PayPilot`
  }),

  // Manager notification for PTO approval needed
  ptoApprovalNeeded: (managerName: string, employeeName: string, requestType: string, dates: string, hours: number) => ({
    subject: `🔔 Action Required: ${employeeName}'s PTO Request`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 40px 30px;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">
                🔔 PTO Request Pending
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px;">
                Hi ${managerName},
              </p>
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px;">
                <strong>${employeeName}</strong> has submitted a ${requestType} request that needs your review.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 4px; color: #6b7280; font-size: 14px;">Dates</p>
                    <p style="margin: 0 0 16px; color: #92400e; font-size: 18px; font-weight: 600;">${dates}</p>
                    <p style="margin: 0; color: #6b7280; font-size: 14px;">Hours: <strong>${hours}</strong></p>
                  </td>
                </tr>
              </table>

              <a href="https://paypilot-one.vercel.app/dashboard" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Review Request →
              </a>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 40px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">PayPilot</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    text: `Hi ${managerName},

${employeeName} has submitted a ${requestType} request that needs your review.

Dates: ${dates}
Hours: ${hours}

Review the request: https://paypilot-one.vercel.app/dashboard

- PayPilot`
  })
}
