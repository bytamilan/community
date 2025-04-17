import { createClient } from "@/lib/supabase/server"
import { getPosts, getCategories, getTags } from "@/lib/data"
import { PostCard } from "@/components/post-card"
import { CategoryFilter } from "@/components/category-filter"
import { TagFilter } from "@/components/tag-filter"
import { Button } from "@/components/ui/button"
import { PlusCircle, AlertCircle } from "lucide-react"
import { Pagination } from "@/components/pagination"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { cookies } from "next/headers"
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from "@/lib/i18n"
import Link from "next/link"

const POSTS_PER_PAGE = 10

export default async function Home({
  searchParams,
}: {
  searchParams: { category?: string; tag?: string; page?: string; lang?: string }
}) {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const categorySlug = searchParams.category
  const tagSlug = searchParams.tag
  const page = Number(searchParams.page) || 1
  const offset = (page - 1) * POSTS_PER_PAGE

  // Get language from query params or cookies
  let lang = DEFAULT_LANGUAGE

  if (searchParams?.lang && SUPPORTED_LANGUAGES.includes(searchParams.lang)) {
    lang = searchParams.lang
  } else {
    const cookieStore = cookies()
    const langCookie = cookieStore.get("i18nextLng")?.value

    if (langCookie && SUPPORTED_LANGUAGES.includes(langCookie)) {
      lang = langCookie
    }
  }

  // Helper function for server-side translation
  const t = async (key: string, params?: Record<string, any>) => {
    return ()=>{}
  }

  // Fetch data with error handling
  let posts: any[] = []
  let count = 0
  let categories: any[] = []
  let tags: any[] = []
  let error = false

  try {
    const postsData = await getPosts(POSTS_PER_PAGE, offset, categorySlug, tagSlug)
    posts = postsData.posts
    count = postsData.count
  } catch (e) {
    console.error("Error fetching posts:", e)
    error = true
  }

  try {
    categories = await getCategories()
  } catch (e) {
    console.error("Error fetching categories:", e)
    categories = []
  }

  try {
    tags = await getTags()
  } catch (e) {
    console.error("Error fetching tags:", e)
    tags = []
  }

  const totalPages = Math.ceil(count / POSTS_PER_PAGE)

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="md:col-span-1">
        <div className="sticky top-20 space-y-6">
          <div>
            {session && (
              <Button className="w-full" asChild>
                <Link href="/new-post">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  {await t("posts.createPost")}
                </Link>
              </Button>
            )}
          </div>
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">{await t("navigation.categories")}</h2>
            <CategoryFilter categories={categories} selectedSlug={categorySlug} />
          </div>
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">{await t("posts.tags")}</h2>
            <TagFilter tags={tags.slice(0, 10)} selectedSlug={tagSlug} />
            <Button variant="link" size="sm" asChild className="px-0">
              <Link href="/tags">{await t("common.view")}</Link>
            </Button>
          </div>
        </div>
      </div>
      <div className="md:col-span-3">
        <h1 className="text-3xl font-bold mb-6">
          {categorySlug
            ? await t("posts.postedIn", {
                category: categories.find((c) => c.slug === categorySlug)?.name || categorySlug,
              })
            : tagSlug
              ? await t("posts.tags", { tag: tags.find((t) => t.slug === tagSlug)?.name || tagSlug })
              : await t("posts.recentDiscussions")}
        </h1>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{await t("common.error")}</AlertTitle>
            <AlertDescription>{await t("posts.errorLoadingPosts")}</AlertDescription>
          </Alert>
        )}

        {!error && posts.length > 0 ? (
          <>
            <div className="space-y-4 mb-6">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} commentCount={post.commentCount} />
              ))}
            </div>
            {totalPages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                baseUrl={`/?${categorySlug ? `category=${categorySlug}&` : ""}${tagSlug ? `tag=${tagSlug}&` : ""}`}
              />
            )}
          </>
        ) : !error ? (
          <div className="text-center py-12 border rounded-lg">
            <h3 className="text-lg font-medium">{await t("posts.noPosts")}</h3>
            <p className="text-muted-foreground mt-1">
              {session ? await t("posts.beFirstToPost") : await t("posts.signInToPost")}
            </p>
            {session && (
              <Button className="mt-4" asChild>
                <Link href="/new-post">{await t("posts.createPost")}</Link>
              </Button>
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}
