import React, { useState } from 'react';
import { useWorkspace } from '@/contexts/workspace-context';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Checkbox } from '../ui/checkbox';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Button } from '../ui/button';
import { toast } from 'sonner';

interface Permission {
  action: 'view' | 'edit' | 'delete' | 'invite' | 'manage';
  role: 'owner' | 'admin' | 'member' | 'guest';
}

interface SpacePermissionsProps {
  spaceId: string;
  onUpdatePermissions: (permissions: Permission[]) => Promise<void>;
}

const defaultPermissions: Permission[] = [
  { action: 'view', role: 'guest' },
  { action: 'edit', role: 'member' },
  { action: 'delete', role: 'admin' },
  { action: 'invite', role: 'member' },
  { action: 'manage', role: 'admin' },
];

const roles = ['owner', 'admin', 'member', 'guest'] as const;
const actions = ['view', 'edit', 'delete', 'invite', 'manage'] as const;

export function SpacePermissions({
  spaceId,
  onUpdatePermissions,
}: SpacePermissionsProps) {
  const { canAccess } = useWorkspace();
  const [permissions, setPermissions] = useState<Permission[]>(defaultPermissions);
  const [isSaving, setIsSaving] = useState(false);

  const getRolePermissions = (role: Permission['role']) => {
    return actions.reduce((acc, action) => {
      acc[action] = permissions.some(
        p => p.action === action && roles.indexOf(p.role) <= roles.indexOf(role)
      );
      return acc;
    }, {} as Record<Permission['action'], boolean>);
  };

  const handlePermissionChange = (action: Permission['action'], role: Permission['role']) => {
    const newPermissions = [...permissions];
    const existingIndex = permissions.findIndex(p => p.action === action);

    if (existingIndex >= 0) {
      newPermissions[existingIndex] = { action, role };
    } else {
      newPermissions.push({ action, role });
    }

    setPermissions(newPermissions);
  };

  const handleSave = async () => {
    if (!canAccess(spaceId, 'manage')) {
      toast.error('You do not have permission to manage space settings');
      return;
    }

    try {
      setIsSaving(true);
      await onUpdatePermissions(permissions);
      toast.success('Permissions updated successfully');
    } catch (error) {
      console.error('Error updating permissions:', error);
      toast.error('Failed to update permissions');
    } finally {
      setIsSaving(false);
    }
  };

  if (!canAccess(spaceId, 'manage')) {
    return null;
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Action</TableHead>
            <TableHead>Guest</TableHead>
            <TableHead>Member</TableHead>
            <TableHead>Admin</TableHead>
            <TableHead>Owner</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {actions.map((action) => (
            <TableRow key={action}>
              <TableCell className="font-medium capitalize">
                {action.replace('_', ' ')}
              </TableCell>
              {roles.map((role) => {
                const rolePerms = getRolePermissions(role);
                return (
                  <TableCell key={role}>
                    <Checkbox
                      checked={rolePerms[action]}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          handlePermissionChange(action, role);
                        }
                      }}
                      disabled={role === 'owner' || isSaving}
                    />
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}