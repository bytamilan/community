import React from 'react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Keyboard } from 'lucide-react';

interface ShortcutItem {
  label: string;
  shortcut: string;
  description: string;
}

const SHORTCUT_GROUPS = {
  navigation: [
    { label: 'Open Search', shortcut: '⌘K', description: 'Search within the current space' },
    { label: 'Command Menu', shortcut: '⌘P', description: 'Open command palette for quick actions' },
    { label: 'Go Back', shortcut: 'Esc', description: 'Return to space home' },
  ],
  actions: [
    { label: 'New Post', shortcut: '⌘N', description: 'Create a new post in the current space' },
    { label: 'View Members', shortcut: '⌘U', description: 'View and manage space members' },
    { label: 'Settings', shortcut: '⌘,', description: 'Open space settings' },
  ],
};

export function SpaceShortcutsHelp() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Keyboard className="mr-2 h-4 w-4" />
          Keyboard Shortcuts
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Use these keyboard shortcuts to quickly navigate and perform actions in this space.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Navigation</h4>
            <div className="rounded-lg border">
              {SHORTCUT_GROUPS.navigation.map((item, index) => (
                <div
                  key={item.label}
                  className={cn(
                    'flex items-center justify-between p-3',
                    index !== SHORTCUT_GROUPS.navigation.length - 1 && 'border-b'
                  )}
                >
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                    {item.shortcut}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium">Actions</h4>
            <div className="rounded-lg border">
              {SHORTCUT_GROUPS.actions.map((item, index) => (
                <div
                  key={item.label}
                  className={cn(
                    'flex items-center justify-between p-3',
                    index !== SHORTCUT_GROUPS.actions.length - 1 && 'border-b'
                  )}
                >
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                    {item.shortcut}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            Note: On Windows and Linux, use Ctrl instead of ⌘
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}