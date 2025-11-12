import React from "react";
import { Card, Typography, Box, Stack } from "@mui/joy";
import { Calendar, CheckCircle, XCircle } from "lucide-react";
import { colors } from "@/src/utils/Colors";
import Container from "@/src/components/Container";

interface Payment {
  id: string;
  guestName: string;
  bookingId: string;
  amount: number;
  date: string;
  method: string;
  status: "Completed" | "Pending" | "Failed";
}

interface PaymentsListProps {
  payments: Payment[];
  title: string;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "Completed":
      return <CheckCircle size={14} style={{ color: colors.success }} />;
    case "Failed":
      return <XCircle size={14} style={{ color: colors.error }} />;
    default:
      return <Calendar size={14} style={{ color: colors.gray }} />;
  }
};

const PaymentsList: React.FC<PaymentsListProps> = ({ payments, title }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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
        {payments.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
              No payments found
            </Typography>
          </Box>
        ) : (
          <Stack spacing={0}>
            {payments.map((payment, index) => (
              <Box
                key={payment.id}
                sx={{
                  p: 2,
                  borderBottom: index < payments.length - 1 ? "1px solid" : "none",
                  borderColor: "divider",
                  transition: "all 0.2s",
                  "&:hover": {
                    bgcolor: "background.level1",
                  },
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                  <Box>
                    <Typography level="title-sm" fontWeight="600">
                      {payment.guestName}
                    </Typography>
                    <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
                      Booking #{payment.bookingId}
                    </Typography>
                  </Box>
                  <Typography level="title-sm" fontWeight="700" sx={{ color: "success.solidBg" }}>
                    ₱{payment.amount.toLocaleString()}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    {getStatusIcon(payment.status)}
                    <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
                      {payment.method}
                    </Typography>
                  </Box>
                  <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
                    {formatDate(payment.date)}
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

export default PaymentsList;
