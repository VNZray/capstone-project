/**
 * PermissionSelector Component
 * 
 * A grouped checkbox interface for selecting permissions.
 * Permissions are organized by category for better UX.
 * 
 * Filters permissions based on:
 * - scope: 'system' | 'business' | 'all' (role type)
 * - businessCapabilities: filters by hasStore/hasBooking to show relevant permissions
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

/**
 * Business capabilities for filtering permissions
 */
interface BusinessCapabilities {
  hasStore?: boolean;
  hasBooking?: boolean;
}

/**
 * Permission names that are only relevant to businesses with hasStore capability
 */
const STORE_ONLY_PERMISSIONS = [
  // Order Management (shop orders)
  'view_orders',
  'create_orders',
  'update_orders',
  'cancel_orders',
  'manage_orders',
  'manage_order_payments',
  // Product Management
  'view_products',
  'create_products',
  'update_products',
  'delete_products',
  'manage_inventory',
  'manage_discounts',
  // Shop
  'view_shop',
  'manage_shop',
];

/**
 * Permission names that are only relevant to businesses with hasBooking capability
 */
const BOOKING_ONLY_PERMISSIONS = [
  // Booking Management
  'view_bookings',
  'create_bookings',
  'update_bookings',
  'cancel_bookings',
  'manage_bookings',
  'check_in_guests',
  'check_out_guests',
  // Room Management
  'view_rooms',
  'add_room',
  'edit_room',
  'delete_room',
  'manage_rooms',
  'manage_room_amenities',
];

/**
 * Check if a permission should be shown based on business capabilities
 */
function shouldShowPermission(
  permission: Permission,
  capabilities?: BusinessCapabilities
): boolean {
  // If no capabilities provided (e.g., for admin), show all
  if (!capabilities) return true;

  const permName = permission.name.toLowerCase();
  
  // Check store-only permissions
  if (STORE_ONLY_PERMISSIONS.includes(permName) && !capabilities.hasStore) {
    return false;
  }
  
  // Check booking-only permissions
  if (BOOKING_ONLY_PERMISSIONS.includes(permName) && !capabilities.hasBooking) {
    return false;
  }
  
  return true;
}

interface PermissionSelectorProps {
  categories: PermissionCategory[];
  selectedIds: number[];
  onChange: (selectedIds: number[]) => void;
  disabled?: boolean;
  scope?: 'system' | 'business' | 'all';
  /**
   * Business capabilities to filter permissions.
   * If provided, only shows permissions relevant to the business type.
   * - hasStore: true → shows shop/product/order permissions
   * - hasBooking: true → shows room/booking permissions
   */
  businessCapabilities?: BusinessCapabilities;
}

export function PermissionSelector({
  categories,
  selectedIds,
  onChange,
  disabled = false,
  scope = 'business',
  businessCapabilities,
}: PermissionSelectorProps) {
  // Filter categories based on scope and business capabilities
  const filteredCategories = useMemo(() => {
    return categories.map((category) => ({
      ...category,
      permissions: category.permissions.filter((p) => {
        // First filter by scope
        const scopeMatch = scope === 'all' || p.scope === 'all' || p.scope === scope;
        if (!scopeMatch) return false;
        
        // Then filter by business capabilities
        return shouldShowPermission(p, businessCapabilities);
      }),
    })).filter((c) => c.permissions.length > 0);
  }, [categories, scope, businessCapabilities]);

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
