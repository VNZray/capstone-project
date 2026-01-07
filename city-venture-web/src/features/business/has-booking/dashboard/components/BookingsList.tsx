import React, { useEffect, useState } from "react";
import { Typography, Box, Chip, Stack, Avatar } from "@mui/joy";
import { Calendar, Clock } from "lucide-react";
import { colors } from "@/src/utils/Colors";
import Container from "@/src/components/Container";
import { fetchTourist } from "@/src/services/BookingService";

// Updated Interface to accept separate date and time
interface Booking {
  id: string;
  guestName: string;
  roomNumber: string;
  roomType?: string;
  checkIn: string | Date;
  checkOut: string | Date;
  checkInTime?: string | Date; // Added
  checkOutTime?: string | Date; // Added
  status: "Pending" | "Reserved" | "Checked-in" | "Checked-out" | "Canceled";
  amount: number;
  touristId?: string;
  createdAt?: string | Date;
}

interface BookingsListProps {
  bookings: Booking[];
  title: string;
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

const BookingsList: React.FC<BookingsListProps> = ({ bookings, title }) => {
  const [touristData, setTouristData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTouristData = async () => {
      const tourists: Record<string, any> = {};

      for (const booking of bookings) {
        if (booking.touristId && !tourists[booking.touristId]) {
          try {
            const data = await fetchTourist(booking.touristId);
            tourists[booking.touristId] = data;
          } catch (error) {
            console.error("Failed to fetch tourist data:", error);
          }
        }
      }

      setTouristData(tourists);
      setLoading(false);
    };

    if (bookings.length > 0) {
      fetchTouristData();
    } else {
      setLoading(false);
    }
  }, [bookings]);

  const formatDateTime = (
    dateInput: string | Date | undefined,
    timeInput?: string | Date
  ) => {
    if (!dateInput) return "";

    const dateObj = new Date(dateInput);
    const dateStr = dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    let timeStr = "";

    // Try to format time from specific input
    if (timeInput) {
      if (timeInput instanceof Date) {
        timeStr = timeInput.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
      } else if (typeof timeInput === "string") {
        // Handle simple time string HH:mm:ss
        if (timeInput.includes(":") && !timeInput.includes("T")) {
          const [h, m] = timeInput.split(":");
          const d = new Date();
          d.setHours(Number(h));
          d.setMinutes(Number(m));
          timeStr = d.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          });
        } else {
          const tDate = new Date(timeInput);
          if (!isNaN(tDate.getTime())) {
            timeStr = tDate.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            });
          }
        }
      }
    }

    // Fallback: extract from date if date is timestamp
    if (!timeStr) {
      if (dateObj.getHours() !== 0 || dateObj.getMinutes() !== 0) {
        timeStr = dateObj.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
      }
    }

    return timeStr ? `${dateStr}, ${timeStr}` : dateStr;
  };

  const formatDaysAgo = (dateString: string | Date | undefined) => {
    if (!dateString) return "Recently";

    const now = new Date();
    const bookingDate = new Date(dateString);
    const diffTime = Math.abs(now.getTime() - bookingDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
    }
    if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return months === 1 ? "1 month ago" : `${months} months ago`;
    }
    const years = Math.floor(diffDays / 365);
    return years === 1 ? "1 year ago" : `${years} years ago`;
  };

  const getTouristName = (booking: Booking) => {
    if (booking.touristId && touristData[booking.touristId]) {
      const tourist = touristData[booking.touristId];
      return (
        `${tourist.first_name || ""} ${tourist.last_name || ""}`.trim() ||
        "Guest"
      );
    }
    return booking.guestName;
  };

  const getTouristAvatar = (booking: Booking) => {
    if (booking.touristId && touristData[booking.touristId]) {
      const tourist = touristData[booking.touristId];
      return tourist.profile_pic || null;
    }
    return null;
  };

  const getTouristInitials = (booking: Booking) => {
    const name = getTouristName(booking);
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <Container elevation={2}>
      <Box
        sx={{
          p: 1,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography
          level="title-lg"
          fontWeight="700"
          sx={{ color: "text.primary" }}
        >
          {title}
        </Typography>
        <Typography level="body-xs" sx={{ color: "text.tertiary", mt: 0.5 }}>
          {bookings.length} {bookings.length === 1 ? "booking" : "bookings"}
        </Typography>
      </Box>

      <Box sx={{ height: 400, overflowY: "auto", overflowX: "hidden" }}>
        {loading ? (
          <Box
            sx={{
              p: 4,
              textAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
              Loading bookings...
            </Typography>
          </Box>
        ) : bookings.length === 0 ? (
          <Box
            sx={{
              p: 6,
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                bgcolor: "background.level2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 1,
              }}
            >
              <Calendar
                size={28}
                style={{ color: colors.gray, opacity: 0.5 }}
              />
            </Box>
            <Typography
              level="body-md"
              fontWeight="600"
              sx={{ color: "text.secondary" }}
            >
              No bookings yet
            </Typography>
            <Typography
              level="body-sm"
              sx={{ color: "text.tertiary", maxWidth: 280 }}
            >
              Your upcoming bookings will appear here
            </Typography>
          </Box>
        ) : (
          <Stack spacing={0}>
            {bookings.map((booking, index) => (
              <Box
                key={booking.id}
                sx={{
                  p: 2.5,
                  borderBottom:
                    index < bookings.length - 1 ? "1px solid" : "none",
                  borderColor: "divider",
                  transition: "all 0.2s ease-in-out",
                  cursor: "pointer",
                  position: "relative",
                  "&:hover": {
                    bgcolor: "background.level1",
                    transform: "translateX(4px)",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: 4,
                      bgcolor: "primary.solidBg",
                      borderRadius: "0 4px 4px 0",
                    },
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 1.5,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    {getTouristAvatar(booking) ? (
                      <Avatar
                        src={getTouristAvatar(booking)}
                        alt={getTouristName(booking)}
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: "12px",
                          transition: "all 0.2s",
                          "&:hover": {
                            transform: "scale(1.1)",
                          },
                        }}
                      />
                    ) : (
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: "12px",
                          bgcolor: "primary.softBg",
                          color: "primary.solidBg",
                          transition: "all 0.2s",
                          fontWeight: 700,
                          fontSize: "0.875rem",
                          "&:hover": {
                            transform: "scale(1.1)",
                          },
                        }}
                      >
                        {getTouristInitials(booking)}
                      </Avatar>
                    )}
                    <Box>
                      <Typography
                        level="title-sm"
                        fontWeight="700"
                        sx={{ mb: 0.25 }}
                      >
                        {getTouristName(booking)}
                      </Typography>
                      <Typography
                        level="body-xs"
                        sx={{ color: "text.tertiary" }}
                      >
                        Room {booking.roomNumber}{" "}
                        {booking.roomType && `• ${booking.roomType}`}
                      </Typography>
                      <Typography
                        level="body-xs"
                        sx={{ color: "text.tertiary", mt: 0.25 }}
                      >
                        Booked {formatDaysAgo(booking.createdAt)}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    size="sm"
                    color={getStatusColor(booking.status)}
                    variant="soft"
                    sx={{
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      px: 1.5,
                      borderRadius: "6px",
                    }}
                  >
                    {booking.status}
                  </Chip>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderTop: "1px solid",
                    borderColor: "divider", // Explicit divider color
                    pt: 1.5, // Added top padding
                    mt: 1, // Added margin top
                  }}
                >
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
                  >
                    {/* Check In */}
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.75 }}
                    >
                      <Typography
                        level="body-xs"
                        fontWeight="600"
                        sx={{ color: "success.plainColor", width: 60 }}
                      >
                        Check-In:
                      </Typography>
                      <Calendar size={14} style={{ color: colors.gray }} />
                      <Typography
                        level="body-xs"
                        sx={{ color: "text.secondary", fontWeight: 500 }}
                      >
                        {formatDateTime(booking.checkIn, booking.checkInTime)}
                      </Typography>
                    </Box>
                    {/* Check Out */}
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.75 }}
                    >
                      <Typography
                        level="body-xs"
                        fontWeight="600"
                        sx={{ color: "danger.plainColor", width: 60 }}
                      >
                        Check-Out:
                      </Typography>
                      <Calendar size={14} style={{ color: colors.gray }} />
                      <Typography
                        level="body-xs"
                        sx={{ color: "text.secondary", fontWeight: 500 }}
                      >
                        {formatDateTime(booking.checkOut, booking.checkOutTime)}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography
                    level="title-sm"
                    fontWeight="700"
                    sx={{
                      color: "success.solidBg",
                      fontSize: "0.9rem",
                      alignSelf: "flex-end", // Align price to bottom
                    }}
                  >
                    ₱{booking.amount.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Stack>
        )}
      </Box>
    </Container>
  );
};

export default BookingsList;
