import React from 'react';
import { useRouter } from 'next/navigation';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from './ui/command';
import {
  Plus,
  Search,
  Settings,
  Users,
  Hash,
  Bell,
  Type,
  Code,
  Quote,
  ListOrdered,
  Image,
} from 'lucide-react';
import { Block } from './content/blocks/block-types';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddBlock?: (type: Block['type']) => void;
}

export function CommandPalette({
  open,
  onOpenChange,
  onAddBlock,
}: CommandPaletteProps) {
  const router = useRouter();

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        {onAddBlock && (
          <CommandGroup heading="Add Block">
            <CommandItem onSelect={() => onAddBlock('text')}>
              <Type className="mr-2 h-4 w-4" />
              Text
            </CommandItem>
            <CommandItem onSelect={() => onAddBlock('code')}>
              <Code className="mr-2 h-4 w-4" />
              Code Block
            </CommandItem>
            <CommandItem onSelect={() => onAddBlock('quote')}>
              <Quote className="mr-2 h-4 w-4" />
              Quote
            </CommandItem>
            <CommandItem onSelect={() => onAddBlock('bullet-list')}>
              <ListOrdered className="mr-2 h-4 w-4" />
              List
            </CommandItem>
            <CommandItem onSelect={() => onAddBlock('image')}>
              <Image className="mr-2 h-4 w-4" />
              Image
            </CommandItem>
          </CommandGroup>
        )}

        <CommandSeparator />
        
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => router.push('/dashboard')}>
            <Search className="mr-2 h-4 w-4" />
            Go to Dashboard
          </CommandItem>
          <CommandItem onSelect={() => router.push('/notifications')}>
            <Bell className="mr-2 h-4 w-4" />
            View Notifications
          </CommandItem>
          <CommandItem onSelect={() => router.push('/users')}>
            <Users className="mr-2 h-4 w-4" />
            Browse Members
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Quick Actions">
          <CommandItem onSelect={() => router.push('/new-post')}>
            <Plus className="mr-2 h-4 w-4" />
            Create New Post
          </CommandItem>
          <CommandItem onSelect={() => router.push('/categories')}>
            <Hash className="mr-2 h-4 w-4" />
            Browse Categories
          </CommandItem>
          <CommandItem onSelect={() => router.push('/profile/settings')}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}