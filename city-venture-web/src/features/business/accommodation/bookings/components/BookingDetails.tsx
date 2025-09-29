import React, { useEffect, useState, useMemo } from "react";
import { DialogTitle, DialogContent, DialogActions } from "@mui/joy";
import Modal from "@mui/joy/Modal";
import Sheet from "@mui/joy/Sheet";
import Button from "@mui/joy/Button";
import Typography from "@mui/joy/Typography";
import Divider from "@mui/joy/Divider";
import CircularProgress from "@mui/joy/CircularProgress";
import Chip from "@mui/joy/Chip";
import Box from "@mui/joy/Box";
import Grid from "@mui/joy/Grid";
import {
  fetchBookingById,
  updateBookingStatus,
} from "@/src/services/BookingService";
import type { Bookings } from "@/src/types/Booking";
import { Check, LogIn, LogOut } from "lucide-react";
import { fetchRoomDetails } from "@/src/services/RoomService";

interface BookingDetailsProps {
  open: boolean;
  onClose: () => void;
  bookingId: string | null;
  booking: Bookings[number] | null; // optionally pre-fetched booking from list
  onStatusChange?: (id: string, newStatus: string) => void;
}

// Normalize status similar to table logic
const normalizeStatus = (status?: string) => {
  if (!status) return "Pending";
  const lower = status.toLowerCase();
  if (lower === "checked-in" || lower === "checked_in") return "Checked-in";
  if (lower === "checked-out" || lower === "checked_out") return "Checked-out";
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const statusColor: Record<string, any> = {
  Pending: "neutral",
  Reserved: "success",
  "Checked-in": "warning",
  "Checked-out": "primary",
  Canceled: "danger",
};

const BookingDetails: React.FC<BookingDetailsProps> = ({
  open,
  onClose,
  bookingId,
  booking,
  onStatusChange,
}) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Bookings[number] | null>(booking || null);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [room, setRoom] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return; // don't fetch if modal closed
    if (!bookingId) return;
    // If we already have full booking (basic fields) we could skip; always re-fetch for freshest
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const b = await fetchBookingById(bookingId);
        const roomDetails = await fetchRoomDetails(b.room_id!);
        setData(b);
        setRoom(roomDetails.room_number || null);
      } catch (e: any) {
        setError(e?.message || "Failed to load booking");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [open, bookingId]);

  const close = () => {
    onClose();
    setError(null);
  };

  const currentStatus = normalizeStatus(data?.booking_status);
  const nextAction = useMemo(() => {
    if (currentStatus === "Reserved")
      return { label: "Check-in", to: "Checked-in", icon: <LogIn size={16} /> };
    if (currentStatus === "Checked-in")
      return {
        label: "Check-out",
        to: "Checked-out",
        icon: <LogOut size={16} />,
      };
    return null;
  }, [currentStatus]);

  const handleTransition = async () => {
    if (!data || !nextAction) return;
    const target = nextAction.to;
    try {
      setActionLoading(true);
      // optimistic
      setData((prev) =>
        prev ? { ...prev, booking_status: target as any } : prev
      );
      await updateBookingStatus(data.id as string, target);
      onStatusChange?.(data.id as string, target);
    } catch (e) {
      // revert if needed by refetch
      await (async () => {
        try {
          if (data?.id) {
            const fresh = await fetchBookingById(data.id);
            setData(fresh);
          }
        } catch {
          /* ignore */
        }
      })();
    } finally {
      setActionLoading(false);
    }
  };

  const formatDateReadable = (value?: Date) => {
    if (!value) return "—";
    const d = new Date(String(value));
    return d.toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Modal
      open={open}
      onClose={close}
      aria-labelledby="booking-details-title"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Sheet
        variant="soft"
        sx={{
          maxWidth: 640,
          width: "100%",
          borderRadius: 12,
          boxShadow: "lg",
          bgcolor: "background.body",
          p: 3,
          outline: "none",
        }}
      >
        <DialogTitle
          id="booking-details-title"
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          Booking Details
          {data && (
            <Chip
              size="sm"
              variant="soft"
              color={statusColor[currentStatus] || "neutral"}
            >
              {currentStatus}
            </Chip>
          )}
        </DialogTitle>
        <Divider />
        <DialogContent>
          {loading && (
            <Typography
              level="body-sm"
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <CircularProgress size="sm" /> Loading...
            </Typography>
          )}
          {!loading && error && (
            <Typography color="danger" level="body-sm">
              {error}
            </Typography>
          )}
          {!loading && !error && data && (
            <Box>
              <Typography level="h4" sx={{ mb: 2, fontWeight: 600 }}>
                Guest #{data.id?.slice(0, 6)}
              </Typography>
              <Grid container spacing={2} sx={{ mb: 1 }}>
                <Grid xs={12} md={6}>
                  <Typography
                    level="body-xs"
                    sx={{
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      color: "neutral.500",
                    }}
                  >
                    Check-in
                  </Typography>
                  <Typography level="body-sm">
                    {formatDateReadable(data.check_in_date)}
                  </Typography>
                </Grid>
                <Grid xs={12} md={6}>
                  <Typography
                    level="body-xs"
                    sx={{
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      color: "neutral.500",
                    }}
                  >
                    Check-out
                  </Typography>
                  <Typography level="body-sm">
                    {formatDateReadable(data.check_out_date)}
                  </Typography>
                </Grid>
                <Grid xs={12} md={4}>
                  <Typography
                    level="body-xs"
                    sx={{
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      color: "neutral.500",
                    }}
                  >
                    Pax
                  </Typography>
                  <Typography level="body-sm">{data.pax ?? 0}</Typography>
                </Grid>
                <Grid xs={12} md={8}>
                  <Typography
                    level="body-xs"
                    sx={{
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      color: "neutral.500",
                    }}
                  >
                    Purpose
                  </Typography>
                  <Typography level="body-sm">
                    {data.trip_purpose || "—"}
                  </Typography>
                </Grid>
                <Grid xs={12} md={6}>
                  <Typography
                    level="body-xs"
                    sx={{
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      color: "neutral.500",
                    }}
                  >
                    Room
                  </Typography>
                  <Typography level="body-sm">
                    {room || "—"}
                  </Typography>
                </Grid>
                <Grid xs={12} md={6}>
                  <Typography
                    level="body-xs"
                    sx={{
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      color: "neutral.500",
                    }}
                  >
                    Status
                  </Typography>
                  <Typography level="body-sm">{currentStatus}</Typography>
                </Grid>
              </Grid>
              <Divider sx={{ my: 1 }} />
              <Grid container spacing={2} sx={{ mb: 1 }}>
                <Grid xs={12} md={6}>
                  <Typography
                    level="body-xs"
                    sx={{
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      color: "neutral.500",
                    }}
                  >
                    Total Price
                  </Typography>
                  <Typography level="body-sm">
                    ₱{(data.total_price ?? 0).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid xs={12} md={6}>
                  <Typography
                    level="body-xs"
                    sx={{
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      color: "neutral.500",
                    }}
                  >
                    Balance
                  </Typography>
                  <Typography level="body-sm">
                    ₱{(data.balance ?? 0).toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                {data.created_at && (
                  <Typography level="body-xs" sx={{ color: "neutral.500" }}>
                    Created: {formatDateReadable(data.created_at)}
                  </Typography>
                )}
                {data.updated_at && (
                  <Typography level="body-xs" sx={{ color: "neutral.500" }}>
                    Updated: {formatDateReadable(data.updated_at)}
                  </Typography>
                )}
              </Box>
            </Box>
          )}
          {!loading && !error && !data && (
            <Typography level="body-sm">No booking data.</Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ pt: 2, gap: 1 }}>
          {nextAction && (
            <Button
              onClick={handleTransition}
              loading={actionLoading}
              color={nextAction.label === "Check-in" ? "primary" : "success"}
              startDecorator={!actionLoading && nextAction.icon}
            >
              {nextAction.label}
            </Button>
          )}
          <Button
            onClick={close}
            variant="outlined"
            color="neutral"
            startDecorator={<Check size={14} />}
          >
            Close
          </Button>
        </DialogActions>
      </Sheet>
    </Modal>
  );
};

export default BookingDetails;
