import React from "react";
import { Stack, Typography, Sheet, Chip, IconButton } from "@mui/joy";
import { Edit, Calendar, Clock, MapPin, Trash2 } from "lucide-react";
import Button from "@/src/components/Button";
import type { EventSchedule, Event as EventType } from "@/src/types/Event";

interface ScheduleInfoSectionProps {
  event?: EventType | null;
  schedules: EventSchedule[] | null;
  onEdit: () => void;
  onDelete?: (scheduleId: string) => void;
}

const ScheduleInfoSection: React.FC<ScheduleInfoSectionProps> = ({ 
  event,
  schedules, 
  onEdit,
  onDelete 
}) => {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Check if event has main date info
  const hasMainDateInfo = event?.start_date || event?.end_date;

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
          Schedule
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

      <Stack spacing={1.5}>
        {/* Show event's main date info if available */}
        {hasMainDateInfo && (
          <div className="ed-schedule-item" style={{ backgroundColor: "#f0f9ff", padding: "12px", borderRadius: "8px" }}>
            <Stack spacing={1}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip size="sm" variant="solid" color="primary">
                  Event Dates
                </Chip>
              </Stack>
              
              <Stack direction="row" spacing={3} flexWrap="wrap">
                {event?.start_date && (
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Calendar size={14} color="#0369a1" />
                    <Typography level="body-sm" sx={{ color: "#0369a1" }}>
                      Start: {formatDate(event.start_date)}
                    </Typography>
                  </Stack>
                )}
                
                {event?.end_date && (
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Calendar size={14} color="#0369a1" />
                    <Typography level="body-sm" sx={{ color: "#0369a1" }}>
                      End: {formatDate(event.end_date)}
                    </Typography>
                  </Stack>
                )}

                {event?.is_all_day && (
                  <Chip size="sm" variant="soft" color="neutral">
                    All Day
                  </Chip>
                )}
              </Stack>
            </Stack>
          </div>
        )}

        {/* Schedule items */}
        {(!schedules || schedules.length === 0) && !hasMainDateInfo ? (
          <Typography level="body-md" sx={{ color: "text.tertiary", fontStyle: "italic", textAlign: "center", py: 2 }}>
            No schedule items added
          </Typography>
        ) : schedules && schedules.length > 0 ? (
          schedules.map((schedule, index) => (
            <div key={schedule.id} className="ed-schedule-item">
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Stack spacing={0.5} flex={1}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip size="sm" variant="soft" color="primary">
                      Day {index + 1}
                    </Chip>
                    {schedule.title && (
                      <Typography level="body-md" fontWeight={600} sx={{ color: "#1e293b" }}>
                        {schedule.title}
                      </Typography>
                    )}
                  </Stack>
                  
                  <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Calendar size={14} color="#6b7280" />
                      <Typography level="body-sm" sx={{ color: "#6b7280" }}>
                        {formatDate(schedule.schedule_date)}
                      </Typography>
                    </Stack>
                    
                    {schedule.start_time && (
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Clock size={14} color="#6b7280" />
                        <Typography level="body-sm" sx={{ color: "#6b7280" }}>
                          {schedule.start_time}
                          {schedule.end_time && ` - ${schedule.end_time}`}
                        </Typography>
                      </Stack>
                    )}
                    
                    {schedule.location_override && (
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <MapPin size={14} color="#6b7280" />
                        <Typography level="body-sm" sx={{ color: "#6b7280" }}>
                          {schedule.location_override}
                        </Typography>
                      </Stack>
                    )}
                  </Stack>
                  
                  {schedule.description && (
                    <Typography level="body-sm" sx={{ color: "#6b7280", mt: 0.5 }}>
                      {schedule.description}
                    </Typography>
                  )}
                </Stack>
                
                {onDelete && (
                  <IconButton
                    size="sm"
                    variant="plain"
                    color="danger"
                    onClick={() => onDelete(schedule.id)}
                  >
                    <Trash2 size={16} />
                  </IconButton>
                )}
              </Stack>
            </div>
          ))
        ) : null}
      </Stack>
    </Sheet>
  );
};

export default ScheduleInfoSection;
