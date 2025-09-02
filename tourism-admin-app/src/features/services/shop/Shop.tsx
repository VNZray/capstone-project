import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Sheet, Typography, Stack, Input, Select, Option, Button, IconButton, Chip, Box, Tooltip } from '@mui/joy';
import TableViewIcon from '@mui/icons-material/TableView';
import GridViewIcon from '@mui/icons-material/GridView';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { useToast } from '@/src/context/useToast';
import { BusinessService } from '@/src/services/BusinessService';
import type { BusinessListItem, BusinessFilters, BusinessStatus } from '@/src/types/Business';
import BusinessTable from '@/src/components/shops/BusinessTable';
import BusinessForm from '@/src/components/shops/BusinessForm';
import BusinessDetailsModal from '@/src/components/shops/BusinessDetailsModal';
import BusinessCards from '@/src/components/shops/BusinessCards';

const PAGE_SIZE = 10;

const statusOptions: (BusinessStatus | 'All')[] = ['All', 'Pending', 'Active', 'Inactive', 'Maintenance'];

const Shop: React.FC = () => {
  const [businesses, setBusinesses] = useState<BusinessListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<BusinessFilters>({ status: 'All' });
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<BusinessListItem | null>(null);
  const [viewing, setViewing] = useState<BusinessListItem | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const { showToast } = useToast();
  const VIEW_MODE_KEY = 'shops_view_mode';
  const [viewMode, setViewMode] = useState<'table' | 'cards'>(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem(VIEW_MODE_KEY) : null;
      return saved === 'cards' ? 'cards' : 'table';
    } catch {
      return 'table';
    }
  });

  // Persist view mode changes
  useEffect(() => {
    try { localStorage.setItem(VIEW_MODE_KEY, viewMode); } catch { /* ignore */ }
  }, [viewMode]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await BusinessService.list({ page, pageSize: PAGE_SIZE, filters });
      const onlyShops = res.data.filter((b) => (b.type || '').toLowerCase() === 'shop');
      setBusinesses(onlyShops);
      setTotal(onlyShops.length);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load shops';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Derived
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total]);

  const updateFilter = <K extends keyof BusinessFilters>(key: K, value: BusinessFilters[K]) => {
    setPage(1); // reset page
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFilter('q', e.target.value || undefined);
  };

  const handleStatusChange = (_event: unknown, value: string | null) => {
    updateFilter('status', (value as (BusinessStatus | 'All')) || 'All');
  };

  const handleRefresh = () => fetchData();

  const handleView = (id: string) => {
    const biz = businesses.find(b => b.id === id) || null;
    setViewing(biz);
    setViewOpen(true);
  };

  const handleEdit = (id: string) => {
  const biz = businesses.find((b) => b.id === id) || null;
  setEditing(biz);
  setEditOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently delete this shop? This action cannot be undone.')) return;
    try {
      await BusinessService.remove(id); // hard delete
  showToast({ message: 'Shop deleted', severity: 'success' });
      fetchData();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Delete failed';
      alert(msg);
    }
  };

  return (
    <Stack gap={3} sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <Stack gap={0.5}>
          <Typography level="h3" fontWeight={700}>Shops</Typography>
          <Typography level="body-sm" sx={{ color: 'text.tertiary' }}>Manage and review registered shops</Typography>
        </Stack>
        <Stack direction="row" gap={1}>
          <Tooltip title={viewMode === 'table' ? 'Card view' : 'Table view'}>
            <IconButton size="sm" variant="outlined" onClick={() => setViewMode(v => v === 'table' ? 'cards' : 'table')}>
              {viewMode === 'table' ? <GridViewIcon fontSize="small" /> : <TableViewIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
          <Button size="sm" startDecorator={<AddIcon />} onClick={() => setCreateOpen(true)} sx={{ fontWeight: 600 }}>Add Shop</Button>
        </Stack>
      </Stack>

      {/* Quick stats */}
      <Stack direction="row" gap={1.5} flexWrap="wrap">
        {statusOptions.filter(s => s !== 'All').map(s => {
          const count = businesses.filter(b => b.status === s).length;
          return (
            <Chip key={s} size="sm" variant="soft" color={s === 'Active' ? 'success' : s === 'Pending' ? 'warning' : s === 'Maintenance' ? 'danger' : 'neutral'}>
              {s}: {count}
            </Chip>
          );
        })}
        <Chip size="sm" variant="outlined">Total: {businesses.length}</Chip>
      </Stack>

      {/* Toolbar */}
      <Sheet variant="outlined" sx={{ p: 2, borderRadius: 12, display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center', bgcolor: 'background.surface' }}>
        <Input
          placeholder="Search shops..."
          value={filters.q || ''}
          onChange={handleSearchChange}
          startDecorator={<SearchIcon sx={{ color: 'text.tertiary' }} />}
          sx={{ width: { xs: '100%', sm: 260 } }}
          size="sm"
        />
        <Select
          size="sm"
          placeholder="Status"
          value={(filters.status as string) || 'All'}
          onChange={handleStatusChange}
          startDecorator={<FilterAltIcon />}
          sx={{ width: { xs: '100%', sm: 180 } }}
        >
          {statusOptions.map((s) => (
            <Option key={s} value={s}>{s}</Option>
          ))}
        </Select>
        <IconButton size="sm" variant="outlined" onClick={handleRefresh}><RefreshIcon fontSize="small" /></IconButton>
        <Box sx={{ flexGrow: 1 }} />
        <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>Showing {(businesses.length)} result(s)</Typography>
      </Sheet>

      {error && (
        <Sheet variant="soft" color="danger" sx={{ p: 2, borderRadius: 8 }}>
          <Typography level="body-sm">{error}</Typography>
        </Sheet>
      )}

      {viewMode === 'table' ? (
        <BusinessTable
          rows={businesses}
          loading={loading}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ) : (
        <BusinessCards
          items={businesses}
          loading={loading}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <Stack direction="row" justifyContent="flex-end" alignItems="center" gap={1} sx={{ mt: 1 }}>
        <Button size="sm" variant="outlined" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
        <Typography level="body-sm" sx={{ px: 1 }}>Page {page} / {totalPages}</Typography>
        <Button size="sm" variant="outlined" disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</Button>
      </Stack>

      <BusinessForm
        open={createOpen}
        mode='create'
        onClose={() => setCreateOpen(false)}
        onSaved={() => { setCreateOpen(false); fetchData(); }}
      />
      <BusinessForm
        open={editOpen}
        mode='edit'
        initial={editing || undefined}
        onClose={() => { setEditOpen(false); setEditing(null); }}
        onSaved={() => { setEditOpen(false); setEditing(null); fetchData(); }}
      />
      <BusinessDetailsModal
        open={viewOpen}
        business={viewing}
        onClose={() => { setViewOpen(false); setViewing(null); }}
      />
    </Stack>
  );
};

export default Shop;
