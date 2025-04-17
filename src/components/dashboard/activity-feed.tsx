import { formatDistanceToNow } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

interface ActivityItem {
  id: string
  title: string
  created_at: string
  profiles: {
    username: string
  }
}

interface ActivityFeedProps {
  activity: ActivityItem[]
}

export function ActivityFeed({ activity }: ActivityFeedProps) {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>The latest posts in the community</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activity.length > 0 ? (
            activity.map((item) => (
              <div key={item.id} className="flex items-start gap-4">
                <div className="rounded-full bg-primary/10 p-2 text-primary">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                </div>
                <div className="space-y-1">
                  <Link href={`/posts/${item.id}`} className="font-medium hover:underline">
                    {item.title}
                  </Link>
                  <div className="text-sm text-muted-foreground">
                    Posted by {item.profiles.username}{" "}
                    {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-muted-foreground">No recent activity</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
