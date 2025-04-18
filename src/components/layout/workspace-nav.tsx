import React from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronRight,
  Plus,
  Hash,
  Users,
  Bell,
  Settings,
  FolderClosed,
  FolderOpen,
  MoreHorizontal,
  Globe,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu';
import { useWorkspace } from '@/contexts/workspace-context';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';

export function WorkspaceNav() {
  const router = useRouter();
  const { spaces, currentSpace, canAccess, createSpace, deleteSpace } = useWorkspace();
  const { user } = useAuth();
  const [expandedSpaces, setExpandedSpaces] = React.useState<string[]>([]);

  const handleCreateSpace = async () => {
    if (!user) {
      toast.error('Please login to create a space');
      return;
    }

    try {
      await createSpace({
        name: 'New Space',
        description: 'A new collaborative space',
        icon: '📁',
      });
      toast.success('Space created successfully');
    } catch (error) {
      console.error('Error creating space:', error);
    }
  };

  const handleDeleteSpace = async (spaceId: string) => {
    try {
      await deleteSpace(spaceId);
    } catch (error) {
      console.error('Error deleting space:', error);
    }
  };

  const toggleSpace = (spaceId: string) => {
    setExpandedSpaces(prev => 
      prev.includes(spaceId)
        ? prev.filter(id => id !== spaceId)
        : [...prev, spaceId]
    );
  };

  const renderSpaceItem = (space: any) => {
    const isExpanded = expandedSpaces.includes(space.id);
    const hasChildren = spaces.some(s => s.parentId === space.id);
    const childSpaces = spaces.filter(s => s.parentId === space.id);

    return (
      <div key={space.id} className="space-y-1">
        <div className="flex items-center group">
          <Collapsible open={isExpanded} onOpenChange={() => toggleSpace(space.id)}>
            <div className="flex items-center w-full">
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "w-full justify-between hover:bg-accent",
                    currentSpace?.id === space.id && "bg-accent"
                  )}
                >
                  <span className="flex items-center">
                    {hasChildren ? (
                      isExpanded ? <FolderOpen className="h-4 w-4 mr-2" /> : <FolderClosed className="h-4 w-4 mr-2" />
                    ) : (
                      <Hash className="h-4 w-4 mr-2" />
                    )}
                    <span className="truncate">{space.name}</span>
                  </span>
                  {hasChildren && (
                    <ChevronRight
                      className={cn(
                        "h-4 w-4 transition-transform",
                        isExpanded && "rotate-90"
                      )}
                    />
                  )}
                </Button>
              </CollapsibleTrigger>
              
              {canAccess(space.id, 'manage') && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => router.push(`/spaces/${space.id}/settings`)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => router.push(`/spaces/${space.id}/members`)}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Manage Members
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDeleteSpace(space.id)}
                    >
                      Delete Space
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            
            {hasChildren && (
              <CollapsibleContent className="pl-6 mt-1">
                {childSpaces.map(renderSpaceItem)}
              </CollapsibleContent>
            )}
          </Collapsible>
        </div>
      </div>
    );
  };

  const rootSpaces = spaces.filter(space => !space.parentId);

  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            <Button
              variant="secondary"
              className="w-full justify-start"
              onClick={handleCreateSpace}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Space
            </Button>
          </div>
        </div>

        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Quick Access
          </h2>
          <div className="space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => router.push('/dashboard')}
            >
              <Globe className="mr-2 h-4 w-4" />
              Overview
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => router.push('/notifications')}
            >
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </Button>
          </div>
        </div>

        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Spaces
          </h2>
          <div className="space-y-1">
            {rootSpaces.map(renderSpaceItem)}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}