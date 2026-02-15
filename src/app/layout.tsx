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
  title: "PayPilot - Payroll & HR that runs itself",
  description: "Modern HR and payroll platform powered by AI. Automate payroll, manage benefits, track time, and get instant answers to HR questions.",
  keywords: ["HR software", "payroll", "AI HR", "benefits administration", "time tracking", "PTO management"],
  authors: [{ name: "PayPilot" }],
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
