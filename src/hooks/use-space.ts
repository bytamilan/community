'use client'
import { useState, useCallback } from 'react';
import { useWorkspace } from '@/contexts/workspace-context';
import { toast } from 'sonner';
import {deleteData, fetchData, patchData, postData} from "@/lib/api-utils";

interface SpaceMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member' | 'guest';
  avatarUrl?: string;
  joinedAt: string;
}

interface UseSpaceOptions {
  spaceId: string;
}

export function useSpace({ spaceId }: UseSpaceOptions) {
  const { spaces, updateSpace, canAccess } = useWorkspace();
  const [isLoading, setIsLoading] = useState(false);
  const [members, setMembers] = useState<SpaceMember[]>([]);

  const space = spaces.find(s => s.id === spaceId);

  const fetchMembers = useCallback(async () => {
    if (!space) return;

    setIsLoading(true);
    try {
      // This would be replaced with your actual API call
      const data = await fetchData<SpaceMember[]>(`/api/spaces/${spaceId}/members`);
      setMembers(data);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast.error('Failed to load space members');
    } finally {
      setIsLoading(false);
    }
  }, [spaceId, space]);

  const updateMember = useCallback(async (memberId: string, role: SpaceMember['role']) => {
    if (!canAccess(spaceId, 'manage')) {
      throw new Error('You do not have permission to manage members');
    }

    try {
      // This would be replaced with your actual API call
      await patchData(`/api/spaces/${spaceId}/members/${memberId}`,{ role });

      setMembers(prev =>
        prev.map(member =>
          member.id === memberId
            ? { ...member, role }
            : member
        )
      );
    } catch (error) {
      console.error('Error updating member:', error);
      throw error;
    }
  }, [spaceId, canAccess]);

  const removeMember = useCallback(async (memberId: string) => {
    if (!canAccess(spaceId, 'manage')) {
      throw new Error('You do not have permission to remove members');
    }

    try {
      await deleteData(`/api/spaces/${spaceId}/members/${memberId}`);

      setMembers(prev => prev.filter(member => member.id !== memberId));
    } catch (error) {
      console.error('Error removing member:', error);
      throw error;
    }
  }, [spaceId, canAccess]);

  const inviteMember = useCallback(async (email: string, role: SpaceMember['role']) => {
    if (!canAccess(spaceId, 'invite')) {
      throw new Error('You do not have permission to invite members');
    }

    try {
      // This would be replaced with your actual API call
      await postData(`/api/spaces/${spaceId}/invites`, { email, role });

      toast.success(`Invitation sent to ${email}`);
    } catch (error) {
      console.error('Error inviting member:', error);
      throw error;
    }
  }, [spaceId, canAccess]);

  const updateSettings = useCallback(async (updates: Partial<typeof space>) => {
    if (!canAccess(spaceId, 'manage')) {
      throw new Error('You do not have permission to update settings');
    }

    try {
      await updateSpace(spaceId, updates);
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  }, [spaceId, canAccess, updateSpace]);

  return {
    space,
    members,
    isLoading,
    fetchMembers,
    updateMember,
    removeMember,
    inviteMember,
    updateSettings,
    canAccess,
  };
}