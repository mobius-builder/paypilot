import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

// Initialize Stripe lazily to ensure env vars are available
function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY?.trim()
  if (!key) return null
  return new Stripe(key, {
    typescript: true,
    maxNetworkRetries: 2
  })
}

// Price IDs for each plan - trim to remove any trailing newlines from env vars
function getPriceIds(): Record<string, string> {
  return {
    starter: (process.env.STRIPE_PRICE_STARTER || 'price_starter_monthly').trim(),
    growth: (process.env.STRIPE_PRICE_GROWTH || 'price_growth_monthly').trim(),
    enterprise: (process.env.STRIPE_PRICE_ENTERPRISE || 'price_enterprise_monthly').trim()
  }
}

export async function POST(req: NextRequest) {
  try {
    const { plan, email, companyName } = await req.json()

    // Validate required fields
    if (!plan || !email) {
      return NextResponse.json(
        { error: 'Plan and email are required' },
        { status: 400 }
      )
    }

    // Get price ID for the selected plan
    const priceIds = getPriceIds()
    const priceId = priceIds[plan]
    if (!priceId) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      )
    }

    // Get Stripe instance
    const stripe = getStripe()

    // If no Stripe key, return demo response
    if (!stripe) {
      console.log('Stripe not configured, returning demo checkout URL')
      return NextResponse.json({
        url: `/signup?plan=${plan}&email=${encodeURIComponent(email)}&demo=true`,
        mode: 'demo'
      })
    }

    console.log('Creating checkout session with priceId:', priceId)

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      customer_email: email,
      metadata: {
        company_name: companyName || '',
        plan: plan
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://paypilot-one.vercel.app'}/signup?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://paypilot-one.vercel.app'}/?canceled=true`,
      subscription_data: {
        trial_period_days: 14,
        metadata: {
          company_name: companyName || '',
          plan: plan
        }
      }
    })

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
      mode: 'live'
    })

  } catch (error) {
    console.error('Stripe checkout error:', error)

    // Return user-friendly error with details
    if (error instanceof Stripe.errors.StripeError) {
      console.error('Stripe error details:', {
        type: error.type,
        code: error.code,
        message: error.message
      })
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode || 500 }
      )
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Failed to create checkout session: ${errorMessage}` },
      { status: 500 }
    )
  }
}
