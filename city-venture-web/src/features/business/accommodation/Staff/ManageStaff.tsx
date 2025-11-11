import { useState, useEffect } from "react";
import axios from "axios";
import Container from "@/src/components/Container";
import PageContainer from "@/src/components/PageContainer";
import Typography from "@/src/components/Typography";
import StaffAddModal, {
  type StaffRole,
} from "@/src/features/business/accommodation/Staff/components/StaffAddModal";
import { Input } from "@mui/joy";
import StaffCard from "./components/StaffCard";
import { Search } from "lucide-react";
import NoDataFound from "@/src/components/NoDataFound";
import Button from "@/src/components/Button";
import IconButton from "@/src/components/IconButton";
import { Add } from "@mui/icons-material";
import { useBusiness } from "@/src/context/BusinessContext";
import api from "@/src/services/api";
import {
  fetchStaffByBusinessId,
  deleteStaffById,
  toggleStaffActive,
  type StaffMember,
} from "@/src/services/manage-staff/StaffService";

type Staff = StaffMember;

// Map staff roles to user_role_id based on database seed
const ROLE_TO_USER_ROLE_ID: Record<StaffRole, number> = {
  Manager: 5, // role_name: "Manager"
  "Room Manager": 6, // role_name: "Room Manager"
  Receptionist: 7, // role_name: "Receptionist"
};

const ManageStaff = () => {
  const { businessDetails } = useBusiness();

  // Staff list and UI state
  const [staff, setStaff] = useState<Staff[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch staff on mount and when business changes
  useEffect(() => {
    if (!businessDetails?.id) return;

    const loadStaff = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchStaffByBusinessId(businessDetails.id as string);
        setStaff(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load staff");
      } finally {
        setLoading(false);
      }
    };

    loadStaff();
  }, [businessDetails?.id]);

  // Add new staff member (Create user first, then staff)
  const handleAddStaff = async (data: {
    first_name: string;
    middle_name?: string | "";
    last_name?: string;
    email: string;
    phone_number?: string;
    role: StaffRole;
  }) => {
    try {
      setError(null);

      // Get the user_role_id based on the selected staff role
      const userRoleId = ROLE_TO_USER_ROLE_ID[data.role];

      // Step 1: Create User Account
      const userRes = await axios.post(`${api}/users`, {
        email: data.email,
        phone_number: data.phone_number || "",
        password: "staff123", // Default temporary password
        barangay_id: 20,
        user_role_id: userRoleId, // Assign role based on staff position
      });

      const userId = userRes?.data?.id;
      if (!userId) throw new Error("Failed to create user account");

      // Step 2: Create Staff Record
      const staffRes = await axios.post(`${api}/staff`, {
        first_name: data.first_name,
        last_name: data.last_name,
        user_id: userId,
        business_id: businessDetails?.id,
      });

      const newStaff: Staff = {
        id: staffRes.data.id,
        first_name: data.first_name,
        middle_name: data.middle_name,
        last_name: data.last_name,
        email: data.email,
        phone_number: data.phone_number,
        role: data.role,
        is_active: true,
        user_id: userId,
        business_id: businessDetails?.id || "",
      };

      setStaff((prev) => [newStaff, ...prev]);
      setAddOpen(false);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to add staff member";
      setError(errorMsg);
      console.error("Error adding staff:", err);
    }
  };

  // Edit staff member
  const handleEdit = (id: string) => {
    console.log("Edit staff:", id);
    // TODO: Implement edit modal
  };

  // Toggle staff active status
  const handleToggleActive = async (id: string) => {
    try {
      const staff_item = staff.find((s) => s.id === id);
      if (!staff_item) return;

      await toggleStaffActive(id, staff_item.is_active);
      setStaff((prev) =>
        prev.map((s) => (s.id === id ? { ...s, is_active: !s.is_active } : s))
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update staff status"
      );
    }
  };

  // Delete staff member
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this staff member?")) return;

    try {
      await deleteStaffById(id);
      setStaff((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete staff member"
      );
    }
  };

  // Filter staff based on search term
  const filteredStaff = staff.filter((s) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      s.first_name.toLowerCase().includes(searchLower) ||
      s.last_name?.toLowerCase().includes(searchLower) ||
      s.email.toLowerCase().includes(searchLower) ||
      s.phone_number?.toLowerCase().includes(searchLower) ||
      (s.role?.toLowerCase() || "").includes(searchLower)
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
          <Typography.Header>Manage Staff</Typography.Header>
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
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Container>
      </Container>

      {/* Error State */}
      {error && (
        <Container padding="16px" elevation={2}>
          <Typography.Body size="sm" sx={{ color: "danger.500" }}>
            {error}
          </Typography.Body>
        </Container>
      )}

      {/* Staff List */}
      <Container padding="0 16px 16px 16px">
        <Typography.Header size="sm" weight="semibold">
          Team Members
        </Typography.Header>
        {loading ? (
          <NoDataFound icon="database" title="Loading..." message="" />
        ) : staff.length === 0 ? (
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
              <StaffCard
                id={s.id}
                key={s.id}
                first_name={s.first_name}
                last_name={s.last_name}
                role={s.role}
                is_active={s.is_active}
                onEdit={handleEdit}
                onToggleActive={handleToggleActive}
                onDelete={handleDelete}
              />
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
