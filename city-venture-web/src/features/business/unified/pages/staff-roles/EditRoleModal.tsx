/**
 * EditRoleModal Component
 * 
 * Modal dialog for editing business roles.
 * Shopify-inspired compact design matching CreateRoleModal.
 */

import { useState, useEffect } from 'react';
import {
  Modal,
  ModalDialog,
  ModalClose,
  Button,
  FormControl,
  Input,
  Textarea,
  Stack,
  Typography,
  CircularProgress,
  Alert,
  Box,
  Divider,
} from '@mui/joy';
import { Info } from 'lucide-react';
import type { Permission } from './types';
import { PermissionSelector } from './PermissionSelector';
import { useRole, usePermissionsGrouped } from './useRoleManagement';
import { canEditRole } from '@/src/services/RoleService';

/**
 * Business capabilities for filtering permissions
 */
interface BusinessCapabilities {
  hasStore?: boolean;
  hasBooking?: boolean;
}

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
  /**
   * Permission scope to filter which permissions are shown:
   * - 'business': Only business-related permissions (for business owners editing staff roles)
   * - 'system': Only system-level permissions (for admins editing tourism staff roles)
   * - undefined: Show all permissions
   */
  permissionScope?: 'business' | 'system';
  /**
   * Business capabilities to filter permissions.
   * Only shows permissions relevant to the business type.
   */
  businessCapabilities?: BusinessCapabilities;
}

export function EditRoleModal({
  open,
  roleId,
  onClose,
  onSave,
  isLoading = false,
  permissionScope,
  businessCapabilities,
}: EditRoleModalProps) {
  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch role data
  const { data: role, isLoading: roleLoading } = useRole(roleId || undefined);
  const { data: permissionCategories, isLoading: permissionsLoading } = usePermissionsGrouped(permissionScope);

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
  const isDataLoading = roleLoading || permissionsLoading;

  // Count total permissions available
  const totalPermissions = permissionCategories?.reduce(
    (acc, cat) => acc + cat.permissions.length, 0
  ) || 0;

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog 
        sx={{ 
          width: 480,
          maxWidth: '95vw',
          maxHeight: '85vh',
          p: 0,
          overflow: 'hidden',
          borderRadius: 'lg',
          boxShadow: 'lg',
        }}
      >
        {/* Header */}
        <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography level="title-lg" sx={{ fontWeight: 600 }}>
            {isDataLoading ? 'Loading...' : 'Edit role'}
          </Typography>
          <ModalClose sx={{ top: 12, right: 12 }} />
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflow: 'auto', px: 3, py: 2.5 }}>
          {isDataLoading ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <CircularProgress size="sm" />
              <Typography level="body-sm" color="neutral" sx={{ mt: 1 }}>
                Loading role data...
              </Typography>
            </Box>
          ) : !role ? (
            <Alert color="danger" size="sm" sx={{ borderRadius: 'md' }}>
              Role not found
            </Alert>
          ) : !isEditable ? (
            <Alert 
              color="warning" 
              size="sm" 
              startDecorator={<Info size={16} />}
              sx={{ borderRadius: 'md' }}
            >
              This role cannot be edited because it is {role.is_immutable ? 'immutable' : 'a system role'}.
            </Alert>
          ) : (
            <Stack spacing={2.5}>
              {/* Based on info */}
              {role.based_on_name && (
                <Alert color="neutral" size="sm" sx={{ borderRadius: 'md' }}>
                  Based on "{role.based_on_name}" template
                </Alert>
              )}

              {/* Role Name */}
              <FormControl>
                <Typography level="body-sm" fontWeight={500} sx={{ mb: 0.5 }}>
                  Name
                </Typography>
                <Input
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  slotProps={{ input: { maxLength: 20 } }}
                  sx={{
                    '--Input-focusedThickness': '1px',
                    '--Input-radius': '8px',
                  }}
                />
              </FormControl>

              {/* Description */}
              <FormControl>
                <Typography level="body-sm" fontWeight={500} sx={{ mb: 0.5 }}>
                  Description <Typography component="span" color="neutral">(optional)</Typography>
                </Typography>
                <Textarea
                  value={roleDescription}
                  onChange={(e) => setRoleDescription(e.target.value)}
                  minRows={2}
                  maxRows={3}
                  sx={{
                    '--Textarea-focusedThickness': '1px',
                    '--Textarea-radius': '8px',
                  }}
                />
              </FormControl>

              <Divider />

              {/* Permissions Section */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Typography level="body-sm" fontWeight={500}>
                    Permissions
                  </Typography>
                  <Typography level="body-xs" color="neutral">
                    {selectedPermissions.length} of {totalPermissions} selected
                  </Typography>
                </Box>
                
                <Box 
                  sx={{ 
                    maxHeight: 280, 
                    overflow: 'auto',
                    border: '1px solid',
                    borderColor: 'neutral.200',
                    borderRadius: 'md',
                    bgcolor: 'background.surface',
                  }}
                >
                  <PermissionSelector
                    categories={permissionCategories || []}
                    selectedIds={selectedPermissions}
                    onChange={setSelectedPermissions}
                    scope={permissionScope}
                    businessCapabilities={businessCapabilities}
                  />
                </Box>
              </Box>

              {error && (
                <Alert 
                  color="danger" 
                  size="sm"
                  sx={{ borderRadius: 'md' }}
                >
                  {error}
                </Alert>
              )}
            </Stack>
          )}
        </Box>

        {/* Footer */}
        <Box 
          sx={{ 
            px: 3, 
            py: 2, 
            borderTop: '1px solid', 
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 1.5,
            bgcolor: 'background.level1',
          }}
        >
          <Button 
            variant="plain" 
            color="neutral" 
            onClick={onClose} 
            disabled={isLoading}
            sx={{ fontWeight: 500 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            loading={isLoading}
            disabled={!isEditable || !hasChanges || isDataLoading}
            sx={{ 
              fontWeight: 500,
              px: 2.5,
            }}
          >
            Save changes
          </Button>
        </Box>
      </ModalDialog>
    </Modal>
  );
}

export default EditRoleModal;
