// Script to create Stripe products and prices
// Run with: npx ts-node scripts/create-stripe-products.ts

import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

async function createProducts() {
  console.log('Creating Stripe products and prices...\n')

  const plans = [
    { name: 'PayPilot Starter', price: 4900, description: 'Perfect for small teams up to 10 employees' },
    { name: 'PayPilot Growth', price: 14900, description: 'For growing companies up to 50 employees' },
    { name: 'PayPilot Enterprise', price: 44900, description: 'Unlimited employees with premium support' }
  ]

  const results: { plan: string; productId: string; priceId: string }[] = []

  for (const plan of plans) {
    // Create product
    const product = await stripe.products.create({
      name: plan.name,
      description: plan.description,
      metadata: {
        app: 'paypilot'
      }
    })

    console.log(`✓ Created product: ${product.name} (${product.id})`)

    // Create price
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: plan.price,
      currency: 'usd',
      recurring: {
        interval: 'month'
      },
      metadata: {
        app: 'paypilot',
        plan: plan.name.toLowerCase().replace('paypilot ', '')
      }
    })

    console.log(`✓ Created price: $${plan.price / 100}/month (${price.id})\n`)

    results.push({
      plan: plan.name,
      productId: product.id,
      priceId: price.id
    })
  }

  console.log('\n=== PRICE IDs FOR ENV VARIABLES ===\n')
  console.log(`STRIPE_PRICE_STARTER=${results[0].priceId}`)
  console.log(`STRIPE_PRICE_GROWTH=${results[1].priceId}`)
  console.log(`STRIPE_PRICE_ENTERPRISE=${results[2].priceId}`)
  console.log('\nAdd these to your Vercel environment variables!')
}

createProducts().catch(console.error)
