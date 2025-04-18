import React from 'react';
import { useWorkspace } from '@/contexts/workspace-context';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import {
  FileEdit,
  UserPlus,
  Settings,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'edit' | 'member_join' | 'settings_update' | 'comment' | 'permission_change';
  user: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  timestamp: string;
  details: string;
}

interface SpaceActivityProps {
  spaceId: string;
  activities: ActivityItem[];
}

export function SpaceActivity({ spaceId, activities }: SpaceActivityProps) {
  const { canAccess } = useWorkspace();

  if (!canAccess(spaceId, 'view')) {
    return null;
  }

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'edit':
        return <FileEdit className="h-4 w-4" />;
      case 'member_join':
        return <UserPlus className="h-4 w-4" />;
      case 'settings_update':
        return <Settings className="h-4 w-4" />;
      case 'comment':
        return <MessageSquare className="h-4 w-4" />;
      case 'permission_change':
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'edit':
        return 'text-blue-500';
      case 'member_join':
        return 'text-green-500';
      case 'settings_update':
        return 'text-purple-500';
      case 'comment':
        return 'text-yellow-500';
      case 'permission_change':
        return 'text-red-500';
    }
  };

  return (
    <ScrollArea className="h-[500px]">
      <div className="space-y-4 p-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start space-x-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={activity.user.avatarUrl} />
              <AvatarFallback>
                {activity.user.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">
                  {activity.user.name}
                </p>
                <Badge
                  variant="outline"
                  className={`flex items-center gap-1 ${getActivityColor(activity.type)}`}
                >
                  {getActivityIcon(activity.type)}
                  <span className="text-xs">
                    {activity.type.replace('_', ' ').toUpperCase()}
                  </span>
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {activity.details}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(activity.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}