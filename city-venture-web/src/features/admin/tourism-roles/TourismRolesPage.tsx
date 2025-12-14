/**
 * TourismRolesPage Component
 *
 * Main page for managing tourism staff roles.
 * Displays existing roles and provides options to create, edit, and delete.
 */

import { useState } from "react";
import {
  Box,
  Button,
  Stack,
  Typography,
  Alert,
  CircularProgress,
  Modal,
  ModalDialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/joy";
import { Plus, Shield, AlertTriangle } from "lucide-react";
import PageContainer from "@/src/components/PageContainer";
import { useTourismRoles, useRoleManagement } from "./useRoleManagement.ts";
import { RoleList } from "./RoleList.tsx";
import { CreateRoleModal } from "./CreateRoleModal.tsx";
import { EditRoleModal } from "./EditRoleModal.tsx";
import type { Role } from "@/src/services/RoleService";

export function TourismRolesPage() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editRoleId, setEditRoleId] = useState<number | null>(null);
  const [deleteRole, setDeleteRole] = useState<Role | null>(null);

  // Fetch tourism roles
  const {
    data: roles,
    isLoading: rolesLoading,
    error: rolesError,
    refetch: refetchRoles,
  } = useTourismRoles();

  // Role management mutations
  const {
    clonePresetAsync,
    createCustomAsync,
    updateRoleAsync,
    deleteRole: deleteRoleMutation,
    isCloning,
    isCreating,
    isUpdating,
    isDeleting,
  } = useRoleManagement({
    onSuccess: async () => {
      // Refetch roles to reflect CRUD changes
      await refetchRoles();
      setCreateModalOpen(false);
      setEditRoleId(null);
      setDeleteRole(null);
    },
  });

  // Handlers
  const handleCreateFromPreset = async (
    presetRoleId: number,
    customName?: string
  ) => {
    try {
      await clonePresetAsync({ presetRoleId, customName });
    } catch (err) {
      console.error("Failed to clone preset role:", err);
    }
  };

  const handleCreateCustom = async (
    roleName: string,
    roleDescription: string,
    permissionIds: number[]
  ) => {
    try {
      await createCustomAsync({ roleName, roleDescription, permissionIds });
    } catch (err) {
      console.error("Failed to create custom role:", err);
    }
  };

  const handleUpdateRole = async (
    roleId: number,
    data: {
      roleName?: string;
      roleDescription?: string;
      permissionIds?: number[];
    }
  ) => {
    try {
      await updateRoleAsync({ roleId, data });
    } catch (err) {
      console.error("Failed to update role:", err);
    }
  };

  const handleDeleteRole = async () => {
    if (deleteRole) {
      try {
        await deleteRoleMutation(deleteRole.id);
      } catch (err) {
        console.error("Failed to delete role:", err);
      }
    }
  };

  return (
    <PageContainer>
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box>
          <Typography level="h3" startDecorator={<Shield size={24} />}>
            Tourism Staff Roles
          </Typography>
          <Typography level="body-sm" color="neutral">
            Manage roles and permissions for tourism staff members
          </Typography>
        </Box>
        <Button
          startDecorator={<Plus size={18} />}
          onClick={() => setCreateModalOpen(true)}
        >
          Create Role
        </Button>
      </Stack>

      {/* Error State */}
      {rolesError && (
        <Alert color="danger" sx={{ mb: 2 }}>
          Failed to load roles. Please try again.
        </Alert>
      )}

      {/* Loading State */}
      {rolesLoading ? (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <CircularProgress />
          <Typography level="body-sm" sx={{ mt: 2 }}>
            Loading roles...
          </Typography>
        </Box>
      ) : (
        <>
          {/* Role List */}
          <RoleList
            roles={roles || []}
            onEdit={(role: Role) => setEditRoleId(role.id)}
            onDelete={(role: Role) => setDeleteRole(role)}
            onViewDetails={(role: Role) => setEditRoleId(role.id)}
          />

          {/* Empty State Help */}
          {roles && roles.length === 0 && (
            <Alert color="neutral" sx={{ mt: 2 }}>
              <Typography level="body-sm">
                <strong>Getting Started:</strong> Create your first tourism
                staff role by clicking the "Create Role" button above. You can
                start from a template or build a custom role with specific
                permissions.
              </Typography>
            </Alert>
          )}
        </>
      )}

      {/* Create Role Modal */}
      <CreateRoleModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreateFromPreset={handleCreateFromPreset}
        onCreateCustom={handleCreateCustom}
        isLoading={isCloning || isCreating}
      />

      {/* Edit Role Modal */}
      <EditRoleModal
        open={editRoleId !== null}
        roleId={editRoleId}
        onClose={() => setEditRoleId(null)}
        onSave={handleUpdateRole}
        isLoading={isUpdating}
      />

      {/* Delete Confirmation Modal */}
      <Modal open={deleteRole !== null} onClose={() => setDeleteRole(null)}>
        <ModalDialog variant="outlined" color="danger">
          <DialogTitle>
            <AlertTriangle size={20} style={{ marginRight: 8 }} />
            Delete Role
          </DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete the role "{deleteRole?.role_name}
              "?
            </Typography>
            <Typography level="body-sm" color="neutral" sx={{ mt: 1 }}>
              This action cannot be undone. Staff members with this role will
              need to be reassigned to a different role.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              variant="plain"
              color="neutral"
              onClick={() => setDeleteRole(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              color="danger"
              onClick={handleDeleteRole}
              loading={isDeleting}
            >
              Delete Role
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>
    </PageContainer>
  );
}

export default TourismRolesPage;
