import * as React from 'react';
import { Sheet, Typography, Chip, IconButton, Tooltip, Box, Stack, Divider } from '@mui/joy';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PlaceIcon from '@mui/icons-material/Place';
import CategoryIcon from '@mui/icons-material/Category';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import type { BusinessListItem } from '@/src/types/Business';

export interface BusinessCardsProps {
  items: BusinessListItem[];
  loading?: boolean;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const statusColor: Record<string, 'success' | 'danger' | 'neutral' | 'warning'> = {
  Active: 'success',
  Pending: 'warning',
  Inactive: 'neutral',
  Maintenance: 'danger',
};

export const BusinessCards: React.FC<BusinessCardsProps> = ({ items, loading = false, onView, onEdit, onDelete }) => {
  if (loading) {
    return (
      <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Sheet key={i} variant="outlined" sx={{ p: 2, borderRadius: 10, minHeight: 160, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ height: 14, bgcolor: 'neutral.200', borderRadius: 4, width: '60%' }} />
            <Box sx={{ height: 10, bgcolor: 'neutral.200', borderRadius: 4, width: '40%' }} />
            <Box sx={{ flex: 1 }} />
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Box sx={{ height: 28, bgcolor: 'neutral.200', borderRadius: 6, flex: 1 }} />
              <Box sx={{ height: 28, bgcolor: 'neutral.200', borderRadius: 6, flex: 1 }} />
              <Box sx={{ height: 28, bgcolor: 'neutral.200', borderRadius: 6, flex: 1 }} />
            </Box>
          </Sheet>
        ))}
      </Box>
    );
  }

  if (!items.length) {
    return (
      <Sheet variant="soft" sx={{ p: 4, textAlign: 'center', borderRadius: 12 }}>
        <Typography level="body-md">No shops found</Typography>
      </Sheet>
    );
  }

  return (
    <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
      {items.map(b => {
        const location = [b.barangay, b.municipality].filter(Boolean).join(', ');
        return (
          <Sheet key={b.id} variant="outlined" sx={{
            p: 2,
            borderRadius: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            position: 'relative',
            bgcolor: 'background.surface',
            transition: 'border-color 0.15s ease, transform 0.15s ease, box-shadow 0.2s',
            '&:hover': { borderColor: 'primary.outlinedHoverBorder', transform: 'translateY(-2px)', boxShadow: 'md' }
          }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
              <Box sx={{ minWidth: 0 }}>
                <Typography level="title-sm" fontWeight={600} noWrap>{b.business_name}</Typography>
                <Typography level="body-xs" sx={{ color: 'text.tertiary' }} noWrap>{b.email}</Typography>
              </Box>
              <Chip size="sm" variant="soft" color={statusColor[b.status] || 'neutral'}>{b.status}</Chip>
            </Stack>
            <Stack direction="row" gap={1} sx={{ flexWrap: 'wrap' }}>
              {b.category && (
                <Stack direction="row" gap={0.5} alignItems="center">
                  <CategoryIcon sx={{ fontSize: 14, color: 'text.tertiary' }} />
                  <Typography level="body-xs" noWrap>{b.category}</Typography>
                </Stack>
              )}
              {b.type && (
                <Stack direction="row" gap={0.5} alignItems="center">
                  <LocalOfferIcon sx={{ fontSize: 14, color: 'text.tertiary' }} />
                  <Typography level="body-xs" noWrap>{b.type}</Typography>
                </Stack>
              )}
            </Stack>
            {location && (
              <Stack direction="row" gap={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                <PlaceIcon sx={{ fontSize: 14, color: 'text.tertiary' }} />
                <Typography level="body-xs" sx={{ color: 'text.secondary' }} noWrap>{location}</Typography>
              </Stack>
            )}
            <Divider sx={{ my: 1 }} />
            <Stack direction="row" gap={0.5} justifyContent="flex-end">
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
            </Stack>
          </Sheet>
        );
      })}
    </Box>
  );
};

export default BusinessCards;
