import React, { useEffect, useState } from "react";
import { apiService } from "@/src/utils/api";
import type { Event as EventType } from "@/src/types/Event";
import { Alert, Grid, Sheet, Stack, Typography, IconButton } from "@mui/joy";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import EditIcon from "@mui/icons-material/Edit";
import "./EventDetails/EventDetails.css";
import {
  BasicInfoSection,
  LocationInfoSection,
  ContactInfoSection,
  OrganizerInfoSection,
  AdminInfoSection,
  ImagesInfoSection,
} from "./EventDetails/index";
import placeholderImage from "@/src/assets/images/placeholder-image.png";

type Props = {
  eventId: string;
  onBack: () => void;
  onEdit?: (step?: number) => void;
};

// Format date for display
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const EventDetails: React.FC<Props> = ({ eventId, onEdit }) => {
  const [event, setEvent] = useState<EventType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("[EventDetails] Fetching event:", eventId);
        const data = await apiService.getEventById(eventId);
        console.log("[EventDetails] Event data received:", data);
        setEvent(data);
      } catch (err: any) {
        console.error("[EventDetails] Error fetching event:", err);
        console.error("[EventDetails] Error details:", {
          message: err?.message,
          status: err?.response?.status,
          data: err?.response?.data,
        });
        setError("Failed to load event details.");
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId]);

  const handleSectionEdit = (step: number) => {
    if (onEdit) {
      onEdit(step);
    }
  };

  if (loading)
    return <Typography level="body-md">Loading details...</Typography>;
  if (error)
    return (
      <Alert color="danger" variant="soft">
        {error}
      </Alert>
    );
  if (!event) return <Alert color="warning">No details found.</Alert>;

  // Get cover image
  const coverImage = event.cover_image_url || placeholderImage;

  // Build location string
  const locationParts = [
    event.venue_name,
    event.barangay_name,
    event.municipality_name,
    event.province_name,
  ].filter(Boolean);
  const locationString = locationParts.length > 0 ? locationParts.join(", ") : "Location not specified";

  return (
    <div className="event-details-page">
      {/* Main content layout: left (details) and right (sidebar) */}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid xs={12} md={8}>
          <Stack spacing={1}>
            {/* Hero Banner */}
            <Sheet sx={{ p: 1, borderRadius: 15 }}>
              <div className="event-hero" role="banner">
                <div
                  className="event-hero__bg"
                  style={{
                    backgroundImage: `url(${coverImage})`,
                  }}
                />
                <div className="event-hero__gradient" />

                <div className="event-hero__content">
                  <div className="event-hero__panel">
                    <div className="event-hero__title">
                      <Typography
                        level="h1"
                        fontWeight={700}
                        sx={{
                          fontSize: { xs: "26px", sm: "34px", md: "42px" },
                          lineHeight: 1.15,
                          color: "#fff",
                          letterSpacing: "-0.02em",
                          mb: 0.5,
                        }}
                      >
                        {event.name}
                      </Typography>
                      {onEdit && (
                        <IconButton
                          aria-label="Edit basic info"
                          size="sm"
                          variant="soft"
                          onClick={() => handleSectionEdit(0)}
                          className="event-hero__edit-inline"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      )}
                    </div>

                    <div className="event-hero__row">
                      <CalendarMonthIcon className="event-hero__icon" />
                      <Typography
                        level="body-lg"
                        sx={{
                          color: "#e5e7eb",
                          fontSize: { xs: "14px", md: "16px" },
                        }}
                      >
                        {formatDate(event.start_date)}
                        {event.end_date &&
                          event.end_date !== event.start_date &&
                          ` - ${formatDate(event.end_date)}`}
                      </Typography>
                    </div>

                    <div className="event-hero__row">
                      <LocationOnIcon className="event-hero__icon" />
                      <Typography
                        level="body-lg"
                        sx={{
                          color: "#e5e7eb",
                          fontSize: { xs: "14px", md: "16px" },
                        }}
                      >
                        {locationString}
                      </Typography>
                    </div>
                  </div>
                </div>
              </div>
            </Sheet>

            {/* Basic Info */}
            <Sheet
              variant="outlined"
              sx={{ p: 1, borderRadius: 15 }}
              className="event-card"
            >
              <BasicInfoSection
                event={event}
                onEdit={() => handleSectionEdit(0)}
              />
            </Sheet>

            {/* Images Gallery */}
            <Sheet
              variant="outlined"
              sx={{ p: 1, borderRadius: 15 }}
              className="event-card"
            >
              <ImagesInfoSection
                images={event.images || []}
                onEdit={() => handleSectionEdit(5)}
              />
            </Sheet>
          </Stack>
        </Grid>

        <Grid xs={12} md={4}>
          <Stack spacing={1}>
            {/* Location with map */}
            <Sheet
              variant="outlined"
              sx={{ p: 1, borderRadius: 15 }}
              className="event-card"
            >
              <LocationInfoSection
                event={event}
                onEdit={() => handleSectionEdit(1)}
              />
            </Sheet>

            {/* Contact Info */}
            <Sheet
              variant="outlined"
              sx={{ p: 1, borderRadius: 15 }}
              className="event-card"
            >
              <ContactInfoSection
                event={event}
                onEdit={() => handleSectionEdit(4)}
              />
            </Sheet>

            {/* Organizer */}
            <Sheet
              variant="outlined"
              sx={{ p: 1, borderRadius: 15 }}
              className="event-card"
            >
              <OrganizerInfoSection
                event={event}
                onEdit={() => handleSectionEdit(4)}
              />
            </Sheet>

            {/* Admin info */}
            <Sheet
              variant="outlined"
              sx={{ p: 1, borderRadius: 15 }}
              className="event-card"
            >
              <AdminInfoSection event={event} />
            </Sheet>
          </Stack>
        </Grid>
      </Grid>
    </div>
  );
};

export default EventDetails;
