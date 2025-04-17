"use client"

import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { markNotificationRead, markAllNotificationsRead } from "@/lib/actions"
import { MessageSquare, ThumbsUp, Bell, Check } from "lucide-react"
import type { Notification } from "@/lib/types"

interface NotificationsDropdownProps {
  notifications: Notification[]
  onClose: () => void
  onMarkAsRead: (notificationId: string) => void
  onMarkAllAsRead: () => void
}

export function NotificationsDropdown({
  notifications,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
}: NotificationsDropdownProps) {
  const router = useRouter()

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    const formData = new FormData()
    formData.append("notification_id", notification.id)
    await markNotificationRead(formData)

    // Update UI
    onMarkAsRead(notification.id)

    // Navigate to the relevant content
    if (notification.post_id) {
      if (notification.comment_id) {
        router.push(`/posts/${notification.post_id}#comment-${notification.comment_id}`)
      } else {
        router.push(`/posts/${notification.post_id}`)
      }
    }

    onClose()
  }

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsRead()
    onMarkAllAsRead()
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "comment":
      case "reply":
        return <MessageSquare className="h-4 w-4" />
      case "vote":
        return <ThumbsUp className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  return (
    <Card className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto z-50 shadow-lg">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="font-medium">Notifications</h3>
        <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead} className="text-xs">
          <Check className="h-3 w-3 mr-1" />
          Mark all as read
        </Button>
      </div>
      <div className="py-2">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`px-4 py-3 hover:bg-accent cursor-pointer ${!notification.is_read ? "bg-accent/50" : ""}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {notification.sender ? (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={notification.sender.avatar_url || undefined} />
                      <AvatarFallback>{notification.sender.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      {getNotificationIcon(notification.type)}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-medium">{notification.sender ? notification.sender.username : "System"}</span>{" "}
                    {notification.content}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </p>
                </div>
                {!notification.is_read && <div className="w-2 h-2 rounded-full bg-primary mt-2" />}
              </div>
            </div>
          ))
        ) : (
          <div className="px-4 py-6 text-center text-muted-foreground">No notifications</div>
        )}
      </div>
      <div className="p-2 border-t text-center">
        <Button variant="link" size="sm" onClick={() => router.push("/notifications")} className="text-xs">
          View all notifications
        </Button>
      </div>
    </Card>
  )
}
