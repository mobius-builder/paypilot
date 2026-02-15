import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'PayPilot - Payroll & HR that runs itself'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1e3a5f 0%, #0f1f35 50%, #0a1628 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Logo and Brand */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 24,
            }}
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
            >
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M12 12v4" />
              <path d="M12 8h.01" />
            </svg>
          </div>
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: 'white',
              letterSpacing: '-0.02em',
            }}
          >
            PayPilot
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 36,
            color: '#94A3B8',
            marginBottom: 50,
          }}
        >
          Payroll & HR that runs itself
        </div>

        {/* Feature Pills */}
        <div
          style={{
            display: 'flex',
            gap: 16,
          }}
        >
          {['AI-Powered', 'Automated Payroll', 'Real-time Insights'].map((feature) => (
            <div
              key={feature}
              style={{
                padding: '12px 24px',
                background: 'rgba(59, 130, 246, 0.2)',
                borderRadius: 40,
                color: '#60A5FA',
                fontSize: 20,
                fontWeight: 500,
              }}
            >
              {feature}
            </div>
          ))}
        </div>

        {/* Bottom gradient line */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 6,
            background: 'linear-gradient(90deg, #3B82F6 0%, #8B5CF6 50%, #EC4899 100%)',
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  )
}
