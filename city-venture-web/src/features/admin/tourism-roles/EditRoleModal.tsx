/**
 * EditRoleModal Component (Tourism)
 * 
 * Wraps the business version with 'system' scope so tourism admins
 * can assign system-level permissions to tourism staff roles.
 * No businessCapabilities filter is applied since system roles aren't business-specific.
 */

import { EditRoleModal as BaseEditRoleModal } from "@/src/features/business/unified/pages/staff-roles/EditRoleModal";

interface TourismEditRoleModalProps {
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
  isLoading,
}: TourismEditRoleModalProps) {
  return (
    <BaseEditRoleModal
      open={open}
      roleId={roleId}
      onClose={onClose}
      onSave={onSave}
      isLoading={isLoading}
      permissionScope="system"
      // No businessCapabilities - tourism staff sees all system permissions
    />
  );
}
