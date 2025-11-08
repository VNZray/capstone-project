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

  const getTotalAmount = () => {
    return payments.reduce((sum, payment) => sum + payment.amount, 0);
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
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Typography level="title-lg" fontWeight="700" sx={{ color: "text.primary" }}>
              {title}
            </Typography>
            <Typography level="body-xs" sx={{ color: "text.tertiary", mt: 0.5 }}>
              {payments.length} {payments.length === 1 ? "transaction" : "transactions"}
            </Typography>
          </Box>
          {payments.length > 0 && (
            <Box sx={{ textAlign: "right" }}>
              <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
                Total
              </Typography>
              <Typography level="title-md" fontWeight="700" sx={{ color: "success.solidBg" }}>
                ₱{getTotalAmount().toLocaleString()}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      <Box sx={{ height: 400, overflowY: "auto", overflowX: "hidden" }}>
        {payments.length === 0 ? (
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
              <CheckCircle size={28} style={{ color: colors.gray, opacity: 0.5 }} />
            </Box>
            <Typography level="body-md" fontWeight="600" sx={{ color: "text.secondary" }}>
              No payments yet
            </Typography>
            <Typography level="body-sm" sx={{ color: "text.tertiary", maxWidth: 280 }}>
              Payment transactions will appear here
            </Typography>
          </Box>
        ) : (
          <Stack spacing={0}>
            {payments.map((payment, index) => (
              <Box
                key={payment.id}
                sx={{
                  p: 2.5,
                  borderBottom: index < payments.length - 1 ? "1px solid" : "none",
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
                      bgcolor: payment.status === "Completed" ? "success.solidBg" : 
                                payment.status === "Failed" ? "danger.solidBg" : "warning.solidBg",
                      borderRadius: "0 4px 4px 0"
                    }
                  },
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography level="title-sm" fontWeight="700" sx={{ mb: 0.25 }}>
                      {payment.guestName}
                    </Typography>
                    <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
                      Booking #{payment.bookingId}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: 0.5
                    }}
                  >
                    <Typography 
                      level="title-md" 
                      fontWeight="700" 
                      sx={{ 
                        color: payment.status === "Completed" ? "success.solidBg" : 
                               payment.status === "Failed" ? "danger.solidBg" : "warning.solidBg",
                        fontSize: "1rem"
                      }}
                    >
                      ₱{payment.amount.toLocaleString()}
                    </Typography>
                  </Box>
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
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 24,
                        height: 24,
                        borderRadius: "6px",
                        bgcolor: payment.status === "Completed" ? "success.softBg" : 
                                 payment.status === "Failed" ? "danger.softBg" : "warning.softBg"
                      }}
                    >
                      {getStatusIcon(payment.status)}
                    </Box>
                    <Typography level="body-xs" sx={{ color: "text.secondary", fontWeight: 600 }}>
                      {payment.method}
                    </Typography>
                  </Box>
                  <Typography level="body-xs" sx={{ color: "text.tertiary", fontWeight: 500 }}>
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
