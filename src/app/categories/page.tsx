import { getCategories } from "@/lib/data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Categories</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((category) => (
          <Link key={category.id} href={`/public?category=${category.slug}`}>
            <Card className="h-full hover:bg-accent/50 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle>{category.name}</CardTitle>
                  {category.is_premium && (
                    <Badge variant="secondary" className="ml-2">
                      Premium
                    </Badge>
                  )}
                </div>
                {category.credit_requirement > 0 && (
                  <CardDescription>{category.credit_requirement} credits required</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <p>{category.description || "No description available."}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
