import { useCallback, useEffect, useMemo, useState } from "react";
import { Grid, Box, Stack, Sheet, Typography } from "@mui/joy";
import Container from "@/src/components/Container";
import SearchBar from "@/src/components/SearchBar";
import Pagination from "@/src/features/admin/services/tourist-spot/components/Pagination";
import StaffFilters from "@/src/features/admin/tourism-staff/components/StaffFilters";
import TourismStaffTable from "@/src/features/admin/tourism-staff/components/TourismStaffTable";
import TourismStaffCards from "@/src/features/admin/tourism-staff/components/TourismStaffCards";
import type { TourismStaff } from "@/src/types/TourismStaff";
import { apiService } from "@/src/utils/api";
import { colors } from "@/src/utils/Colors";
import ResetPasswordModal from "@/src/features/admin/tourism-staff/components/ResetPasswordModal";
import EditStaffModal from "@/src/features/admin/tourism-staff/components/EditStaffModal";
import type { UserRoles } from "@/src/types/User";
import StaffSkeleton from "@/src/features/admin/tourism-staff/components/StaffSkeleton";
import Button from "@/src/components/Button";
import { Table as TableIcon, LayoutGrid } from "lucide-react";
import { IoAdd } from "react-icons/io5";

type DisplayMode = 'table' | 'cards';

const TourismStaffManagement: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedRole, setSelectedRole] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [staff, setStaff] = useState<TourismStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [display, setDisplay] = useState<DisplayMode>('table');
  const perPage = 12;
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

  const handlePageChange = (page: number) => setCurrentPage(page);
  const handleStatusChange = (status: string) => { setSelectedStatus(status); setCurrentPage(1); };
  const handleRoleChange = (role: string) => { setSelectedRole(role); setCurrentPage(1); };
  const handleSearch = (q: string) => { setSearchQuery(q); setCurrentPage(1); };

  const filtered = useMemo(() => {
    let rows = staff;
    if (selectedStatus !== 'All') {
      rows = rows.filter((s) => {
        if (selectedStatus === 'active') return !!s.is_active;
        if (selectedStatus === 'inactive') return !s.is_active;
        if (selectedStatus === 'verified') return !!s.is_verified;
        if (selectedStatus === 'unverified') return !s.is_verified;
        return true;
      });
    }
    if (selectedRole !== 'All') {
      rows = rows.filter((s) => (s.role_name || '').toLowerCase() === selectedRole.toLowerCase());
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
  }, [staff, selectedStatus, selectedRole, searchQuery]);

  const totalPages = Math.ceil(filtered.length / perPage) || 1;
  const pageRows = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, currentPage]);

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
    <>
    <Container background={colors.background} elevation={2}>
      <Stack spacing={2} sx={{ p: 2 }}>
        {/* Filters, Search, and Display toggle */}
        <Grid container spacing={2} justifyContent="space-between" alignItems="center" sx={{ width: '99%' }}>
          <Grid xs={12} sm={6} md={5}>
            <StaffFilters
              selectedStatus={selectedStatus}
              selectedRole={selectedRole}
              onStatusChange={handleStatusChange}
              onRoleChange={handleRoleChange}
              onRefresh={fetchStaff}
              roleOptions={roles.map(r => r.role_name)}
            />
          </Grid>
          <Grid xs={12} sm={6} md={7} sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
            <Box sx={{ flex: 1, maxWidth: 300, mr: { xs: 1, sm: 2, md: 3 } }}>
              <SearchBar
                value={searchQuery}
                onChangeText={handleSearch}
                onSearch={() => {}}
                placeholder="Search by name, email, or position..."
                containerStyle={{ width: '100%' }}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button variant="solid" colorScheme="primary" size="sm" onClick={handleCreate} startDecorator={<IoAdd size={18} />}>Add Staff</Button>
              <Box sx={{ display: 'inline-flex', borderRadius: '8px', overflow: 'hidden', border: '1px solid', borderColor: display === 'table' || display === 'cards' ? 'primary.500' : 'neutral.outlinedBorder' }}>
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
                  borderLeft: '1px solid',
                  borderColor: 'neutral.outlinedBorder',
                }}
              >
                <LayoutGrid size={16} />
              </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Loading/Error/Content */}
        {loading ? (
          <StaffSkeleton variant={display} />
        ) : error ? (
          <Sheet variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 8, borderColor: 'danger.500' }}>
            <Typography level="body-md" sx={{ color: 'danger.500' }}>
              Error: {error}
            </Typography>
          </Sheet>
        ) : (
          <Stack spacing={2}>
            {display === 'table' ? (
              <TourismStaffTable
                staff={pageRows}
                onEdit={handleEdit}
                onResetPassword={handleResetPassword}
              />)
              : (
              <TourismStaffCards
                staff={pageRows}
                onEdit={handleEdit}
                onResetPassword={handleResetPassword}
              />
            )}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
              </Box>
            )}
          </Stack>
        )}
      </Stack>
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
    </>
  );
};

export default TourismStaffManagement;
