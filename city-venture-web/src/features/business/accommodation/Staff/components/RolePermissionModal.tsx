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
  Card,
  Select,
  Option,
} from "@mui/joy";
import Container from "@/src/components/Container";
import Typography from "@/src/components/Typography";
import {
  createRole,
  assignRolePermissions,
  fetchAllPermissions,
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

interface PermissionModule {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  permissions: {
    add: boolean;
    view: boolean;
    update: boolean;
    delete: boolean;
  };
}

const PERMISSION_MODULES: PermissionModule[] = [
  {
    id: "dashboard",
    name: "Manage Dashboard",
    description: "Access to business analytics and overview",
    icon: LayoutDashboard,
    permissions: { add: false, view: true, update: false, delete: false },
  },
  {
    id: "transactions",
    name: "Manage Transactions",
    description: "View and manage payment transactions",
    icon: CreditCard,
    permissions: { add: false, view: true, update: true, delete: false },
  },
  {
    id: "bookings",
    name: "Manage Bookings",
    description: "Handle customer reservations and bookings",
    icon: Calendar,
    permissions: { add: true, view: true, update: true, delete: true },
  },
  {
    id: "business_profile",
    name: "Manage Business Profile",
    description: "Edit business information and settings",
    icon: Building2,
    permissions: { add: false, view: true, update: true, delete: false },
  },
  {
    id: "rooms",
    name: "Manage Rooms",
    description: "Add, edit, and manage room inventory",
    icon: BedDouble,
    permissions: { add: true, view: true, update: true, delete: true },
  },
  {
    id: "promotions",
    name: "Manage Promotions",
    description: "Create and manage promotional offers",
    icon: Megaphone,
    permissions: { add: true, view: true, update: true, delete: true },
  },
  {
    id: "subscriptions",
    name: "Manage Subscriptions",
    description: "Handle business subscription plans",
    icon: Crown,
    permissions: { add: false, view: true, update: true, delete: false },
  },
  {
    id: "reviews",
    name: "Manage Reviews & Ratings",
    description: "Respond to and manage customer feedback",
    icon: Star,
    permissions: { add: false, view: true, update: true, delete: false },
  },
  {
    id: "staff",
    name: "Manage Staff",
    description: "Add and manage staff members",
    icon: Users,
    permissions: { add: true, view: true, update: true, delete: true },
  },
];

export default function RolePermissionModal({
  open,
  onClose,
  onSuccess,
}: RolePermissionModalProps) {
  const { businessDetails } = useBusiness();
  const [roleName, setRoleName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedModules, setSelectedModules] = useState<Record<string, PermissionModule["permissions"]>>({});
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);

  useEffect(() => {
    if (!open) return;
    // Reset form
    setRoleName("");
    setDescription("");
    setSelectedModules({});
    setError("");
    loadPermissions();
  }, [open]);

  const loadPermissions = async () => {
    try {
      const data = await fetchAllPermissions();
      // Filter to only show permissions for this business
      const businessPerms = data.filter(
        (p: Permission) => p.permission_for === businessDetails?.id || p.permission_for === 'business'
      );
      setAllPermissions(businessPerms);
    } catch (err) {
      setError("Failed to load permissions");
    }
  };

  const handleToggleModule = (moduleId: string) => {
    setSelectedModules((prev) => {
      const newModules = { ...prev };
      if (newModules[moduleId]) {
        delete newModules[moduleId];
      } else {
        const module = PERMISSION_MODULES.find((m) => m.id === moduleId);
        if (module) {
          newModules[moduleId] = { ...module.permissions };
        }
      }
      return newModules;
    });
  };

  const handlePermissionChange = (
    moduleId: string,
    permType: "add" | "view" | "update" | "delete",
    checked: boolean
  ) => {
    setSelectedModules((prev) => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId],
        [permType]: checked,
      },
    }));
  };

  const handleSave = async () => {
    if (!roleName.trim()) {
      setError("Role name is required.");
      return;
    }
    if (Object.keys(selectedModules).length === 0) {
      setError("Please select at least one permission module.");
      return;
    }

    setLoading(true);
    try {
      // Create role with role_for = 'Business'
      const newRole = await createRole({
        role_name: roleName.trim(),
        description: description.trim(),
        role_for: businessDetails?.id,
      });

      console.log("Created role:", newRole);

      // Create permissions for each selected module and assign them
      const permissionIds: number[] = [];
      
      Object.entries(selectedModules).forEach(([moduleId, perms]) => {
        const module = PERMISSION_MODULES.find((m) => m.id === moduleId);
        if (!module) return;

        // Find matching permissions in the database by module keywords
        const keywords = [moduleId, ...module.name.toLowerCase().split(' ')];
        
        const matchingPerms = allPermissions.filter((p) => {
          const nameLower = p.name.toLowerCase();
          const descLower = p.description.toLowerCase();
          
          // Check if any keyword matches the permission name or description
          return keywords.some(kw => 
            nameLower.includes(kw) || descLower.includes(kw)
          );
        });

        console.log(`Module ${moduleId} matched ${matchingPerms.length} permissions:`, matchingPerms.map(p => p.name));

        // Add all matching permissions that have ANY of the selected CRUD flags
        matchingPerms.forEach((perm) => {
          const shouldInclude =
            (perms.add && perm.can_add) ||
            (perms.view && perm.can_view) ||
            (perms.update && perm.can_update) ||
            (perms.delete && perm.can_delete);

          if (shouldInclude && !permissionIds.includes(perm.id)) {
            permissionIds.push(perm.id);
          }
        });
      });

      console.log("Permission IDs to assign:", permissionIds);

      // Assign permissions
      if (permissionIds.length > 0) {
        await assignRolePermissions(newRole.id, permissionIds);
        console.log("Permissions assigned successfully");
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error creating role:", err);
      setError(err instanceof Error ? err.message : "Failed to create role");
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
      maxWidth={800}
      actions={[
        { label: "Cancel", onClick: onClose },
        {
          label: loading ? "Creating..." : "Create Role",
          onClick: handleSave,
          variant: "primary",
          disabled: !roleName.trim() || Object.keys(selectedModules).length === 0 || loading,
        },
      ]}
    >
      <Container padding="0" gap="24px">
        <FormControl>
          <FormLabel>
            <Typography.Label>Role Name</Typography.Label>
          </FormLabel>
          <Input
            placeholder="e.g. Admin"
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
            minRows={3}
            size="lg"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </FormControl>

        <Box>
          <Typography.Label sx={{ mb: 1 }}>Access</Typography.Label>
          <Container padding="0" gap="12px">
            {PERMISSION_MODULES.map((module) => {
              const Icon = module.icon;
              const isSelected = !!selectedModules[module.id];

              return (
                <Card
                  key={module.id}
                  variant={isSelected ? "soft" : "outlined"}
                  sx={{
                    cursor: "pointer",
                    transition: "all 0.2s",
                    border: isSelected ? "2px solid" : "1px solid",
                    borderColor: isSelected ? "primary.500" : "divider",
                    "&:hover": {
                      borderColor: "primary.300",
                      boxShadow: "sm",
                    },
                  }}
                  onClick={() => handleToggleModule(module.id)}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: 2,
                    }}
                  >
                    <Box sx={{ display: "flex", gap: 2, flex: 1 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "8px",
                          backgroundColor: isSelected ? "primary.100" : "background.level2",
                          color: isSelected ? "primary.600" : "text.secondary",
                        }}
                      >
                        <Icon size={24} />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography.CardTitle>{module.name}</Typography.CardTitle>
                        <Typography.Body size="sm" sx={{ color: "text.secondary" }}>
                          {module.description}
                        </Typography.Body>
                      </Box>
                    </Box>

                    <Box
                      sx={{ minWidth: 140 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Select
                        placeholder="Permission"
                        size="sm"
                        value={
                          isSelected
                            ? Object.entries(selectedModules[module.id] || {})
                                .filter(([_, val]) => val)
                                .map(([key]) => key)
                                .join(",") || "custom"
                            : ""
                        }
                        disabled={!isSelected}
                        onChange={(_, value) => {
                          if (!value) return;
                          const perms = value.split(",");
                          setSelectedModules((prev) => ({
                            ...prev,
                            [module.id]: {
                              add: perms.includes("add"),
                              view: perms.includes("view"),
                              update: perms.includes("update"),
                              delete: perms.includes("delete"),
                            },
                          }));
                        }}
                      >
                        {module.permissions.add && (
                          <Option value="add">Add</Option>
                        )}
                        {module.permissions.view && (
                          <Option value="view">View</Option>
                        )}
                        {module.permissions.update && (
                          <Option value="update,view">Update</Option>
                        )}
                        {module.permissions.delete && (
                          <Option value="delete">Delete</Option>
                        )}
                        <Option value="add,view,update,delete">All</Option>
                      </Select>

                      {isSelected && (
                        <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 0.5 }}>
                          {module.permissions.add && (
                            <Checkbox
                              label="Add"
                              size="sm"
                              checked={selectedModules[module.id]?.add || false}
                              onChange={(e) =>
                                handlePermissionChange(module.id, "add", e.target.checked)
                              }
                            />
                          )}
                          {module.permissions.view && (
                            <Checkbox
                              label="View"
                              size="sm"
                              checked={selectedModules[module.id]?.view || false}
                              onChange={(e) =>
                                handlePermissionChange(module.id, "view", e.target.checked)
                              }
                            />
                          )}
                          {module.permissions.update && (
                            <Checkbox
                              label="Update"
                              size="sm"
                              checked={selectedModules[module.id]?.update || false}
                              onChange={(e) =>
                                handlePermissionChange(module.id, "update", e.target.checked)
                              }
                            />
                          )}
                          {module.permissions.delete && (
                            <Checkbox
                              label="Delete"
                              size="sm"
                              checked={selectedModules[module.id]?.delete || false}
                              onChange={(e) =>
                                handlePermissionChange(module.id, "delete", e.target.checked)
                              }
                            />
                          )}
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Card>
              );
            })}
          </Container>
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
