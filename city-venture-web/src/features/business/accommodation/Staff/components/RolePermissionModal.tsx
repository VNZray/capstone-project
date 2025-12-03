import * as React from "react";
import BaseEditModal from "@/src/components/BaseEditModal";
import {
  FormControl,
  FormLabel,
  Input,
  Textarea,
  FormHelperText,
  Box,
  Checkbox,
  Table,
  Sheet,
} from "@mui/joy";
import Container from "@/src/components/Container";
import Typography from "@/src/components/Typography";
import {
  createRole,
  assignRolePermissions,
  fetchAllPermissions,
  insertPermission,
  type Permission,
} from "@/src/services/manage-staff/StaffService";
import { useState, useEffect } from "react";
import { useBusiness } from "@/src/context/BusinessContext";
import {
  LayoutDashboard,
  CreditCard,
  Calendar,
  Building2,
  BedDouble,
  Megaphone,
  Crown,
  Star,
  Users,
} from "lucide-react";

interface RolePermissionModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type PermissionType = "add" | "view" | "update" | "delete";

interface PermissionModule {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  availablePermissions: PermissionType[];
}

const PERMISSION_MODULES: PermissionModule[] = [
  {
    id: "dashboard",
    name: "Dashboard",
    description: "Access to business analytics and overview",
    icon: LayoutDashboard,
    availablePermissions: ["view"],
  },
  {
    id: "transactions",
    name: "Transactions",
    description: "View and manage payment transactions",
    icon: CreditCard,
    availablePermissions: ["view", "update"],
  },
  {
    id: "bookings",
    name: "Bookings",
    description: "Handle customer reservations and bookings",
    icon: Calendar,
    availablePermissions: ["add", "view", "update", "delete"],
  },
  {
    id: "business_profile",
    name: "Business Profile",
    description: "Edit business information and settings",
    icon: Building2,
    availablePermissions: ["view", "update"],
  },
  {
    id: "rooms",
    name: "Rooms",
    description: "Add, edit, and manage room inventory",
    icon: BedDouble,
    availablePermissions: ["add", "view", "update", "delete"],
  },
  {
    id: "promotions",
    name: "Promotions",
    description: "Create and manage promotional offers",
    icon: Megaphone,
    availablePermissions: ["add", "view", "update", "delete"],
  },
  {
    id: "subscriptions",
    name: "Subscriptions",
    description: "Handle business subscription plans",
    icon: Crown,
    availablePermissions: ["view", "update"],
  },
  {
    id: "reviews",
    name: "Reviews & Ratings",
    description: "Respond to and manage customer feedback",
    icon: Star,
    availablePermissions: ["view", "update"],
  },
  {
    id: "staff",
    name: "Staff",
    description: "Add and manage staff members",
    icon: Users,
    availablePermissions: ["add", "view", "update", "delete"],
  },
];

const ALL_PERMISSIONS: PermissionType[] = ["view", "add", "update", "delete"];

export default function RolePermissionModal({
  open,
  onClose,
  onSuccess,
}: RolePermissionModalProps) {
  const { businessDetails } = useBusiness();
  const [roleName, setRoleName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<
    Record<string, Partial<Record<PermissionType, boolean>>>
  >({});
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);

  useEffect(() => {
    if (!open) return;
    setRoleName("");
    setDescription("");
    setSelectedPermissions({});
    setError("");
    loadPermissions();
  }, [open, businessDetails]);

  const loadPermissions = async () => {
    if (!businessDetails?.id) return;
    try {
      console.log("Loading all permissions for business...");
      const data = await fetchAllPermissions();
      const businessPerms = data.filter(
        (p: Permission) => p.permission_for === businessDetails?.id
      );
      setAllPermissions(businessPerms);
      console.log(`Loaded ${businessPerms.length} permissions.`);
    } catch (err) {
      setError("Failed to load permissions");
      console.error(err);
    }
  };

  const handlePermissionChange = (
    moduleId: string,
    permType: PermissionType,
    checked: boolean
  ) => {
    setSelectedPermissions((prev) => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId],
        [permType]: checked,
      },
    }));
  };

  const handleSelectRow = (moduleId: string, checked: boolean) => {
    const module = PERMISSION_MODULES.find((m) => m.id === moduleId);
    if (!module) return;

    const newPerms: Partial<Record<PermissionType, boolean>> = {};
    if (checked) {
      module.availablePermissions.forEach((p) => {
        newPerms[p] = true;
      });
    }

    setSelectedPermissions((prev) => ({
      ...prev,
      [moduleId]: newPerms,
    }));
  };

  const handleSelectColumn = (permType: PermissionType, checked: boolean) => {
    const newSelected = { ...selectedPermissions };
    PERMISSION_MODULES.forEach((module) => {
      if (module.availablePermissions.includes(permType)) {
        if (!newSelected[module.id]) {
          newSelected[module.id] = {};
        }
        newSelected[module.id]![permType] = checked;
      }
    });
    setSelectedPermissions(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    const newSelected: Record<
      string,
      Partial<Record<PermissionType, boolean>>
    > = {};
    if (checked) {
      PERMISSION_MODULES.forEach((module) => {
        newSelected[module.id] = {};
        module.availablePermissions.forEach((perm) => {
          newSelected[module.id][perm] = true;
        });
      });
    }
    setSelectedPermissions(newSelected);
  };

  const isAllSelected = () => {
    const totalPossible = PERMISSION_MODULES.reduce(
      (acc, m) => acc + m.availablePermissions.length,
      0
    );
    const totalSelected = Object.values(selectedPermissions).reduce(
      (acc, perms) => acc + Object.values(perms).filter(Boolean).length,
      0
    );
    return totalSelected === totalPossible;
  };

  const isColumnSelected = (permType: PermissionType) => {
    return PERMISSION_MODULES.every(
      (m) =>
        !m.availablePermissions.includes(permType) ||
        selectedPermissions[m.id]?.[permType]
    );
  };

  const isRowSelected = (moduleId: string) => {
    const module = PERMISSION_MODULES.find((m) => m.id === moduleId);
    if (!module) return false;
    return module.availablePermissions.every(
      (p) => selectedPermissions[moduleId]?.[p]
    );
  };

  const handleSave = async () => {
    if (!roleName.trim()) {
      setError("Role name is required.");
      return;
    }
    if (Object.keys(selectedPermissions).length === 0) {
      setError("Please select at least one permission.");
      return;
    }

    setLoading(true);
    try {
      const newRole = await createRole({
        role_name: roleName.trim(),
        description: description.trim(),
        role_for: businessDetails?.id,
      });

      const permissionIdsToAssign: number[] = [];

      for (const [moduleId, perms] of Object.entries(selectedPermissions)) {
        if (Object.values(perms).every(v => !v)) continue; // Skip if no perms selected for this module

        const module = PERMISSION_MODULES.find(m => m.id === moduleId);
        if (!module) continue;

        const can_add = !!perms.add;
        const can_view = !!perms.view;
        const can_update = !!perms.update;
        const can_delete = !!perms.delete;

        // Find if an identical permission already exists for this business
        let existingPerm = allPermissions.find(p => 
            p.name === module.name &&
            p.can_add === can_add &&
            p.can_view === can_view &&
            p.can_update === can_update &&
            p.can_delete === can_delete
        );

        let permissionId: number;

        if (existingPerm) {
            permissionId = existingPerm.id;
        } else {
            // Create new permission
            console.log(`Creating new permission for ${module.name} with custom rights.`);
            const newPerm = await insertPermission({
                name: module.name,
                description: module.description,
                can_add,
                can_view,
                can_update,
                can_delete,
                business_id: businessDetails?.id || null || undefined,
            });
            permissionId = newPerm.id;
            // Add to allPermissions to avoid creating duplicates in the same run
            setAllPermissions(prev => [...prev, newPerm]); 
        }
        
        if (permissionId) {
            permissionIdsToAssign.push(permissionId);
        }
      }

      if (permissionIdsToAssign.length > 0) {
        await assignRolePermissions(newRole.id, permissionIdsToAssign);
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create role");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseEditModal
      open={open}
      onClose={onClose}
      title="Create Custom Role"
      description="Define a new role with specific permissions for your staff"
      maxWidth={900}
      actions={[
        { label: "Cancel", onClick: onClose },
        {
          label: loading ? "Creating..." : "Create Role",
          onClick: handleSave,
          variant: "primary",
          disabled:
            !roleName.trim() ||
            Object.keys(selectedPermissions).length === 0 ||
            loading,
        },
      ]}
    >
      <Container padding="0" gap="24px">
        <FormControl>
          <FormLabel>
            <Typography.Label>Role Name</Typography.Label>
          </FormLabel>
          <Input
            placeholder="e.g. Front Desk Manager"
            type="text"
            size="lg"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
          />
        </FormControl>

        <FormControl>
          <FormLabel>
            <Typography.Label>Description (optional)</Typography.Label>
          </FormLabel>
          <Textarea
            placeholder="Describe the responsibilities of this role"
            minRows={2}
            size="lg"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </FormControl>

        <Box>
          <Typography.Label sx={{ mb: 1 }}>Permissions</Typography.Label>
          <Sheet
            variant="outlined"
            sx={{
              borderRadius: "sm",
              overflow: "auto",
              boxShadow: "sm",
            }}
          >
            <Table
              borderAxis="bothBetween"
              stickyHeader
              hoverRow
              sx={{
                "& tr > *:first-of-type": {
                  position: "sticky",
                  left: 0,
                  boxShadow: "1px 0 var(--joy-palette-divider)",
                  bgcolor: "background.surface",
                },
                "& tr > *:last-child": {
                  textAlign: "center",
                },
              }}
            >
              <thead>
                <tr>
                  <th style={{ width: 250, minWidth: 200 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                      }}
                    >
                      <Checkbox
                        size="sm"
                        checked={isAllSelected()}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                      <Typography.Label>Module</Typography.Label>
                    </Box>
                  </th>
                  {ALL_PERMISSIONS.map((perm) => (
                    <th key={perm} style={{ textAlign: "center" }}>
                      <Checkbox
                        label={perm.charAt(0).toUpperCase() + perm.slice(1)}
                        size="sm"
                        checked={isColumnSelected(perm)}
                        onChange={(e) =>
                          handleSelectColumn(perm, e.target.checked)
                        }
                      />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERMISSION_MODULES.map((module) => {
                  const Icon = module.icon;
                  return (
                    <tr key={module.id}>
                      <td>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 2 }}
                        >
                          <Checkbox
                            size="sm"
                            checked={isRowSelected(module.id)}
                            onChange={(e) =>
                              handleSelectRow(module.id, e.target.checked)
                            }
                          />
                          <Icon
                            size={20}
                            style={{
                              color: "var(--joy-palette-text-secondary)",
                            }}
                          />
                          <Box>
                            <Typography.Body size="sm">
                              {module.name}
                            </Typography.Body>
                            <Typography.Body
                              size="xs"
                              sx={{ color: "text.tertiary" }}
                            >
                              {module.description}
                            </Typography.Body>
                          </Box>
                        </Box>
                      </td>
                      {ALL_PERMISSIONS.map((perm) => (
                        <td key={perm}>
                          {module.availablePermissions.includes(perm) ? (
                            <Checkbox
                              size="sm"
                              checked={
                                selectedPermissions[module.id]?.[perm] || false
                              }
                              onChange={(e) =>
                                handlePermissionChange(
                                  module.id,
                                  perm,
                                  e.target.checked
                                )
                              }
                            />
                          ) : (
                            <Typography.Body
                              size="sm"
                              sx={{ color: "text.disabled" }}
                            >
                              N/A
                            </Typography.Body>
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Sheet>
        </Box>
      </Container>
      {error ? (
        <FormHelperText sx={{ mt: 2, color: "danger.500" }}>
          {error}
        </FormHelperText>
      ) : null}
    </BaseEditModal>
  );
}
