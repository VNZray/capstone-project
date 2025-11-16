import { useCallback, useEffect, useMemo, useState } from "react";
import { Input } from "@mui/joy";
import Container from "@/src/components/Container";
import PageContainer from "@/src/components/PageContainer";
import Typography from "@/src/components/Typography";
import TourismStaffTable from "@/src/features/admin/tourism-staff/components/TourismStaffTable";
import TourismStaffCards from "@/src/features/admin/tourism-staff/components/TourismStaffCards";
import type { TourismStaff } from "@/src/types/TourismStaff";
import { apiService } from "@/src/utils/api";
import ResetPasswordModal from "@/src/features/admin/tourism-staff/components/ResetPasswordModal";
import EditStaffModal from "@/src/features/admin/tourism-staff/components/EditStaffModal";
import type { UserRoles } from "@/src/types/User";
import StaffSkeleton from "@/src/features/admin/tourism-staff/components/StaffSkeleton";
import Button from "@/src/components/Button";
import IconButton from "@/src/components/IconButton";
import NoDataFound from "@/src/components/NoDataFound";
import DynamicTab from "@/src/components/ui/DynamicTab";
import { Table as TableIcon, LayoutGrid, Search, ListChecks, CheckCircle, XCircle, UserCheck, UserX } from "lucide-react";
import { IoAdd } from "react-icons/io5";

type DisplayMode = 'table' | 'cards';

const TourismStaffManagement: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [staff, setStaff] = useState<TourismStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [display, setDisplay] = useState<DisplayMode>('cards');
  const [roles, setRoles] = useState<UserRoles[]>([]);

  // Modals state
  const [showEdit, setShowEdit] = useState(false);
  const [editMode, setEditMode] = useState<'create' | 'edit'>('create');
  const [selected, setSelected] = useState<TourismStaff | null>(null);
  // Status changes are now handled inside Edit modal (via Active checkbox)
  const [showReset, setShowReset] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetTempPassword, setResetTempPassword] = useState<string | undefined>(undefined);
  const [resetEmail, setResetEmail] = useState<string | undefined>(undefined);

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await apiService.getTourismStaff();
      setStaff(rows);
    } catch (e: any) {
      console.error('[TourismStaffManagement] fetchStaff error', {
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
      const filtered = all.filter(r => /admin|tourism/i.test(r.role_name));
      setRoles(filtered);
    } catch (e: any) {
      console.warn('[TourismStaffManagement] fetchRoles warning', {
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
    { id: "verified", label: "Verified", icon: <UserCheck size={16} /> },
    { id: "unverified", label: "Unverified", icon: <UserX size={16} /> },
  ];

  const handleSearch = (q: string) => { 
    setSearchQuery(q);
  };

  const filtered = useMemo(() => {
    let rows = staff;
    if (selectedStatus !== 'all') {
      rows = rows.filter((s) => {
        if (selectedStatus === 'active') return !!s.is_active;
        if (selectedStatus === 'inactive') return !s.is_active;
        if (selectedStatus === 'verified') return !!s.is_verified;
        if (selectedStatus === 'unverified') return !s.is_verified;
        return true;
      });
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      rows = rows.filter((s) =>
        `${s.first_name} ${s.middle_name || ''} ${s.last_name}`.toLowerCase().includes(q) ||
        (s.email || '').toLowerCase().includes(q) ||
        (s.position || '').toLowerCase().includes(q)
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
    setEditMode('edit');
    setShowEdit(true);
  };

  const handleCreate = () => {
    setSelected(null);
    setEditMode('create');
    setShowEdit(true);
  };

  const handleResetPassword = (s: TourismStaff) => {
    setSelected(s);
    setResetTempPassword(undefined);
    setShowReset(true);
  };

  const doResetPassword = async () => {
    if (!selected) return;
    setResetLoading(true);
    try {
      const res = await apiService.resetTourismStaffPassword(selected.tourism_id);
      const temp = (res as any)?.credentials?.temporary_password;
      setResetTempPassword(temp);
    } catch (e: any) {
      console.error('[TourismStaffManagement] doResetPassword error', {
        message: e?.message,
        status: e?.response?.status,
        data: e?.response?.data,
        stack: e?.stack,
      });
    } finally {
      setResetLoading(false);
    }
  };

  // Create/Edit submit
  const submitStaff = async (payload: any) => {
    try {
      if (editMode === 'create') {
        const res = await apiService.createTourismStaff({
          email: payload.email,
          phone_number: payload.phone_number,
          first_name: payload.first_name,
          middle_name: payload.middle_name,
          last_name: payload.last_name,
          position: payload.position,
          user_role_id: payload.role_id,
          is_active: payload.is_active,
          is_verified: payload.is_verified,
        });
        const tmp = (res as any)?.credentials?.temporary_password;
        if (tmp) {
          setResetEmail(payload.email);
          setResetTempPassword(tmp);
          setShowReset(true);
        }
      } else if (selected) {
        await apiService.updateTourismStaff(selected.tourism_id, {
          email: payload.email,
          phone_number: payload.phone_number,
          first_name: payload.first_name,
          middle_name: payload.middle_name,
          last_name: payload.last_name,
          position: payload.position,
          user_role_id: payload.role_id,
          is_active: payload.is_active,
          is_verified: payload.is_verified,
        });
      }
      setShowEdit(false);
      setSelected(null);
      await fetchStaff();
    } catch (e: any) {
      console.error('[TourismStaffManagement] submitStaff error', {
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

        {/* Search + View Toggle */}
        <Container
          padding="20px 20px 0 20px"
          direction="row"
          justify="space-between"
          align="center"
          gap="16px"
        >
          <Input
            startDecorator={<Search />}
            placeholder="Search by name, email, or position..."
            size="lg"
            fullWidth
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
          
          <div style={{ display: 'inline-flex', borderRadius: '8px', overflow: 'hidden', border: '1px solid #0A1B47' }}>
            <Button
              size="sm"
              variant={display === 'table' ? 'solid' : 'plain'}
              colorScheme="primary"
              aria-label="Table view"
              title="Table view"
              onClick={() => setDisplay('table')}
              sx={{
                borderRadius: 0,
                minWidth: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: 1.2,
                ...(display !== 'table' && { background: 'transparent' }),
              }}
            >
              <TableIcon size={16} />
            </Button>
            <Button
              size="sm"
              variant={display === 'cards' ? 'solid' : 'plain'}
              colorScheme="primary"
              aria-label="Cards view"
              title="Cards view"
              onClick={() => setDisplay('cards')}
              sx={{
                borderRadius: 0,
                minWidth: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: 1.2,
                ...(display !== 'cards' && { background: 'transparent' }),
                borderLeft: '1px solid #E5E7EB',
              }}
            >
              <LayoutGrid size={16} />
            </Button>
          </div>
        </Container>

        {/* Tabs */}
        <DynamicTab
          tabs={tabs}
          activeTabId={selectedStatus}
          onChange={(tabId) => {
            setSelectedStatus(String(tabId));
          }}
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

      {/* Staff List */}
      <Container padding="0 16px 16px 16px">
        <Typography.Header size="sm" weight="semibold">
          Staff Members
        </Typography.Header>
        {loading ? (
          <StaffSkeleton variant={display} />
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
          <div
            style={{
              display: display === 'cards' ? "grid" : "block",
              gridTemplateColumns: display === 'cards' ? "repeat(auto-fill,minmax(280px,1fr))" : undefined,
              gap: display === 'cards' ? 20 : undefined,
            }}
          >
            {display === 'table' ? (
              <TourismStaffTable
                staff={filtered}
                onEdit={handleEdit}
                onResetPassword={handleResetPassword}
              />
            ) : (
              filtered.map((s) => (
                <TourismStaffCards
                  key={s.tourism_id}
                  staff={[s]}
                  onEdit={handleEdit}
                  onResetPassword={handleResetPassword}
                />
              ))
            )}
          </div>
        )}
      </Container>

      {/* Reset password */}
      <ResetPasswordModal
        open={showReset}
        email={resetEmail || selected?.email}
        temporaryPassword={resetTempPassword}
        loading={resetLoading}
        onClose={() => { setShowReset(false); setSelected(null); setResetTempPassword(undefined); setResetEmail(undefined); }}
        onConfirm={doResetPassword}
      />

      {/* Create/Edit */}
      <EditStaffModal
        open={showEdit}
        mode={editMode}
        staff={selected}
        roles={roles.map(r => ({ id: r.id as number, name: r.role_name }))}
        onClose={() => setShowEdit(false)}
        onSubmit={submitStaff}
      />
    </PageContainer>
  );
};

export default TourismStaffManagement;
