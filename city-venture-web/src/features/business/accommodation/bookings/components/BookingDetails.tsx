import React, { useState, useMemo, useEffect } from "react";
import {
  Modal,
  ModalClose,
  Sheet,
  Typography,
  Button,
  Divider,
  Chip,
  Avatar,
} from "@mui/joy";
import { Box } from "@mui/material";
import {
  User,
  Calendar,
  Users,
  DollarSign,
  MapPin,
  Clock,
  FileText,
} from "lucide-react";
import type { Booking } from "@/src/types/Booking";
import { fetchTourist } from "@/src/services/BookingService";
import { fetchUserData } from "@/src/services/AuthService";
import api from "@/src/services/api";

interface BookingDetailsProps {
  open: boolean;
  onClose: () => void;
  bookingId: string | null;
  booking: Booking | null;
  onStatusChange: (id: string, newStatus: string) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "Pending":
      return "neutral";
    case "Reserved":
      return "success";
    case "Checked-in":
      return "warning";
    case "Checked-out":
      return "primary";
    case "Canceled":
      return "danger";
    default:
      return "neutral";
  }
};

const BookingDetails: React.FC<BookingDetailsProps> = ({
  open,
  onClose,
  bookingId,
  booking,
  onStatusChange,
}) => {
  const [guestInfo, setGuestInfo] = useState<{
    name: string;
    email?: string;
    phone?: string;
    user_profile?: string;
  } | null>(null);
  const [imageError, setImageError] = useState(false);

  // Fetch guest info
  useEffect(() => {
    const loadGuestInfo = async () => {
      if (!booking?.tourist_id) return;
      try {
        const tourist = await fetchTourist(booking.tourist_id);
        let userData = undefined;
        if (tourist?.user_id) {
          userData = await fetchUserData(tourist.user_id);
        }
        setGuestInfo({
          name:
            [tourist?.first_name, tourist?.last_name]
              .filter(Boolean)
              .join(" ") || "Guest",
          email: userData?.email,
          phone: userData?.phone_number,
          user_profile: userData?.user_profile,
        });
      } catch (error) {
        console.error("Failed to load guest info", error);
        setGuestInfo({ name: "Guest" });
      }
    };
    if (open) {
      loadGuestInfo();
    }
  }, [booking?.tourist_id, open]);

  // Resolve avatar image URL
  const avatarSrc = useMemo(() => {
    const raw = (guestInfo?.user_profile ?? "").toString().trim();
    if (!raw) return undefined;
    if (/^(?:https?:|data:)/i.test(raw)) return raw;
    const base = (api || "").replace(/\/?api\/?$/, "").replace(/\/$/, "");
    const path = raw.startsWith("/") ? raw : `/${raw}`;
    return `${base}${path}`;
  }, [guestInfo?.user_profile]);

  // Get initials for avatar fallback
  const initials = useMemo(() => {
    if (!guestInfo?.name) return "?";
    const parts = guestInfo.name.split(" ").filter(Boolean);
    return (
      parts
        .map((p) => p[0])
        .join("")
        .toUpperCase() || "?"
    );
  }, [guestInfo?.name]);

  const formatDate = (date?: Date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleStatusUpdate = (newStatus: string) => {
    if (bookingId) {
      onStatusChange(bookingId, newStatus);
    }
    onClose();
  };

  // Normalize status for consistent comparison
  const normalizeStatus = (status?: string) => {
    if (!status) return "Pending";
    const lower = status.toLowerCase();
    if (lower === "checked-in" || lower === "checked_in") return "Checked-in";
    if (lower === "checked-out" || lower === "checked_out")
      return "Checked-out";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Determine available actions based on current status
  const getStatusActions = () => {
    const status = normalizeStatus(booking?.booking_status);
    type Action = {
      label: string;
      action: string;
      color: "success" | "danger" | "warning" | "primary";
      disabled?: boolean;
    };
    switch (status) {
      case "Pending":
        return [
          { label: "Confirm", action: "Reserved", color: "success" },
          { label: "Cancel", action: "Canceled", color: "danger" },
        ] as Action[];
      case "Reserved":
        return [
          { label: "Check-in", action: "Checked-in", color: "warning" },
          { label: "Cancel", action: "Canceled", color: "danger" },
        ] as Action[];
      case "Checked-in":
        return [
          {
            label: "Check-out",
            action: "Checked-out",
            color: "primary",
            disabled: (booking?.balance ?? 0) !== 0,
          },
        ] as Action[];
      case "Checked-out":
      case "Canceled":
        return [] as Action[]; // No actions for final states
      default:
        return [] as Action[];
    }
  };

  if (!booking) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Sheet
        variant="outlined"
        sx={{
          width: "90%",
          maxWidth: 600,
          borderRadius: "md",
          p: 4,
          boxShadow: "lg",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <ModalClose variant="plain" sx={{ m: 1 }} />

        {/* Header */}
        <Typography level="h4" component="h2" sx={{ mb: 3, fontWeight: 700 }}>
          Booking Details
        </Typography>

        {/* Guest Profile Section */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mb: 3,
          }}
        >
          {avatarSrc && !imageError ? (
            <Box
              component="img"
              src={avatarSrc}
              alt={guestInfo?.name}
              onError={() => setImageError(true)}
              sx={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                objectFit: "cover",
                mb: 2,
              }}
            />
          ) : (
            <Avatar
              sx={{
                width: 100,
                height: 100,
                mb: 2,
                fontSize: "2rem",
                bgcolor: "primary.500",
              }}
            >
              {initials}
            </Avatar>
          )}
          <Typography level="title-lg" sx={{ fontWeight: 600 }}>
            {guestInfo?.name || "Loading..."}
          </Typography>
          {guestInfo?.email && (
            <Typography level="body-sm" sx={{ color: "text.secondary" }}>
              {guestInfo.email}
            </Typography>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Booking Information Grid */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Guest Details */}
          {guestInfo?.phone && (
            <InfoRow
              icon={<User size={18} />}
              label="Phone"
              value={guestInfo.phone}
            />
          )}

          {/* Booking Dates */}
          <InfoRow
            icon={<Calendar size={18} />}
            label="Check-in Date"
            value={formatDate(booking.check_in_date)}
          />
          <InfoRow
            icon={<Calendar size={18} />}
            label="Check-out Date"
            value={formatDate(booking.check_out_date)}
          />

          {/* Guests Count */}
          {booking.pax > 0 && (
            <InfoRow
              icon={<Users size={18} />}
              label="Total Guests (Pax)"
              value={String(booking.pax)}
            />
          )}
          {(booking.num_adults ||
            booking.num_children ||
            booking.num_infants) && (
            <Box
              sx={{ pl: 4, display: "flex", flexDirection: "column", gap: 0.5 }}
            >
              {(booking.num_adults ?? 0) > 0 && (
                <Typography level="body-sm" sx={{ color: "text.secondary" }}>
                  Adults: {booking.num_adults}
                </Typography>
              )}
              {(booking.num_children ?? 0) > 0 && (
                <Typography level="body-sm" sx={{ color: "text.secondary" }}>
                  Children: {booking.num_children}
                </Typography>
              )}
              {(booking.num_infants ?? 0) > 0 && (
                <Typography level="body-sm" sx={{ color: "text.secondary" }}>
                  Infants: {booking.num_infants}
                </Typography>
              )}
            </Box>
          )}

          {/* Guest Type Breakdown */}
          {(booking.foreign_counts ||
            booking.domestic_counts ||
            booking.overseas_counts ||
            booking.local_counts) && (
            <>
              <InfoRow
                icon={<MapPin size={18} />}
                label="Guest Origin"
                value=""
              />
              <Box
                sx={{
                  pl: 4,
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.5,
                }}
              >
                {(booking.foreign_counts ?? 0) > 0 && (
                  <Typography level="body-sm" sx={{ color: "text.secondary" }}>
                    Foreign: {booking.foreign_counts}
                  </Typography>
                )}
                {(booking.domestic_counts ?? 0) > 0 && (
                  <Typography level="body-sm" sx={{ color: "text.secondary" }}>
                    Domestic: {booking.domestic_counts}
                  </Typography>
                )}
                {(booking.overseas_counts ?? 0) > 0 && (
                  <Typography level="body-sm" sx={{ color: "text.secondary" }}>
                    Overseas: {booking.overseas_counts}
                  </Typography>
                )}
                {(booking.local_counts ?? 0) > 0 && (
                  <Typography level="body-sm" sx={{ color: "text.secondary" }}>
                    Local: {booking.local_counts}
                  </Typography>
                )}
              </Box>
            </>
          )}

          {/* Trip Purpose */}
          {booking.trip_purpose && booking.trip_purpose !== "—" && (
            <InfoRow
              icon={<FileText size={18} />}
              label="Trip Purpose"
              value={booking.trip_purpose}
            />
          )}

          {/* Pricing */}
          {(booking.total_price ?? 0) > 0 && (
            <InfoRow
              icon={<DollarSign size={18} />}
              label="Total Price"
              value={`₱${(booking.total_price ?? 0).toLocaleString()}`}
            />
          )}
          {(booking.balance ?? 0) > 0 && (
            <InfoRow
              icon={<DollarSign size={18} />}
              label="Balance"
              value={`₱${(booking.balance ?? 0).toLocaleString()}`}
            />
          )}

          {/* Timestamps */}
          {booking.created_at && (
            <InfoRow
              icon={<Clock size={18} />}
              label="Booked On"
              value={formatDate(booking.created_at)}
            />
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Status Section */}
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography level="body-sm" sx={{ fontWeight: 600 }}>
              Booking Status
            </Typography>
            <Chip
              color={getStatusColor(booking.booking_status || "Pending")}
              size="lg"
              variant="soft"
            >
              {booking.booking_status}
            </Chip>
          </Box>
        </Box>

        {/* Action Buttons Based on Status */}
        {getStatusActions().length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mb: 3 }}>
              <Typography level="body-sm" sx={{ mb: 2, fontWeight: 600 }}>
                Update Booking Status
              </Typography>

              {/* Banner for outstanding balance */}
              {(booking?.balance ?? 0) > 0 && (
                <Box
                  sx={{
                    mb: 2,
                    py: 1.5,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    fontWeight: 500,
                  }}
                >
                  <DollarSign size={20} style={{ marginRight: 8 }} />
                  The guest still has an outstanding balance of{" "}
                  <b>₱{booking.balance?.toLocaleString()}</b>.
                </Box>
              )}

              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                {getStatusActions().map((action) => (
                  <Button
                    key={action.action}
                    variant="solid"
                    color={action.color}
                    onClick={() => handleStatusUpdate(action.action)}
                    sx={{ flex: 1, minWidth: 120 }}
                    disabled={action.disabled}
                  >
                    {action.label}
                  </Button>
                ))}
              </Box>
            </Box>
          </>
        )}

        {/* Close Button */}
        <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
          <Button variant="outlined" color="neutral" onClick={onClose}>
            Close
          </Button>
        </Box>
      </Sheet>
    </Modal>
  );
};

// Info Row Component
interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const InfoRow: React.FC<InfoRowProps> = ({ icon, label, value }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "flex-start",
      gap: 2,
    }}
  >
    <Box sx={{ color: "primary.500", mt: 0.5 }}>{icon}</Box>
    <Box sx={{ flex: 1 }}>
      <Typography level="body-sm" sx={{ fontWeight: 500, mb: 0.5 }}>
        {label}
        {": "}
        <Typography level="body-sm" sx={{ fontWeight: 500 }}>
          {value}
        </Typography>
      </Typography>
    </Box>
  </Box>
);

export default BookingDetails;
