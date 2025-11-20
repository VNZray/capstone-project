import * as React from "react";
import BaseEditModal from "@/src/components/BaseEditModal";
import { FormControl, FormLabel, Input, Select, Option, FormHelperText } from "@mui/joy";

export type StaffRole = "Manager" | "Cashier" | "Front Desk" | "Housekeeping" | "Staff";

export type StaffFormData = {
  first_name: string;
  last_name?: string;
  email: string;
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
  { label: "Cashier", value: "Cashier" },
  { label: "Front Desk", value: "Front Desk" },
  { label: "Housekeeping", value: "Housekeeping" },
  { label: "Staff", value: "Staff" },
];

const StaffAddModal: React.FC<StaffAddModalProps> = ({ open, onClose, onSave }) => {
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [role, setRole] = React.useState<StaffRole>("Staff");
  const [error, setError] = React.useState<string>("");

  React.useEffect(() => {
    if (!open) return;
    // reset on open to always start clean
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setRole("Staff");
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
      maxWidth={720}
      actions={[
        { label: "Cancel", onClick: onClose },
        { label: "Add", onClick: handleSave, variant: "primary", disabled: !canSubmit },
      ]}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 12,
        }}
      >
        <FormControl>
          <FormLabel>First Name</FormLabel>
          <Input
            type="text"
            size="md"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Last Name</FormLabel>
          <Input
            type="text"
            size="md"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Email</FormLabel>
          <Input
            type="email"
            size="md"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Phone Number</FormLabel>
          <Input
            type="tel"
            size="md"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Role</FormLabel>
          <Select value={role} onChange={(_e, val) => val && setRole(val)}>
            {ROLE_OPTIONS.map((opt) => (
              <Option key={opt.value} value={opt.value}>
                {opt.label}
              </Option>
            ))}
          </Select>
        </FormControl>
      </div>
      {error ? (
        <FormHelperText color="danger" sx={{ mt: 1 }}>
          {error}
        </FormHelperText>
      ) : null}
    </BaseEditModal>
  );
}

export default StaffAddModal;