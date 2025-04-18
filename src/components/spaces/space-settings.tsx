import React, { useState } from 'react';
import { useWorkspace } from '@/contexts/workspace-context';
import { useAuth } from '@/contexts/auth-context';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Avatar } from '../ui/avatar';
import { toast } from 'sonner';

interface SpaceSettingsProps {
  spaceId: string;
}

export function SpaceSettings({ spaceId }: SpaceSettingsProps) {
  const { spaces, updateSpace, canAccess } = useWorkspace();
  const { user } = useAuth();
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('member');

  const space = spaces.find(s => s.id === spaceId);
  if (!space || !canAccess(spaceId, 'manage')) return null;

  const handleUpdateSpace = async (updates: Partial<typeof space>) => {
    try {
      await updateSpace(spaceId, updates);
      toast.success('Space settings updated');
    } catch (error) {
      toast.error('Failed to update space settings');
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    try {
      // This would be implemented to integrate with your backend
      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteEmail('');
      setIsInviteDialogOpen(false);
    } catch (error) {
      toast.error('Failed to send invitation');
    }
  };

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>
            Configure the basic settings for this space
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Space Name</Label>
            <Input
              id="name"
              value={space.name}
              onChange={(e) => handleUpdateSpace({ name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={space.description}
              onChange={(e) => handleUpdateSpace({ description: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="icon">Icon</Label>
            <Input
              id="icon"
              value={space.icon}
              onChange={(e) => handleUpdateSpace({ icon: e.target.value })}
              placeholder="📁"
            />
          </div>
        </CardContent>
      </Card>

      {/* Members Management */}
      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
          <CardDescription>
            Manage members and their permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium">Space Members</h4>
              <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                <DialogTrigger asChild>
                  <Button>Invite Member</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite New Member</DialogTitle>
                    <DialogDescription>
                      Send an invitation to join this space
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleInviteMember} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="member@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select
                        value={selectedRole}
                        onValueChange={setSelectedRole}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="guest">Guest</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" className="w-full">
                      Send Invitation
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="divide-y">
              {/* Example member list - would be populated from your backend */}
              <div className="py-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar />
                  <div>
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-sm text-muted-foreground">Owner</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Permissions */}
      <Card>
        <CardHeader>
          <CardTitle>Permissions</CardTitle>
          <CardDescription>
            Configure access levels for different roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Permission settings would be implemented based on your requirements */}
            <p className="text-sm text-muted-foreground">
              Permission settings are managed by space owners and administrators.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}