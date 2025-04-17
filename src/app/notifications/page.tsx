import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getNotifications } from "@/lib/data"
import { formatDistanceToNow } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { markAllNotificationsRead } from "@/lib/actions"
import { Check, MessageSquare, ThumbsUp, Bell } from "lucide-react"
import Link from "next/link"

export default async function NotificationsPage() {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Redirect if not logged in
  if (!session) {
    redirect("/auth/login")
  }

  const notifications = await getNotifications(session.user.id, 50)

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "comment":
      case "reply":
        return <MessageSquare className="h-5 w-5 text-blue-500" />
      case "vote":
        return <ThumbsUp className="h-5 w-5 text-green-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  const getNotificationLink = (notification: any) => {
    if (notification.post_id) {
      if (notification.comment_id) {
        return `/posts/${notification.post_id}#comment-${notification.comment_id}`
      }
      return `/posts/${notification.post_id}`
    }
    return "#"
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Notifications</h1>
        <form action={markAllNotificationsRead}>
          <Button type="submit" variant="outline" size="sm">
            <Check className="h-4 w-4 mr-2" />
            Mark all as read
          </Button>
        </form>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length > 0 ? (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <Link
                  key={notification.id}
                  href={getNotificationLink(notification)}
                  className={`block p-4 rounded-lg border ${
                    !notification.is_read ? "bg-accent/50 border-accent" : "hover:bg-accent/20"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      {notification.sender ? (
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={notification.sender.avatar_url || undefined} />
                          <AvatarFallback>{notification.sender.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          {getNotificationIcon(notification.type)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p>
                        <span className="font-medium">
                          {notification.sender ? notification.sender.username : "System"}
                        </span>{" "}
                        {notification.content}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    {!notification.is_read && <div className="w-3 h-3 rounded-full bg-primary mt-2 flex-shrink-0" />}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No notifications yet</p>
              <p className="text-sm mt-1">
                You'll receive notifications when someone comments on your posts or replies to your comments.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
