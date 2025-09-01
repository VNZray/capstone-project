import * as React from 'react';
import {
  Modal, ModalDialog, DialogTitle, DialogContent,
  Stack, Typography, Chip, Divider, Sheet, IconButton, Link, Box,
} from '@mui/joy';
import CloseIcon from '@mui/icons-material/Close';
import type { BusinessListItem } from '@/src/types/Business';

interface BusinessDetailsModalProps {
  open: boolean;
  business: BusinessListItem | null;
  onClose: () => void;
}

const statusColor: Record<string, 'success' | 'danger' | 'neutral' | 'warning'> = {
  Active: 'success',
  Pending: 'warning',
  Inactive: 'neutral',
  Maintenance: 'danger',
};

const labelStyle = { fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, color: 'text.tertiary' } as const;

export const BusinessDetailsModal: React.FC<BusinessDetailsModalProps> = ({ open, business, onClose }) => {
  const lat = business?.latitude;
  const lng = business?.longitude;
  const hasCoords = !!lat && !!lng;
  const fullAddress = [business?.address, business?.barangay, business?.municipality, business?.province]
    .filter(Boolean)
    .join(', ');

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog layout="fullscreen" sx={{ maxWidth: 900 }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack direction="row" gap={1} alignItems="center">
            <Typography level="h4" sx={{ fontWeight: 600 }}>{business?.business_name || '—'}</Typography>
            {business && (
              <Chip size="sm" variant="soft" color={statusColor[business.status] || 'neutral'}>{business.status}</Chip>
            )}
          </Stack>
          <IconButton size="sm" variant="plain" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 0 }}>
          {!business ? (
            <Typography level="body-sm">No data.</Typography>
          ) : (
            <Stack gap={3}>
              <Stack direction={{ xs: 'column', md: 'row' }} gap={3}>
                <Sheet variant="outlined" sx={{ flex: 1, p: 2, borderRadius: 8 }}>
                  <Stack gap={1}>
                    <Typography level="body-sm" sx={labelStyle}>Basic Info</Typography>
                    <Typography level="title-sm">{business.category || '—'} • {business.type || '—'}</Typography>
                    {business.description && (
                      <Typography level="body-sm" sx={{ whiteSpace: 'pre-wrap' }}>{business.description}</Typography>
                    )}
                  </Stack>
                  <Divider sx={{ my: 1.5 }} />
                  <Stack gap={1}>
                    <Typography level="body-sm" sx={labelStyle}>Pricing</Typography>
                    <Typography level="body-sm">₱{business.min_price} – ₱{business.max_price}</Typography>
                  </Stack>
                  <Divider sx={{ my: 1.5 }} />
                  <Stack gap={1}>
                    <Typography level="body-sm" sx={labelStyle}>Contact</Typography>
                    <Typography level="body-xs">Email: {business.email}</Typography>
                    <Typography level="body-xs">Phone: {business.phone_number}</Typography>
                  </Stack>
                  {(business.facebook_url || business.instagram_url || business.website_url || business.x_url) && (
                    <>
                      <Divider sx={{ my: 1.5 }} />
                      <Stack gap={0.5}>
                        <Typography level="body-sm" sx={labelStyle}>Social / Links</Typography>
                        {business.website_url && <Link href={business.website_url} target="_blank" level="body-xs">Website</Link>}
                        {business.facebook_url && <Link href={business.facebook_url} target="_blank" level="body-xs">Facebook</Link>}
                        {business.instagram_url && <Link href={business.instagram_url} target="_blank" level="body-xs">Instagram</Link>}
                        {business.x_url && <Link href={business.x_url} target="_blank" level="body-xs">X / Twitter</Link>}
                      </Stack>
                    </>
                  )}
                  <Divider sx={{ my: 1.5 }} />
                  <Stack gap={0.5}>
                    <Typography level="body-sm" sx={labelStyle}>Meta</Typography>
                    <Typography level="body-xs">Created: {business.created_at ? new Date(business.created_at).toLocaleString() : '—'}</Typography>
                    <Typography level="body-xs">Has Booking: {business.hasBooking ? 'Yes' : 'No'}</Typography>
                    <Typography level="body-xs">Owner: {business.owner_id ? business.owner_id : 'Unclaimed'}</Typography>
                  </Stack>
                </Sheet>
                <Sheet variant="outlined" sx={{ flex: 1, p: 2, borderRadius: 8, minHeight: 360 }}>
                  <Stack gap={1} sx={{ mb: 1 }}>
                    <Typography level="body-sm" sx={labelStyle}>Location</Typography>
                    <Typography level="body-sm" sx={{ fontWeight: 500 }}>{fullAddress || '—'}</Typography>
                    <Typography level="body-xs">Lat: {lat || '—'} | Lng: {lng || '—'}</Typography>
                  </Stack>
                  {hasCoords ? (
                    <Box sx={{ borderRadius: 8, overflow: 'hidden', aspectRatio: '16 / 9', mb: 1 }}>
                      <iframe
                        title="map"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        src={`https://www.google.com/maps?q=${encodeURIComponent(lat!)},${encodeURIComponent(lng!)}&z=16&output=embed`}
                      />
                    </Box>
                  ) : (
                    <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>No coordinates provided.</Typography>
                  )}
                  {hasCoords && (
                    <Link
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lat!)},${encodeURIComponent(lng!)}`}
                      target="_blank"
                      level="body-xs"
                    >
                      Open in Google Maps
                    </Link>
                  )}
                </Sheet>
              </Stack>
            </Stack>
          )}
        </DialogContent>
      </ModalDialog>
    </Modal>
  );
};

export default BusinessDetailsModal;
