import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://paypilot-one.vercel.app'

  // Static pages
  const staticPages = [
    '',           // Home
    '/login',
    '/signup',
    '/terms',
    '/privacy',
  ]

  // Dashboard pages (require auth but still indexable for SEO purposes)
  const dashboardPages = [
    '/overview',
    '/employees',
    '/payroll',
    '/time',
    '/benefits',
    '/compliance',
    '/reports',
    '/ai',
    '/agents',
    '/messages',
    '/settings',
    '/org-chart',
  ]

  const allPages = [...staticPages, ...dashboardPages]

  return allPages.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' ? 'daily' : 'weekly',
    priority: path === '' ? 1 : path.startsWith('/login') || path.startsWith('/signup') ? 0.9 : 0.7,
  }))
}
