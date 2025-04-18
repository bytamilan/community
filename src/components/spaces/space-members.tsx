import React, { useState } from 'react';
import { useWorkspace } from '@/contexts/workspace-context';
import { useAuth } from '@/contexts/auth-context';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { MoreHorizontal, Shield, UserX } from 'lucide-react';
import { toast } from 'sonner';

interface SpaceMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member' | 'guest';
  avatarUrl?: string;
  joinedAt: string;
}

interface SpaceMembersProps {
  spaceId: string;
  members: SpaceMember[];
  onUpdateMember: (memberId: string, role: SpaceMember['role']) => Promise<void>;
  onRemoveMember: (memberId: string) => Promise<void>;
}

export function SpaceMembers({
  spaceId,
  members,
  onUpdateMember,
  onRemoveMember,
}: SpaceMembersProps) {
  const { canAccess } = useWorkspace();
  const { user } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateRole = async (memberId: string, newRole: SpaceMember['role']) => {
    if (!canAccess(spaceId, 'manage')) {
      toast.error('You do not have permission to manage members');
      return;
    }

    try {
      setIsUpdating(true);
      await onUpdateMember(memberId, newRole);
      toast.success('Member role updated');
    } catch (error) {
      toast.error('Failed to update member role');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!canAccess(spaceId, 'manage')) {
      toast.error('You do not have permission to remove members');
      return;
    }

    try {
      setIsUpdating(true);
      await onRemoveMember(memberId);
      toast.success('Member removed from space');
    } catch (error) {
      toast.error('Failed to remove member');
    } finally {
      setIsUpdating(false);
    }
  };

  const getRoleBadgeColor = (role: SpaceMember['role']) => {
    switch (role) {
      case 'owner':
        return 'bg-primary text-primary-foreground';
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'member':
        return 'bg-blue-100 text-blue-800';
      case 'guest':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={member.avatarUrl} />
                  <AvatarFallback>
                    {member.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm text-muted-foreground">{member.email}</p>
                </div>
              </TableCell>
              <TableCell>
                <Badge className={getRoleBadgeColor(member.role)}>
                  {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>
                {new Date(member.joinedAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {canAccess(spaceId, 'manage') && member.id !== user?.id && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isUpdating}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={() => handleUpdateRole(member.id, 'admin')}
                        disabled={member.role === 'owner'}
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        Make Admin
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleUpdateRole(member.id, 'member')}
                        disabled={member.role === 'owner'}
                      >
                        Make Member
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleRemoveMember(member.id)}
                        disabled={member.role === 'owner'}
                      >
                        <UserX className="mr-2 h-4 w-4" />
                        Remove Member
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}