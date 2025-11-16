import React, { useState, useMemo, useEffect } from "react";
import {
  Modal,
  ModalClose,
  Sheet,
  Typography,
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
import { fetchUserData } from "@/src/services/auth/AuthService";
import api from "@/src/services/api";
import { colors } from "@/src/utils/Colors";
import Button from "@/src/components/Button";
import Alert from "@/src/components/Alert";

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
      return "primary";
    case "Checked-in":
      return "warning";
    case "Checked-out":
      return "success";
    case "Canceled":
      return "danger";
    default:
      return "neutral";
  }
};

// Helper Components
const SectionTitle: React.FC<{ icon: React.ReactNode; title: string }> = ({
  icon,
  title,
}) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
    <Box sx={{ color: "primary.500" }}>{icon}</Box>
    <Typography
      level="title-sm"
      sx={{ fontWeight: 700, color: "text.primary" }}
    >
      {title}
    </Typography>
  </Box>
);

const InfoCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box
    sx={{
      bgcolor: "background.level1",
      borderRadius: "12px",
      p: 2.5,
      border: "1px solid",
      borderColor: "divider",
      transition: "all 0.2s ease",
      "&:hover": {
        borderColor: "primary.300",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
      },
    }}
  >
    {children}
  </Box>
);

const InfoRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
}> = ({ icon, label, value }) => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 2,
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <Box sx={{ color: "primary.400", display: "flex" }}>{icon}</Box>
      <Typography
        level="body-sm"
        sx={{ color: "text.secondary", fontWeight: 500 }}
      >
        {label}
      </Typography>
    </Box>
    <Typography level="body-sm" sx={{ fontWeight: 600, textAlign: "right" }}>
      {value}
    </Typography>
  </Box>
);

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
  const [alertConfig, setAlertConfig] = useState<{
    open: boolean;
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    open: false,
    type: "info",
    title: "",
    message: "",
    onConfirm: () => {},
  });

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

  const avatarSrc = useMemo(() => {
    const raw = (guestInfo?.user_profile ?? "").toString().trim();
    if (!raw) return undefined;
    if (/^(?:https?:|data:)/i.test(raw)) return raw;
    const base = (api || "").replace(/\/?api\/?$/, "").replace(/\/$/, "");
    const path = raw.startsWith("/") ? raw : `/${raw}`;
    return `${base}${path}`;
  }, [guestInfo?.user_profile]);

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

  const handleActionClick = (action: string) => {
    const balance = booking?.balance ?? 0;

    switch (action) {
      case "Canceled":
        setAlertConfig({
          open: true,
          type: "warning",
          title: "Cancel Booking",
          message: `Are you sure you want to cancel this booking for ${guestInfo?.name || "this guest"}? This action cannot be undone.`,
          onConfirm: () => handleStatusUpdate(action),
        });
        break;

      case "Checked-in":
        setAlertConfig({
          open: true,
          type: "info",
          title: "Check-in Guest",
          message: `Confirm check-in for ${guestInfo?.name || "this guest"}? Please ensure all booking details are verified.`,
          onConfirm: () => handleStatusUpdate(action),
        });
        break;

      case "Checked-out":
        if (balance > 0) {
          setAlertConfig({
            open: true,
            type: "error",
            title: "Outstanding Balance",
            message: `Cannot check out. ${guestInfo?.name || "The guest"} has an unpaid balance of ₱${balance.toLocaleString()}. Please collect the payment before proceeding with check-out.`,
            onConfirm: () => setAlertConfig((prev) => ({ ...prev, open: false })),
          });
        } else {
          setAlertConfig({
            open: true,
            type: "success",
            title: "Check-out Guest",
            message: `Confirm check-out for ${guestInfo?.name || "this guest"}? All payments have been settled.`,
            onConfirm: () => handleStatusUpdate(action),
          });
        }
        break;

      case "Reserved":
        setAlertConfig({
          open: true,
          type: "success",
          title: "Confirm Booking",
          message: `Confirm reservation for ${guestInfo?.name || "this guest"}? The booking will be marked as confirmed.`,
          onConfirm: () => handleStatusUpdate(action),
        });
        break;

      default:
        handleStatusUpdate(action);
    }
  };

  const normalizeStatus = (status?: string) => {
    if (!status) return "Pending";
    const lower = status.toLowerCase();
    if (lower === "checked-in" || lower === "checked_in") return "Checked-in";
    if (lower === "checked-out" || lower === "checked_out")
      return "Checked-out";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getStatusActions = () => {
    const status = normalizeStatus(booking?.booking_status);
    type Action = {
      label: string;
      action: string;
      color: "success" | "error" | "warning" | "primary";
      disabled?: boolean;
    };
    switch (status) {
      case "Pending":
        return [
          { label: "Confirm", action: "Reserved", color: "success" },
          { label: "Cancel", action: "Canceled", color: "error" },
        ] as Action[];
      case "Reserved":
        return [
          { label: "Check-in", action: "Checked-in", color: "warning" },
          { label: "Cancel", action: "Canceled", color: "error" },
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
        return [] as Action[];
      default:
        return [] as Action[];
    }
  };

  if (!booking) return null;

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          p: 2,
        }}
      >
        <Sheet
          variant="outlined"
          sx={{
            width: "100%",
            maxWidth: 680,
            maxHeight: "90vh",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
          }}
        >
        <ModalClose
          variant="plain"
          sx={{
            m: 1.5,
            zIndex: 2,
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.2)",
            },
          }}
        />

        <Box sx={{ overflowY: "auto", maxHeight: "90vh" }}>
          {/* Header with Gradient */}
          <Box
            sx={{
              background: `linear-gradient(135deg, #667eea 0%, ${colors.primary} 100%)`,
              color: "white",
              p: 4,
              pb: 5,
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
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
                    border: "4px solid white",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                  }}
                />
              ) : (
                <Avatar
                  sx={{
                    width: 100,
                    height: 100,
                    fontSize: "2rem",
                    bgcolor: "rgba(255, 255, 255, 0.2)",
                    color: "white",
                    border: "4px solid white",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                  }}
                >
                  {initials}
                </Avatar>
              )}
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  level="h4"
                  sx={{ fontWeight: 700, color: "white", mb: 0.5 }}
                >
                  {guestInfo?.name || "Loading..."}
                </Typography>
                {guestInfo?.email && (
                  <Typography
                    level="body-sm"
                    sx={{ color: "rgba(255, 255, 255, 0.9)" }}
                  >
                    {guestInfo.email}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>

          {/* Status Badge - Overlapping */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mt: -3,
              mb: 3,
              position: "relative",
              zIndex: 1,
            }}
          >
            <Chip
              size="md"
              color={getStatusColor(normalizeStatus(booking?.booking_status))}
              variant="soft"
              sx={{
                fontWeight: 700,
                fontSize: "0.875rem",
                px: 3,
                py: 1.5,
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              }}
            >
              {normalizeStatus(booking?.booking_status)}
            </Chip>
          </Box>

          {/* Content */}
          <Box sx={{ px: 4, pb: 4 }}>
            {/* Contact Information */}
            {guestInfo?.phone && (
              <Box sx={{ mb: 4 }}>
                <SectionTitle
                  icon={<User size={18} />}
                  title="Contact Information"
                />
                <InfoCard>
                  <InfoRow
                    icon={<User size={18} />}
                    label="Phone Number"
                    value={guestInfo.phone}
                  />
                </InfoCard>
              </Box>
            )}

            {/* Booking Details */}
            <Box sx={{ mb: 4 }}>
              <SectionTitle
                icon={<Calendar size={18} />}
                title="Booking Details"
              />
              <InfoCard>
                <InfoRow
                  icon={<Calendar size={18} />}
                  label="Check-in"
                  value={formatDate(booking.check_in_date)}
                />
                <Divider sx={{ my: 1.5 }} />
                <InfoRow
                  icon={<Calendar size={18} />}
                  label="Check-out"
                  value={formatDate(booking.check_out_date)}
                />
                {booking.created_at && (
                  <>
                    <Divider sx={{ my: 1.5 }} />
                    <InfoRow
                      icon={<Clock size={18} />}
                      label="Booked On"
                      value={formatDate(booking.created_at)}
                    />
                  </>
                )}
              </InfoCard>
            </Box>

            {/* Guest Information */}
            {booking.pax > 0 && (
              <Box sx={{ mb: 4 }}>
                <SectionTitle
                  icon={<Users size={18} />}
                  title="Guest Information"
                />
                <InfoCard>
                  <InfoRow
                    icon={<Users size={18} />}
                    label="Total Guests"
                    value={String(booking.pax)}
                  />
                  {(booking.num_adults ||
                    booking.num_children ||
                    booking.num_infants) && (
                    <>
                      <Divider sx={{ my: 1.5 }} />
                      <Box
                        sx={{
                          pl: 4,
                          display: "flex",
                          flexDirection: "column",
                          gap: 1,
                        }}
                      >
                        {(booking.num_adults ?? 0) > 0 && (
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography
                              level="body-sm"
                              sx={{ color: "text.secondary" }}
                            >
                              Adults
                            </Typography>
                            <Typography
                              level="body-sm"
                              sx={{ fontWeight: 600 }}
                            >
                              {booking.num_adults}
                            </Typography>
                          </Box>
                        )}
                        {(booking.num_children ?? 0) > 0 && (
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography
                              level="body-sm"
                              sx={{ color: "text.secondary" }}
                            >
                              Children
                            </Typography>
                            <Typography
                              level="body-sm"
                              sx={{ fontWeight: 600 }}
                            >
                              {booking.num_children}
                            </Typography>
                          </Box>
                        )}
                        {(booking.num_infants ?? 0) > 0 && (
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography
                              level="body-sm"
                              sx={{ color: "text.secondary" }}
                            >
                              Infants
                            </Typography>
                            <Typography
                              level="body-sm"
                              sx={{ fontWeight: 600 }}
                            >
                              {booking.num_infants}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </>
                  )}
                </InfoCard>
              </Box>
            )}

            {/* Tourist Origin */}
            {(booking.foreign_counts ||
              booking.domestic_counts ||
              booking.overseas_counts ||
              booking.local_counts) && (
              <Box sx={{ mb: 4 }}>
                <SectionTitle
                  icon={<MapPin size={18} />}
                  title="Tourist Origin"
                />
                <InfoCard>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    {(booking.local_counts ?? 0) > 0 && (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              bgcolor: "primary.500",
                            }}
                          />
                          <Typography
                            level="body-sm"
                            sx={{ color: "text.secondary" }}
                          >
                            Local
                          </Typography>
                        </Box>
                        <Chip size="sm" variant="soft" color="primary">
                          {booking.local_counts}
                        </Chip>
                      </Box>
                    )}
                    {(booking.domestic_counts ?? 0) > 0 && (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              bgcolor: "success.500",
                            }}
                          />
                          <Typography
                            level="body-sm"
                            sx={{ color: "text.secondary" }}
                          >
                            Domestic
                          </Typography>
                        </Box>
                        <Chip size="sm" variant="soft" color="success">
                          {booking.domestic_counts}
                        </Chip>
                      </Box>
                    )}
                    {(booking.foreign_counts ?? 0) > 0 && (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              bgcolor: "warning.500",
                            }}
                          />
                          <Typography
                            level="body-sm"
                            sx={{ color: "text.secondary" }}
                          >
                            Foreign
                          </Typography>
                        </Box>
                        <Chip size="sm" variant="soft" color="warning">
                          {booking.foreign_counts}
                        </Chip>
                      </Box>
                    )}
                    {(booking.overseas_counts ?? 0) > 0 && (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              bgcolor: "danger.500",
                            }}
                          />
                          <Typography
                            level="body-sm"
                            sx={{ color: "text.secondary" }}
                          >
                            Overseas
                          </Typography>
                        </Box>
                        <Chip size="sm" variant="soft" color="danger">
                          {booking.overseas_counts}
                        </Chip>
                      </Box>
                    )}
                  </Box>
                </InfoCard>
              </Box>
            )}

            {/* Trip Purpose */}
            {booking.trip_purpose && booking.trip_purpose !== "—" && (
              <Box sx={{ mb: 4 }}>
                <SectionTitle
                  icon={<FileText size={18} />}
                  title="Trip Purpose"
                />
                <InfoCard>
                  <Typography level="body-md" sx={{ fontWeight: 500 }}>
                    {booking.trip_purpose}
                  </Typography>
                </InfoCard>
              </Box>
            )}

            {/* Payment Information */}
            {((booking.total_price ?? 0) > 0 || (booking.balance ?? 0) > 0) && (
              <Box sx={{ mb: 4 }}>
                <SectionTitle
                  icon={<DollarSign size={18} />}
                  title="Payment Information"
                />
                <InfoCard>
                  {(booking.total_price ?? 0) > 0 && (
                    <>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography
                          level="body-sm"
                          sx={{ color: "text.secondary" }}
                        >
                          Total Amount
                        </Typography>
                        <Typography
                          level="h4"
                          sx={{ fontWeight: 700, color: "success.600" }}
                        >
                          ₱{(booking.total_price ?? 0).toLocaleString()}
                        </Typography>
                      </Box>
                      {(booking.balance ?? 0) > 0 && (
                        <>
                          <Divider sx={{ my: 1.5 }} />
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Typography
                              level="body-sm"
                              sx={{ color: "text.secondary" }}
                            >
                              Remaining Balance
                            </Typography>
                            <Typography
                              level="title-lg"
                              sx={{ fontWeight: 600, color: "warning.600" }}
                            >
                              ₱{(booking.balance ?? 0).toLocaleString()}
                            </Typography>
                          </Box>
                        </>
                      )}
                    </>
                  )}
                </InfoCard>
              </Box>
            )}

            {/* Action Buttons */}
            {getStatusActions().length > 0 && (
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                {getStatusActions().map((action) => (
                  <Button
                    key={action.action}
                    variant={action.color === "error" ? "outlined" : "solid"}
                    colorScheme={action.color}
                    disabled={action.disabled}
                    onClick={() => handleActionClick(action.action)}
                    sx={{
                      flex: 1,
                      minWidth: 120,
                      py: 1.5,
                      fontWeight: 600,
                      transition: "all 0.2s",
                      "&:hover:not(:disabled)": {
                        transform: "translateY(-2px)",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                      },
                    }}
                  >
                    {action.label}
                  </Button>
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </Sheet>
      </Modal>

      {/* Alert Dialog */}
      <Alert
        open={alertConfig.open}
        onClose={() => setAlertConfig((prev) => ({ ...prev, open: false }))}
        onConfirm={alertConfig.onConfirm}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        confirmText={alertConfig.type === "error" ? "Okay" : "Confirm"}
        showCancel={alertConfig.type !== "error"}
      />
    </>
  );
};

export default BookingDetails;
