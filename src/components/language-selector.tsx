"use client"

import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Globe } from "lucide-react"
import { SUPPORTED_LANGUAGES } from "@/lib/i18n"
import { useRouter, usePathname, useSearchParams } from "next/navigation"

export function LanguageSelector() {
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleLanguageChange = (lang: string) => {
    // Change language in i18next
    i18n.changeLanguage(lang)

    // Update URL query parameter
    const current = new URLSearchParams(Array.from(searchParams.entries()))
    current.set("lang", lang)

    const search = current.toString()
    const query = search ? `?${search}` : ""

    router.replace(`${pathname}${query}`)
  }

  const languageNames: Record<string, string> = {
    en: t("common.english"),
    ta: t("common.tamil"),
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Globe className="h-5 w-5" />
          <span className="sr-only">{t("common.language")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {SUPPORTED_LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang}
            onClick={() => handleLanguageChange(lang)}
            className={i18n.language === lang ? "bg-accent" : ""}
          >
            {languageNames[lang] || lang}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
