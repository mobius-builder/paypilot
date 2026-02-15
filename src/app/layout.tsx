import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://paypilot-one.vercel.app"),
  title: "PayPilot - Payroll & HR that runs itself",
  description: "Modern HR and payroll platform powered by AI. Automate payroll, manage benefits, track time, and get instant answers to HR questions.",
  keywords: ["HR software", "payroll", "AI HR", "benefits administration", "time tracking", "PTO management"],
  authors: [{ name: "PayPilot" }],
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.svg",
    apple: "/icon.png",
  },
  openGraph: {
    title: "PayPilot - Payroll & HR that runs itself",
    description: "The modern HR platform with AI at its core. Automate payroll, manage benefits, and let employees get instant answers.",
    url: "https://paypilot-one.vercel.app",
    siteName: "PayPilot",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "PayPilot - Payroll & HR that runs itself",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PayPilot - Payroll & HR that runs itself",
    description: "The modern HR platform with AI at its core. Automate payroll, manage benefits, and let employees get instant answers.",
    creator: "@PayPilotHR",
    images: ["/opengraph-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

// JSON-LD structured data for SEO
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PayPilot",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description: "Modern HR and payroll platform powered by AI. Automate payroll, manage benefits, track time, and get instant answers to HR questions.",
  url: "https://paypilot-one.vercel.app",
  offers: [
    {
      "@type": "Offer",
      name: "Starter",
      price: "49",
      priceCurrency: "USD",
      priceValidUntil: "2027-12-31",
      description: "For small teams up to 10 employees"
    },
    {
      "@type": "Offer",
      name: "Growth",
      price: "149",
      priceCurrency: "USD",
      priceValidUntil: "2027-12-31",
      description: "For growing businesses up to 50 employees"
    },
    {
      "@type": "Offer",
      name: "Enterprise",
      price: "449",
      priceCurrency: "USD",
      priceValidUntil: "2027-12-31",
      description: "For larger organizations with unlimited employees"
    }
  ],
  featureList: [
    "AI-Powered HR Assistant",
    "Automated Payroll Processing",
    "Benefits Administration",
    "Time & PTO Tracking",
    "Employee Directory & Org Chart",
    "Compliance Management",
    "Real-time Analytics"
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: "127",
    bestRating: "5",
    worstRating: "1"
  },
  creator: {
    "@type": "Organization",
    name: "PayPilot",
    url: "https://paypilot-one.vercel.app"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
