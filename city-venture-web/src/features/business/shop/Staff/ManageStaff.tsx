import { useState, useEffect } from "react";
import Container from "@/src/components/Container";
import PageContainer from "@/src/components/PageContainer";
import Typography from "@/src/components/Typography";
import StaffAddModal, {
  type StaffFormData,
} from "@/src/features/business/accommodation/Staff/components/StaffAddModal";
import { Input } from "@mui/joy";
import StaffCard from "./components/StaffCard";
import { Search } from "lucide-react";
import NoDataFound from "@/src/components/NoDataFound";
import Button from "@/src/components/Button";
import IconButton from "@/src/components/IconButton";
import { Add } from "@mui/icons-material";
import { useBusiness } from "@/src/context/BusinessContext";
import {
  fetchStaffByBusinessId,
  deleteStaffById,
  toggleStaffActive,
  onboardStaff,
  type StaffMember,
} from "@/src/services/manage-staff/StaffService";
import {
  initializeEmailJS,
  sendStaffCredentials,
} from "@/src/services/email/EmailService";

type Staff = StaffMember;

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

  // Initialize EmailJS
  useEffect(() => {
    initializeEmailJS();
  }, []);

  // Add new staff member using the new onboard endpoint
  const handleAddStaff = async (data: StaffFormData) => {
    try {
      setError(null);

      // Use the new onboard endpoint that creates user + staff in one transaction
      const result = await onboardStaff({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone_number: data.phone_number || "",
        password: data.password || "staff123",
        business_id: businessDetails?.id as string,
        role_id: data.role_id,
      });

      const newStaff: Staff = {
        id: result.id,
        first_name: result.first_name,
        last_name: result.last_name,
        email: result.email,
        phone_number: result.phone_number,
        role: result.role_name || data.role_name,
        is_active: result.is_active,
        user_id: result.user_id,
        business_id: businessDetails?.id || "",
      };

      // Send account credentials via email
      await sendStaffCredentials(
        data.email,
        `${data.first_name} ${data.last_name || ""}`.trim(),
        result.temp_password
      );

      setStaff((prev) => [newStaff, ...prev]);
      setAddOpen(false);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 
        (err instanceof Error ? err.message : "Failed to add staff member");
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
          <Typography.Title size="sm">
            Manage Staff
          </Typography.Title>
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
        businessId={businessDetails?.id as string}
      />
    </PageContainer>
  );
};

export default ManageStaff;
