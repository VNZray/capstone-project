import * as React from "react";
import BaseEditModal from "@/src/components/BaseEditModal";
import {
  FormControl,
  FormLabel,
  Input,
  FormHelperText,
  Divider,
  Box,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Sheet,
  CircularProgress,
} from "@mui/joy";
import Container from "@/src/components/Container";
import Button from "@/src/components/Button";
import { RotateCw, ChevronDown } from "lucide-react";
import Typography from "@/src/components/Typography";
import { useBusiness } from "@/src/context/BusinessContext";
import {
  fetchAvailableStaffPermissions,
  fetchStaffPermissions,
  type PermissionCategory,
  type Permission,
} from "@/src/services/manage-staff/StaffService";

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
  const [selectedPermissions, setSelectedPermissions] = React.useState<Set<number>>(new Set());
  const [error, setError] = React.useState<string>("");
  const [permissionCategories, setPermissionCategories] = React.useState<PermissionCategory[]>([]);
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
      const categories = await fetchAvailableStaffPermissions(businessDetails.id);
      setPermissionCategories(categories);
      
      // Load current staff permissions if editing existing staff
      if (initialData?.id) {
        const currentPerms = await fetchStaffPermissions(initialData.id);
        setSelectedPermissions(new Set(currentPerms.map(p => p.id)));
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
    <BaseEditModal
      open={open}
      onClose={onClose}
      title="Edit Staff Member"
      description="Update staff member details and permissions"
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
      <Container padding="0">
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
          <Typography.Label>Manage Permissions</Typography.Label>
          <Typography.Body size="sm" sx={{ color: "text.secondary", mb: 1 }}>
            Select the permissions this staff member should have
          </Typography.Body>
          
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
              <CircularProgress size="sm" />
            </Box>
          ) : permissionCategories.length === 0 ? (
            <FormHelperText>
              No permissions available.
            </FormHelperText>
          ) : (
            <Sheet variant="outlined" sx={{ borderRadius: "sm", overflow: "hidden", maxHeight: 300, overflowY: "auto" }}>
              {permissionCategories.map((category) => {
                const allSelected = category.permissions.every(p => selectedPermissions.has(p.id));
                const someSelected = category.permissions.some(p => selectedPermissions.has(p.id));
                
                return (
                  <Accordion key={category.category_name}>
                    <AccordionSummary
                      indicator={<ChevronDown size={16} />}
                      sx={{ 
                        "& .MuiAccordionSummary-button": { 
                          justifyContent: "space-between" 
                        }
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Checkbox
                          checked={allSelected}
                          indeterminate={someSelected && !allSelected}
                          onChange={() => toggleCategory(category.permissions)}
                          onClick={(e) => e.stopPropagation()}
                          size="sm"
                        />
                        <Typography.Label>{category.category_name}</Typography.Label>
                        <Typography.Body size="sm" sx={{ color: "text.tertiary" }}>
                          ({category.permissions.filter(p => selectedPermissions.has(p.id)).length}/{category.permissions.length})
                        </Typography.Body>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box sx={{ pl: 4, display: "flex", flexDirection: "column", gap: 1 }}>
                        {category.permissions.map((permission) => (
                          <Box 
                            key={permission.id} 
                            sx={{ 
                              display: "flex", 
                              alignItems: "flex-start", 
                              gap: 1,
                              cursor: "pointer",
                              "&:hover": { bgcolor: "background.level1" },
                              p: 0.5,
                              borderRadius: "sm"
                            }}
                            onClick={() => togglePermission(permission.id)}
                          >
                            <Checkbox
                              checked={selectedPermissions.has(permission.id)}
                              onChange={() => togglePermission(permission.id)}
                              size="sm"
                            />
                            <Box>
                              <Typography.Body size="sm">{permission.name}</Typography.Body>
                              {permission.description && (
                                <Typography.Body size="sm" sx={{ color: "text.tertiary" }}>
                                  {permission.description}
                                </Typography.Body>
                              )}
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            </Sheet>
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
    </BaseEditModal>
  );
}
