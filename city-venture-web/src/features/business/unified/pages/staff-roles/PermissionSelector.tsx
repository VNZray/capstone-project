/**
 * PermissionSelector Component
 * 
 * A grouped checkbox interface for selecting permissions.
 * Permissions are organized by category for better UX.
 */

import { useMemo } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Checkbox,
  Chip,
  Stack,
  Typography,
} from '@mui/joy';
import { ChevronDown, Shield } from 'lucide-react';
import type { PermissionCategory, Permission } from './types';

interface PermissionSelectorProps {
  categories: PermissionCategory[];
  selectedIds: number[];
  onChange: (selectedIds: number[]) => void;
  disabled?: boolean;
  scope?: 'system' | 'business' | 'all';
}

export function PermissionSelector({
  categories,
  selectedIds,
  onChange,
  disabled = false,
  scope = 'business',
}: PermissionSelectorProps) {
  // Filter categories based on scope
  const filteredCategories = useMemo(() => {
    return categories.map((category) => ({
      ...category,
      permissions: category.permissions.filter(
        (p) => scope === 'all' || p.scope === 'all' || p.scope === scope
      ),
    })).filter((c) => c.permissions.length > 0);
  }, [categories, scope]);

  const handleTogglePermission = (permId: number) => {
    if (disabled) return;
    
    const newSelected = selectedIds.includes(permId)
      ? selectedIds.filter((id) => id !== permId)
      : [...selectedIds, permId];
    
    onChange(newSelected);
  };

  const handleToggleCategory = (category: PermissionCategory) => {
    if (disabled) return;
    
    const categoryPermIds = category.permissions.map((p) => p.id);
    const allSelected = categoryPermIds.every((id) => selectedIds.includes(id));
    
    let newSelected: number[];
    if (allSelected) {
      // Deselect all in category
      newSelected = selectedIds.filter((id) => !categoryPermIds.includes(id));
    } else {
      // Select all in category
      newSelected = [...new Set([...selectedIds, ...categoryPermIds])];
    }
    
    onChange(newSelected);
  };

  const getCategorySelectionState = (category: PermissionCategory) => {
    const categoryPermIds = category.permissions.map((p) => p.id);
    const selectedCount = categoryPermIds.filter((id) => selectedIds.includes(id)).length;
    
    if (selectedCount === 0) return 'none';
    if (selectedCount === categoryPermIds.length) return 'all';
    return 'partial';
  };

  if (filteredCategories.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Shield size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
        <Typography level="body-sm" color="neutral">
          No permissions available
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={1}>
      {filteredCategories.map((category) => {
        const selectionState = getCategorySelectionState(category);
        
        return (
          <Accordion key={category.name} defaultExpanded={false}>
            <AccordionSummary
              indicator={<ChevronDown size={16} />}
              sx={{
                '& .MuiAccordionSummary-button': {
                  px: 2,
                },
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2} sx={{ flex: 1 }}>
                <Checkbox
                  size="sm"
                  checked={selectionState === 'all'}
                  indeterminate={selectionState === 'partial'}
                  disabled={disabled}
                  onChange={() => handleToggleCategory(category)}
                  onClick={(e) => e.stopPropagation()}
                />
                <Typography level="title-sm" sx={{ flex: 1 }}>
                  {category.name}
                </Typography>
                <Chip size="sm" variant="soft" color="neutral">
                  {category.permissions.filter((p) => selectedIds.includes(p.id)).length} / {category.permissions.length}
                </Chip>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={1} sx={{ pl: 4 }}>
                {category.permissions.map((permission) => (
                  <PermissionItem
                    key={permission.id}
                    permission={permission}
                    selected={selectedIds.includes(permission.id)}
                    disabled={disabled}
                    onToggle={() => handleTogglePermission(permission.id)}
                  />
                ))}
              </Stack>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Stack>
  );
}

interface PermissionItemProps {
  permission: Permission;
  selected: boolean;
  disabled?: boolean;
  onToggle: () => void;
}

function PermissionItem({ permission, selected, disabled, onToggle }: PermissionItemProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1,
        p: 1,
        borderRadius: 'sm',
        '&:hover': {
          bgcolor: disabled ? undefined : 'neutral.50',
        },
      }}
    >
      <Checkbox
        size="sm"
        checked={selected}
        disabled={disabled}
        onChange={onToggle}
      />
      <Box sx={{ flex: 1 }}>
        <Typography level="body-sm" fontWeight="md">
          {formatPermissionName(permission.name)}
        </Typography>
        {permission.description && (
          <Typography level="body-xs" color="neutral">
            {permission.description}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

/**
 * Format a snake_case permission name to Title Case
 */
function formatPermissionName(name: string): string {
  return name
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default PermissionSelector;
