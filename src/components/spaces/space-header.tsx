'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSpace } from '@/hooks/use-space';
import { SpaceCommandPalette } from './space-command-palette';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Settings,
  MoreHorizontal,
  Share,
  Users,
  Search,
  Command,
  ChevronLeft,
  Pencil,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpaceHeaderProps {
  spaceId: string;
  showBackButton?: boolean;
}

export function SpaceHeader({ spaceId, showBackButton = true }: SpaceHeaderProps) {
  const router = useRouter();
  const { space, canAccess, updateSettings } = useSpace({ spaceId });
  const [isEditing, setIsEditing] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  if (!space) return null;

  const handleNameChange = async (newName: string) => {
    try {
      await updateSettings({ name: newName });
      setIsEditing(false);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {showBackButton && (
          <Button
            variant="ghost"
            size="icon"
            className="mr-2"
            onClick={() => router.back()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}

        <div className="flex flex-1 items-center justify-between space-x-4">
          <div className="flex items-center space-x-4">
            {isEditing ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const input = e.currentTarget.elements.namedItem('name') as HTMLInputElement;
                  handleNameChange(input.value);
                }}
                className="flex items-center space-x-2"
              >
                <Input
                  name="name"
                  defaultValue={space.name}
                  className="h-8 w-[200px]"
                  autoFocus
                  onBlur={(e) => handleNameChange(e.target.value)}
                />
              </form>
            ) : (
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-semibold">{space.name}</h1>
                {canAccess(spaceId, 'manage') && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setIsEditing(true)}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="hidden md:flex"
              onClick={() => setCommandOpen(true)}
            >
              <Search className="mr-2 h-4 w-4" />
              Search
              <kbd className="ml-2 pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/spaces/${spaceId}/members`)}
            >
              <Users className="h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {canAccess(spaceId, 'manage') && (
                  <DropdownMenuItem
                    onClick={() => router.push(`/spaces/${spaceId}/settings`)}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                  }}
                >
                  <Share className="mr-2 h-4 w-4" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setCommandOpen(true)}
                  className="sm:hidden"
                >
                  <Command className="mr-2 h-4 w-4" />
                  Command Menu
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <SpaceCommandPalette
        spaceId={spaceId}
        open={commandOpen}
        onOpenChange={setCommandOpen}
      />
    </header>
  );
}