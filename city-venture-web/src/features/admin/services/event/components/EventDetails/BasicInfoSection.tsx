import React from "react";
import { Stack, Typography, Sheet, Chip } from "@mui/joy";
import { Edit, Calendar, Clock, Users, DollarSign } from "lucide-react";
import Button from "@/src/components/Button";
import type { Event as EventType } from "@/src/types/Event";

interface BasicInfoSectionProps {
  event: EventType;
  onEdit: () => void;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({ event, onEdit }) => {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const priceDisplay = React.useMemo(() => {
    if (event.is_free) return "Free";
    if (!event.entry_fee) return "N/A";
    try {
      return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        maximumFractionDigits: 0,
      }).format(event.entry_fee);
    } catch {
      return `₱${event.entry_fee}`;
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
          sx={{ borderRadius: '8px' }}
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
          <Typography level="body-md" sx={{ color: "#374151", whiteSpace: "pre-wrap" }}>
            {event.description || "No description available"}
          </Typography>
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
          <Stack direction="row" spacing={3} alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center">
              <Calendar size={16} color="#6b7280" />
              <Typography level="body-md" sx={{ color: "#374151" }}>
                {event.start_date ? formatDate(event.start_date) : "Not specified"}
                {event.end_date && event.end_date !== event.start_date && (
                  <> - {formatDate(event.end_date)}</>
                )}
              </Typography>
            </Stack>
            {!event.is_all_day && event.start_date && (
              <Stack direction="row" spacing={1} alignItems="center">
                <Clock size={16} color="#6b7280" />
                <Typography level="body-md" sx={{ color: "#374151" }}>
                  {formatTime(event.start_date)}
                  {event.end_date && <> - {formatTime(event.end_date)}</>}
                </Typography>
              </Stack>
            )}
          </Stack>
        </Stack>

        {/* Category */}
        <Stack spacing={0.5}>
          <Typography
            level="body-sm"
            fontWeight={600}
            sx={{ color: "#1e293b", mb: 0.5 }}
          >
            Category
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
            {event.category_name ? (
              <Chip
                size="md"
                variant="soft"
                color="primary"
                sx={{ borderRadius: "20px", fontWeight: 500 }}
              >
                {event.category_name}
              </Chip>
            ) : (
              <Typography level="body-md" sx={{ color: "text.tertiary", fontStyle: "italic" }}>
                No category specified
              </Typography>
            )}
          </Stack>
        </Stack>

        {/* Capacity & Price Row */}
        <Stack direction="row" spacing={4}>
          {/* Capacity */}
          {event.max_attendees && (
            <Stack spacing={0.5}>
              <Typography
                level="body-sm"
                fontWeight={600}
                sx={{ color: "#1e293b", mb: 0.5 }}
              >
                Capacity
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Users size={16} color="#6b7280" />
                <Typography level="body-md" sx={{ color: "#374151" }}>
                  {event.current_attendees || 0} / {event.max_attendees} attendees
                </Typography>
              </Stack>
            </Stack>
          )}

          {/* Entry Fee */}
          <Stack spacing={0.5}>
            <Typography
              level="body-sm"
              fontWeight={600}
              sx={{ color: "#1e293b", mb: 0.5 }}
            >
              Entry Fee
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <DollarSign size={16} color="#6b7280" />
              <Chip
                size="md"
                variant="soft"
                color={event.is_free ? "success" : "primary"}
                sx={{ borderRadius: "20px", fontWeight: 500 }}
              >
                {priceDisplay}
              </Chip>
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </Sheet>
  );
};

export default BasicInfoSection;
