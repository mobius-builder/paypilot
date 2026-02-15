import { NextResponse } from 'next/server'

export async function GET() {
  const key = process.env.STRIPE_SECRET_KEY || ''
  const starterPrice = process.env.STRIPE_PRICE_STARTER || ''

  return NextResponse.json({
    hasKey: !!key,
    keyLength: key.length,
    keyPrefix: key.substring(0, 12),
    keySuffix: key.substring(key.length - 8),
    starterPrice: starterPrice,
    nodeVersion: process.version
  })
}
