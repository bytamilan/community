import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ThumbsUp, Eye } from "lucide-react"
import Link from "next/link"

interface PopularPost {
  id: string
  title: string
  view_count: number
  upvotes: number
  profiles: {
    username: string
  }
}

interface PopularPostsProps {
  posts: PopularPost[]
}

export function PopularPosts({ posts }: PopularPostsProps) {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Popular Posts</CardTitle>
        <CardDescription>Most viewed and upvoted content</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {posts.length > 0 ? (
            posts.map((post) => (
              <div key={post.id} className="flex flex-col space-y-2">
                <Link href={`/posts/${post.id}`} className="font-medium hover:underline">
                  {post.title}
                </Link>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{post.view_count} views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="h-4 w-4" />
                    <span>{post.upvotes} upvotes</span>
                  </div>
                  <div>by {post.profiles.username}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-muted-foreground">No popular posts yet</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
