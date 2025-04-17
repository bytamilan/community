"use client"

import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import type { Tag } from "@/lib/types"

interface TagFilterProps {
  tags: Tag[]
  selectedSlug?: string
}

export function TagFilter({ tags, selectedSlug }: TagFilterProps) {
  const router = useRouter()

  function handleTagClick(slug: string) {
    if (selectedSlug === slug) {
      router.push("/")
    } else {
      router.push(`/?tag=${slug}`)
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Badge
          key={tag.id}
          variant={selectedSlug === tag.slug ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => handleTagClick(tag.slug)}
        >
          {tag.name}
        </Badge>
      ))}
    </div>
  )
}
