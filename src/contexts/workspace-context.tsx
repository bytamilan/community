'use client'
import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './auth-context';
import { toast } from 'sonner';

interface Space {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  permissions: SpacePermission[];
  parentId?: string;
}

interface SpacePermission {
  action: 'view' | 'edit' | 'delete' | 'invite' | 'manage';
  role: 'owner' | 'admin' | 'member' | 'guest';
}

interface WorkspaceContextType {
  spaces: Space[];
  currentSpace: Space | null;
  isLoading: boolean;
  canAccess: (spaceId: string, action: SpacePermission['action']) => boolean;
  createSpace: (space: Omit<Space, 'id' | 'permissions'>) => Promise<void>;
  updateSpace: (spaceId: string, updates: Partial<Space>) => Promise<void>;
  deleteSpace: (spaceId: string) => Promise<void>;
  setCurrentSpace: (spaceId: string | null) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [currentSpace, setCurrentSpace] = useState<Space | null>(null);
  const [isLoading] = useState(true);

  const canAccess = useCallback((spaceId: string, action: SpacePermission['action']) => {
    if (!user) return false;
    
    const space = spaces.find(s => s.id === spaceId);
    if (!space) return false;

    // Owner has all permissions
    if (space.permissions.some(p => p.role === 'owner')) {
      return true;
    }

    // Check specific permission
    const userRole = space.permissions.find(p => p.role)?.role;
    if (!userRole) return false;

    const roleHierarchy = {
      owner: 4,
      admin: 3,
      member: 2,
      guest: 1,
    };

    const requiredRole = {
      view: 'guest',
      edit: 'member',
      delete: 'admin',
      invite: 'member',
      manage: 'admin',
    }[action];

    return roleHierarchy[userRole] >= roleHierarchy[requiredRole as keyof typeof roleHierarchy];
  }, [user, spaces]);

  const createSpace = useCallback(async (spaceData: Omit<Space, 'id' | 'permissions'>) => {
    try {
      // Implementation for creating a space in your backend
      // This is a placeholder for the actual implementation
      const newSpace: Space = {
        id: crypto.randomUUID(),
        ...spaceData,
        permissions: [{ action: 'manage', role: 'owner' }],
      };

      setSpaces(prev => [...prev, newSpace]);
      toast.success('Space created successfully');
    } catch (error) {
      console.error('Error creating space:', error);
      toast.error('Failed to create space');
      throw error;
    }
  }, []);

  const updateSpace = useCallback(async (spaceId: string, updates: Partial<Space>) => {
    try {
      if (!canAccess(spaceId, 'edit')) {
        throw new Error('You do not have permission to edit this space');
      }

      setSpaces(prev =>
        prev.map(space =>
          space.id === spaceId
            ? { ...space, ...updates }
            : space
        )
      );

      toast.success('Space updated successfully');
    } catch (error) {
      console.error('Error updating space:', error);
      toast.error('Failed to update space');
      throw error;
    }
  }, [canAccess]);

  const deleteSpace = useCallback(async (spaceId: string) => {
    try {
      if (!canAccess(spaceId, 'delete')) {
        throw new Error('You do not have permission to delete this space');
      }

      setSpaces(prev => prev.filter(space => space.id !== spaceId));
      if (currentSpace?.id === spaceId) {
        setCurrentSpace(null);
      }

      toast.success('Space deleted successfully');
    } catch (error) {
      console.error('Error deleting space:', error);
      toast.error('Failed to delete space');
      throw error;
    }
  }, [canAccess, currentSpace]);

  const handleSetCurrentSpace = useCallback((spaceId: string | null) => {
    if (!spaceId) {
      setCurrentSpace(null);
      return;
    }

    const space = spaces.find(s => s.id === spaceId);
    if (space && canAccess(spaceId, 'view')) {
      setCurrentSpace(space);
    } else {
      toast.error('Cannot access this space');
    }
  }, [spaces, canAccess]);

  return (
    <WorkspaceContext.Provider
      value={{
        spaces,
        currentSpace,
        isLoading,
        canAccess,
        createSpace,
        updateSpace,
        deleteSpace,
        setCurrentSpace: handleSetCurrentSpace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};