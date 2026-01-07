import * as React from "react";
import BaseEditModal from "@/src/components/BaseEditModal";
import {
  FormControl,
  FormLabel,
  Input,
  FormHelperText,
  CircularProgress,
  Checkbox,
  Box,
  Chip,
  Tooltip,
} from "@mui/joy";
import Typography from "@/src/components/Typography";
import { ChevronDown, ChevronUp, Mail, Phone, User, Briefcase, Shield, AlertCircle } from "lucide-react";
import { 
  fetchAvailableStaffPermissions, 
  type PermissionCategory,
  type Permission 
} from "@/src/services/manage-staff/StaffService";

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
  const [selectedPermissions, setSelectedPermissions] = React.useState<Set<number>>(new Set());
  const [error, setError] = React.useState<string>("");
  const [permissionCategories, setPermissionCategories] = React.useState<PermissionCategory[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [expandedCategories, setExpandedCategories] = React.useState<Set<string>>(new Set());

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
    setExpandedCategories(new Set());
    setError("");
  }, [open]);

  const togglePermission = (permissionId: number) => {
    setSelectedPermissions(prev => {
      const next = new Set(prev);
      if (next.has(permissionId)) {
        next.delete(permissionId);
      } else {
        next.add(permissionId);
      }
      return next;
    });
  };

  const toggleCategory = (permissions: Permission[]) => {
    const allSelected = permissions.every(p => selectedPermissions.has(p.id));
    setSelectedPermissions(prev => {
      const next = new Set(prev);
      permissions.forEach(p => {
        if (allSelected) {
          next.delete(p.id);
        } else {
          next.add(p.id);
        }
      });
      return next;
    });
  };

  const toggleCategoryExpanded = (categoryName: string) => {
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

  const totalPermissions = permissionCategories.reduce((acc, cat) => acc + cat.permissions.length, 0);

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
            <AlertCircle size={16} style={{ color: "var(--joy-palette-danger-500)" }} />
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
              First Name <Typography.Body component="span" sx={{ color: "danger.500" }}>*</Typography.Body>
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
            <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 0.5 }}>Last Name</FormLabel>
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
              Email <Typography.Body component="span" sx={{ color: "danger.500" }}>*</Typography.Body>
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
            <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 0.5 }}>Phone</FormLabel>
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
          <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 0.5 }}>Title / Position</FormLabel>
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

        {/* Permissions Section - Compact */}
        <Box sx={{ mt: 0.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Shield size={14} style={{ opacity: 0.6 }} />
            <Typography.Label sx={{ fontSize: "12px" }}>Permissions</Typography.Label>
            <Chip size="sm" variant="soft" color="neutral" sx={{ fontSize: "11px", height: "20px" }}>
              {selectedPermissions.size}/{totalPermissions} selected
            </Chip>
          </Box>
          
          {loading ? (
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", py: 3 }}>
              <CircularProgress size="sm" />
            </Box>
          ) : permissionCategories.length === 0 ? (
            <FormHelperText sx={{ fontSize: "12px" }}>No permissions available.</FormHelperText>
          ) : (
            <Box
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "8px",
                overflow: "hidden",
                maxHeight: "200px",
                overflowY: "auto",
              }}
            >
              {permissionCategories.map((category, idx) => {
                const allSelected = category.permissions.every(p => selectedPermissions.has(p.id));
                const someSelected = category.permissions.some(p => selectedPermissions.has(p.id));
                const isExpanded = expandedCategories.has(category.category_name);
                const selectedCount = category.permissions.filter(p => selectedPermissions.has(p.id)).length;
                
                return (
                  <Box
                    key={category.category_name}
                    sx={{
                      borderBottom: idx < permissionCategories.length - 1 ? "1px solid" : "none",
                      borderColor: "divider",
                    }}
                  >
                    {/* Category Header */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        px: 1.5,
                        py: 1,
                        bgcolor: isExpanded ? "background.level1" : "transparent",
                        cursor: "pointer",
                        transition: "background-color 0.15s",
                        "&:hover": { bgcolor: "background.level1" },
                      }}
                      onClick={() => toggleCategoryExpanded(category.category_name)}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Checkbox
                          checked={allSelected}
                          indeterminate={someSelected && !allSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleCategory(category.permissions);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          size="sm"
                          sx={{ "--Checkbox-size": "16px" }}
                        />
                        <Typography.Body size="sm" weight="medium" sx={{ fontSize: "13px" }}>
                          {category.category_name}
                        </Typography.Body>
                        <Chip 
                          size="sm" 
                          variant="soft" 
                          color={selectedCount > 0 ? "primary" : "neutral"}
                          sx={{ fontSize: "10px", height: "18px", minHeight: "18px" }}
                        >
                          {selectedCount}/{category.permissions.length}
                        </Chip>
                      </Box>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </Box>

                    {/* Expanded Permissions */}
                    {isExpanded && (
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                          gap: 0.5,
                          px: 1.5,
                          py: 1,
                          bgcolor: "background.level1",
                        }}
                      >
                        {category.permissions.map((permission) => (
                          <Tooltip
                            key={permission.id}
                            title={permission.description || permission.name}
                            placement="top"
                            arrow
                            size="sm"
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.75,
                                py: 0.5,
                                px: 0.75,
                                borderRadius: "4px",
                                cursor: "pointer",
                                transition: "background-color 0.1s",
                                "&:hover": { bgcolor: "background.level2" },
                              }}
                              onClick={() => togglePermission(permission.id)}
                            >
                              <Checkbox
                                checked={selectedPermissions.has(permission.id)}
                                onChange={() => togglePermission(permission.id)}
                                size="sm"
                                sx={{ "--Checkbox-size": "14px" }}
                              />
                              <Typography.Body 
                                size="sm" 
                                sx={{ 
                                  fontSize: "12px",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {permission.name}
                              </Typography.Body>
                            </Box>
                          </Tooltip>
                        ))}
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      </Box>
    </BaseEditModal>
  );
}
