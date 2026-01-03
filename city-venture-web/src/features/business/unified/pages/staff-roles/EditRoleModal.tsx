/**
 * EditRoleModal Component
 * 
 * Modal dialog for editing business roles.
 * Allows modifying role name, description, and permissions.
 */

import { useState, useEffect } from 'react';
import {
  Modal,
  ModalDialog,
  ModalClose,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Stack,
  Typography,
  CircularProgress,
  Alert,
  Box,
  Chip,
  Divider,
} from '@mui/joy';
import { Info } from 'lucide-react';
import type { Permission } from './types';
import { PermissionSelector } from './PermissionSelector';
import { useRole, usePermissionsGrouped } from './useRoleManagement';
import { canEditRole } from '@/src/services/RoleService';

interface EditRoleModalProps {
  open: boolean;
  roleId: number | null;
  onClose: () => void;
  onSave: (roleId: number, data: {
    roleName?: string;
    roleDescription?: string;
    permissionIds?: number[];
  }) => Promise<void>;
  isLoading?: boolean;
}

export function EditRoleModal({
  open,
  roleId,
  onClose,
  onSave,
  isLoading = false,
}: EditRoleModalProps) {
  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch role data
  const { data: role, isLoading: roleLoading } = useRole(roleId || undefined);
  const { data: permissionCategories, isLoading: permissionsLoading } = usePermissionsGrouped('business');

  // Initialize form when role data loads
  useEffect(() => {
    if (role && open) {
      setRoleName(role.role_name);
      setRoleDescription(role.role_description || '');
      setSelectedPermissions(role.permissions.map((p: Permission) => p.id));
      setError(null);
      setHasChanges(false);
    }
  }, [role, open]);

  // Track changes
  useEffect(() => {
    if (!role) return;
    
    const nameChanged = roleName !== role.role_name;
    const descChanged = roleDescription !== (role.role_description || '');
    const originalPermIds = role.permissions.map((p: Permission) => p.id).sort();
    const currentPermIds = [...selectedPermissions].sort();
    const permsChanged = JSON.stringify(originalPermIds) !== JSON.stringify(currentPermIds);
    
    setHasChanges(nameChanged || descChanged || permsChanged);
  }, [role, roleName, roleDescription, selectedPermissions]);

  const handleSubmit = async () => {
    if (!roleId || !role) return;
    setError(null);

    if (!roleName.trim()) {
      setError('Role name is required');
      return;
    }

    if (roleName.length > 20) {
      setError('Role name must be 20 characters or less');
      return;
    }

    try {
      await onSave(roleId, {
        roleName: roleName.trim(),
        roleDescription: roleDescription.trim(),
        permissionIds: selectedPermissions,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role');
    }
  };

  const isEditable = role ? canEditRole(role) : false;

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog size="lg" sx={{ maxWidth: 600, maxHeight: '90vh', overflow: 'auto' }}>
        <ModalClose />
        <DialogTitle>
          {roleLoading ? 'Loading...' : `Edit Role: ${role?.role_name || ''}`}
        </DialogTitle>

        <DialogContent>
          {roleLoading || permissionsLoading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress />
              <Typography level="body-sm" sx={{ mt: 1 }}>Loading role data...</Typography>
            </Box>
          ) : !role ? (
            <Alert color="danger">Role not found</Alert>
          ) : !isEditable ? (
            <Alert color="warning" startDecorator={<Info size={16} />}>
              This role cannot be edited because it is {role.is_immutable ? 'immutable' : 'a system or preset role'}.
            </Alert>
          ) : (
            <Stack spacing={3}>
              {/* Role Info */}
              {role.based_on_name && (
                <Alert color="neutral" size="sm">
                  This role is based on the "{role.based_on_name}" template
                </Alert>
              )}

              <FormControl required>
                <FormLabel>Role Name</FormLabel>
                <Input
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  slotProps={{ input: { maxLength: 20 } }}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={roleDescription}
                  onChange={(e) => setRoleDescription(e.target.value)}
                  minRows={2}
                />
              </FormControl>

              <Divider />

              {/* Permissions */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography level="title-sm">
                    Permissions
                  </Typography>
                  <Chip size="sm" variant="soft">
                    {selectedPermissions.length} selected
                  </Chip>
                </Box>
                
                <Box 
                  sx={{ 
                    maxHeight: 300, 
                    overflow: 'auto', 
                    border: '1px solid', 
                    borderColor: 'divider', 
                    borderRadius: 'sm' 
                  }}
                >
                  <PermissionSelector
                    categories={permissionCategories || []}
                    selectedIds={selectedPermissions}
                    onChange={setSelectedPermissions}
                    scope="business"
                  />
                </Box>
              </Box>
            </Stack>
          )}

          {error && (
            <Alert color="danger" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>

        <DialogActions>
          <Button variant="plain" color="neutral" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            loading={isLoading}
            disabled={!isEditable || !hasChanges || roleLoading}
          >
            Save Changes
          </Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  );
}

export default EditRoleModal;
