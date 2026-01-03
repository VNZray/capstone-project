/**
 * CreateRoleModal Component
 * 
 * Modal dialog for creating new custom business roles.
 * Shopify-inspired compact design with clean visual hierarchy.
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
  permissionScope,
  businessCapabilities,
}: CreateRoleModalProps) {
  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch permissions based on scope (undefined = all permissions for admins)
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
            Create role
          </Typography>
          <ModalClose sx={{ top: 12, right: 12 }} />
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflow: 'auto', px: 3, py: 2.5 }}>
          <Stack spacing={2.5}>
            {/* Role Name */}
            <FormControl>
              <Typography level="body-sm" fontWeight={500} sx={{ mb: 0.5 }}>
                Name
              </Typography>
              <Input
                placeholder="e.g., Store Manager"
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
                placeholder="Brief description of this role's responsibilities"
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

              {permissionsLoading ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <CircularProgress size="sm" />
                </Box>
              ) : (
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
              )}
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
            disabled={!roleName.trim()}
            sx={{ 
              fontWeight: 500,
              px: 2.5,
            }}
          >
            Create role
          </Button>
        </Box>
      </ModalDialog>
    </Modal>
  );
}

export default CreateRoleModal;
