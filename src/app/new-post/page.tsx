import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getCategories, getTags } from "@/lib/data"
import { NewPostForm } from "@/components/new-post-form"

export default async function NewPostPage() {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Redirect if not logged in
  if (!session) {
    redirect("/auth/login")
  }

  const categories = await getCategories()
  const tags = await getTags()

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create a New Post</h1>
      <NewPostForm categories={categories} tags={tags} />
    </div>
  )
}
