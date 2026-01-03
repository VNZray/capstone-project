/**
 * CreateRoleModal Component
 * 
 * Modal dialog for creating new custom business roles.
 * Business owners and Tourism Officers can create custom roles
 * with specific permissions for their staff.
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
} from '@mui/joy';
import { Shield, Plus } from 'lucide-react';
import { PermissionSelector } from './PermissionSelector';
import { usePermissionsGrouped } from './useRoleManagement';

/**
 * Business capabilities for filtering permissions
 */
interface BusinessCapabilities {
  hasStore?: boolean;
  hasBooking?: boolean;
}

interface CreateRoleModalProps {
  open: boolean;
  onClose: () => void;
  onCreateCustom: (roleName: string, roleDescription: string, permissionIds: number[]) => Promise<void>;
  isLoading?: boolean;
  /**
   * Permission scope to filter which permissions are shown:
   * - 'business': Only business-related permissions (for business owners creating staff roles)
   * - 'system': Only system-level permissions (for admins creating tourism staff roles)
   * - undefined: Show all permissions
   */
  permissionScope?: 'business' | 'system';
  /**
   * Business capabilities to filter permissions.
   * Only shows permissions relevant to the business type.
   */
  businessCapabilities?: BusinessCapabilities;
}

export function CreateRoleModal({
  open,
  onClose,
  onCreateCustom,
  isLoading = false,
  permissionScope = 'business',
  businessCapabilities,
}: CreateRoleModalProps) {
  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch permissions based on scope
  const { data: permissionCategories, isLoading: permissionsLoading } = usePermissionsGrouped(permissionScope);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setRoleName('');
      setRoleDescription('');
      setSelectedPermissions([]);
      setError(null);
    }
  }, [open]);

  const handleSubmit = async () => {
    setError(null);

    try {
      if (!roleName.trim()) {
        setError('Role name is required');
        return;
      }
      if (roleName.length > 20) {
        setError('Role name must be 20 characters or less');
        return;
      }
      await onCreateCustom(roleName.trim(), roleDescription.trim(), selectedPermissions);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create role');
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog size="lg" sx={{ maxWidth: 600, maxHeight: '90vh', overflow: 'auto' }}>
        <ModalClose />
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Plus size={20} />
            <span>Create Staff Role</span>
          </Stack>
        </DialogTitle>
        
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <FormControl required>
              <FormLabel>Role Name</FormLabel>
              <Input
                placeholder="e.g., Senior Receptionist, Kitchen Manager"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                slotProps={{ input: { maxLength: 20 } }}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Description</FormLabel>
              <Textarea
                placeholder="Describe what this role does and their responsibilities..."
                value={roleDescription}
                onChange={(e) => setRoleDescription(e.target.value)}
                minRows={2}
              />
            </FormControl>

            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Shield size={16} />
                <Typography level="title-sm" component="span">
                  Permissions
                </Typography>
                <Chip size="sm" variant="soft" color={selectedPermissions.length > 0 ? 'success' : 'neutral'}>
                  {selectedPermissions.length} selected
                </Chip>
              </Box>
              <Typography level="body-xs" color="neutral" sx={{ mb: 1 }}>
                Select which actions staff with this role can perform.
              </Typography>
              {permissionsLoading ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CircularProgress size="sm" />
                </Box>
              ) : (
                <Box sx={{ maxHeight: 300, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 'sm' }}>
                  <PermissionSelector
                    categories={permissionCategories || []}
                    selectedIds={selectedPermissions}
                    onChange={setSelectedPermissions}
                    scope={permissionScope}
                    businessCapabilities={businessCapabilities}
                  />
                </Box>
              )}
            </Box>
          </Stack>

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
            disabled={!roleName.trim()}
            startDecorator={<Plus size={16} />}
          >
            Create Role
          </Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  );
}

export default CreateRoleModal;
