import { useState, useEffect } from "react";
import Container from "@/src/components/Container";
import PageContainer from "@/src/components/PageContainer";
import Typography from "@/src/components/Typography";
import StaffAddModal, {
  type StaffFormData,
} from "./components/StaffAddModal";
import StaffEditModal, {
  type StaffEditData,
} from "./components/StaffEditModal";
import { Input } from "@mui/joy";
import Alert from "@/src/components/Alert";
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
  updateStaffById,
  onboardStaff,
  type StaffMember,
} from "@/src/services/manage-staff/StaffService";
import {
  initializeEmailJS,
  sendStaffCredentials,
} from "@/src/services/email/EmailService";
import Table, { type TableColumn, StatusChip } from "@/src/components/ui/Table";
import { Edit, Trash2 } from "lucide-react";
import { Box } from "@mui/joy";
import apiClient from "@/src/services/apiClient";

type Staff = StaffMember;

const ManageStaff = () => {
  const { businessDetails } = useBusiness();

  // Staff list and UI state
  const [staff, setStaff] = useState<Staff[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Alert states
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
    onConfirm?: () => void;
    showCancel?: boolean;
  }>({
    type: "info",
    title: "",
    message: "",
  });

  // Initialize EmailJS
  useEffect(() => {
    initializeEmailJS();
  }, []);

  // Load staff data
  const loadStaff = async () => {
    if (!businessDetails?.id) return;
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

  // Fetch staff on mount and when business changes
  useEffect(() => {
    loadStaff();
  }, [businessDetails?.id]);

  // Add new staff member using the new onboard endpoint
  const handleAddStaff = async (data: StaffFormData) => {
    try {
      setError(null);

      // Use the new onboard endpoint that creates user + staff in one transaction
      // Staff automatically gets the "Staff" role; permissions are assigned separately
      const result = await onboardStaff({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone_number: data.phone_number || "",
        password: data.password || "staff123",
        business_id: businessDetails?.id as string,
        title: data.title,
        permission_ids: data.permission_ids,
      });

      const newStaff: Staff = {
        id: result.id,
        first_name: result.first_name,
        last_name: result.last_name,
        email: result.email,
        phone_number: result.phone_number,
        title: data.title,
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
    const staff_member = staff.find((s) => s.id === id);
    if (!staff_member) return;
    setSelectedStaff(staff_member);
    setEditOpen(true);
  };

  // Save edited staff member
  const handleSaveEdit = async (data: StaffEditData) => {
    if (!selectedStaff) return;

    try {
      // Update staff info
      await updateStaffById(selectedStaff.id, {
        first_name: data.first_name,
        middle_name: data.middle_name,
        last_name: data.last_name,
        email: data.email,
        phone_number: data.phone_number,
        title: data.title,
      });

      // Update permissions separately if changed
      if (data.permission_ids) {
        const { updateStaffPermissions } = await import("@/src/services/manage-staff/StaffService");
        await updateStaffPermissions(selectedStaff.id, data.permission_ids);
      }

      setAlertConfig({
        type: "success",
        title: "Success",
        message: "Staff member updated successfully!",
        showCancel: false,
      });
      setAlertOpen(true);
      setEditOpen(false);
      await loadStaff();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update staff member"
      );
    }
  };

  // Generate random password
  const generatePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    let password = "";
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  // Reset staff password
  const handleResetPassword = async () => {
    if (!selectedStaff) return;

    setAlertConfig({
      type: "warning",
      title: "Reset Password?",
      message: `Are you sure you want to reset the password for ${selectedStaff.first_name}? A new temporary password will be generated and sent to their email.`,
      showCancel: true,
      onConfirm: async () => {
        try {
          const newPassword = generatePassword();

          // Update password in database
          await apiClient.put(`/users/${selectedStaff.user_id}`, {
            password: newPassword,
          });

          // Send new password via email
          await sendStaffCredentials(
            selectedStaff.email,
            `${selectedStaff.first_name} ${
              selectedStaff.last_name || ""
            }`.trim(),
            newPassword
          );

          setAlertConfig({
            type: "success",
            title: "Password Reset",
            message: `New password has been generated and sent to ${selectedStaff.email}`,
            showCancel: false,
          });
          setAlertOpen(true);
        } catch (err) {
          setAlertConfig({
            type: "error",
            title: "Error",
            message: "Failed to reset password. Please try again.",
            showCancel: false,
          });
          setAlertOpen(true);
        }
      },
    });
    setAlertOpen(true);
  };

  // Toggle staff active status
  const handleToggleActive = async (id: string) => {
    const staff_item = staff.find((s) => s.id === id);
    if (!staff_item) return;

    const action = staff_item.is_active ? "deactivate" : "activate";

    setAlertConfig({
      type: "warning",
      title: `${
        action === "deactivate" ? "Deactivate" : "Activate"
      } Staff Member?`,
      message: `Are you sure you want to ${action} ${staff_item.first_name} ${
        staff_item.last_name || ""
      }? ${
        action === "deactivate"
          ? "They will not be able to access their account."
          : "They will be able to access their account again."
      }`,
      showCancel: true,
      onConfirm: async () => {
        try {
          await toggleStaffActive(staff_item.user_id, staff_item.is_active);

          setAlertConfig({
            type: "success",
            title: "Success",
            message: `Staff member ${
              action === "deactivate" ? "deactivated" : "activated"
            } successfully!`,
            showCancel: false,
          });
          setAlertOpen(true);
          await loadStaff();
        } catch (err) {
          setAlertConfig({
            type: "error",
            title: "Error",
            message: `Failed to ${action} staff member. Please try again.`,
            showCancel: false,
          });
          setAlertOpen(true);
        }
      },
    });
    setAlertOpen(true);
  };

  // Delete staff member
  const handleDelete = async (id: string) => {
    const staff_item = staff.find((s) => s.id === id);
    if (!staff_item) return;

    setAlertConfig({
      type: "error",
      title: "Delete Staff Member?",
      message: `Are you sure you want to permanently delete ${
        staff_item.first_name
      } ${staff_item.last_name || ""}? This action cannot be undone.`,
      showCancel: true,
      onConfirm: async () => {
        try {
          await deleteStaffById(id);

          setAlertConfig({
            type: "success",
            title: "Deleted",
            message: "Staff member deleted successfully!",
            showCancel: false,
          });
          setAlertOpen(true);
          await loadStaff();
        } catch (err) {
          setAlertConfig({
            type: "error",
            title: "Error",
            message: "Failed to delete staff member. Please try again.",
            showCancel: false,
          });
          setAlertOpen(true);
        }
      },
    });
    setAlertOpen(true);
  };

  // Filter staff based on search term
  const filteredStaff = staff.filter((s) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      s.first_name.toLowerCase().includes(searchLower) ||
      s.last_name?.toLowerCase().includes(searchLower) ||
      s.email.toLowerCase().includes(searchLower) ||
      s.phone_number?.toLowerCase().includes(searchLower) ||
      (s.title?.toLowerCase() || "").includes(searchLower)
    );
  });

  // Table columns configuration
  const columns: TableColumn<Staff>[] = [
    {
      id: "first_name",
      label: "Name",
      minWidth: 200,
      render: (row) => (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <Typography.Body weight="semibold">
            {`${row.first_name} ${row.middle_name || ""} ${
              row.last_name || ""
            }`.trim()}
          </Typography.Body>
        </Box>
      ),
    },
    {
      id: "email",
      label: "Email",
      minWidth: 200,
    },
    {
      id: "phone_number",
      label: "Phone Number",
      minWidth: 150,
      render: (row) => row.phone_number || "—",
    },
    {
      id: "title",
      label: "Title/Position",
      minWidth: 150,
      align: "center",
      render: (row) => <Typography.Body>{row.title || "Staff"}</Typography.Body>,
    },
    {
      id: "is_active",
      label: "Status",
      minWidth: 120,
      align: "center",
      render: (row) => (
        <StatusChip
          status={row.is_active ? "Active" : "Inactive"}
          colorMap={{
            active: "success",
            inactive: "danger",
          }}
        />
      ),
    },
    {
      id: "actions",
      label: "Actions",
      minWidth: 180,
      align: "center",
      render: (row) => (
        <Box
          sx={{
            display: "flex",
            gap: "8px",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Button
            variant="outlined"
            colorScheme="primary"
            size="sm"
            startDecorator={<Edit size={16} />}
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(row.id);
            }}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            colorScheme={row.is_active ? "warning" : "success"}
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleActive(row.id);
            }}
          >
            {row.is_active ? "Deactivate" : "Activate"}
          </Button>
          <IconButton
            variant="outlined"
            colorScheme="error"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row.id);
            }}
          >
            <Trash2 size={16} />
          </IconButton>
        </Box>
      ),
    },
  ];

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
      <Container padding="0" gap="16px">
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
        ) : (
          <Table
            columns={columns}
            data={filteredStaff}
            rowsPerPage={10}
            rowKey="id"
            emptyMessage={`No staff members match "${searchTerm}". Try a different search term.`}
            loading={loading}
            stickyHeader
            maxHeight="600px"
          />
        )}
      </Container>
      <StaffAddModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSave={handleAddStaff}
        businessId={businessDetails?.id as string}
      />
      <StaffEditModal
        open={editOpen}
        onClose={() => {
          setEditOpen(false);
          setSelectedStaff(null);
        }}
        onSave={handleSaveEdit}
        onResetPassword={handleResetPassword}
        initialData={
          selectedStaff
            ? {
                first_name: selectedStaff.first_name,
                middle_name: selectedStaff.middle_name,
                last_name: selectedStaff.last_name,
                email: selectedStaff.email,
                phone_number: selectedStaff.phone_number,
                role: selectedStaff.role || "Manager",
              }
            : undefined
        }
      />
      <Alert
        open={alertOpen}
        onClose={() => setAlertOpen(false)}
        onConfirm={alertConfig.onConfirm}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        showCancel={alertConfig.showCancel}
      />
    </PageContainer>
  );
};

export default ManageStaff;
