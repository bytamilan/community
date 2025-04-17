"use client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useTranslation } from "react-i18next"
import type { Category } from "@/lib/types"

interface CategoryFilterProps {
  categories: Category[]
  selectedSlug?: string
}

export function CategoryFilter({ categories, selectedSlug }: CategoryFilterProps) {
  const router = useRouter()
  const { t } = useTranslation()

  return (
    <div className="space-y-2">
      <Button
        variant={!selectedSlug ? "default" : "ghost"}
        className="w-full justify-start"
        onClick={() => router.push("/")}
      >
        {t("categories.allCategories")}
      </Button>
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedSlug === category.slug ? "default" : "ghost"}
          className="w-full justify-start"
          onClick={() => router.push(`/?category=${category.slug}`)}
        >
          {category.name}
          {category.is_premium && (
            <span className="ml-2 text-xs bg-yellow-500/10 text-yellow-500 px-1.5 py-0.5 rounded-full">
              {t("categories.premium")}
            </span>
          )}
        </Button>
      ))}
    </div>
  )
}
