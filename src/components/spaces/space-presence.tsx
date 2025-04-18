import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { useRealtimeSync } from '@/hooks/use-real-time-sync';

interface SpacePresenceProps {
  spaceId: string;
}

interface ActiveUser {
  user_id: string;
  name: string;
  avatar_url?: string;
  last_seen: string;
}

export function SpacePresence({ spaceId }: SpacePresenceProps) {
  const [activeUsers, setActiveUsers] = React.useState<ActiveUser[]>([]);

  useRealtimeSync({
    spaceId,
    onPresenceUpdate: (presence) => {
      const users = presence as ActiveUser[];
      // Filter out users who haven't been seen in the last 2 minutes
      const recentUsers = users.filter(user => {
        const lastSeen = new Date(user.last_seen).getTime();
        const twoMinutesAgo = Date.now() - 2 * 60 * 1000;
        return lastSeen > twoMinutesAgo;
      });
      setActiveUsers(recentUsers);
    },
  });

  if (activeUsers.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 flex -space-x-2">
      {activeUsers.slice(0, 5).map((user) => (
        <Tooltip key={user.user_id}>
          <TooltipTrigger>
            <Avatar className="h-8 w-8 border-2 border-background">
              <AvatarImage src={user.avatar_url} />
              <AvatarFallback>
                {user.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </TooltipTrigger>
          <TooltipContent>
            <p>{user.name}</p>
            <p className="text-xs text-muted-foreground">
              Active {new Date(user.last_seen).toLocaleTimeString()}
            </p>
          </TooltipContent>
        </Tooltip>
      ))}
      {activeUsers.length > 5 && (
        <Tooltip>
          <TooltipTrigger>
            <Avatar className="h-8 w-8 border-2 border-background">
              <AvatarFallback>
                +{activeUsers.length - 5}
              </AvatarFallback>
            </Avatar>
          </TooltipTrigger>
          <TooltipContent>
            <p>{activeUsers.length - 5} more active users</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}