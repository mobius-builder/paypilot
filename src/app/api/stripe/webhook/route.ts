import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

// Initialize Stripe lazily with trimmed key
function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY?.trim()
  if (!key) return null
  return new Stripe(key, { typescript: true })
}

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim()

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    const stripe = getStripe()

    if (!stripe || !webhookSecret) {
      console.log('Stripe webhook not configured')
      return NextResponse.json({ received: true, mode: 'demo' })
    }

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      )
    }

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        console.log('Checkout completed:', {
          sessionId: session.id,
          customerEmail: session.customer_email,
          subscriptionId: session.subscription,
          metadata: session.metadata
        })

        // TODO: Create company and user in database
        // TODO: Send welcome email
        // TODO: Provision account

        break
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription
        console.log('Subscription created:', {
          subscriptionId: subscription.id,
          customerId: subscription.customer,
          status: subscription.status,
          plan: subscription.metadata?.plan
        })
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        console.log('Subscription updated:', {
          subscriptionId: subscription.id,
          status: subscription.status,
          cancelAtPeriodEnd: subscription.cancel_at_period_end
        })

        // TODO: Update company subscription status in database
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        console.log('Subscription cancelled:', {
          subscriptionId: subscription.id,
          customerId: subscription.customer
        })

        // TODO: Update company status to churned
        // TODO: Send churn email
        break
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        console.log('Invoice paid:', {
          invoiceId: invoice.id,
          amountPaid: invoice.amount_paid,
          customerEmail: invoice.customer_email
        })

        // TODO: Record payment in audit log
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        console.log('Payment failed:', {
          invoiceId: invoice.id,
          customerEmail: invoice.customer_email
        })

        // TODO: Send payment failed email
        // TODO: Update company status to payment_issue
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

// Note: In App Router, body parsing is handled automatically
// No config needed - we use req.text() to get raw body above
