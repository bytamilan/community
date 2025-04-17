import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, ThumbsDown, ThumbsUp, Lock } from "lucide-react"
import type { Post } from "@/lib/types"

interface PostCardProps {
  post: Post
  commentCount?: number
}

export function PostCard({ post, commentCount = 0 }: PostCardProps) {
  const author = post.author || { username: "Unknown", avatar_url: null }
  const category = post.category || { name: "Uncategorized", slug: "uncategorized" }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <Link href={`/posts/${post.id}`} className="hover:underline">
              <CardTitle className="text-xl">
                {post.title}
                {category.is_premium && <Lock className="inline-block ml-2 h-4 w-4 text-yellow-500" />}
              </CardTitle>
            </Link>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <Link href={`/categories/${category.slug}`} className="hover:underline">
                {category.name}
              </Link>
              <span>•</span>
              <span>Posted {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
            </div>
          </div>
          {post.credit_cost > 1 && (
            <Badge variant="outline" className="ml-2">
              {post.credit_cost} Credits
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="line-clamp-2">{post.content}</p>
      </CardContent>
      <CardFooter className="pt-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{post.upvotes}</span>
          </div>
          <div className="flex items-center space-x-1">
            <ThumbsDown className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{post.downvotes}</span>
          </div>
          <div className="flex items-center space-x-1">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{commentCount}</span>
          </div>
        </div>
        <div className="flex items-center">
          <Avatar className="h-6 w-6 mr-2">
            <AvatarImage src={author.avatar_url || undefined} alt={author.username} />
            <AvatarFallback>{author.username.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <Link href={`/users/${author.username}`} className="text-sm hover:underline">
            {author.username}
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}
