import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getPostById, getCommentsByPostId, canAccessPremiumCategory } from "@/lib/data"
import { formatDistanceToNow } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CommentForm } from "@/components/comment-form"
import { CommentList } from "@/components/comment-list"
import { VoteButtons } from "@/components/vote-buttons"
import { ArrowLeft, Lock } from "lucide-react"
import Link from "next/link"

export default async function PostPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const post = await getPostById(params.id)

  if (!post) {
    notFound()
  }

  const author = post.author || { username: "Unknown", avatar_url: null }
  const category = post.category || { name: "Uncategorized", slug: "uncategorized" }

  // Check if this is a premium category and user has enough credits
  if (category.is_premium && session) {
    const hasAccess = await canAccessPremiumCategory(session.user.id, category.id)

    // If user doesn't have enough credits, redirect to credits page
    if (!hasAccess) {
      redirect(
        `/credits?message=You need at least ${category.credit_requirement} credits to view posts in the ${category.name} category`,
      )
    }
  } else if (category.is_premium && !session) {
    // If not logged in, redirect to login
    redirect("/auth/login?message=You need to be logged in to view premium content")
  }

  const comments = await getCommentsByPostId(params.id)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/public">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to discussions
          </Link>
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              {post.title}
              {category.is_premium && <Lock className="ml-2 h-5 w-5 text-yellow-500" />}
            </h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href={`/categories/${category.slug}`} className="hover:underline">
                {category.name}
              </Link>
              <span>•</span>
              <span>Posted {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
              {post.credit_cost > 1 && (
                <>
                  <span>•</span>
                  <Badge variant="outline">{post.credit_cost} Credits</Badge>
                </>
              )}
            </div>
          </div>

          {session && <VoteButtons postId={post.id} upvotes={post.upvotes} downvotes={post.downvotes} />}
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="prose dark:prose-invert max-w-none">
            {post.content.split("\n").map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>

          <div className="flex items-center mt-6">
            <Avatar className="h-10 w-10 mr-3">
              <AvatarImage src={author.avatar_url || undefined} alt={author.username} />
              <AvatarFallback>{author.username.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <Link href={`/users/${author.username}`} className="font-medium hover:underline">
                {author.username}
              </Link>
              <div className="text-xs text-muted-foreground">{post.view_count} views</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator className="my-8" />

      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Comments ({comments.length})</h2>

        {session && <CommentForm postId={post.id} />}

        {comments.length > 0 ? (
          <CommentList comments={comments} />
        ) : (
          <div className="text-center py-12 text-muted-foreground">No comments yet. Be the first to comment!</div>
        )}
      </div>
    </div>
  )
}
