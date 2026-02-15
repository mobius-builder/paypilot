import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

// Initialize Stripe lazily with trimmed key
function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY?.trim()
  if (!key) return null
  return new Stripe(key, { typescript: true })
}

export async function POST(req: NextRequest) {
  try {
    const { customerId } = await req.json()

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      )
    }

    const stripe = getStripe()

    // If no Stripe key, return demo response
    if (!stripe) {
      console.log('Stripe not configured, returning demo portal URL')
      return NextResponse.json({
        url: '/settings?tab=billing&demo=true',
        mode: 'demo'
      })
    }

    // Create Stripe Customer Portal Session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://paypilot-one.vercel.app'}/settings?tab=billing`
    })

    return NextResponse.json({
      url: session.url,
      mode: 'live'
    })

  } catch (error) {
    console.error('Stripe portal error:', error)

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode || 500 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    )
  }
}
