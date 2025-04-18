'use client'
import { useEffect, useCallback, useState } from 'react';
import { useWorkspace } from '@/contexts/workspace-context';
import { useAuth } from '@/contexts/auth-context';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface RealtimeSyncOptions {
  spaceId: string;
  onPresenceUpdate?: (presence: Record<string, any>[]) => void;
  onActivityUpdate?: (activity: any) => void;
}

export function useRealtimeSync({
  spaceId,
  onPresenceUpdate,
  onActivityUpdate,
}: RealtimeSyncOptions) {
  const { user } = useAuth();
  const { canAccess } = useWorkspace();
  const supabase = createClient();
  const [isConnected, setIsConnected] = useState(false);

  // Join the space's real-time channel
  useEffect(() => {
    if (!user || !canAccess(spaceId, 'view')) return;

    const channel = supabase.channel(`space:${spaceId}`, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    // Set up presence tracking
    const presence = {
      user_id: user.id,
      name: user.name,
      avatar_url: user.avatarUrl,
      last_seen: new Date().toISOString(),
    };

    // Handle presence updates
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      onPresenceUpdate?.(Object.values(state));
    });

    // Handle space activity updates
    channel.on('broadcast', { event: 'activity' }, ({ payload }) => {
      onActivityUpdate?.(payload);
    });

    // Subscribe to space changes
    channel.on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'spaces',
      filter: `id=eq.${spaceId}`,
    }, (payload) => {
      console.log('Space updated:', payload);
      // Handle space updates here
    });

    // Connect to the channel
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track(presence);
        setIsConnected(true);
      }
    });

    return () => {
      channel.unsubscribe();
    };
  }, [spaceId, user, canAccess, onPresenceUpdate, onActivityUpdate]);

  // Broadcast activity to other users
  const broadcastActivity = useCallback(async (activityData: any) => {
    if (!isConnected || !user) return;

    try {
      await supabase.channel(`space:${spaceId}`).send({
        type: 'broadcast',
        event: 'activity',
        payload: {
          ...activityData,
          user: {
            id: user.id,
            name: user.name,
            avatarUrl: user.avatarUrl,
          },
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Error broadcasting activity:', error);
      toast.error('Failed to sync activity');
    }
  }, [spaceId, user, isConnected]);

  // Track user presence
  const updatePresence = useCallback(async () => {
    if (!isConnected || !user) return;

    try {
      await supabase.channel(`space:${spaceId}`).track({
        user_id: user.id,
        last_seen: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error updating presence:', error);
    }
  }, [spaceId, user, isConnected]);

  // Keep presence alive
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(updatePresence, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [isConnected, updatePresence]);

  return {
    isConnected,
    broadcastActivity,
  };
}