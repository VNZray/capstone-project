/**
 * CreateRoleModal Component (Tourism)
 * 
 * Wraps the business version with 'system' scope so tourism admins
 * can assign system-level permissions to tourism staff roles.
 * No businessCapabilities filter is applied since system roles aren't business-specific.
 */

import { CreateRoleModal as BaseCreateRoleModal } from "@/src/features/business/unified/pages/staff-roles/CreateRoleModal";

interface TourismCreateRoleModalProps {
  open: boolean;
  onClose: () => void;
  onCreateCustom: (roleName: string, roleDescription: string, permissionIds: number[]) => Promise<void>;
  isLoading?: boolean;
}

export function CreateRoleModal({
  open,
  onClose,
  onCreateCustom,
  isLoading,
}: TourismCreateRoleModalProps) {
  return (
    <BaseCreateRoleModal
      open={open}
      onClose={onClose}
      onCreateCustom={onCreateCustom}
      isLoading={isLoading}
      permissionScope="system"
      // No businessCapabilities - tourism staff sees all system permissions
    />
  );
}
