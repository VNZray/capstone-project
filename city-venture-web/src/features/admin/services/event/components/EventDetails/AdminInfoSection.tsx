import React, { useState } from "react";
import { Stack, Typography, Sheet, Chip } from "@mui/joy";
import { Edit, Eye, Bookmark, Clock, CheckCircle, XCircle, Send } from "lucide-react";
import Button from "@/src/components/Button";
import { apiService } from "@/src/utils/api";
import type { Event as EventType, EventStatus } from "@/src/types/Event";

interface AdminInfoSectionProps {
  event: EventType;
  onEdit: () => void;
  onStatusChange?: () => void;
}

const statusColors: Record<EventStatus, "success" | "warning" | "danger" | "neutral" | "primary"> = {
  draft: "neutral",
  pending: "warning",
  approved: "primary",
  rejected: "danger",
  published: "success",
  cancelled: "danger",
  completed: "neutral",
  archived: "neutral",
};

const AdminInfoSection: React.FC<AdminInfoSectionProps> = ({ event, onEdit, onStatusChange }) => {
  const [statusLoading, setStatusLoading] = useState<string | null>(null);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const handleStatusChange = async (newStatus: EventStatus) => {
    try {
      setStatusLoading(newStatus);
      await apiService.updateEvent(event.id, { status: newStatus });
      onStatusChange?.();
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update event status");
    } finally {
      setStatusLoading(null);
    }
  };

  // Determine which status actions are available
  const getAvailableActions = (): { label: string; status: EventStatus; color: "success" | "error" | "warning" | "primary"; icon: React.ReactNode }[] => {
    switch (event.status) {
      case "draft":
        return [
          { label: "Submit for Review", status: "pending", color: "warning", icon: <Send size={14} /> },
        ];
      case "pending":
        return [
          { label: "Approve", status: "approved", color: "success", icon: <CheckCircle size={14} /> },
          { label: "Reject", status: "rejected", color: "error", icon: <XCircle size={14} /> },
        ];
      case "approved":
        return [
          { label: "Publish", status: "published", color: "success", icon: <CheckCircle size={14} /> },
          { label: "Cancel", status: "cancelled", color: "error", icon: <XCircle size={14} /> },
        ];
      case "rejected":
        return [
          { label: "Resubmit", status: "pending", color: "warning", icon: <Send size={14} /> },
        ];
      case "published":
        return [
          { label: "Mark Complete", status: "completed", color: "primary", icon: <CheckCircle size={14} /> },
          { label: "Cancel", status: "cancelled", color: "error", icon: <XCircle size={14} /> },
        ];
      case "cancelled":
        return [
          { label: "Resubmit", status: "pending", color: "warning", icon: <Send size={14} /> },
        ];
      case "completed":
        return [
          { label: "Archive", status: "archived", color: "warning", icon: <CheckCircle size={14} /> },
        ];
      default:
        return [];
    }
  };

  const availableActions = getAvailableActions();

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
            color={event.status ? (statusColors[event.status] || "neutral") : "neutral"}
            sx={{ borderRadius: "20px", fontWeight: 500, width: "fit-content" }}
          >
            {event.status ? event.status.charAt(0).toUpperCase() + event.status.slice(1) : "Unknown"}
          </Chip>
        </Stack>

        {/* Featured */}
        {event.is_featured && (
          <Stack spacing={0.5}>
            <Typography
              level="body-sm"
              fontWeight={600}
              sx={{ color: "#1e293b", mb: 0.5 }}
            >
              Featured
            </Typography>
            <Chip
              size="md"
              variant="soft"
              color="warning"
              startDecorator={<CheckCircle size={14} />}
              sx={{ borderRadius: "20px", fontWeight: 500, width: "fit-content" }}
            >
              Featured Event
            </Chip>
          </Stack>
        )}

        {/* Stats */}
        <Stack spacing={0.5}>
          <Typography
            level="body-sm"
            fontWeight={600}
            sx={{ color: "#1e293b", mb: 0.5 }}
          >
            Statistics
          </Typography>
          <Stack direction="row" spacing={2}>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Eye size={14} color="#6b7280" />
              <Typography level="body-sm" sx={{ color: "#6b7280" }}>
                {event.view_count || 0} views
              </Typography>
            </Stack>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Bookmark size={14} color="#6b7280" />
              <Typography level="body-sm" sx={{ color: "#6b7280" }}>
                {event.bookmark_count || 0} bookmarks
              </Typography>
            </Stack>
          </Stack>
        </Stack>

        {/* Timestamps */}
        <Stack spacing={0.5}>
          <Typography
            level="body-sm"
            fontWeight={600}
            sx={{ color: "#1e293b", mb: 0.5 }}
          >
            Timestamps
          </Typography>
          <Stack spacing={0.5}>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Clock size={14} color="#6b7280" />
              <Typography level="body-sm" sx={{ color: "#6b7280" }}>
                Created: {event.created_at ? formatDate(event.created_at) : "N/A"}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Clock size={14} color="#6b7280" />
              <Typography level="body-sm" sx={{ color: "#6b7280" }}>
                Updated: {event.updated_at ? formatDate(event.updated_at) : "N/A"}
              </Typography>
            </Stack>
          </Stack>
        </Stack>

        {/* Status Actions */}
        {availableActions.length > 0 && (
          <Stack spacing={1}>
            <Typography
              level="body-sm"
              fontWeight={600}
              sx={{ color: "#1e293b", mb: 0.5 }}
            >
              Actions
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {availableActions.map((action) => (
                <Button
                  key={action.status}
                  size="sm"
                  variant="soft"
                  colorScheme={action.color}
                  startDecorator={action.icon}
                  onClick={() => handleStatusChange(action.status)}
                  loading={statusLoading === action.status}
                  disabled={statusLoading !== null}
                >
                  {action.label}
                </Button>
              ))}
            </Stack>
          </Stack>
        )}
      </Stack>
    </Sheet>
  );
};

export default AdminInfoSection;
