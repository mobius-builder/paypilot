import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'PayPilot - Payroll & HR that runs itself',
    short_name: 'PayPilot',
    description: 'Modern HR and payroll platform powered by AI. Automate payroll, manage benefits, track time, and get instant answers to HR questions.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#3b82f6',
    orientation: 'portrait-primary',
    categories: ['business', 'productivity', 'finance'],
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'Dashboard',
        short_name: 'Dashboard',
        description: 'View your HR dashboard',
        url: '/overview',
        icons: [{ src: '/icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'AI Assistant',
        short_name: 'AI Help',
        description: 'Ask the AI HR assistant',
        url: '/ai',
        icons: [{ src: '/icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'Time Off',
        short_name: 'PTO',
        description: 'Request time off',
        url: '/time',
        icons: [{ src: '/icon-192.png', sizes: '192x192' }],
      },
    ],
    related_applications: [],
    prefer_related_applications: false,
  }
}
