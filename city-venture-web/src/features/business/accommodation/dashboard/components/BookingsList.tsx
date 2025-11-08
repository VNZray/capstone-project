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
    <Container
      elevation={2}
      hoverEffect="lift"
      hoverDuration={300}
      hover
    >
      <Box sx={{ p: 2.5, borderBottom: "1px solid", borderColor: "divider" }}>
        <Typography level="title-lg" fontWeight="700">
          {title}
        </Typography>
      </Box>

      <Box sx={{ maxHeight: 400, overflowY: "auto" }}>
        {bookings.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
              No bookings found
            </Typography>
          </Box>
        ) : (
          <Stack spacing={0}>
            {bookings.map((booking, index) => (
              <Box
                key={booking.id}
                sx={{
                  p: 2,
                  borderBottom: index < bookings.length - 1 ? "1px solid" : "none",
                  borderColor: "divider",
                  transition: "all 0.2s",
                  "&:hover": {
                    bgcolor: "background.level1",
                  },
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        bgcolor: "primary.softBg",
                        color: "primary.solidBg",
                      }}
                    >
                      <User size={16} />
                    </Box>
                    <Box>
                      <Typography level="title-sm" fontWeight="600">
                        {booking.guestName}
                      </Typography>
                      <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
                        Room {booking.roomNumber}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip size="sm" color={getStatusColor(booking.status)} variant="soft">
                    {booking.status}
                  </Chip>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Calendar size={14} style={{ color: colors.gray }} />
                    <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
                      {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                    </Typography>
                  </Box>
                  <Typography level="body-sm" fontWeight="600" sx={{ color: "success.solidBg" }}>
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
