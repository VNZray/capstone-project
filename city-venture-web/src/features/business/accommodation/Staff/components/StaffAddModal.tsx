import * as React from "react";
import BaseEditModal from "@/src/components/BaseEditModal";
import {
  FormControl,
  FormLabel,
  Input,
  Select,
  Option,
  FormHelperText,
} from "@mui/joy";
import Container from "@/src/components/Container";
import { fetchRolesByBusinessId, type Role } from "@/src/services/manage-staff/StaffService";
import { useBusiness } from "@/src/context/BusinessContext";

export type StaffFormData = {
  first_name: string;
  last_name?: string;
  email: string;
  password: string;
  phone_number?: string;
  role: string;
};

type StaffAddModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: (data: StaffFormData) => void;
};

export default function StaffAddModal({
  open,
  onClose,
  onSave,
}: StaffAddModalProps) {
  const { businessDetails } = useBusiness();
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [password, setPassword] = React.useState("123456");
  const [role, setRole] = React.useState<string>("");
  const [error, setError] = React.useState<string>("");
  const [businessRoles, setBusinessRoles] = React.useState<Role[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    // reset on open to always start clean
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setPassword("123456");
    setRole("");
    setError("");
    loadBusinessRoles();
  }, [open, businessDetails?.id]);

  const loadBusinessRoles = async () => {
    if (!businessDetails?.id) return;
    
    setLoading(true);
    try {
      const roles = await fetchRolesByBusinessId(businessDetails.id);
      setBusinessRoles(roles);
      console.log("Loaded business roles:", roles);
    } catch (err) {
      console.error("Failed to load business roles:", err);
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = firstName.trim().length > 0 && email.trim().length > 0 && role.length > 0;

  const handleSave = () => {
    if (!canSubmit) {
      setError("First name, email, and role are required.");
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
      role,
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
          <Select 
            value={role} 
            onChange={(_e, val) => val && setRole(val)}
            disabled={loading || businessRoles.length === 0}
            placeholder={businessRoles.length === 0 ? "No roles available. Create one first." : "Select a role"}
          >
            {businessRoles.map((businessRole) => (
              <Option key={businessRole.id} value={businessRole.role_name}>
                {businessRole.role_name}
              </Option>
            ))}
          </Select>
          {businessRoles.length === 0 && !loading && (
            <FormHelperText>
              Please create a role in "Manage Roles & Permissions" first.
            </FormHelperText>
          )}
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
