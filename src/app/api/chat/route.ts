import { NextRequest, NextResponse } from 'next/server'

// HR context and knowledge base for the AI
const HR_SYSTEM_PROMPT = `You are an AI HR Assistant for PayPilot, a modern HR and payroll platform. You help employees with questions about:

- Time Off: PTO balance, requesting time off, leave policies
- Payroll: Pay dates, pay stubs, direct deposit, taxes
- Benefits: Health insurance, dental, vision, 401(k), HSA
- Policies: Remote work, dress code, expense reports, company handbook
- Team: Who's on leave, org chart, manager info

COMPANY CONTEXT (Acme Technologies):
- Company size: 47 employees
- Pay schedule: Biweekly (every other Friday)
- Next payday: February 20, 2026
- PTO policy: 15 days (120 hours) per year + 5 sick days
- Remote work: Hybrid model (Tue-Thu in office, Mon/Fri remote)
- Core hours: 10 AM - 4 PM PT
- 401(k): 4% company match, immediate vesting
- Health insurance: Blue Cross Premium Plan, company pays 75%

EMPLOYEE DATA (for demo user John Doe):
- PTO Balance: 96 hours (12 days) remaining
- Sick Leave: 32 hours (4 days) remaining
- Department: Engineering
- Manager: Sarah Wilson
- Start Date: March 15, 2023

FORMATTING:
- Use **bold** for important numbers, dates, and key terms
- Use bullet points for lists
- Keep responses concise but helpful
- If you don't have specific info, say so and suggest contacting HR

Always be helpful, professional, and friendly.`

// Simulated AI responses when no API key is available
const getSimulatedResponse = (question: string): string => {
  const q = question.toLowerCase()

  if (q.includes('pto') || q.includes('vacation') || q.includes('time off') || q.includes('days off')) {
    return `Based on your records, you have **96 hours (12 days)** of PTO remaining for 2026.

Here's your breakdown:
- Annual PTO allowance: 120 hours (15 days)
- Used this year: 24 hours (3 days)
- Remaining: 96 hours (12 days)

You also have **32 hours (4 days)** of sick leave available.

Would you like to submit a time off request?`
  }

  if (q.includes('payday') || q.includes('pay date') || q.includes('next payroll') || q.includes('when do i get paid')) {
    return `The next payday is **February 20, 2026**.

Acme Technologies runs payroll on a biweekly schedule. Here are the upcoming pay dates:
- Feb 20, 2026 (for Feb 2-15 pay period)
- Mar 6, 2026 (for Feb 16 - Mar 1 pay period)
- Mar 20, 2026 (for Mar 2-15 pay period)

Payments are typically deposited by 9 AM on pay day.`
  }

  if (q.includes('health insurance') || q.includes('medical') || q.includes('health plan')) {
    return `Acme Technologies offers the **Blue Cross Premium Health Plan**.

**Key Details:**
- Company pays 75% of the premium
- Your monthly cost: $150.00
- Deductible: $500 individual / $1,000 family
- Copay: $20 primary care / $40 specialist

**Coverage includes:**
- Preventive care (100% covered)
- Hospital stays
- Prescription drugs
- Mental health services

Would you like me to help you find in-network providers or explain any specific coverage?`
  }

  if (q.includes('401k') || q.includes('retirement') || q.includes('401(k)')) {
    return `Acme Technologies offers a **401(k) retirement plan** through Fidelity.

**Key Details:**
- Company match: 4% of your salary
- Immediate vesting (you own 100% from day 1)
- Contribution limit (2026): $23,000

**To Enroll:**
1. Log into Fidelity NetBenefits
2. Select "Enroll in 401(k)"
3. Choose your contribution percentage
4. Select your investment funds

I recommend contributing at least 4% to maximize the company match!`
  }

  if (q.includes('core hours') || q.includes('working hours') || q.includes('work hours') || q.includes('schedule')) {
    return `Acme Technologies follows a **hybrid work model**.

**Schedule:**
- Office days: Tuesday, Wednesday, Thursday
- Remote days: Monday, Friday
- Core hours: 10 AM - 4 PM PT

You're expected to be available during core hours for meetings and collaboration. Outside of core hours, you have flexibility to manage your own schedule.`
  }

  if (q.includes('who is on leave') || q.includes("who's out") || q.includes('who is out')) {
    return `Here's who's on leave this week (Feb 10-14, 2026):

**Currently Out:**
- Rachel Kim (HR) - On leave until Feb 21

**Upcoming Time Off:**
- Sarah Chen - Feb 24-26 (pending approval)
- Tom Wilson - Mar 3-7 (pending approval)

Would you like to see the full team calendar?`
  }

  if (q.includes('remote') || q.includes('work from home') || q.includes('wfh')) {
    return `**Acme Technologies Remote Work Policy:**

We follow a hybrid model:
- **In-office days:** Tuesday, Wednesday, Thursday
- **Remote days:** Monday, Friday
- **Core hours:** 10 AM - 4 PM PT

**Home Office Benefits:**
- $500 one-time setup stipend
- $50/month ongoing stipend
- VPN access required`
  }

  if (q.includes('expense') || q.includes('reimburse')) {
    return `**Expense Reimbursement Policy:**

**Eligible Expenses:**
- Business travel
- Client meals
- Software/tools (pre-approved)
- Home office equipment (up to $500)

**Process:**
1. Submit expense report in PayPilot
2. Attach receipts for all items over $25
3. Manager approval required
4. Reimbursement processed with next payroll

Need to submit an expense report now?`
  }

  // Default response
  return `I'd be happy to help you with that! I can assist with:

- **Time Off:** PTO balance, requesting time off, leave policies
- **Payroll:** Pay dates, pay stubs, direct deposit
- **Benefits:** Health insurance, dental, vision, 401(k)
- **Policies:** Remote work, dress code, expense reports

Could you provide a bit more detail about what you'd like to know?`
}

export async function POST(req: NextRequest) {
  try {
    const { message, conversationHistory } = await req.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Check for Anthropic API key
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY

    if (anthropicApiKey) {
      // Use real Claude API
      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': anthropicApiKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-3-haiku-20240307',
            max_tokens: 1024,
            system: HR_SYSTEM_PROMPT,
            messages: [
              ...(conversationHistory || []).map((msg: { role: string; content: string }) => ({
                role: msg.role,
                content: msg.content
              })),
              {
                role: 'user',
                content: message
              }
            ]
          })
        })

        if (!response.ok) {
          throw new Error('Anthropic API error')
        }

        const data = await response.json()
        const assistantMessage = data.content[0].text

        return NextResponse.json({
          message: assistantMessage,
          source: 'claude'
        })
      } catch {
        // Fall back to simulated response
        console.error('Claude API error, falling back to simulated response')
      }
    }

    // Use simulated response
    // Add slight delay to simulate API call
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500))

    const response = getSimulatedResponse(message)

    return NextResponse.json({
      message: response,
      source: 'simulated'
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    )
  }
}
