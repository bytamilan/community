'use client'
import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSpace } from './use-space';
import { toast } from 'sonner';

interface UseSpaceShortcutsOptions {
  spaceId: string;
  onOpenSearch?: () => void;
  onOpenCommandPalette?: () => void;
}

export function useSpaceShortcuts({
  spaceId,
  onOpenSearch,
  onOpenCommandPalette,
}: UseSpaceShortcutsOptions) {
  const router = useRouter();
  const { canAccess } = useSpace({ spaceId });

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in input fields
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      event.target instanceof HTMLSelectElement
    ) {
      return;
    }

    // Command/Ctrl + K to open search
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      onOpenSearch?.();
    }

    // Command/Ctrl + P to open command palette
    if ((event.metaKey || event.ctrlKey) && event.key === 'p') {
      event.preventDefault();
      onOpenCommandPalette?.();
    }

    // Command/Ctrl + N to create new post (if user has edit permission)
    if ((event.metaKey || event.ctrlKey) && event.key === 'n') {
      event.preventDefault();
      if (canAccess(spaceId, 'edit')) {
        router.push(`/spaces/${spaceId}/new`);
      } else {
        toast.error('You do not have permission to create posts');
      }
    }

    // Command/Ctrl + , to open settings (if user has manage permission)
    if ((event.metaKey || event.ctrlKey) && event.key === ',') {
      event.preventDefault();
      if (canAccess(spaceId, 'manage')) {
        router.push(`/spaces/${spaceId}/settings`);
      } else {
        toast.error('You do not have permission to manage settings');
      }
    }

    // Command/Ctrl + U to view members
    if ((event.metaKey || event.ctrlKey) && event.key === 'u') {
      event.preventDefault();
      router.push(`/spaces/${spaceId}/members`);
    }

    // Escape key to go back to space home
    if (event.key === 'Escape') {
      router.push(`/spaces/${spaceId}`);
    }
  }, [spaceId, canAccess, router, onOpenSearch, onOpenCommandPalette]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  return {
    shortcuts: {
      search: '⌘K',
      commandPalette: '⌘P',
      newPost: '⌘N',
      settings: '⌘,',
      members: '⌘U',
      back: 'Esc',
    },
  };
}