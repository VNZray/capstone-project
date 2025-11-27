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

export type StaffRole = "Manager" | "Room Manager" | "Receptionist";

export type StaffFormData = {
  first_name: string;
  last_name?: string;
  email: string;
  password: string;
  phone_number?: string;
  role: StaffRole;
};

type StaffAddModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: (data: StaffFormData) => void;
};

const ROLE_OPTIONS: { label: string; value: StaffRole }[] = [
  { label: "Manager", value: "Manager" },
  { label: "Room Manager", value: "Room Manager" },
  { label: "Receptionist", value: "Receptionist" },
];

export default function StaffAddModal({
  open,
  onClose,
  onSave,
}: StaffAddModalProps) {
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [password, setPassword] = React.useState("123456");
  const [role, setRole] = React.useState<StaffRole>("Manager");
  const [error, setError] = React.useState<string>("");

  React.useEffect(() => {
    if (!open) return;
    // reset on open to always start clean
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setPassword("123456");
    setRole("Manager");
    setError("");
  }, [open]);

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
          <Select value={role} onChange={(_e, val) => val && setRole(val)}>
            {ROLE_OPTIONS.map((opt) => (
              <Option key={opt.value} value={opt.value}>
                {opt.label}
              </Option>
            ))}
          </Select>
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
