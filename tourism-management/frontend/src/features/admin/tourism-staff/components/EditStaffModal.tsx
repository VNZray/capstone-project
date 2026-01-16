import * as React from "react";
import BaseEditModal from "@/src/components/BaseEditModal";
import {
  FormControl,
  FormLabel,
  Input,
  Select,
  Option,
  Box,
  Checkbox,
  CircularProgress,
} from "@mui/joy";
import Typography from "@/src/components/Typography";
import { Mail, Phone, User, Briefcase, AlertCircle } from "lucide-react";
import type { TourismStaff } from "@/src/types/TourismStaff";
import {
  fetchTourismStaffPermissions,
  updateTourismStaffPermissions,
  fetchAvailableTourismPermissions,
  type PermissionCategory,
} from "@/src/services/TourismStaffService";
import PermissionSelector from "./PermissionSelector";

export type TourismStaffEditData = {
  first_name: string;
  middle_name?: string;
  last_name: string;
  email: string;
  phone_number: string;
  position?: string;
  user_role_id: number;
  is_active: boolean;
  is_verified: boolean;
  permission_ids?: number[];
};

type RoleOption = {
  id: number;
  name: string;
};

type StaffEditModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: (data: TourismStaffEditData) => void;
  initialData?: TourismStaff;
  roles: RoleOption[];
};

export default function StaffEditModal({
  open,
  onClose,
  onSave,
  initialData,
  roles,
}: StaffEditModalProps) {
  const [firstName, setFirstName] = React.useState("");
  const [middleName, setMiddleName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [position, setPosition] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [roleId, setRoleId] = React.useState<number | undefined>(undefined);
  const [isActive, setIsActive] = React.useState(true);
  const [error, setError] = React.useState<string>("");

  // Permission states
  const [selectedPermissions, setSelectedPermissions] = React.useState<
    Set<number>
  >(new Set());
  const [permissionCategories, setPermissionCategories] = React.useState<
    PermissionCategory[]
  >([]);
  const [loadingPermissions, setLoadingPermissions] = React.useState(false);

  // Load available permissions and staff's current permissions
  const loadPermissions = React.useCallback(async () => {
    if (!open || !initialData?.user_id) return;

    setLoadingPermissions(true);
    try {
      const [categories, staffPermissions] = await Promise.all([
        fetchAvailableTourismPermissions(),
        fetchTourismStaffPermissions(initialData.user_id),
      ]);

      setPermissionCategories(categories);
      setSelectedPermissions(new Set(staffPermissions.map((p) => p.id)));
    } catch (err) {
      console.error("Failed to load permissions:", err);
      setError("Failed to load permissions");
    } finally {
      setLoadingPermissions(false);
    }
  }, [open, initialData?.user_id]);

  React.useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  const togglePermission = (permissionId: number) => {
    setSelectedPermissions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(permissionId)) {
        newSet.delete(permissionId);
      } else {
        newSet.add(permissionId);
      }
      return newSet;
    });
  };

  const toggleCategory = (permissions: any[]) => {
    const permissionIds = permissions.map((p) => p.id);
    const allSelected = permissionIds.every((id) =>
      selectedPermissions.has(id)
    );

    setSelectedPermissions((prev) => {
      const newSet = new Set(prev);
      if (allSelected) {
        permissionIds.forEach((id) => newSet.delete(id));
      } else {
        permissionIds.forEach((id) => newSet.add(id));
      }
      return newSet;
    });
  };

  // Reset form when modal opens with initialData
  React.useEffect(() => {
    if (!open) return;

    if (initialData) {
      setFirstName(initialData.first_name || "");
      setMiddleName(initialData.middle_name || "");
      setLastName(initialData.last_name || "");
      setPosition(initialData.position || "");
      setEmail(initialData.email || "");
      setPhone(initialData.phone_number || "");
      setIsActive(Boolean(initialData.is_active));

      // Find matching role
      const matched = roles.find(
        (r) =>
          r.name.toLowerCase() === (initialData.role_name || "").toLowerCase()
      );
      setRoleId(matched?.id);
    }

    setError("");
  }, [open, initialData, roles]);

  const isEmailValid = React.useMemo(() => {
    if (!email.trim()) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }, [email]);

  const canSubmit = React.useMemo(() => {
    return (
      firstName.trim().length > 0 &&
      lastName.trim().length > 0 &&
      email.trim().length > 0 &&
      isEmailValid &&
      phone.trim().length > 0 &&
      roleId !== undefined
    );
  }, [firstName, lastName, email, isEmailValid, phone, roleId]);

  const handleSave = () => {
    if (!canSubmit) {
      setError("Please fill in all required fields with valid data.");
      return;
    }

    if (!roleId) {
      setError("Please select a role.");
      return;
    }

    onSave({
      first_name: firstName.trim(),
      middle_name: middleName.trim() || undefined,
      last_name: lastName.trim(),
      email: email.trim(),
      phone_number: phone.trim(),
      position: position.trim() || undefined,
      user_role_id: roleId,
      is_active: isActive,
      is_verified: true,
      permission_ids: Array.from(selectedPermissions),
    });

    onClose();
  };

  return (
    <BaseEditModal
      open={open}
      onClose={onClose}
      title="Edit Tourism Staff"
      description="Update staff member details and role"
      maxWidth={580}
      actions={[
        { label: "Cancel", onClick: onClose },
        {
          label: "Save Changes",
          onClick: handleSave,
          variant: "primary",
          disabled: !canSubmit,
        },
      ]}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {/* Error Alert */}
        {error && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              p: 1.5,
              borderRadius: "8px",
              bgcolor: "danger.softBg",
              border: "1px solid",
              borderColor: "danger.300",
            }}
          >
            <AlertCircle
              size={16}
              style={{ color: "var(--joy-palette-danger-500)" }}
            />
            <Typography.Body size="sm" sx={{ color: "danger.700" }}>
              {error}
            </Typography.Body>
          </Box>
        )}

        {/* First Name */}
        <FormControl size="sm">
          <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 0.5 }}>
            First Name{" "}
            <Typography.Body component="span" sx={{ color: "danger.500" }}>
              *
            </Typography.Body>
          </FormLabel>
          <Input
            placeholder="Juan"
            type="text"
            size="sm"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            startDecorator={<User size={14} style={{ opacity: 0.5 }} />}
            sx={{ "--Input-radius": "6px" }}
          />
        </FormControl>

        {/* Middle Name */}
        <FormControl size="sm">
          <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 0.5 }}>
            Middle Name
          </FormLabel>
          <Input
            placeholder="M."
            type="text"
            size="sm"
            value={middleName}
            onChange={(e) => setMiddleName(e.target.value)}
            sx={{ "--Input-radius": "6px" }}
          />
        </FormControl>

        {/* Last Name */}
        <FormControl size="sm">
          <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 0.5 }}>
            Last Name{" "}
            <Typography.Body component="span" sx={{ color: "danger.500" }}>
              *
            </Typography.Body>
          </FormLabel>
          <Input
            placeholder="Dela Cruz"
            type="text"
            size="sm"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            sx={{ "--Input-radius": "6px" }}
          />
        </FormControl>

        {/* Email */}
        <FormControl size="sm" error={!isEmailValid}>
          <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 0.5 }}>
            Email{" "}
            <Typography.Body component="span" sx={{ color: "danger.500" }}>
              *
            </Typography.Body>
          </FormLabel>
          <Input
            placeholder="staff@tourism.gov.ph"
            type="email"
            size="sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            startDecorator={<Mail size={14} style={{ opacity: 0.5 }} />}
            sx={{ "--Input-radius": "6px" }}
          />
          {!isEmailValid && (
            <Typography.Body size="xs" sx={{ color: "danger.500", mt: 0.5 }}>
              Invalid email format
            </Typography.Body>
          )}
        </FormControl>

        {/* Phone */}
        <FormControl size="sm">
          <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 0.5 }}>
            Phone{" "}
            <Typography.Body component="span" sx={{ color: "danger.500" }}>
              *
            </Typography.Body>
          </FormLabel>
          <Input
            placeholder="09*********"
            type="tel"
            size="sm"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            startDecorator={<Phone size={14} style={{ opacity: 0.5 }} />}
            sx={{ "--Input-radius": "6px" }}
          />
        </FormControl>

        {/* Position */}
        <FormControl size="sm">
          <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 0.5 }}>
            Position / Title
          </FormLabel>
          <Input
            placeholder="e.g., Tourism Officer, Admin Assistant"
            type="text"
            size="sm"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            startDecorator={<Briefcase size={14} style={{ opacity: 0.5 }} />}
            sx={{ "--Input-radius": "6px" }}
          />
        </FormControl>

        {/* Role Selection */}
        <FormControl size="sm">
          <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 0.5 }}>
            Role{" "}
            <Typography.Body component="span" sx={{ color: "danger.500" }}>
              *
            </Typography.Body>
          </FormLabel>
          <Select
            size="sm"
            placeholder="Select a role"
            value={roleId ?? null}
            onChange={(_, value) => setRoleId(value as number)}
            sx={{ "--Select-radius": "6px" }}
          >
            {roles.map((role) => (
              <Option key={role.id} value={role.id}>
                {role.name}
              </Option>
            ))}
          </Select>
        </FormControl>

        {/* Active Status Checkbox */}
        <FormControl>
          <Checkbox
            label="Active"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            size="sm"
          />
          <Typography.Body size="xs" sx={{ color: "neutral.600", mt: 0.5 }}>
            Active staff can log in and access the system
          </Typography.Body>
        </FormControl>

        {/* Permissions Section */}
        <FormControl>
          <FormLabel>Permissions</FormLabel>
          {loadingPermissions ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
              <CircularProgress size="sm" />
            </Box>
          ) : (
            <PermissionSelector
              categories={permissionCategories}
              selectedPermissions={selectedPermissions}
              onTogglePermission={togglePermission}
              onToggleCategory={toggleCategory}
              selectedRoleId={roleId}
              roles={roles}
            />
          )}
          <Typography.Body size="xs" sx={{ color: "neutral.600", mt: 0.5 }}>
            Assign specific permissions to control what this staff member can
            access
          </Typography.Body>
        </FormControl>
      </Box>
    </BaseEditModal>
  );
}
