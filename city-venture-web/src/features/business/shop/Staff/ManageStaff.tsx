import { useState } from "react";
import Container from "@/src/components/Container";
import PageContainer from "@/src/components/PageContainer";
import ResponsiveText from "@/src/components/ResponsiveText";
import StaffAddModal, { type StaffRole } from "@/src/components/StaffAddModal";
import { Input } from "@mui/joy";
import StaffCard from "./components/StaffCard";
import { Search } from "lucide-react";
import NoDataFound from "@/src/components/NoDataFound";
import Button from "@/src/components/Button";
import IconButton from "@/src/components/IconButton";
import { Add } from "@mui/icons-material";

type Staff = {
  id: string;
  first_name: string;
  last_name?: string;
  email: string;
  phone_number?: string;
  role: StaffRole;
  is_active: boolean;
};

// Commented out for now - can be reactivated when implementing role management
// const ROLE_OPTIONS: { label: string; value: StaffRole }[] = [
//   { label: "Manager", value: "Manager" },
//   { label: "Cashier", value: "Cashier" },
//   { label: "Front Desk", value: "Front Desk" },
//   { label: "Housekeeping", value: "Housekeeping" },
//   { label: "Staff", value: "Staff" },
// ];

const uuid = () => crypto.randomUUID();

const ManageStaff = () => {
  // Staff list
  const [staff, setStaff] = useState<Staff[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleAddStaff = (data: {
    first_name: string;
    last_name?: string;
    email: string;
    phone_number?: string;
    role: StaffRole;
  }) => {
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

  // Commented out for now - can be reactivated when implementing staff management actions
  // const handleChangeRole = (id: string, next: StaffRole) => {
  //   setStaff((prev) =>
  //     prev.map((s) => (s.id === id ? { ...s, role: next } : s))
  //   );
  // };

  // const handleToggleActive = (id: string) => {
  //   setStaff((prev) =>
  //     prev.map((s) => (s.id === id ? { ...s, is_active: !s.is_active } : s))
  //   );
  // };

  // const handleRemove = (id: string) => {
  //   setStaff((prev) => prev.filter((s) => s.id !== id));
  // };

  // Filter staff based on search term
  const filteredStaff = staff.filter((s) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      s.first_name.toLowerCase().includes(searchLower) ||
      s.last_name?.toLowerCase().includes(searchLower) ||
      s.email.toLowerCase().includes(searchLower) ||
      s.phone_number?.toLowerCase().includes(searchLower) ||
      s.role.toLowerCase().includes(searchLower)
    );
  });

  return (
    <PageContainer>
      {/* Header */}
      <Container gap="0" padding="0" elevation={3}>
        <Container
          direction="row"
          justify="space-between"
          align="center"
          padding="16px 16px 0 16px"
        >
          <ResponsiveText type="title-small" weight="bold">
            Manage Staff
          </ResponsiveText>
        </Container>

        <IconButton
          onClick={() => setAddOpen(true)}
          size="lg"
          floating
          floatPosition="bottom-right"
          hoverEffect="rotate"
        >
          <Add />
        </IconButton>

        {/* Search + Filters */}
        <Container
          direction="row"
          justify="space-between"
          align="center"
          gap="16px"
        >
          <Input
            startDecorator={<Search />}
            placeholder="Search Staff"
            size="lg"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} // 👈 bind state
          />
        </Container>
      </Container>

      {/* Staff List */}
      <Container padding="0 16px 16px 16px">
        <ResponsiveText type="sub-title-small" weight="semi-bold">
          Team Members
        </ResponsiveText>
        {staff.length === 0 ? (
          <NoDataFound
            icon="database"
            title="No Staff Yet"
            message="No staff members yet. Add your first team member above."
          >
            <Button
              startDecorator={<Add />}
              size="lg"
              onClick={() => setAddOpen(true)}
            >
              Add Staff
            </Button>
          </NoDataFound>
        ) : filteredStaff.length === 0 ? (
          <NoDataFound
            icon="search"
            title="No Results Found"
            message={`No staff members match "${searchTerm}". Try a different search term.`}
          />
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
              gap: 20,
            }}
          >
            {filteredStaff.map((s) => (
              <StaffCard key={s.id} email={s.email} password="******" />
            ))}
          </div>
        )}
      </Container>
      <StaffAddModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSave={handleAddStaff}
      />
    </PageContainer>
  );
};

export default ManageStaff;
