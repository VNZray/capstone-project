import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Sheet, Typography, Stack, Input, Select, Option, Button } from '@mui/joy';
import { BusinessService } from '@/src/services/BusinessService';
import type { BusinessListItem, BusinessFilters, BusinessStatus } from '@/src/types/Business';
import BusinessTable from '@/src/components/shops/BusinessTable';
import BusinessForm from '@/src/components/shops/BusinessForm';
import BusinessDetailsModal from '@/src/components/shops/BusinessDetailsModal';

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
    if (!confirm('Mark this shop as Inactive?')) return;
    try {
      await BusinessService.remove(id, false); // soft
      fetchData();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Delete failed';
      alert(msg);
    }
  };

  return (
    <Stack gap={2} sx={{ p: 2 }}>
      <Typography level="h3" fontWeight={600}>Shops</Typography>

      <Sheet variant="plain" sx={{ p: 2, borderRadius: 8, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <Input
          placeholder="Search shops..."
          value={filters.q || ''}
          onChange={handleSearchChange}
          sx={{ width: 260 }}
          size="sm"
        />
        <Select
          size="sm"
          placeholder="Status"
            value={(filters.status as string) || 'All'}
          onChange={handleStatusChange}
          sx={{ width: 180 }}
        >
          {statusOptions.map((s) => (
            <Option key={s} value={s}>{s}</Option>
          ))}
        </Select>
        <Button size="sm" variant="soft" onClick={handleRefresh}>Refresh</Button>
  <Button size="sm" variant="solid" color="primary" onClick={() => setCreateOpen(true)}>Add Shop</Button>
      </Sheet>

      {error && (
        <Sheet variant="soft" color="danger" sx={{ p: 2, borderRadius: 8 }}>
          <Typography level="body-sm">{error}</Typography>
        </Sheet>
      )}

      <BusinessTable
        rows={businesses}
        loading={loading}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Stack direction="row" justifyContent="flex-end" alignItems="center" gap={1} sx={{ mt: 1 }}>
        <Button size="sm" variant="plain" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
        <Typography level="body-sm">Page {page} / {totalPages}</Typography>
        <Button size="sm" variant="plain" disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</Button>
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
