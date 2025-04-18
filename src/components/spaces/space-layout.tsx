'use client'
import React, { useEffect, useState } from 'react';
import { useSpace } from '@/hooks/use-space';
import { useRealtimeSync } from '@/hooks/use-real-time-sync';
import { useSpaceShortcuts } from '@/hooks/use-space-shortcuts';
import { SpacePresence } from './space-presence';
import { SpaceActivity } from './space-activity';
import { SpaceHeader } from './space-header';
import { SpaceSearch } from './space-search';
import { SpaceCommandPalette } from './space-command-palette';
import { SpaceShortcutsHelp } from './space-shortcuts-help';
import { Button } from '../ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../ui/sheet';
import { ScrollArea } from '../ui/scroll-area';
import { ActivityIcon, Users } from 'lucide-react';
import { toast } from 'sonner';

interface SpaceLayoutProps {
  spaceId: string;
  children: React.ReactNode;
}

export function SpaceLayout({ spaceId, children }: SpaceLayoutProps) {
  const { space, isLoading } = useSpace({ spaceId });
  const [activities, setActivities] = React.useState<any[]>([]);
  const [activeUsers, setActiveUsers] = React.useState<any[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  // Set up real-time sync
  const { isConnected, broadcastActivity } = useRealtimeSync({
    spaceId,
    onPresenceUpdate: (presence) => {
      setActiveUsers(presence);
    },
    onActivityUpdate: (activity) => {
      setActivities(prev => [activity, ...prev].slice(0, 50));
    },
  });

  // Set up keyboard shortcuts
  useSpaceShortcuts({
    spaceId,
    onOpenSearch: () => setIsSearchOpen(true),
    onOpenCommandPalette: () => setIsCommandOpen(true),
  });

  useEffect(() => {
    if (isConnected) {
      toast.success('Connected to space');
    }
  }, [isConnected]);

  if (isLoading || !space) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      <SpaceHeader spaceId={spaceId} />

      {/* Main content area */}
      <div className="flex-1 container py-6">
        <ScrollArea className="h-full">
          {children}
        </ScrollArea>
      </div>

      {/* Floating action buttons */}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2">
        <SpaceShortcutsHelp />
        
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-background shadow-md relative"
            >
              <Users className="h-4 w-4" />
              {activeUsers.length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] text-primary-foreground flex items-center justify-center">
                  {activeUsers.length}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Active Members</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <SpacePresence spaceId={spaceId} />
            </div>
          </SheetContent>
        </Sheet>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-background shadow-md relative"
            >
              <ActivityIcon className="h-4 w-4" />
              {activities.length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] text-primary-foreground flex items-center justify-center">
                  {activities.length}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Recent Activity</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <SpaceActivity spaceId={spaceId} activities={activities} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Command palette and search dialogs */}
      <SpaceCommandPalette
        spaceId={spaceId}
        open={isCommandOpen}
        onOpenChange={setIsCommandOpen}
      />

      <Sheet open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <SheetContent side="right" className="w-[600px] sm:w-[800px]">
          <SheetHeader>
            <SheetTitle>Search Space</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <SpaceSearch spaceId={spaceId} onClose={() => setIsSearchOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}