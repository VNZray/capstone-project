import React, { useEffect, useMemo, useState } from "react";
import { apiService } from "../../../../utils/api";
import type { Event } from "./EventTable";
import {
  Alert,
  Button,
  Chip,
  Divider,
  Grid,
  Sheet,
  Stack,
  Typography,
  Card,
  CardContent,
} from "@mui/joy";
import MapInput from "../../../../components/touristSpot/MapInput";

interface EventDetailsProps {
  eventId: string;
  initialData?: Event | null;
  onBack: () => void;
  onEdit: (step?: number) => void;
}

const EventDetails: React.FC<EventDetailsProps> = ({ eventId, initialData = null, onBack, onEdit }) => {
  const [event, setEvent] = useState<Event | null>(initialData ?? null);
  const [rawData, setRawData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError(null);
        // If parent provided initial data, use that and skip network call
        if (initialData) {
          setEvent(initialData);
          setRawData(null);
          setLoading(false);
          return;
        }

        const raw = await apiService.getEventById(eventId);
        const data = Array.isArray(raw) ? raw[0] : raw;
        // Adapt backend row shape to UI
        const adapted: Event = {
          id: data?.id,
          name: data?.event_name ?? data?.name ?? "Untitled Event",
          date: data?.event_start_date ?? data?.date,
          categories: data?.category ? [{ category: data.category }] : data?.categories,
          description: data?.description,
          status: data?.status ?? undefined,
        };
        setEvent(adapted);
        setRawData(data ?? null);
      } catch (e) {
        console.error(e);
        // Only show an error if we don't already have event data to display
        if (!initialData && !event) {
          setError("Failed to load event details.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventId, initialData]);

  const dateDisplay = useMemo(() => {
    if (!event?.date) return "—";
    try {
      return new Date(event.date).toLocaleString("en-PH", { dateStyle: "medium" });
    } catch {
      return event.date;
    }
  }, [event]);

  // Simple demo metrics to match the sample UI (replace with real analytics when available)
  const metrics = useMemo(
    () => [
      { label: "Average Rating", value: "4.8", color: "warning" as const },
      { label: "Profile Views", value: "356", color: "success" as const },
      { label: "Socials Click", value: "1823", color: "primary" as const },
      { label: "Total Reviews", value: "26", color: "neutral" as const },
    ],
    []
  );

  if (loading) return <Typography level="body-md">Loading details...</Typography>;
  if (error) return <Alert color="danger" variant="soft">{error}</Alert>;
  if (!event) return <Alert color="warning">No details found.</Alert>;

  return (
    <Sheet variant="outlined" sx={{ p: 1.5, borderRadius: 8 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Button variant="plain" onClick={onBack}>← Back</Button>
        <Typography level="h3">Event Details</Typography>
        <Button variant="outlined" onClick={() => onEdit(0)}>Edit</Button>
      </Stack>

      {/* Metrics */}
      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        {metrics.map((m) => (
          <Grid key={m.label} xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ borderRadius: 10 }}>
              <CardContent>
                <Stack alignItems="center" spacing={0.5}>
                  <Typography level="h3" color={m.color}>{m.value}</Typography>
                  <Typography level="body-sm" sx={{ color: 'text.tertiary' }}>{m.label}</Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2} sx={{ maxWidth: '100%', overflow: 'hidden' }}>
        {/* Left: hero image + content */}
        <Grid xs={12} lg={9}>
          <Stack spacing={2}>
            <Sheet 
              variant="outlined" 
              sx={{ 
                height: 220, 
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'background.level1',
                minHeight: 220,
              }}
            >
              <Typography level="body-sm" sx={{ color: 'text.tertiary' }}>
                Image Placeholder
              </Typography>
            </Sheet>

            <Stack spacing={0.5}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
                <Typography level="h4">{event.name}</Typography>
                {event.status && (
                  <Chip size="sm" color={event.status === 'active' ? 'success' : event.status === 'pending' ? 'warning' : 'neutral'}>
                    {event.status}
                  </Chip>
                )}
              </Stack>
              <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>{event.categories?.map((c) => c.category).join(", ") || '—'} · {dateDisplay}</Typography>
            </Stack>

            <Divider />
            <Stack spacing={0.5}>
              <Typography level="title-sm" sx={{ color: 'text.tertiary' }}>About The Event</Typography>
              <Typography level="body-md">{event.description || 'No description provided'}</Typography>
            </Stack>
          </Stack>
        </Grid>

        {/* Right: info card */}
        <Grid xs={12} lg={3}>
          <Card variant="outlined" sx={{ borderRadius: 10 }}>
            <CardContent>
              <Stack spacing={1}>
                <Typography level="title-sm" sx={{ color: 'text.tertiary' }}>Location</Typography>
                <Sheet 
                  variant="outlined" 
                  sx={{ borderRadius: 8, overflow: 'hidden', '& > div': { '& > div': { height: '180px !important' } } }}
                >
                  <MapInput 
                    latitude={rawData?.latitude ?? undefined}
                    longitude={rawData?.longitude ?? undefined}
                    onChange={() => {}}
                  />
                </Sheet>

                <Stack spacing={0.5}>
                  <Typography level="title-sm" sx={{ color: 'text.tertiary' }}>Address</Typography>
                  <Typography level="body-sm">{(event as any)?.address || 'Not provided'}</Typography>
                </Stack>

                <Stack spacing={0.5}>
                  <Typography level="title-sm" sx={{ color: 'text.tertiary' }}>Contact Number</Typography>
                  <Typography level="body-sm">Not provided</Typography>
                </Stack>

                <Stack spacing={0.5}>
                  <Typography level="title-sm" sx={{ color: 'text.tertiary' }}>Website</Typography>
                  <Typography level="body-sm">Not provided</Typography>
                </Stack>

                <Stack spacing={0.5}>
                  <Typography level="title-sm" sx={{ color: 'text.tertiary' }}>Social Apps</Typography>
                  <Typography level="body-sm">Connect your social media (optional).</Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Sheet>
  );
};

export default EventDetails;