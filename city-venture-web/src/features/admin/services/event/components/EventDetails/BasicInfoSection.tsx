import React from "react";
import { Stack, Typography, Sheet, Chip } from "@mui/joy";
import { Edit, Calendar, Clock, Users, Ticket } from "lucide-react";
import type { Event } from "@/src/types/Event";
import Button from "@/src/components/Button";

interface BasicInfoSectionProps {
  event: Event;
  onEdit: () => void;
}

// Format date for display
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

// Format time for display
const formatTime = (timeStr?: string) => {
  if (!timeStr) return null;
  const [hours, minutes] = timeStr.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({ event, onEdit }) => {
  const priceDisplay = React.useMemo(() => {
    if (event.is_free) return "Free";
    if (!event.ticket_price) return "N/A";
    try {
      return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        maximumFractionDigits: 0,
      }).format(event.ticket_price);
    } catch {
      return `₱${event.ticket_price}`;
    }
  }, [event]);

  return (
    <Sheet sx={{ p: 2 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography
          fontFamily={"poppins"}
          level="title-lg"
          fontWeight={700}
          sx={{ color: "#1e293b" }}
        >
          About the Event
        </Typography>
        <Button
          variant="outlined"
          size="sm"
          startDecorator={<Edit size={16} />}
          onClick={onEdit}
          sx={{ borderRadius: "8px" }}
        >
          Edit
        </Button>
      </Stack>

      <Stack spacing={2}>
        {/* Description */}
        <Stack spacing={0.5}>
          <Typography
            level="body-sm"
            fontWeight={600}
            sx={{ color: "#1e293b", mb: 0.5 }}
          >
            Description
          </Typography>
          <Typography level="body-md" sx={{ color: "#374151" }}>
            {event.description || "No description available"}
          </Typography>
        </Stack>

        {/* Category */}
        <Stack spacing={0.5}>
          <Typography
            level="body-sm"
            fontWeight={600}
            sx={{ color: "#1e293b", mb: 0.5 }}
          >
            {event.categories && event.categories.length > 1 ? "Categories" : "Category"}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
            {event.categories && event.categories.length > 0 ? (
              event.categories.map((cat) => (
                <Chip
                  key={cat.id}
                  size="md"
                  variant="soft"
                  color="primary"
                  sx={{ borderRadius: "20px", fontWeight: 500 }}
                >
                  {cat.name}
                </Chip>
              ))
            ) : event.category_name ? (
              <Chip
                size="md"
                variant="soft"
                color="primary"
                sx={{ borderRadius: "20px", fontWeight: 500 }}
              >
                {event.category_name}
              </Chip>
            ) : (
              <Typography
                level="body-md"
                sx={{ color: "text.tertiary", fontStyle: "italic" }}
              >
                No category
              </Typography>
            )}
          </Stack>
        </Stack>

        {/* Date & Time */}
        <Stack spacing={0.5}>
          <Typography
            level="body-sm"
            fontWeight={600}
            sx={{ color: "#1e293b", mb: 0.5 }}
          >
            Date & Time
          </Typography>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Calendar size={18} color="#6b7280" />
            <Typography level="body-md">
              {formatDate(event.start_date)}
              {event.end_date &&
                event.end_date !== event.start_date &&
                ` - ${formatDate(event.end_date)}`}
            </Typography>
          </Stack>
          {!event.is_all_day && (event.start_time || event.end_time) && (
            <Stack direction="row" alignItems="center" spacing={1}>
              <Clock size={18} color="#6b7280" />
              <Typography level="body-md">
                {formatTime(event.start_time)}
                {event.end_time && ` - ${formatTime(event.end_time)}`}
              </Typography>
            </Stack>
          )}
          {!!event.is_all_day && (
            <Chip size="sm" variant="soft" color="neutral">
              All Day Event
            </Chip>
          )}
        </Stack>

        {/* Pricing & Capacity */}
        <Stack direction="row" spacing={3}>
          <Stack spacing={0.5}>
            <Typography
              level="body-sm"
              fontWeight={600}
              sx={{ color: "#1e293b" }}
            >
              Ticket Price
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Ticket size={18} color="#6b7280" />
              <Typography level="body-md">{priceDisplay}</Typography>
            </Stack>
          </Stack>

          {event.max_capacity != null && event.max_capacity > 0 && (
            <Stack spacing={0.5}>
              <Typography
                level="body-sm"
                fontWeight={600}
                sx={{ color: "#1e293b" }}
              >
                Capacity
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Users size={18} color="#6b7280" />
                <Typography level="body-md">
                  {event.current_attendees > 0 ? `${event.current_attendees} / ` : ""}{event.max_capacity}
                </Typography>
              </Stack>
            </Stack>
          )}
        </Stack>
      </Stack>
    </Sheet>
  );
};

export default BasicInfoSection;
