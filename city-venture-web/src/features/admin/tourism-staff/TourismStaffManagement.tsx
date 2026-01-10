import { useCallback, useEffect, useMemo, useState } from "react";
import { Input } from "@mui/joy";
import Container from "@/src/components/Container";
import PageContainer from "@/src/components/PageContainer";
import Typography from "@/src/components/Typography";
import TourismStaffTable from "@/src/features/admin/tourism-staff/components/TourismStaffTable";
import type { TourismStaff } from "@/src/types/TourismStaff";
import { apiService } from "@/src/utils/api";
import ResetPasswordModal from "@/src/features/admin/tourism-staff/components/ResetPasswordModal";
import StaffAddModal, {
  type TourismStaffFormData,
} from "@/src/features/admin/tourism-staff/components/StaffAddModal";
import StaffEditModal, {
  type TourismStaffEditData,
} from "@/src/features/admin/tourism-staff/components/EditStaffModal";
import ConfirmDialog from "@/src/components/modals/ConfirmDialog";
import type { UserRoles } from "@/src/types/User";
import StaffSkeleton from "@/src/features/admin/tourism-staff/components/StaffSkeleton";
import Button from "@/src/components/Button";
import IconButton from "@/src/components/IconButton";
import NoDataFound from "@/src/components/NoDataFound";
import DynamicTab from "@/src/components/ui/DynamicTab";
import { Search, ListChecks, CheckCircle, XCircle } from "lucide-react";
import { IoAdd } from "react-icons/io5";

const TourismStaffManagement: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [staff, setStaff] = useState<TourismStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roles, setRoles] = useState<UserRoles[]>([]);

  // Modals state
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selected, setSelected] = useState<TourismStaff | null>(null);
  const [showReset, setShowReset] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetTempPassword, setResetTempPassword] = useState<
    string | undefined
  >(undefined);
  const [resetEmail, setResetEmail] = useState<string | undefined>(undefined);

  // Delete state
  const [showDelete, setShowDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await apiService.getTourismStaff();
      setStaff(rows);
    } catch (e: any) {
      console.error("[TourismStaffManagement] fetchStaff error", {
        message: e?.message,
        status: e?.response?.status,
        data: e?.response?.data,
        stack: e?.stack,
      });
      setError("Failed to load tourism staff");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRoles = useCallback(async () => {
    try {
      const all = await apiService.getUserRoles();
      // Only include tourism-relevant roles (Admin, Tourism Officer)
      const filtered = all.filter((r) => /admin|tourism/i.test(r.role_name));
      setRoles(filtered);
    } catch (e: any) {
      console.warn("[TourismStaffManagement] fetchRoles warning", {
        message: e?.message,
        status: e?.response?.status,
        data: e?.response?.data,
      });
      setRoles([]);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
    fetchRoles();
  }, [fetchStaff, fetchRoles]);

  const tabs = [
    { id: "all", label: "All", icon: <ListChecks size={16} /> },
    { id: "active", label: "Active", icon: <CheckCircle size={16} /> },
    { id: "inactive", label: "Inactive", icon: <XCircle size={16} /> },
  ];

  const handleSearch = (q: string) => {
    setSearchQuery(q);
  };

  const filtered = useMemo(() => {
    let rows = staff;
    if (selectedStatus !== "all") {
      rows = rows.filter((s) => {
        if (selectedStatus === "active") return !!s.is_active;
        if (selectedStatus === "inactive") return !s.is_active;
        return true;
      });
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      rows = rows.filter(
        (s) =>
          `${s.first_name} ${s.middle_name || ""} ${s.last_name}`
            .toLowerCase()
            .includes(q) ||
          (s.email || "").toLowerCase().includes(q) ||
          (s.position || "").toLowerCase().includes(q)
      );
    }
    // Sort by last_name, first_name
    return rows.slice().sort((a, b) => {
      const an = `${a.last_name}, ${a.first_name}`.toLowerCase();
      const bn = `${b.last_name}, ${b.first_name}`.toLowerCase();
      return an.localeCompare(bn);
    });
  }, [staff, selectedStatus, searchQuery]);

  // Action handlers
  const handleEdit = (s: TourismStaff) => {
    setSelected(s);
    setShowEdit(true);
  };

  const handleCreate = () => {
    setShowAdd(true);
  };

  const handleResetPassword = (s: TourismStaff) => {
    setSelected(s);
    setResetTempPassword(undefined);
    setShowReset(true);
  };

  const handleDelete = (s: TourismStaff) => {
    setSelected(s);
    setShowDelete(true);
  };

  const doDelete = async () => {
    if (!selected) return;
    setDeleteLoading(true);
    try {
      await apiService.deleteTourismStaff(selected.tourism_id);
      setShowDelete(false);
      setSelected(null);
      fetchStaff();
    } catch (e: any) {
      console.error("Failed to delete staff", e);
    } finally {
      setDeleteLoading(false);
    }
  };

  const doResetPassword = async () => {
    if (!selected) return;
    setResetLoading(true);
    try {
      const res = await apiService.resetTourismStaffPassword(
        selected.tourism_id
      );
      const temp = (res as any)?.credentials?.temporary_password;
      setResetTempPassword(temp);
    } catch (e: any) {
      console.error("[TourismStaffManagement] doResetPassword error", {
        message: e?.message,
        status: e?.response?.status,
        data: e?.response?.data,
        stack: e?.stack,
      });
    } finally {
      setResetLoading(false);
    }
  };

  // Create staff
  const handleAddStaff = async (payload: TourismStaffFormData) => {
    try {
      const res = await apiService.createTourismStaff({
        email: payload.email,
        phone_number: payload.phone_number,
        first_name: payload.first_name,
        middle_name: payload.middle_name,
        last_name: payload.last_name,
        position: payload.position,
        user_role_id: payload.user_role_id,
        is_active: payload.is_active,
        is_verified: payload.is_verified,
        permission_ids: payload.permission_ids,
      });
      const tmp = (res as any)?.credentials?.temporary_password;
      if (tmp) {
        setResetEmail(payload.email);
        setResetTempPassword(tmp);
        setShowReset(true);
      }
      setShowAdd(false);
      await fetchStaff();
    } catch (e: any) {
      console.error("[TourismStaffManagement] handleAddStaff error", {
        message: e?.message,
        status: e?.response?.status,
        data: e?.response?.data,
        stack: e?.stack,
      });
    }
  };

  // Edit staff
  const handleEditStaff = async (payload: TourismStaffEditData) => {
    if (!selected) return;
    try {
      await apiService.updateTourismStaff(selected.tourism_id, {
        email: payload.email,
        phone_number: payload.phone_number,
        first_name: payload.first_name,
        middle_name: payload.middle_name,
        last_name: payload.last_name,
        position: payload.position,
        user_role_id: payload.user_role_id,
        is_active: payload.is_active,
        is_verified: payload.is_verified,
        permission_ids: payload.permission_ids,
      });
      setShowEdit(false);
      setSelected(null);
      await fetchStaff();
    } catch (e: any) {
      console.error("[TourismStaffManagement] handleEditStaff error", {
        message: e?.message,
        status: e?.response?.status,
        data: e?.response?.data,
        stack: e?.stack,
      });
    }
  };

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
          <Typography.Header>Tourism Staff Management</Typography.Header>

          <IconButton
            onClick={handleCreate}
            size="lg"
            floating
            floatPosition="bottom-right"
            hoverEffect="rotate"
          >
            <IoAdd />
          </IconButton>
        </Container>

        {/* Search */}
        <Container
          padding="20px 20px 0 20px"
          direction="row"
          justify="space-between"
          align="center"
        >
          <Input
            startDecorator={<Search />}
            placeholder="Search by name, email, or position..."
            size="lg"
            fullWidth
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </Container>

        {/* Tabs */}
        <Container padding="0">
          <DynamicTab
            tabs={tabs}
            activeTabId={selectedStatus}
            onChange={(tabId) => {
              setSelectedStatus(String(tabId));
            }}
            padding="16px 20px 20px 20px"
          />
        </Container>

        {/* Error State */}
        {error && (
          <Container padding="16px" elevation={2}>
            <Typography.Body size="sm" sx={{ color: "danger.500" }}>
              Error: {error}
            </Typography.Body>
          </Container>
        )}
      </Container>

      {/* Staff List */}
      <Container background="transparent" padding={"0"}>
        {loading ? (
          <StaffSkeleton variant="table" />
        ) : staff.length === 0 ? (
          <NoDataFound
            icon="database"
            title="No Staff Yet"
            message="No tourism staff members yet. Add your first team member above."
          >
            <Button
              startDecorator={<IoAdd />}
              size="lg"
              onClick={handleCreate}
              colorScheme="primary"
              variant="solid"
            >
              Add Staff
            </Button>
          </NoDataFound>
        ) : filtered.length === 0 ? (
          <NoDataFound
            icon="search"
            title="No Results Found"
            message={`No staff members match your search criteria. Try adjusting your filters.`}
          />
        ) : (
          <TourismStaffTable
            staff={filtered}
            onEdit={handleEdit}
            onResetPassword={handleResetPassword}
            onDelete={handleDelete}
          />
        )}
      </Container>

      {/* Reset password */}
      <ResetPasswordModal
        open={showReset}
        email={resetEmail || selected?.email}
        temporaryPassword={resetTempPassword}
        loading={resetLoading}
        onClose={() => {
          setShowReset(false);
          setSelected(null);
          setResetTempPassword(undefined);
          setResetEmail(undefined);
        }}
        onConfirm={doResetPassword}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={showDelete}
        title="Delete Staff Member"
        description={`Are you sure you want to delete ${selected?.first_name} ${selected?.last_name}? This action cannot be undone.`}
        confirmLabel="Delete"
        loading={deleteLoading}
        onClose={() => setShowDelete(false)}
        onConfirm={doDelete}
      />

      {/* Create/Edit Modals */}
      <StaffAddModal
        open={showAdd}
        roles={roles.map((r) => ({ id: r.id as number, name: r.role_name }))}
        onClose={() => setShowAdd(false)}
        onSave={handleAddStaff}
      />

      <StaffEditModal
        open={showEdit}
        initialData={selected || undefined}
        roles={roles.map((r) => ({ id: r.id as number, name: r.role_name }))}
        onClose={() => {
          setShowEdit(false);
          setSelected(null);
        }}
        onSave={handleEditStaff}
      />
    </PageContainer>
  );
};

export default TourismStaffManagement;
