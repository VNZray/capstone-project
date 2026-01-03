/**
 * PermissionSelector Component
 * 
 * A compact, Shopify-inspired interface for selecting permissions.
 * Uses collapsible sections with switches for a cleaner UX.
 * 
 * Filters permissions based on:
 * - scope: 'system' | 'business' | 'all' (role type)
 * - businessCapabilities: filters by hasStore/hasBooking to show relevant permissions
 */

import { useMemo, useState } from 'react';
import {
  Box,
  Checkbox,
  Stack,
  Typography,
  IconButton,
} from '@mui/joy';
import { ChevronDown, ChevronRight } from 'lucide-react';
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
  'view_orders',
  'create_orders',
  'update_orders',
  'cancel_orders',
  'manage_orders',
  'manage_order_payments',
  'view_products',
  'create_products',
  'update_products',
  'delete_products',
  'manage_inventory',
  'manage_discounts',
  'view_shop',
  'manage_shop',
];

/**
 * Permission names that are only relevant to businesses with hasBooking capability
 */
const BOOKING_ONLY_PERMISSIONS = [
  'view_bookings',
  'create_bookings',
  'update_bookings',
  'cancel_bookings',
  'manage_bookings',
  'check_in_guests',
  'check_out_guests',
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
  if (!capabilities) return true;

  const permName = permission.name.toLowerCase();
  
  if (STORE_ONLY_PERMISSIONS.includes(permName) && !capabilities.hasStore) {
    return false;
  }
  
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
  /**
   * Scope filter for permissions:
   * - 'business': Show business + all permissions
   * - 'system': Show system + all permissions  
   * - undefined: Show ALL permissions (for admins)
   */
  scope?: 'system' | 'business';
  businessCapabilities?: BusinessCapabilities;
}

export function PermissionSelector({
  categories,
  selectedIds,
  onChange,
  disabled = false,
  scope,
  businessCapabilities,
}: PermissionSelectorProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Filter categories based on scope and business capabilities
  const filteredCategories = useMemo(() => {
    return categories.map((category) => ({
      ...category,
      permissions: category.permissions.filter((p) => {
        // If no scope specified, show all permissions (admin view)
        // Otherwise, show permissions matching scope or 'all' scope
        const scopeMatch = !scope || p.scope === 'all' || p.scope === scope;
        if (!scopeMatch) return false;
        return shouldShowPermission(p, businessCapabilities);
      }),
    })).filter((c) => c.permissions.length > 0);
  }, [categories, scope, businessCapabilities]);

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryName)) {
        next.delete(categoryName);
      } else {
        next.add(categoryName);
      }
      return next;
    });
  };

  const handleTogglePermission = (permId: number) => {
    if (disabled) return;
    
    const newSelected = selectedIds.includes(permId)
      ? selectedIds.filter((id) => id !== permId)
      : [...selectedIds, permId];
    
    onChange(newSelected);
  };

  const handleToggleCategory = (category: PermissionCategory, e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    
    const categoryPermIds = category.permissions.map((p) => p.id);
    const allSelected = categoryPermIds.every((id) => selectedIds.includes(id));
    
    let newSelected: number[];
    if (allSelected) {
      newSelected = selectedIds.filter((id) => !categoryPermIds.includes(id));
    } else {
      newSelected = [...new Set([...selectedIds, ...categoryPermIds])];
    }
    
    onChange(newSelected);
  };

  const getCategoryState = (category: PermissionCategory) => {
    const categoryPermIds = category.permissions.map((p) => p.id);
    const selectedCount = categoryPermIds.filter((id) => selectedIds.includes(id)).length;
    
    return {
      count: selectedCount,
      total: categoryPermIds.length,
      checked: selectedCount === categoryPermIds.length,
      indeterminate: selectedCount > 0 && selectedCount < categoryPermIds.length,
    };
  };

  if (filteredCategories.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4, px: 2 }}>
        <Typography level="body-sm" color="neutral">
          No permissions available
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={0}>
      {filteredCategories.map((category, index) => {
        const isExpanded = expandedCategories.has(category.name);
        const state = getCategoryState(category);
        
        return (
          <Box key={category.name}>
            {/* Category Header */}
            <Box
              onClick={() => toggleCategory(category.name)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 1.5,
                py: 1,
                cursor: 'pointer',
                userSelect: 'none',
                bgcolor: 'background.surface',
                borderBottom: index < filteredCategories.length - 1 && !isExpanded ? '1px solid' : 'none',
                borderColor: 'neutral.100',
                '&:hover': {
                  bgcolor: 'neutral.50',
                },
              }}
            >
              <IconButton 
                size="sm" 
                variant="plain" 
                color="neutral"
                sx={{ 
                  '--IconButton-size': '24px',
                  minWidth: 24,
                  minHeight: 24,
                }}
              >
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </IconButton>
              
              <Checkbox
                size="sm"
                checked={state.checked}
                indeterminate={state.indeterminate}
                disabled={disabled}
                onChange={(e) => handleToggleCategory(category, e as unknown as React.MouseEvent)}
                onClick={(e) => e.stopPropagation()}
                sx={{ mr: 0.5 }}
              />
              
              <Typography 
                level="body-sm" 
                fontWeight={500}
                sx={{ flex: 1, color: 'text.primary' }}
              >
                {category.name}
              </Typography>
              
              <Typography level="body-xs" color="neutral">
                {state.count}/{state.total}
              </Typography>
            </Box>

            {/* Permissions List */}
            {isExpanded && (
              <Box 
                sx={{ 
                  bgcolor: 'neutral.50',
                  borderBottom: index < filteredCategories.length - 1 ? '1px solid' : 'none',
                  borderColor: 'neutral.100',
                }}
              >
                {category.permissions.map((permission) => (
                  <Box
                    key={permission.id}
                    onClick={() => handleTogglePermission(permission.id)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      pl: 5.5,
                      pr: 1.5,
                      py: 0.75,
                      cursor: disabled ? 'default' : 'pointer',
                      '&:hover': {
                        bgcolor: disabled ? undefined : 'neutral.100',
                      },
                    }}
                  >
                    <Checkbox
                      size="sm"
                      checked={selectedIds.includes(permission.id)}
                      disabled={disabled}
                      onChange={() => handleTogglePermission(permission.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography level="body-sm" sx={{ color: 'text.primary' }}>
                        {formatPermissionName(permission.name)}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        );
      })}
    </Stack>
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
