import React, { useEffect, useState, Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiService } from "@/src/utils/api";
import type { Event as EventType, EventImage, EventSchedule } from "@/src/types/Event";
import { Alert, Grid, Sheet, Stack, Typography, IconButton, Chip } from "@mui/joy";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EditIcon from "@mui/icons-material/Edit";
import { Star } from "lucide-react";
import "./components/EventDetails/EventDetails.css";
import {
  BasicInfoSection,
  LocationInfoSection,
  ContactInfoSection,
  ScheduleInfoSection,
  ImagesInfoSection,
  AdminInfoSection,
  ReviewsInfoSection,
} from "./components/EventDetails/index";
import { EventForm } from "./components";
import PageContainer from "@/src/components/PageContainer";

// Error Boundary Component
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("EventDetails Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert color="danger" variant="soft" sx={{ m: 2 }}>
          <Typography level="title-md">Something went wrong</Typography>
          <Typography level="body-sm">{this.state.error?.message}</Typography>
        </Alert>
      );
    }
    return this.props.children;
  }
}

type Props = {
  eventId?: string;
  onBack?: () => void;
  onEdit?: (step?: number) => void;
  onRefresh?: () => void;
};

const EventDetailsContent: React.FC<Props> = ({ eventId, onEdit, onRefresh }) => {
  const [event, setEvent] = useState<EventType | null>(null);
  const [schedules, setSchedules] = useState<EventSchedule[] | null>(null);
  const [images, setImages] = useState<EventImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshEvent = async () => {
    if (!eventId) return;
    try {
      const data = await apiService.getEventById(eventId);
      setEvent(data);
      onRefresh?.();
    } catch (err) {
      console.error("Error refreshing event:", err);
    }
  };

  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!eventId) {
        console.log("No eventId provided");
        return;
      }
      
      console.log("Fetching event details for:", eventId);
      
      try {
        setLoading(true);
        setError(null);
        const data = await apiService.getEventById(eventId);
        console.log("Event data received:", data);
        setEvent(data);

        try {
          const sched = await apiService.getEventSchedules(eventId);
          setSchedules(sched);
        } catch (e) {
          console.warn("Failed to load schedules", e);
          setSchedules([]);
        }

        try {
          const imageData = await apiService.getEventImages(eventId);
          setImages(imageData || []);
        } catch (e) {
          console.warn("Failed to load images", e);
          setImages([]);
        }
      } catch (err) {
        console.error("Error fetching event:", err);
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

  const handleSetPrimaryImage = async (imageId: string) => {
    try {
      await apiService.setPrimaryEventImage(imageId);
      setImages(images.map((img) => ({
        ...img,
        is_primary: img.id === imageId,
      })));
    } catch (err) {
      console.error("Error setting primary image:", err);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;
    
    try {
      await apiService.deleteEventImage(imageId);
      setImages(images.filter((img) => img.id !== imageId));
    } catch (err) {
      console.error("Error deleting image:", err);
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!confirm("Are you sure you want to delete this schedule item?")) return;
    
    try {
      await apiService.deleteEventSchedule(scheduleId);
      setSchedules(schedules?.filter((s) => s.id !== scheduleId) || []);
    } catch (err) {
      console.error("Error deleting schedule:", err);
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

  const primaryImage = images.find((img) => img.is_primary) || images[0];

  return (
    <div className="ed-page">
      {/* Main content layout: left (details) and right (sidebar) */}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid xs={12} md={8}>
          <Stack spacing={1}>
            {/* Hero Banner */}
            <Sheet sx={{ p: 1, borderRadius: 15 }}>
              <div className="ed-hero" role="banner">
                <div
                  className="ed-hero__bg"
                  style={{
                    backgroundImage: primaryImage?.file_url
                      ? `url(${primaryImage.file_url})`
                      : undefined,
                  }}
                />
                <div className="ed-hero__gradient" />

                <div className="ed-hero__content">
                  <div className="ed-hero__panel">
                    <div className="ed-hero__title">
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
                          className="ed-hero__edit-inline"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      )}
                    </div>

                    <div className="ed-hero__row">
                      <LocationOnIcon className="ed-hero__icon" />
                      <Typography
                        level="body-lg"
                        sx={{
                          color: "#e5e7eb",
                          fontSize: { xs: "14px", md: "16px" },
                        }}
                      >
                        {event.venue_name || 
                          `${event.barangay ?? ""}${event.barangay ? ", " : ""}${event.municipality ?? ""}${event.municipality ? ", " : ""}${event.province ?? ""}` || 
                          "Location not available"}
                      </Typography>
                    </div>

                    <div className="ed-hero__badges">
                      {event.is_featured && (
                        <Chip 
                          size="sm" 
                          variant="soft" 
                          color="warning"
                          startDecorator={<Star size={12} />}
                          sx={{ bgcolor: "rgba(251, 191, 36, 0.2)", color: "#fbbf24" }}
                        >
                          Featured
                        </Chip>
                      )}
                      {event.category_name && (
                        <Chip 
                          size="sm" 
                          variant="soft"
                          sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "#fff" }}
                        >
                          {event.category_name}
                        </Chip>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Sheet>

            {/* Basic Info */}
            <Sheet
              variant="outlined"
              sx={{ p: 1, borderRadius: 15 }}
              className="ed-card"
            >
              <BasicInfoSection
                event={event}
                onEdit={() => handleSectionEdit(0)}
              />
            </Sheet>

            {/* Schedule */}
            <Sheet
              variant="outlined"
              sx={{ p: 1, borderRadius: 15 }}
              className="ed-card"
            >
              <ScheduleInfoSection
                event={event}
                schedules={schedules}
                onEdit={() => handleSectionEdit(2)}
                onDelete={handleDeleteSchedule}
              />
            </Sheet>

            {/* Images */}
            <Sheet
              variant="outlined"
              sx={{ p: 1, borderRadius: 15 }}
              className="ed-card"
            >
              <ImagesInfoSection
                images={images}
                onEdit={() => handleSectionEdit(4)}
                onSetPrimary={handleSetPrimaryImage}
                onDelete={handleDeleteImage}
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
              className="ed-card"
            >
              <LocationInfoSection
                event={event}
                onEdit={() => handleSectionEdit(1)}
              />
            </Sheet>

            {/* Contacts / Organizer */}
            <Sheet
              variant="outlined"
              sx={{ p: 1, borderRadius: 15 }}
              className="ed-card"
            >
              <ContactInfoSection
                event={event}
                onEdit={() => handleSectionEdit(5)}
              />
            </Sheet>

            {/* Admin info */}
            <Sheet
              variant="outlined"
              sx={{ p: 1, borderRadius: 15 }}
              className="ed-card"
            >
              <AdminInfoSection
                event={event}
                onEdit={() => handleSectionEdit(3)}
                onStatusChange={refreshEvent}
              />
            </Sheet>

            {/* Reviews */}
            <Sheet
              variant="outlined"
              sx={{ p: 1, borderRadius: 15 }}
              className="ed-card"
            >
              <ReviewsInfoSection eventId={eventId || ''} />
            </Sheet>
          </Stack>
        </Grid>
      </Grid>
    </div>
  );
};

// Main screen component
const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isEditVisible, setEditVisible] = useState(false);
  const [editEventData, setEditEventData] = useState<EventType | undefined>(undefined);
  const [categories, setCategories] = useState<any[]>([]);
  const [refreshTick, setRefreshTick] = useState(0);
  const [editStep, setEditStep] = useState(0);

  console.log("EventDetails rendered with id:", id);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await apiService.getEventCategories();
        setCategories(cats);
      } catch (e) {
        console.warn("Failed to load categories", e);
      }
    };
    loadCategories();
  }, []);

  if (!id) {
    console.log("No event ID in URL params");
    return (
      <PageContainer padding={20}>
        <Alert color="danger">No event ID provided</Alert>
      </PageContainer>
    );
  }

  const openEdit = async (step: number = 0) => {
    setEditStep(step);
    try {
      const data = await apiService.getEventById(id);
      setEditEventData(data);
    } catch (e) {
      console.warn("Failed to prefetch event for edit", e);
      setEditEventData(undefined);
    }
    setEditVisible(true);
  };

  return (
    <ErrorBoundary>
      <PageContainer padding={20}>
        <EventDetailsContent
          key={`${id}-${refreshTick}`}
          eventId={id}
          onBack={() => navigate(-1)}
          onEdit={openEdit}
        />
        <EventForm
          isVisible={isEditVisible}
          onClose={() => setEditVisible(false)}
          onEventUpdated={() => {
            setEditVisible(false);
            setRefreshTick((t) => t + 1);
          }}
          mode="edit"
          initialData={editEventData}
          categories={categories}
          initialStep={editStep}
        />
      </PageContainer>
    </ErrorBoundary>
  );
};

export default EventDetails;
