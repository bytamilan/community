import React, { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { CommandDialog, CommandInput, CommandList, CommandGroup, CommandItem } from '../ui/command';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Search, Menu } from 'lucide-react';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { ThemeToggle } from '../theme-toggle';
import { UserNav } from '../user-nav';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [commandOpen, setCommandOpen] = useState(false);
  const { user, permissions } = useAuth();

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen border-r bg-background transition-all duration-300",
          sidebarOpen ? "w-64" : "w-16"
        )}
      >
        <div className="flex h-16 items-center justify-between px-4">
          {sidebarOpen && <span className="text-lg font-semibold">Community</span>}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarOpen ? <ChevronLeft /> : <ChevronRight />}
          </Button>
        </div>
        
        <ScrollArea className="h-[calc(100vh-4rem)]">
          <nav className="space-y-2 p-2">
            {/* Add your navigation items here */}
          </nav>
        </ScrollArea>
      </aside>

      {/* Main content */}
      <div
        className={cn(
          "flex-1 transition-all duration-300",
          sidebarOpen ? "ml-64" : "ml-16"
        )}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              className="hidden md:flex"
              onClick={() => setCommandOpen(true)}
            >
              <Search className="h-4 w-4 mr-2" />
              Quick search...
              <kbd className="ml-2 text-xs">⌘K</kbd>
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            {user && <UserNav />}
          </div>
        </header>

        {/* Main content area */}
        <main className="h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="container py-6">
            {children}
          </div>
        </main>
      </div>

      {/* Command palette */}
      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandGroup heading="Quick Actions">
            {permissions.map((permission) => (
              <CommandItem
                key={permission.name}
                onSelect={() => {
                  // Handle command selection
                  setCommandOpen(false);
                }}
              >
                {permission.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}