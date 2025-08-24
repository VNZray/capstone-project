import React, { useEffect, useMemo, useState } from 'react';
import { apiService } from '../../utils/api';
import type { TouristSpot, TouristSpotSchedule } from '../../types/TouristSpot';
import {
  Alert,
  Button,
  Chip,
  Divider,
  Grid,
  Link,
  Sheet,
  Stack,
  Table,
  Typography,
} from '@mui/joy';

type Props = {
  spotId: string;
  onBack: () => void;
};

const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const TouristSpotDetails: React.FC<Props> = ({ spotId, onBack }) => {
  const [spot, setSpot] = useState<TouristSpot | null>(null);
  const [schedules, setSchedules] = useState<TouristSpotSchedule[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpotDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiService.getTouristSpotById(spotId);
        setSpot(data);
        try {
          const sched = await apiService.getTouristSpotSchedules(spotId);
          setSchedules(sched);
        } catch (e) {
          console.warn('Failed to load schedules', e);
          setSchedules([]);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load tourist spot details.');
      } finally {
        setLoading(false);
      }
    };

    fetchSpotDetails();
  }, [spotId]);

  const feeDisplay = useMemo(() => {
    if (!spot || spot.entry_fee == null) return 'N/A';
    try {
      return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(spot.entry_fee);
    } catch {
      return `₱${spot.entry_fee}`;
    }
  }, [spot]);

  const createdDisplay = useMemo(() => {
    if (!spot) return '—';
    try {
      return new Date(spot.created_at).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' });
    } catch {
      return spot.created_at;
    }
  }, [spot]);

  const updatedDisplay = useMemo(() => {
    if (!spot) return '—';
    try {
      return new Date(spot.updated_at).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' });
    } catch {
      return spot.updated_at;
    }
  }, [spot]);

  const coordDisplay = useMemo(() => {
    if (!spot) return 'N/A';
    const lat = spot.latitude != null ? Number(spot.latitude).toFixed(6) : null;
    const lng = spot.longitude != null ? Number(spot.longitude).toFixed(6) : null;
    return lat && lng ? `${lat}, ${lng}` : 'N/A';
  }, [spot]);

  if (loading) return <Typography level="body-md">Loading details...</Typography>;
  if (error) return <Alert color="danger" variant="soft">{error}</Alert>;
  if (!spot) return <Alert color="warning">No details found.</Alert>;

  return (
    <Sheet variant="outlined" sx={{ p: 2, borderRadius: 8 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography level="h4">{spot.name}</Typography>
          <Chip size="sm" color={spot.spot_status === 'active' ? 'success' : spot.spot_status === 'pending' ? 'warning' : 'neutral'}>
            {spot.spot_status}
          </Chip>
          {spot.is_featured ? (
            <Chip size="sm" color="primary" variant="soft">Featured</Chip>
          ) : null}
        </Stack>
        <Button variant="plain" onClick={onBack}>← Back</Button>
      </Stack>

      <Typography level="title-md" sx={{ mb: 1 }}>Overview</Typography>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid xs={12}>
          <Typography level="body-sm" sx={{ color: 'text.tertiary' }}>Description</Typography>
          <Typography level="body-md">{spot.description || 'N/A'}</Typography>
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

  <Typography level="title-md" sx={{ mb: 1 }}>Details</Typography>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid xs={12} md={6}>
          <Stack spacing={0.5}>
            <Typography level="body-sm" sx={{ color: 'text.tertiary', mt: 1 }}>Category / Type</Typography>
    <Typography level="body-md">{spot.category} / {spot.type}</Typography>

            <Typography level="body-sm" sx={{ color: 'text.tertiary', mt: 1 }}>Location</Typography>
            <Typography level="body-md">{spot.barangay}, {spot.municipality}, {spot.province}</Typography>

            <Typography level="body-sm" sx={{ color: 'text.tertiary', mt: 1 }}>Coordinates</Typography>
    <Typography level="body-md">{coordDisplay}</Typography>

            <Typography level="body-sm" sx={{ color: 'text.tertiary', mt: 1 }}>Created / Updated</Typography>
    <Typography level="body-md">{createdDisplay} • {updatedDisplay}</Typography>
          </Stack>
        </Grid>
        <Grid xs={12} md={6}>
          <Stack spacing={0.5}>
            <Typography level="body-sm" sx={{ color: 'text.tertiary' }}>Contact Phone</Typography>
            <Typography level="body-md">{spot.contact_phone || 'N/A'}</Typography>

            <Typography level="body-sm" sx={{ color: 'text.tertiary', mt: 1 }}>Contact Email</Typography>
            <Typography level="body-md">{spot.contact_email || 'N/A'}</Typography>

            <Typography level="body-sm" sx={{ color: 'text.tertiary', mt: 1 }}>Website</Typography>
            {spot.website ? (
              <Link href={spot.website} target="_blank" rel="noopener noreferrer">
                {spot.website}
              </Link>
            ) : (
              <Typography level="body-md">N/A</Typography>
            )}

            <Typography level="body-sm" sx={{ color: 'text.tertiary', mt: 1 }}>Entry Fee</Typography>
            <Typography level="body-md">{feeDisplay}</Typography>
          </Stack>
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      <Typography level="title-md" sx={{ mb: 1 }}>Schedules</Typography>
      {schedules && schedules.length > 0 ? (
        <Table size="sm" variant="outlined" sx={{ mb: 2 }}>
          <thead>
            <tr>
              <th style={{ width: 120 }}>Day</th>
              <th>Open</th>
              <th>Close</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((s, idx) => (
              <tr key={`${s.id ?? idx}`}>
                <td>{dayNames[s.day_of_week] ?? s.day_of_week}</td>
                <td>{s.open_time ?? '—'}</td>
                <td>{s.close_time ?? '—'}</td>
                <td>
                  {s.is_closed ? (
                    <Chip size="sm" color="neutral" variant="soft">Closed</Chip>
                  ) : (
                    <Chip size="sm" color="success" variant="soft">Open</Chip>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <Typography level="body-sm" sx={{ color: 'text.tertiary', mb: 1 }}>
          {schedules ? 'No schedules provided.' : 'Loading schedules...'}
        </Typography>
      )}
    </Sheet>
  );
};

export default TouristSpotDetails;
