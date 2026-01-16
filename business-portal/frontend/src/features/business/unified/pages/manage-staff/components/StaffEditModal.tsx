import * as React from "react";
import BaseEditModal from "@/src/components/BaseEditModal";
import {
  FormControl,
  FormLabel,
  Input,
  FormHelperText,
  Divider,
  Box,
  CircularProgress,
} from "@mui/joy";
import Container from "@/src/components/Container";
import Button from "@/src/components/Button";
import { RotateCw } from "lucide-react";
import Typography from "@/src/components/Typography";
import { useBusiness } from "@/src/context/BusinessContext";
import {
  fetchAvailableStaffPermissions,
  fetchStaffPermissions,
  type PermissionCategory,
} from "@/src/services/manage-staff/StaffService";
import PermissionSelector from "./PermissionSelector";
import BaseModal from "@/src/components/BaseModal";

export type StaffEditData = {
  first_name: string;
  middle_name?: string;
  last_name?: string;
  email: string;
  phone_number?: string;
  title?: string;
  permission_ids: number[];
};

type StaffEditModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: (data: StaffEditData) => void;
  onResetPassword: () => void;
  initialData?: {
    id?: string;
    first_name: string;
    middle_name?: string;
    last_name?: string;
    email: string;
    phone_number?: string;
    title?: string;
  };
};

export default function StaffEditModal({
  open,
  onClose,
  onSave,
  onResetPassword,
  initialData,
}: StaffEditModalProps) {
  const { businessDetails } = useBusiness();
  const [firstName, setFirstName] = React.useState("");
  const [middleName, setMiddleName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [selectedPermissions, setSelectedPermissions] = React.useState<
    Set<number>
  >(new Set());
  const [error, setError] = React.useState<string>("");
  const [permissionCategories, setPermissionCategories] = React.useState<
    PermissionCategory[]
  >([]);
  const [loading, setLoading] = React.useState(false);

  // Load permissions when modal opens
  React.useEffect(() => {
    if (!open || !businessDetails?.id) return;
    loadPermissions();
  }, [open, businessDetails?.id, initialData?.id]);

  const loadPermissions = async () => {
    if (!businessDetails?.id) return;

    setLoading(true);
    try {
      // Load available permissions
      const categories = await fetchAvailableStaffPermissions(
        businessDetails.id
      );
      setPermissionCategories(categories);

      // Load current staff permissions if editing existing staff
      if (initialData?.id) {
        const currentPerms = await fetchStaffPermissions(initialData.id);
        setSelectedPermissions(new Set(currentPerms.map((p) => p.id)));
      }
    } catch (err) {
      console.error("Failed to load permissions:", err);
    } finally {
      setLoading(false);
    }
  };

  // Reset form when initialData changes
  React.useEffect(() => {
    if (!open || !initialData) return;
    setFirstName(initialData.first_name || "");
    setMiddleName(initialData.middle_name || "");
    setLastName(initialData.last_name || "");
    setEmail(initialData.email || "");
    setPhone(initialData.phone_number || "");
    setTitle(initialData.title || "");
    setError("");
  }, [open, initialData]);

  const togglePermission = (permissionId: number) => {
    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      if (next.has(permissionId)) {
        next.delete(permissionId);
      } else {
        next.add(permissionId);
      }
      return next;
    });
  };

  const toggleCategory = (permissions: any[]) => {
    const allSelected = permissions.every((p) => selectedPermissions.has(p.id));
    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      permissions.forEach((p) => {
        if (allSelected) {
          next.delete(p.id);
        } else {
          next.add(p.id);
        }
      });
      return next;
    });
  };

  const canSubmit = firstName.trim().length > 0 && email.trim().length > 0;

  const handleSave = () => {
    if (!canSubmit) {
      setError("First name and email are required.");
      return;
    }
    if (!email.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }
    onSave({
      first_name: firstName.trim(),
      middle_name: middleName.trim() || undefined,
      last_name: lastName.trim() || undefined,
      email: email.trim(),
      phone_number: phone.trim() || undefined,
      title: title.trim() || undefined,
      permission_ids: Array.from(selectedPermissions),
    });
  };

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title="Edit Staff Member"
      description="Update staff member details and permissions"
      maxWidth={580}
      actions={[
        { label: "Cancel", onClick: onClose, variant: "soft" },
        {
          label: "Save Changes",
          onClick: handleSave,
          variant: "solid",
          disabled: !canSubmit,
        },
      ]}
    >
      <Container>
        <FormControl>
          <FormLabel>First Name *</FormLabel>
          <Input
            placeholder="John"
            type="text"
            size="md"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Middle Name</FormLabel>
          <Input
            placeholder="M."
            type="text"
            size="md"
            value={middleName}
            onChange={(e) => setMiddleName(e.target.value)}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Last Name</FormLabel>
          <Input
            placeholder="Doe"
            type="text"
            size="md"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Email *</FormLabel>
          <Input
            placeholder="example@gmail.com"
            type="email"
            size="md"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Phone Number</FormLabel>
          <Input
            placeholder="09*********"
            type="tel"
            size="md"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Title / Position</FormLabel>
          <Input
            placeholder="e.g., Manager, Receptionist, Front Desk"
            type="text"
            size="md"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <FormHelperText>
            Descriptive title for this staff member's role
          </FormHelperText>
        </FormControl>

        <Divider sx={{ my: 2 }} />

        <Box>
          <Typography.Label sx={{ mb: 1 }}>Manage Permissions</Typography.Label>
          <Typography.Body size="sm" sx={{ color: "text.secondary", mb: 2 }}>
            Select the permissions this staff member should have
          </Typography.Body>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size="sm" />
            </Box>
          ) : permissionCategories.length === 0 ? (
            <FormHelperText>No permissions available.</FormHelperText>
          ) : (
            <PermissionSelector
              categories={permissionCategories}
              selectedPermissions={selectedPermissions}
              onTogglePermission={togglePermission}
              onToggleCategory={toggleCategory}
            />
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box>
          <Typography.Label>Password Management</Typography.Label>
          <Typography.Body size="sm" sx={{ mb: 2, color: "text.secondary" }}>
            Reset password to generate and send a new temporary password to the
            staff member's email.
          </Typography.Body>
          <Button
            variant="outlined"
            colorScheme="warning"
            startDecorator={<RotateCw size={16} />}
            onClick={onResetPassword}
            fullWidth
          >
            Reset Password
          </Button>
        </Box>
      </Container>
      {error ? (
        <FormHelperText sx={{ color: "danger.500", mt: 1 }}>
          {error}
        </FormHelperText>
      ) : null}
    </BaseModal>
  );
}
