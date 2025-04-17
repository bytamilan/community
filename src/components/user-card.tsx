import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import type { Profile } from "@/lib/types"

interface UserCardProps {
  user: Profile
}

export function UserCard({ user }: UserCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <Link href={`/users/${user.username}`} className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.avatar_url || undefined} alt={user.username} />
            <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{user.username}</div>
            {user.full_name && <div className="text-sm text-muted-foreground">{user.full_name}</div>}
            <div className="text-xs text-muted-foreground">
              Joined {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  )
}
