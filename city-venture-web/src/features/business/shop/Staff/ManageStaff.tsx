import { useState } from "react";
import Container from "@/src/components/Container";
import PageContainer from "@/src/components/PageContainer";
import ResponsiveText from "@/src/components/ResponsiveText";
import Button from "@/src/components/Button";
import StaffAddModal, { type StaffRole } from "@/src/components/StaffAddModal";
import { Select, Option } from "@mui/joy";

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
  // Staff list
  const [staff, setStaff] = useState<Staff[]>([]);
  const [addOpen, setAddOpen] = useState(false);

  const handleAddStaff = (data: { first_name: string; last_name?: string; email: string; phone_number?: string; role: StaffRole; }) => {
    const item: Staff = {
      id: uuid(),
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone_number: data.phone_number,
      role: data.role,
      is_active: true,
    };
    setStaff((prev) => [item, ...prev]);
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
      {/* Add Staff Modal trigger */}
      <Container elevation={3}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <ResponsiveText type="sub-title-small" weight="semi-bold" mb={0}>
            Team
          </ResponsiveText>
          <Button variant="primary" onClick={() => setAddOpen(true)}>Add Staff</Button>
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
                  <div>
                    <Select value={s.role} onChange={(_e, val) => val && handleChangeRole(s.id, val)}>
                      {ROLE_OPTIONS.map((opt) => (
                        <Option key={opt.value} value={opt.value}>
                          {opt.label}
                        </Option>
                      ))}
                    </Select>
                  </div>
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
      <StaffAddModal open={addOpen} onClose={() => setAddOpen(false)} onSave={handleAddStaff} />
    </PageContainer>
  );
};

export default ManageStaff;
