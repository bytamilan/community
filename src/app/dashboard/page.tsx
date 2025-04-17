import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { PopularPosts } from "@/components/dashboard/popular-posts"
import { CategoryDistribution } from "@/components/dashboard/category-distribution"
import { CreditHistory } from "@/components/dashboard/credit-history"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Redirect if not logged in
  if (!session) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  // Get community stats
  const { data: postCount } = await supabase.from("posts").select("*", { count: "exact", head: true })
  const { data: commentCount } = await supabase.from("comments").select("*", { count: "exact", head: true })
  const { data: userCount } = await supabase.from("profiles").select("*", { count: "exact", head: true })

  // Get recent activity
  const { data: recentActivity } = await supabase
    .from("posts")
    .select("id, title, created_at, profiles!posts_author_id_fkey(username)")
    .order("created_at", { ascending: false })
    .limit(5)

  // Get popular posts
  const { data: popularPosts } = await supabase
    .from("posts")
    .select("id, title, view_count, upvotes, profiles!posts_author_id_fkey(username)")
    .order("view_count", { ascending: false })
    .limit(5)

  // Get category distribution
  const { data: categoryDistribution } = await supabase
    .from("posts")
    .select("categories!posts_category_id_fkey(name, id)")

  // Get user's credit history
  const { data: creditHistory } = await supabase
    .from("credit_transactions")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })
    .limit(10)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Community Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {profile?.username || session.user.email}! Here's what's happening in the community.
        </p>
      </div>

      <DashboardStats
        postCount={postCount?.count || 0}
        commentCount={commentCount?.count || 0}
        userCount={userCount?.count || 0}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ActivityFeed activity={recentActivity || []} />
        <PopularPosts posts={popularPosts || []} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CategoryDistribution data={categoryDistribution || []} />
        <CreditHistory transactions={creditHistory || []} />
      </div>
    </div>
  )
}
