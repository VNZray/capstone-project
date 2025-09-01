import * as React from 'react';
import { Table, Sheet, Typography, Chip, IconButton, Tooltip } from '@mui/joy';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import type { BusinessListItem } from '@/src/types/Business';

export interface BusinessTableProps {
  rows: BusinessListItem[];
  loading?: boolean;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void; // soft delete for now
}

const statusColor: Record<string, 'success' | 'danger' | 'neutral' | 'warning'> = {
  Active: 'success',
  Pending: 'warning',
  Inactive: 'neutral',
  Maintenance: 'danger',
};

export const BusinessTable: React.FC<BusinessTableProps> = ({
  rows,
  loading = false,
  onView,
  onEdit,
  onDelete,
}) => {
  return (
    <Sheet variant="outlined" sx={{ borderRadius: 8, p: 1, overflow: 'auto' }}>
      <Table stickyHeader hoverRow sx={{ '--TableCell-headBackground': 'var(--joy-palette-neutral-100)', minWidth: 960 }}>
        <thead>
          <tr>
            <th style={{ width: 220 }}>Name</th>
            <th style={{ width: 160 }}>Category</th>
            <th style={{ width: 140 }}>Type</th>
            <th style={{ width: 180 }}>Location</th>
            <th style={{ width: 120 }}>Status</th>
            <th style={{ width: 140, textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={6} style={{ padding: '2rem', textAlign: 'center' }}>
                <Typography level="body-md">Loading shops...</Typography>
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ padding: '2rem', textAlign: 'center' }}>
                <Typography level="body-md">No shops found</Typography>
              </td>
            </tr>
          ) : (
            rows.map((b) => {
              const location = [b.barangay, b.municipality, b.province]
                .filter(Boolean)
                .join(', ');
              return (
                <tr key={b.id}>
                  <td>
                    <Typography level="body-sm" fontWeight={600} noWrap>
                      {b.business_name}
                    </Typography>
                    <Typography level="body-xs" sx={{ color: 'text.tertiary' }} noWrap>
                      {b.email}
                    </Typography>
                  </td>
                  <td>
                    <Typography level="body-sm">{b.category || '-'}</Typography>
                  </td>
                  <td>
                    <Typography level="body-sm">{b.type || '-'}</Typography>
                  </td>
                  <td>
                    <Typography level="body-xs">{location || '-'}</Typography>
                  </td>
                  <td>
                    <Chip size="sm" variant="soft" color={statusColor[b.status] || 'neutral'}>
                      {b.status}
                    </Chip>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Tooltip title="View Details">
                      <IconButton size="sm" variant="plain" color="neutral" onClick={() => onView?.(b.id)}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton size="sm" variant="plain" color="primary" onClick={() => onEdit?.(b.id)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="sm" variant="plain" color="danger" onClick={() => onDelete?.(b.id)}>
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </Table>
    </Sheet>
  );
};

export default BusinessTable;
