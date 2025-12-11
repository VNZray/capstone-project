/**
 * CreateRoleModal Component
 * 
 * Modal dialog for creating new business roles.
 * Supports both:
 * - Cloning from preset templates
 * - Creating fully custom roles
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
  Tabs,
  TabList,
  Tab,
  TabPanel,
  Stack,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  Typography,
  CircularProgress,
  Alert,
  Box,
  Chip,
} from '@mui/joy';
import { Shield, Copy, Plus, Check } from 'lucide-react';
import type { Role } from './types';
import { PermissionSelector } from './PermissionSelector';
import { usePresetRoles, usePermissionsGrouped } from './useRoleManagement';

interface CreateRoleModalProps {
  open: boolean;
  onClose: () => void;
  onCreateFromPreset: (presetRoleId: number, customName?: string) => Promise<void>;
  onCreateCustom: (roleName: string, roleDescription: string, permissionIds: number[]) => Promise<void>;
  isLoading?: boolean;
}

type TabValue = 'preset' | 'custom';

export function CreateRoleModal({
  open,
  onClose,
  onCreateFromPreset,
  onCreateCustom,
  isLoading = false,
}: CreateRoleModalProps) {
  const [activeTab, setActiveTab] = useState<TabValue>('preset');
  const [selectedPresetId, setSelectedPresetId] = useState<number | null>(null);
  const [customName, setCustomName] = useState('');
  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch preset roles and permissions
  const { data: presets, isLoading: presetsLoading } = usePresetRoles();
  const { data: permissionCategories, isLoading: permissionsLoading } = usePermissionsGrouped('business');

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setActiveTab('preset');
      setSelectedPresetId(null);
      setCustomName('');
      setRoleName('');
      setRoleDescription('');
      setSelectedPermissions([]);
      setError(null);
    }
  }, [open]);

  const handleSubmit = async () => {
    setError(null);

    try {
      if (activeTab === 'preset') {
        if (!selectedPresetId) {
          setError('Please select a template');
          return;
        }
        await onCreateFromPreset(selectedPresetId, customName || undefined);
      } else {
        if (!roleName.trim()) {
          setError('Role name is required');
          return;
        }
        if (roleName.length > 20) {
          setError('Role name must be 20 characters or less');
          return;
        }
        await onCreateCustom(roleName.trim(), roleDescription.trim(), selectedPermissions);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create role');
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog size="lg" sx={{ maxWidth: 600, maxHeight: '90vh', overflow: 'auto' }}>
        <ModalClose />
        <DialogTitle>Create Staff Role</DialogTitle>
        
        <DialogContent>
          <Tabs
            value={activeTab}
            onChange={(_, value) => setActiveTab(value as TabValue)}
            sx={{ mb: 2 }}
          >
            <TabList>
              <Tab value="preset">
                <Copy size={16} style={{ marginRight: 8 }} />
                From Template
              </Tab>
              <Tab value="custom">
                <Plus size={16} style={{ marginRight: 8 }} />
                Custom Role
              </Tab>
            </TabList>

            <TabPanel value="preset" sx={{ p: 0, pt: 2 }}>
              <PresetSelector
                presets={presets || []}
                selectedId={selectedPresetId}
                onSelect={setSelectedPresetId}
                isLoading={presetsLoading}
              />
              
              {selectedPresetId && (
                <FormControl sx={{ mt: 2 }}>
                  <FormLabel>Custom Name (optional)</FormLabel>
                  <Input
                    placeholder="Leave blank to use template name"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    slotProps={{ input: { maxLength: 20 } }}
                  />
                </FormControl>
              )}
            </TabPanel>

            <TabPanel value="custom" sx={{ p: 0, pt: 2 }}>
              <Stack spacing={2}>
                <FormControl required>
                  <FormLabel>Role Name</FormLabel>
                  <Input
                    placeholder="e.g., Senior Receptionist"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    slotProps={{ input: { maxLength: 20 } }}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    placeholder="Describe what this role does..."
                    value={roleDescription}
                    onChange={(e) => setRoleDescription(e.target.value)}
                    minRows={2}
                  />
                </FormControl>

                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography level="title-sm" component="span">
                      Permissions
                    </Typography>
                    <Chip size="sm" variant="soft">
                      {selectedPermissions.length} selected
                    </Chip>
                  </Box>
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
                        scope="business"
                      />
                    </Box>
                  )}
                </Box>
              </Stack>
            </TabPanel>
          </Tabs>

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
            disabled={activeTab === 'preset' ? !selectedPresetId : !roleName.trim()}
          >
            Create Role
          </Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  );
}

interface PresetSelectorProps {
  presets: Role[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  isLoading: boolean;
}

function PresetSelector({ presets, selectedId, onSelect, isLoading }: PresetSelectorProps) {
  if (isLoading) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <CircularProgress size="sm" />
        <Typography level="body-sm" sx={{ mt: 1 }}>Loading templates...</Typography>
      </Box>
    );
  }

  if (presets.length === 0) {
    return (
      <Alert color="warning">
        No role templates available. Contact your administrator to create preset roles.
      </Alert>
    );
  }

  return (
    <RadioGroup
      value={selectedId?.toString() || ''}
      onChange={(e) => onSelect(parseInt(e.target.value))}
    >
      <Stack spacing={1}>
        {presets.map((preset) => (
          <Card
            key={preset.id}
            variant={selectedId === preset.id ? 'soft' : 'outlined'}
            color={selectedId === preset.id ? 'primary' : 'neutral'}
            sx={{
              cursor: 'pointer',
              '&:hover': { borderColor: 'primary.300' },
            }}
            onClick={() => onSelect(preset.id)}
          >
            <CardContent sx={{ p: 2 }}>
              <Stack direction="row" alignItems="flex-start" spacing={2}>
                <Radio value={preset.id.toString()} />
                <Box sx={{ flex: 1 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography level="title-sm">{preset.role_name}</Typography>
                    <Chip size="sm" variant="soft" color="success">
                      <Shield size={12} style={{ marginRight: 4 }} />
                      {preset.permission_count} permissions
                    </Chip>
                  </Stack>
                  {preset.role_description && (
                    <Typography level="body-xs" color="neutral">
                      {preset.role_description}
                    </Typography>
                  )}
                </Box>
                {selectedId === preset.id && (
                  <Check size={20} color="var(--joy-palette-primary-500)" />
                )}
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </RadioGroup>
  );
}

export default CreateRoleModal;
