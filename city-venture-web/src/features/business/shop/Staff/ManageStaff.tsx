import { useMemo, useState } from "react";
import Container from "@/src/components/Container";
import PageContainer from "@/src/components/PageContainer";
import ResponsiveText from "@/src/components/ResponsiveText";
import Input from "@/src/components/Input";
import Button from "@/src/components/Button";

type StaffRole = "Manager" | "Cashier" | "Front Desk" | "Housekeeping" | "Staff";

type Staff = {
  id: string;
  first_name: string;
  last_name?: string;
  email: string;
  phone_number?: string;
  role: StaffRole;
  is_active: boolean;
};

const ROLE_OPTIONS: { label: string; value: StaffRole }[] = [
  { label: "Manager", value: "Manager" },
  { label: "Cashier", value: "Cashier" },
  { label: "Front Desk", value: "Front Desk" },
  { label: "Housekeeping", value: "Housekeeping" },
  { label: "Staff", value: "Staff" },
];

const uuid = () => crypto.randomUUID();

const ManageStaff = () => {
  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<StaffRole>("Staff");
  const [error, setError] = useState<string>("");

  // Staff list
  const [staff, setStaff] = useState<Staff[]>([]);

  const canAdd = useMemo(() => firstName.trim() && email.trim(), [firstName, email]);

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setRole("Staff");
    setError("");
  };

  const handleAddStaff = () => {
    if (!canAdd) {
      setError("First name and email are required.");
      return;
    }
    // Very light validation
    if (!email.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }
    const item: Staff = {
      id: uuid(),
      first_name: firstName.trim(),
      last_name: lastName.trim() || undefined,
      email: email.trim(),
      phone_number: phone.trim() || undefined,
      role,
      is_active: true,
    };
    setStaff((prev) => [item, ...prev]);
    resetForm();
  };

  const handleChangeRole = (id: string, next: StaffRole) => {
    setStaff((prev) => prev.map((s) => (s.id === id ? { ...s, role: next } : s)));
  };

  const handleToggleActive = (id: string) => {
    setStaff((prev) => prev.map((s) => (s.id === id ? { ...s, is_active: !s.is_active } : s)));
  };

  const handleRemove = (id: string) => {
    setStaff((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <PageContainer>
      {/* Header */}
      <Container padding="0">
        <ResponsiveText type="title-small" weight="bold">
          Staff Management
        </ResponsiveText>
      </Container>

      {/* Add Staff Form */}
      <Container elevation={3}>
        <ResponsiveText type="sub-title-small" weight="semi-bold" mb={0.25}>
          Add Staff
        </ResponsiveText>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 12,
          }}
        >
          <Input
            type="text"
            label="First Name"
            value={firstName}
            onChange={(e) => setFirstName((e.target as HTMLInputElement).value)}
          />
          <Input
            type="text"
            label="Last Name"
            value={lastName}
            onChange={(e) => setLastName((e.target as HTMLInputElement).value)}
          />
          <Input
            type="email"
            label="Email"
            value={email}
            onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
          />
          <Input
            type="text"
            label="Phone Number"
            value={phone}
            onChange={(e) => setPhone((e.target as HTMLInputElement).value)}
          />
          <Input
            type="select"
            label="Role"
            value={role}
            onChange={(e) => setRole(e.target.value as StaffRole)}
            options={ROLE_OPTIONS}
          />
        </div>
        {error ? (
          <ResponsiveText type="body-small" color="#c00" mt={0.5}>
            {error}
          </ResponsiveText>
        ) : null}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
          <Button variant="primary" onClick={handleAddStaff} disabled={!canAdd}>
            Add Staff
          </Button>
        </div>
      </Container>

      {/* Staff List */}
      <Container>
        <ResponsiveText type="sub-title-small" weight="semi-bold" mb={0.25}>
          Team Members
        </ResponsiveText>
        {staff.length === 0 ? (
          <ResponsiveText type="body-medium" color="#666">
            No staff yet. Add your first team member above.
          </ResponsiveText>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 12,
            }}
          >
            {staff.map((s) => (
              <Container key={s.id} elevation={2} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <ResponsiveText type="card-title-small" weight="bold">
                    {s.first_name} {s.last_name || ""}
                  </ResponsiveText>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      padding: "2px 8px",
                      borderRadius: 999,
                      background: s.is_active ? "#e6f7ee" : "#f4f4f4",
                      color: s.is_active ? "#0a8f5a" : "#666",
                    }}
                  >
                    {s.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <ResponsiveText type="card-sub-title-small" color="#555">
                  {s.role}
                </ResponsiveText>
                <ResponsiveText type="body-small" color="#444">
                  {s.email}
                </ResponsiveText>
                {s.phone_number ? (
                  <ResponsiveText type="body-small" color="#444">
                    {s.phone_number}
                  </ResponsiveText>
                ) : null}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <Input
                    type="select"
                    label="Change Role"
                    value={s.role}
                    onChange={(e) => handleChangeRole(s.id, e.target.value as StaffRole)}
                    options={ROLE_OPTIONS}
                  />
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
                    <Button
                      variant={s.is_active ? "secondary" : "primary"}
                      onClick={() => handleToggleActive(s.id)}
                      style={{ width: "100%" }}
                    >
                      {s.is_active ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button variant="cancel" onClick={() => handleRemove(s.id)}>
                    Remove
                  </Button>
                </div>
              </Container>
            ))}
          </div>
        )}
      </Container>
    </PageContainer>
  );
};

export default ManageStaff;
