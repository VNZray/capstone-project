import * as React from "react";
import BaseEditModal from "@/src/components/BaseEditModal";
import {
  FormControl,
  FormLabel,
  Input,
  FormHelperText,
  CircularProgress,
  Box,
} from "@mui/joy";
import Typography from "@/src/components/Typography";
import { Mail, Phone, User, Briefcase, AlertCircle } from "lucide-react";
import {
  fetchAvailableStaffPermissions,
  type PermissionCategory,
} from "@/src/services/manage-staff/StaffService";
import PermissionSelector from "./PermissionSelector";

export type StaffFormData = {
  first_name: string;
  last_name?: string;
  email: string;
  password: string;
  phone_number?: string;
  title?: string;
  permission_ids: number[];
};

type StaffAddModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: (data: StaffFormData) => void;
  businessId: string;
};

export default function StaffAddModal({
  open,
  onClose,
  onSave,
  businessId,
}: StaffAddModalProps) {
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [password, setPassword] = React.useState("123456");
  const [title, setTitle] = React.useState("");
  const [selectedPermissions, setSelectedPermissions] = React.useState<
    Set<number>
  >(new Set());
  const [error, setError] = React.useState<string>("");
  const [permissionCategories, setPermissionCategories] = React.useState<
    PermissionCategory[]
  >([]);
  const [loading, setLoading] = React.useState(false);

  // Load available permissions when modal opens
  React.useEffect(() => {
    if (!open || !businessId) return;
    loadAvailablePermissions();
  }, [open, businessId]);

  const loadAvailablePermissions = async () => {
    setLoading(true);
    try {
      const categories = await fetchAvailableStaffPermissions(businessId);
      setPermissionCategories(categories);
    } catch (err) {
      console.error("Failed to load permissions:", err);
      setError("Failed to load permissions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Reset form when modal opens
  React.useEffect(() => {
    if (!open) return;
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setPassword("123456");
    setTitle("");
    setSelectedPermissions(new Set());
    setError("");
  }, [open]);

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
      last_name: lastName.trim() || undefined,
      email: email.trim(),
      password: password.trim(),
      phone_number: phone.trim() || undefined,
      title: title.trim() || undefined,
      permission_ids: Array.from(selectedPermissions),
    });

    onClose();
  };

  return (
    <BaseEditModal
      open={open}
      onClose={onClose}
      title="Add Staff Member"
      maxWidth={520}
      actions={[
        { label: "Cancel", onClick: onClose },
        {
          label: "Add Staff",
          onClick: handleSave,
          variant: "primary",
          disabled: !canSubmit,
        },
      ]}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
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

        {/* Basic Information - Compact Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 1.5,
          }}
        >
          <FormControl size="sm">
            <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 0.5 }}>
              First Name{" "}
              <Typography.Body component="span" sx={{ color: "danger.500" }}>
                *
              </Typography.Body>
            </FormLabel>
            <Input
              placeholder="John"
              type="text"
              size="sm"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              startDecorator={<User size={14} style={{ opacity: 0.5 }} />}
              sx={{ "--Input-radius": "6px" }}
            />
          </FormControl>
          <FormControl size="sm">
            <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 0.5 }}>
              Last Name
            </FormLabel>
            <Input
              placeholder="Doe"
              type="text"
              size="sm"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              sx={{ "--Input-radius": "6px" }}
            />
          </FormControl>
        </Box>

        {/* Contact Information - Compact Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 1.5,
          }}
        >
          <FormControl size="sm">
            <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 0.5 }}>
              Email{" "}
              <Typography.Body component="span" sx={{ color: "danger.500" }}>
                *
              </Typography.Body>
            </FormLabel>
            <Input
              placeholder="staff@business.com"
              type="email"
              size="sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              startDecorator={<Mail size={14} style={{ opacity: 0.5 }} />}
              sx={{ "--Input-radius": "6px" }}
            />
          </FormControl>
          <FormControl size="sm">
            <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 0.5 }}>
              Phone
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
        </Box>

        {/* Title/Position - Full Width */}
        <FormControl size="sm">
          <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 0.5 }}>
            Title / Position
          </FormLabel>
          <Input
            placeholder="e.g., Manager, Receptionist"
            type="text"
            size="sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            startDecorator={<Briefcase size={14} style={{ opacity: 0.5 }} />}
            sx={{ "--Input-radius": "6px" }}
          />
        </FormControl>

        {/* Permissions Section */}
        <Box sx={{ mt: 1 }}>
          {loading ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                py: 4,
              }}
            >
              <CircularProgress size="sm" />
            </Box>
          ) : permissionCategories.length === 0 ? (
            <FormHelperText sx={{ fontSize: "12px" }}>
              No permissions available.
            </FormHelperText>
          ) : (
            <PermissionSelector
              categories={permissionCategories}
              selectedPermissions={selectedPermissions}
              onTogglePermission={togglePermission}
              onToggleCategory={toggleCategory}
            />
          )}
        </Box>
      </Box>
    </BaseEditModal>
  );
}
