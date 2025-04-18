import { getTags } from "@/lib/data"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default async function TagsPage() {
  const tags = await getTags()

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Tags</h1>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Link key={tag.id} href={`/?tag=${tag.slug}`}>
            <Badge variant="outline" className="text-base py-1.5 px-3 hover:bg-accent">
              {tag.name}
            </Badge>
          </Link>
        ))}
      </div>
    </div>
  )
}
