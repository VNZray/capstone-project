import * as React from 'react';
import {
  Modal, ModalDialog, DialogTitle, DialogContent,
  Stack, Typography, Chip, Sheet, IconButton, Link, Box,
} from '@mui/joy';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LanguageIcon from '@mui/icons-material/Language';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import StoreIcon from '@mui/icons-material/Store';
import LaunchIcon from '@mui/icons-material/Launch';
import type { BusinessListItem } from '@/src/types/Business';

interface BusinessDetailsModalProps {
  open: boolean;
  business: BusinessListItem | null;
  onClose: () => void;
}

const statusColor: Record<string, 'success' | 'danger' | 'neutral' | 'warning'> = {
  Active: 'success',
  Approved: 'success',
  Pending: 'warning',
  Inactive: 'neutral',
  Rejected: 'danger',
  Maintenance: 'danger',
};

const InfoCard: React.FC<{ 
  title: string; 
  icon?: React.ReactNode; 
  children: React.ReactNode;
  fullHeight?: boolean;
}> = ({ title, icon, children, fullHeight = false }) => (
  <Sheet 
    variant="outlined" 
    sx={{ 
      p: 3, 
      borderRadius: 16, 
      bgcolor: 'background.surface',
      border: '1px solid',
      borderColor: 'neutral.200',
      boxShadow: 'sm',
      height: fullHeight ? '100%' : 'auto',
      display: 'flex',
      flexDirection: 'column'
    }}
  >
    <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 2 }}>
      {icon}
      <Typography 
        level="title-sm" 
        sx={{ 
          fontWeight: 700, 
          color: 'text.primary',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          fontSize: '0.75rem'
        }}
      >
        {title}
      </Typography>
    </Stack>
    <Box sx={{ flex: 1 }}>
      {children}
    </Box>
  </Sheet>
);

const InfoRow: React.FC<{ 
  icon: React.ReactNode; 
  label?: string;
  value: string | React.ReactNode;
  href?: string;
}> = ({ icon, label, value, href }) => (
  <Stack direction="row" alignItems="center" gap={1.5} sx={{ py: 0.5 }}>
    <Box sx={{ color: 'text.tertiary', display: 'flex' }}>{icon}</Box>
    <Box sx={{ flex: 1 }}>
      {label && (
        <Typography level="body-xs" sx={{ color: 'text.tertiary', fontWeight: 500 }}>
          {label}
        </Typography>
      )}
      {href ? (
        <Link 
          href={href} 
          target="_blank" 
          rel="noopener noreferrer"
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 0.5,
            fontWeight: 500,
            color: 'primary.500',
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'underline'
            }
          }}
        >
          {value}
          <LaunchIcon sx={{ fontSize: 12 }} />
        </Link>
      ) : (
        <Typography level="body-sm" sx={{ fontWeight: 500, color: 'text.primary' }}>
          {value}
        </Typography>
      )}
    </Box>
  </Stack>
);

export const BusinessDetailsModal: React.FC<BusinessDetailsModalProps> = ({ open, business, onClose }) => {
  const lat = business?.latitude;
  const lng = business?.longitude;
  const hasCoords = !!lat && !!lng;
  const fullAddress = [business?.address, business?.barangay, business?.municipality, business?.province]
    .filter(Boolean)
    .join(', ');

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog 
        sx={{ 
          maxWidth: 1000,
          width: { xs: '95vw', sm: '90vw', md: '85vw' },
          maxHeight: '90vh',
          margin: 'auto',
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          borderRadius: { xs: 12, sm: 16 },
          boxShadow: 'xl',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          pb: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.surface'
        }}>
          <Stack direction="row" gap={2} alignItems="center">
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 12,
                bgcolor: 'primary.100',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <StoreIcon sx={{ color: 'primary.600', fontSize: 24 }} />
            </Box>
            <Stack>
              <Typography level="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
                {business?.business_name || 'Business Details'}
              </Typography>
              {business && (
                <Stack direction="row" gap={1} alignItems="center" sx={{ mt: 0.5 }}>
                  <Chip 
                    size="sm" 
                    variant="soft" 
                    color={statusColor[business.status] || 'neutral'}
                    sx={{ fontWeight: 600 }}
                  >
                    {business.status}
                  </Chip>
                  <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                    {business.category} • {business.type}
                  </Typography>
                </Stack>
              )}
            </Stack>
          </Stack>
          <IconButton 
            size="sm" 
            variant="outlined" 
            onClick={onClose}
            sx={{ borderRadius: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3, overflow: 'auto' }}>
          {!business ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography level="body-sm" sx={{ color: 'text.tertiary' }}>No data available.</Typography>
            </Box>
          ) : (
            <Stack gap={3}>
              {/* Main Content Grid */}
              <Stack direction={{ xs: 'column', lg: 'row' }} gap={3}>
                {/* Left Column */}
                <Stack gap={3} sx={{ flex: 1 }}>
                  {/* Basic Information */}
                  <InfoCard title="Basic Information" icon={<StoreIcon sx={{ fontSize: 16, color: 'primary.500' }} />}>
                    <Stack gap={2}>
                      {business.business_image && (
                        <Box sx={{ 
                          borderRadius: 12, 
                          overflow: 'hidden', 
                          border: '1px solid', 
                          borderColor: 'neutral.200',
                          aspectRatio: '16 / 10'
                        }}>
                          <img 
                            src={business.business_image} 
                            alt={business.business_name}
                            style={{ 
                              width: '100%', 
                              height: '100%', 
                              objectFit: 'cover' 
                            }}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </Box>
                      )}

                      {business.description && (
                        <Box>
                          <Typography level="body-xs" sx={{ color: 'text.tertiary', mb: 0.5 }}>Description</Typography>
                          <Typography level="body-sm" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                            {business.description}
                          </Typography>
                        </Box>
                      )}
                      
                      <Box>
                        <Typography level="body-xs" sx={{ color: 'text.tertiary', mb: 0.5 }}>Price Range</Typography>
                        <Typography level="title-sm" sx={{ fontWeight: 700, color: 'success.600' }}>
                          ₱{business.min_price?.toLocaleString()} - ₱{business.max_price?.toLocaleString()}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography level="body-xs" sx={{ color: 'text.tertiary', mb: 0.5 }}>Booking Available</Typography>
                        <Chip 
                          size="sm" 
                          variant={business.hasBooking ? 'soft' : 'outlined'} 
                          color={business.hasBooking ? 'success' : 'neutral'}
                        >
                          {business.hasBooking ? 'Yes' : 'No'}
                        </Chip>
                      </Box>
                    </Stack>
                  </InfoCard>

                  {/* Contact Information */}
                  <InfoCard title="Contact Information" icon={<PhoneIcon sx={{ fontSize: 16, color: 'primary.500' }} />}>
                    <Stack gap={1}>
                      <InfoRow
                        icon={<EmailIcon sx={{ fontSize: 16 }} />}
                        label="Email"
                        value={business.email}
                        href={`mailto:${business.email}`}
                      />
                      <InfoRow
                        icon={<PhoneIcon sx={{ fontSize: 16 }} />}
                        label="Phone"
                        value={business.phone_number}
                        href={`tel:${business.phone_number}`}
                      />
                    </Stack>
                  </InfoCard>

                  {/* Social Media & Links */}
                  {(business.facebook_url || business.instagram_url || business.website_url || business.x_url) && (
                    <InfoCard title="Online Presence" icon={<LanguageIcon sx={{ fontSize: 16, color: 'primary.500' }} />}>
                      <Stack gap={1}>
                        {business.website_url && (
                          <InfoRow
                            icon={<LanguageIcon sx={{ fontSize: 16 }} />}
                            value="Website"
                            href={business.website_url}
                          />
                        )}
                        {business.facebook_url && (
                          <InfoRow
                            icon={<FacebookIcon sx={{ fontSize: 16, color: '#1877F2' }} />}
                            value="Facebook"
                            href={business.facebook_url}
                          />
                        )}
                        {business.instagram_url && (
                          <InfoRow
                            icon={<InstagramIcon sx={{ fontSize: 16, color: '#E4405F' }} />}
                            value="Instagram"
                            href={business.instagram_url}
                          />
                        )}
                        {business.x_url && (
                          <InfoRow
                            icon={<TwitterIcon sx={{ fontSize: 16, color: '#1DA1F2' }} />}
                            value="Twitter / X"
                            href={business.x_url}
                          />
                        )}
                      </Stack>
                    </InfoCard>
                  )}
                </Stack>

                {/* Right Column - Location */}
                <Stack gap={3} sx={{ flex: 1 }}>
                  <InfoCard 
                    title="Location & Map" 
                    icon={<LocationOnIcon sx={{ fontSize: 16, color: 'primary.500' }} />}
                    fullHeight
                  >
                    <Stack gap={2} sx={{ height: '100%' }}>
                      <Box>
                        <Typography level="body-xs" sx={{ color: 'text.tertiary', mb: 0.5 }}>Address</Typography>
                        <Typography level="body-sm" sx={{ fontWeight: 500, lineHeight: 1.5 }}>
                          {fullAddress || 'No address provided'}
                        </Typography>
                        {hasCoords && (
                          <Typography level="body-xs" sx={{ color: 'text.tertiary', mt: 0.5 }}>
                            {lat}, {lng}
                          </Typography>
                        )}
                      </Box>

                      {hasCoords ? (
                        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <Box sx={{ 
                            borderRadius: 12, 
                            overflow: 'hidden', 
                            flex: 1,
                            minHeight: 200,
                            border: '1px solid',
                            borderColor: 'neutral.200'
                          }}>
                            <iframe
                              title="business-location-map"
                              width="100%"
                              height="100%"
                              style={{ border: 0 }}
                              loading="lazy"
                              referrerPolicy="no-referrer-when-downgrade"
                              src={`https://www.google.com/maps?q=${encodeURIComponent(lat!)},${encodeURIComponent(lng!)}&z=16&output=embed`}
                            />
                          </Box>
                          <Link
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lat!)},${encodeURIComponent(lng!)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 0.5,
                              fontWeight: 600,
                              fontSize: '0.875rem',
                              textDecoration: 'none',
                              color: 'primary.500',
                              '&:hover': {
                                textDecoration: 'underline'
                              }
                            }}
                          >
                            Open in Google Maps
                            <LaunchIcon sx={{ fontSize: 14 }} />
                          </Link>
                        </Box>
                      ) : (
                        <Box sx={{ 
                          flex: 1, 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          bgcolor: 'neutral.50',
                          borderRadius: 8,
                          p: 3
                        }}>
                          <Typography level="body-sm" sx={{ color: 'text.tertiary', textAlign: 'center' }}>
                            No coordinates provided
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </InfoCard>
                </Stack>
              </Stack>

              {/* Bottom Metadata */}
              <InfoCard title="Metadata" icon={<Box sx={{ width: 16, height: 16, bgcolor: 'neutral.300', borderRadius: '50%' }} />}>
                <Stack direction={{ xs: 'column', sm: 'row' }} gap={3}>
                  <Box sx={{ flex: 1 }}>
                    <Typography level="body-xs" sx={{ color: 'text.tertiary', mb: 0.5 }}>Created Date</Typography>
                    <Typography level="body-sm" sx={{ fontWeight: 500 }}>
                      {business.created_at ? new Date(business.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'Unknown'}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography level="body-xs" sx={{ color: 'text.tertiary', mb: 0.5 }}>Owner Status</Typography>
                    <Typography level="body-sm" sx={{ fontWeight: 500 }}>
                      {business.owner_id ? `Owner ID: ${business.owner_id}` : 'Unclaimed'}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography level="body-xs" sx={{ color: 'text.tertiary', mb: 0.5 }}>Business ID</Typography>
                    <Typography level="body-sm" sx={{ fontWeight: 500, fontFamily: 'monospace' }}>
                      #{business.id}
                    </Typography>
                  </Box>
                </Stack>
              </InfoCard>
            </Stack>
          )}
        </DialogContent>
      </ModalDialog>
    </Modal>
  );
};

export default BusinessDetailsModal;
