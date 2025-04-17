import type React from "react"
import type { Metadata } from "next"
import { Geist } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from "@/components/navbar"
import { Toaster } from "@/components/ui/toaster"
import { I18nProvider } from "@/contexts/i18n-provider"
import { cookies } from "next/headers"
import "./globals.css"
import {DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES} from "@/lib/i18n";
import { NotificationCleanupService } from '@/lib/services/notification-cleanup.service'

const geist = Geist({
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Community Discussion Platform",
  description: "A community discussion platform built with Next.js and Supabase",
}

// Initialize notification cleanup service
if (process.env.NODE_ENV === 'production') {
  const cleanupService = new NotificationCleanupService()
  cleanupService.scheduleCleanup()
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { searchParams?: { lang?: string } }
}) {
  // Get the user's language preference
  let lang = DEFAULT_LANGUAGE

  // Check query params
  if (params.searchParams?.lang && SUPPORTED_LANGUAGES.includes(params.searchParams.lang)) {
    lang = params.searchParams.lang
  } else {
    // Check cookies
    const cookieStore = await cookies()
    const langCookie = cookieStore.get("i18nextLng")?.value

    if (langCookie && SUPPORTED_LANGUAGES.includes(langCookie)) {
      lang = langCookie
    }
  }

  return (
    <html lang={lang} suppressHydrationWarning>
      <body className={geist.className}>
        <I18nProvider lang={lang}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <Navbar />
            <main className="container mx-auto py-8 px-4">{children}</main>
            <Toaster />
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  )
}
