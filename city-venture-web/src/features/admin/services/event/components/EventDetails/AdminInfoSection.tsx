import React from "react";
import { Stack, Typography, Sheet, Chip } from "@mui/joy";
import { Star, CheckCircle, Clock, XCircle, AlertCircle, Edit as EditIcon } from "lucide-react";
import type { Event, EventStatus } from "@/src/types/Event";

interface AdminInfoSectionProps {
  event: Event;
}

const statusConfig: Record<
  EventStatus,
  { label: string; color: "success" | "warning" | "danger" | "neutral" | "primary"; icon: React.ReactNode }
> = {
  draft: { label: "Draft", color: "neutral", icon: <EditIcon size={14} /> },
  pending: { label: "Pending", color: "warning", icon: <Clock size={14} /> },
  approved: { label: "Approved", color: "primary", icon: <CheckCircle size={14} /> },
  rejected: { label: "Rejected", color: "danger", icon: <XCircle size={14} /> },
  published: { label: "Published", color: "success", icon: <CheckCircle size={14} /> },
  cancelled: { label: "Cancelled", color: "danger", icon: <XCircle size={14} /> },
  completed: { label: "Completed", color: "neutral", icon: <CheckCircle size={14} /> },
  archived: { label: "Archived", color: "neutral", icon: <AlertCircle size={14} /> },
};

const formatDateTime = (dateStr?: string) => {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const AdminInfoSection: React.FC<AdminInfoSectionProps> = ({ event }) => {
  const status = statusConfig[event.status] || statusConfig.draft;

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
          Admin Info
        </Typography>
      </Stack>

      <Stack spacing={2}>
        {/* Status */}
        <Stack spacing={0.5}>
          <Typography
            level="body-sm"
            fontWeight={600}
            sx={{ color: "#1e293b", mb: 0.5 }}
          >
            Status
          </Typography>
          <Chip
            size="md"
            variant="soft"
            color={status.color}
            startDecorator={status.icon}
            sx={{ width: "fit-content" }}
          >
            {status.label}
          </Chip>
        </Stack>

        {/* Featured */}
        <Stack spacing={0.5}>
          <Typography
            level="body-sm"
            fontWeight={600}
            sx={{ color: "#1e293b", mb: 0.5 }}
          >
            Featured
          </Typography>
          {event.is_featured ? (
            <Chip
              size="md"
              variant="soft"
              color="warning"
              startDecorator={<Star size={14} fill="currentColor" />}
              sx={{ width: "fit-content" }}
            >
              Featured Event
            </Chip>
          ) : (
            <Typography level="body-md" sx={{ color: "#6b7280" }}>
              Not featured
            </Typography>
          )}
        </Stack>

        {/* Created At */}
        <Stack spacing={0.5}>
          <Typography
            level="body-sm"
            fontWeight={600}
            sx={{ color: "#1e293b", mb: 0.5 }}
          >
            Created
          </Typography>
          <Typography level="body-md">
            {formatDateTime(event.created_at)}
          </Typography>
        </Stack>

        {/* Approved At (if applicable) */}
        {event.approved_at && (
          <Stack spacing={0.5}>
            <Typography
              level="body-sm"
              fontWeight={600}
              sx={{ color: "#1e293b", mb: 0.5 }}
            >
              Approved
            </Typography>
            <Typography level="body-md">
              {formatDateTime(event.approved_at)}
            </Typography>
          </Stack>
        )}

        {/* Rejection Reason (if rejected) */}
        {event.status === "rejected" && event.rejection_reason && (
          <Stack spacing={0.5}>
            <Typography
              level="body-sm"
              fontWeight={600}
              sx={{ color: "#dc2626", mb: 0.5 }}
            >
              Rejection Reason
            </Typography>
            <Typography level="body-md" sx={{ color: "#dc2626" }}>
              {event.rejection_reason}
            </Typography>
          </Stack>
        )}
      </Stack>
    </Sheet>
  );
};

export default AdminInfoSection;
