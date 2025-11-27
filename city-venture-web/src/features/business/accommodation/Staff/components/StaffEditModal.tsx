import * as React from "react";
import BaseEditModal from "@/src/components/BaseEditModal";
import {
  FormControl,
  FormLabel,
  Input,
  Select,
  Option,
  FormHelperText,
  Divider,
  Box,
} from "@mui/joy";
import Container from "@/src/components/Container";
import Button from "@/src/components/Button";
import { RotateCw } from "lucide-react";
import Typography from "@/src/components/Typography";
import { fetchRolesByBusinessId, type Role } from "@/src/services/manage-staff/StaffService";
import { useBusiness } from "@/src/context/BusinessContext";

export type StaffEditData = {
  first_name: string;
  middle_name?: string;
  last_name?: string;
  email: string;
  phone_number?: string;
  role: string;
};

type StaffEditModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: (data: StaffEditData) => void;
  onResetPassword: () => void;
  initialData?: StaffEditData;
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
  const [role, setRole] = React.useState<string>("");
  const [error, setError] = React.useState<string>("");
  const [businessRoles, setBusinessRoles] = React.useState<Role[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    loadBusinessRoles();
  }, [open, businessDetails?.id]);

  React.useEffect(() => {
    if (!open || !initialData) return;
    setFirstName(initialData.first_name || "");
    setMiddleName(initialData.middle_name || "");
    setLastName(initialData.last_name || "");
    setEmail(initialData.email || "");
    setPhone(initialData.phone_number || "");
    setRole(initialData.role || "");
    setError("");
  }, [open, initialData]);

  const loadBusinessRoles = async () => {
    if (!businessDetails?.id) return;
    
    setLoading(true);
    try {
      const roles = await fetchRolesByBusinessId(businessDetails.id);
      setBusinessRoles(roles);
    } catch (err) {
      console.error("Failed to load business roles:", err);
    } finally {
      setLoading(false);
    }
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
      role,
    });
  };

  return (
    <BaseEditModal
      open={open}
      onClose={onClose}
      title="Edit Staff Member"
      description="Update staff member details or reset their password"
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
            placeholder={businessRoles.length === 0 ? "No roles available" : "Select a role"}
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
        <FormHelperText color="danger" sx={{ mt: 1 }}>
          {error}
        </FormHelperText>
      ) : null}
    </BaseEditModal>
  );
}
