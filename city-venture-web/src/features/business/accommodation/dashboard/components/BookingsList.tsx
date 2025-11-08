import React from "react";
import { Card, Typography, Box, Chip, Stack } from "@mui/joy";
import { Calendar, User } from "lucide-react";
import { colors } from "@/src/utils/Colors";
import Container from "@/src/components/Container";

interface Booking {
  id: string;
  guestName: string;
  roomNumber: string;
  checkIn: string;
  checkOut: string;
  status: "Pending" | "Reserved" | "Checked-in" | "Checked-out" | "Canceled";
  amount: number;
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
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
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
        <Typography level="title-lg" fontWeight="700" sx={{ color: "text.primary" }}>
          {title}
        </Typography>
        <Typography level="body-xs" sx={{ color: "text.tertiary", mt: 0.5 }}>
          {bookings.length} {bookings.length === 1 ? "booking" : "bookings"}
        </Typography>
      </Box>

      <Box sx={{ height: 400, overflowY: "auto", overflowX: "hidden" }}>
        {bookings.length === 0 ? (
          <Box 
            sx={{ 
              p: 6, 
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1
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
                mb: 1
              }}
            >
              <Calendar size={28} style={{ color: colors.gray, opacity: 0.5 }} />
            </Box>
            <Typography level="body-md" fontWeight="600" sx={{ color: "text.secondary" }}>
              No bookings yet
            </Typography>
            <Typography level="body-sm" sx={{ color: "text.tertiary", maxWidth: 280 }}>
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
                  borderBottom: index < bookings.length - 1 ? "1px solid" : "none",
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
                      borderRadius: "0 4px 4px 0"
                    }
                  },
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 40,
                        height: 40,
                        borderRadius: "12px",
                        bgcolor: "primary.softBg",
                        color: "primary.solidBg",
                        transition: "all 0.2s",
                        "&:hover": {
                          transform: "scale(1.1)"
                        }
                      }}
                    >
                      <User size={18} />
                    </Box>
                    <Box>
                      <Typography level="title-sm" fontWeight="700" sx={{ mb: 0.25 }}>
                        {booking.guestName}
                      </Typography>
                      <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
                        Room {booking.roomNumber}
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
                      borderRadius: "6px"
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
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                    <Calendar size={15} style={{ color: colors.gray }} />
                    <Typography level="body-xs" sx={{ color: "text.secondary", fontWeight: 500 }}>
                      {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                    </Typography>
                  </Box>
                  <Typography 
                    level="title-sm" 
                    fontWeight="700" 
                    sx={{ 
                      color: "success.solidBg",
                      fontSize: "0.9rem"
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
