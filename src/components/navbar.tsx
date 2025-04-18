'use client'
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserNav } from "@/components/user-nav"
import { NotificationBell } from "@/components/notification-bell"
import { LanguageSelector } from "@/components/language-selector"
import { Search, BarChart2 } from "lucide-react"
import { getNotifications, getUnreadNotificationCount } from "@/lib/data"
import {useTranslation} from "@/hooks/use-translations";
import {useState} from "react";


export function Navbar({ searchParams }: { searchParams?: { lang?: string } }) {
  const [session, setSession] = useState()
  // const supabase = await createClient()
  // const {
  //   data: { session },
  // } = await supabase.auth.getSession()
  //
  // // Get notifications if user is logged in
  let notifications = []
  let unreadCount = 0
  //
  // if (session) {
  //   try {
  //     notifications = await getNotifications(session.user.id, 5)
  //     unreadCount = await getUnreadNotificationCount(session.user.id)
  //   } catch (error) {
  //     console.error("Error fetching notifications:", error)
  //     // Continue with empty notifications
  //   }
  // }
  

  // Helper function for server-side translation
  const {t} = useTranslation()

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold">
            Community
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/categories" className="text-sm font-medium hover:underline">
              {t("navigation.categories")}
            </Link>
            <Link href="/tags" className="text-sm font-medium hover:underline">
              {t("navigation.tags")}
            </Link>
            {session && (
              <>
                <Link href="/new-post" className="text-sm font-medium hover:underline">
                  {t("navigation.newPost")}
                </Link>
                <Link href="/dashboard" className="text-sm font-medium hover:underline">
                  {t("navigation.dashboard")}
                </Link>
              </>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/search">
              <Search className="h-5 w-5" />
              <span className="sr-only">{t("common.search")}</span>
            </Link>
          </Button>
          {session && (
            <>
              <NotificationBell initialNotifications={notifications} initialUnreadCount={unreadCount} />
              <Button variant="ghost" size="icon" asChild>
                <Link href="/dashboard">
                  <BarChart2 className="h-5 w-5" />
                  <span className="sr-only">{t("navigation.dashboard")}</span>
                </Link>
              </Button>
            </>
          )}
          <LanguageSelector />
          <ThemeToggle />
          {session ? (
            <UserNav user={session.user} />
          ) : (
            <Button asChild variant="outline">
              <Link href="/auth/login">{t("auth.signIn")}</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
