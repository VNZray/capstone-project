import * as React from "react";
import BaseEditModal from "@/src/components/BaseEditModal";
import {
  FormControl,
  FormLabel,
  Input,
  Select,
  Option,
  FormHelperText,
  CircularProgress,
  Chip,
  ListItemDecorator,
} from "@mui/joy";
import Container from "@/src/components/Container";
import { fetchAvailableRolesForStaff, type Role } from "@/src/services/manage-staff/StaffService";

export type StaffFormData = {
  first_name: string;
  last_name?: string;
  email: string;
  password: string;
  phone_number?: string;
  role_id: number;
  role_name?: string;
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
  const [roleId, setRoleId] = React.useState<number | null>(null);
  const [error, setError] = React.useState<string>("");
  const [businessRoles, setBusinessRoles] = React.useState<Role[]>([]);
  const [loading, setLoading] = React.useState(false);

  // Load business roles and preset roles when modal opens
  React.useEffect(() => {
    if (!open || !businessId) return;
    loadAvailableRoles();
  }, [open, businessId]);

  const loadAvailableRoles = async () => {
    setLoading(true);
    try {
      // Fetch both business roles and preset roles
      const roles = await fetchAvailableRolesForStaff(businessId);
      setBusinessRoles(roles);
      // Set default role to first available
      if (roles.length > 0 && !roleId) {
        setRoleId(roles[0].id);
      }
    } catch (err) {
      console.error("Failed to load roles:", err);
      setError("Failed to load roles. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (!open) return;
    // reset on open to always start clean
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setPassword("123456");
    setRoleId(null);
    setError("");
  }, [open]);

  const canSubmit = firstName.trim().length > 0 && email.trim().length > 0 && roleId !== null;

  const handleSave = () => {
    if (!canSubmit || roleId === null) {
      setError("First name, email, and role are required.");
      return;
    }
    if (!email.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }
    
    const selectedRole = businessRoles.find(r => r.id === roleId);
    onSave({
      first_name: firstName.trim(),
      last_name: lastName.trim() || undefined,
      email: email.trim(),
      password: password.trim(),
      phone_number: phone.trim() || undefined,
      role_id: roleId,
      role_name: selectedRole?.role_name,
    });

    onClose();
  };

  return (
    <BaseEditModal
      open={open}
      onClose={onClose}
      title="Add Staff"
      description="Create a new staff member and assign a role"
      actions={[
        { label: "Cancel", onClick: onClose },
        {
          label: "Add",
          onClick: handleSave,
          variant: "primary",
          disabled: !canSubmit,
        },
      ]}
    >
      <Container padding="0">
        <FormControl>
          <FormLabel>First Name</FormLabel>
          <Input
            placeholder="John"
            type="text"
            size="md"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
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
          <FormLabel>Email</FormLabel>
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
          <FormLabel>Assign Role</FormLabel>
          {loading ? (
            <CircularProgress size="sm" />
          ) : businessRoles.length === 0 ? (
            <FormHelperText>
              No roles available. Please create a role in Staff Roles first.
            </FormHelperText>
          ) : (
            <Select
              value={roleId}
              onChange={(_e, val) => val !== null && setRoleId(val)}
              placeholder="Select a role"
            >
              {businessRoles.map((r) => (
                <Option key={r.id} value={r.id}>
                  {r.role_type === 'preset' && (
                    <ListItemDecorator>
                      <Chip size="sm" variant="soft" color="primary" sx={{ mr: 1 }}>
                        Template
                      </Chip>
                    </ListItemDecorator>
                  )}
                  {r.role_type === 'business' && r.is_custom && (
                    <ListItemDecorator>
                      <Chip size="sm" variant="soft" color="success" sx={{ mr: 1 }}>
                        Custom
                      </Chip>
                    </ListItemDecorator>
                  )}
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span>{r.role_name}</span>
                    {r.role_description && (
                      <span style={{ color: '#888', fontSize: '0.85em' }}>
                        – {r.role_description}
                      </span>
                    )}
                  </div>
                </Option>
              ))}
            </Select>
          )}
          <FormHelperText>
            Template roles are standard presets. Custom roles are specific to your business.
          </FormHelperText>
        </FormControl>
      </Container>
      {error ? (
        <FormHelperText color="danger" sx={{ mt: 1 }}>
          {error}
        </FormHelperText>
      ) : null}
    </BaseEditModal>
  );
}
