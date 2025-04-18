'use client'
import React from 'react';
import { useRouter } from 'next/navigation';
import { useWorkspace } from '@/contexts/workspace-context';
import { useSpace } from '@/hooks/use-space';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Settings,
  Users,
  Plus,
  Search,
  FileText,
  Share,
  Trash,
} from 'lucide-react';
import { toast } from 'sonner';

interface SpaceCommandPaletteProps {
  spaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SpaceCommandPalette({
  spaceId,
  open,
  onOpenChange,
}: SpaceCommandPaletteProps) {
  const router = useRouter();
  const { canAccess } = useWorkspace();
  const { space } = useSpace({ spaceId });

  const handleAction = async (action: string) => {
    try {
      switch (action) {
        case 'settings':
          if (canAccess(spaceId, 'manage')) {
            router.push(`/spaces/${spaceId}/settings`);
          } else {
            toast.error('You do not have permission to manage settings');
          }
          break;
        case 'members':
          router.push(`/spaces/${spaceId}/members`);
          break;
        case 'new-post':
          if (canAccess(spaceId, 'edit')) {
            router.push(`/spaces/${spaceId}/new`);
          } else {
            toast.error('You do not have permission to create posts');
          }
          break;
        case 'search':
          router.push(`/spaces/${spaceId}/search`);
          break;
        case 'share':
          // Implement share functionality
          navigator.clipboard.writeText(window.location.href);
          toast.success('Link copied to clipboard');
          break;
        case 'delete':
          if (canAccess(spaceId, 'delete')) {
            // Implement delete confirmation
            router.push('/dashboard');
          } else {
            toast.error('You do not have permission to delete this space');
          }
          break;
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Error performing action:', error);
      toast.error('Failed to perform action');
    }
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        <CommandGroup heading="Quick Actions">
          {canAccess(spaceId, 'edit') && (
            <CommandItem onSelect={() => handleAction('new-post')}>
              <Plus className="mr-2 h-4 w-4" />
              New Post
            </CommandItem>
          )}
          <CommandItem onSelect={() => handleAction('search')}>
            <Search className="mr-2 h-4 w-4" />
            Search Space
          </CommandItem>
          <CommandItem onSelect={() => handleAction('share')}>
            <Share className="mr-2 h-4 w-4" />
            Share Space
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Management">
          {canAccess(spaceId, 'manage') && (
            <CommandItem onSelect={() => handleAction('settings')}>
              <Settings className="mr-2 h-4 w-4" />
              Space Settings
            </CommandItem>
          )}
          <CommandItem onSelect={() => handleAction('members')}>
            <Users className="mr-2 h-4 w-4" />
            View Members
          </CommandItem>
          {canAccess(spaceId, 'delete') && (
            <CommandItem
              onSelect={() => handleAction('delete')}
              className="text-destructive"
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete Space
            </CommandItem>
          )}
        </CommandGroup>

        {space?.description && (
          <>
            <CommandSeparator />
            <CommandGroup heading="About">
              <CommandItem className="h-auto">
                <FileText className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="text-sm text-muted-foreground line-clamp-2">
                  {space.description}
                </span>
              </CommandItem>
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}