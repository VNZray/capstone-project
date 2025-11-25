import React from "react";
import { Typography, Box, Chip, Stack } from "@mui/joy";
import { CreditCard, Check, Clock, XCircle } from "lucide-react";
import Container from "@/src/components/Container";
import { colors } from "@/src/utils/Colors";

export interface SubscriptionPayment {
  id: string;
  businessName: string;
  amount: number;
  paymentMethod: string;
  status: "completed" | "pending" | "failed";
  paidAt: string;
  subscriptionPlan: string;
}

interface SubscriptionPaymentsTableProps {
  payments: SubscriptionPayment[];
  title?: string;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <Check size={14} />;
    case "pending":
      return <Clock size={14} />;
    case "failed":
      return <XCircle size={14} />;
    default:
      return <Clock size={14} />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "success";
    case "pending":
      return "warning";
    case "failed":
      return "danger";
    default:
      return "neutral";
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const SubscriptionPaymentsTable: React.FC<SubscriptionPaymentsTableProps> = ({
  payments,
  title = "Recent Subscription Payments",
}) => {
  const totalAmount = payments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);

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
              {payments.length} {payments.length === 1 ? "payment" : "payments"}
            </Typography>
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
              Total Revenue
            </Typography>
            <Typography level="title-md" fontWeight="700" sx={{ color: "success.solidBg" }}>
              ₱{totalAmount.toLocaleString()}
            </Typography>
          </Box>
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
              <CreditCard size={28} style={{ color: colors.gray, opacity: 0.5 }} />
            </Box>
            <Typography level="body-md" fontWeight="600" sx={{ color: "text.secondary" }}>
              No payments yet
            </Typography>
            <Typography level="body-sm" sx={{ color: "text.tertiary", maxWidth: 280 }}>
              Subscription payments will appear here
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
                      bgcolor: "success.solidBg",
                      borderRadius: "0 4px 4px 0",
                    },
                  },
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography level="title-sm" fontWeight="700" sx={{ mb: 0.25 }}>
                      {payment.businessName}
                    </Typography>
                    <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
                      {payment.subscriptionPlan} Plan • {payment.paymentMethod}
                    </Typography>
                  </Box>
                  <Chip
                    size="sm"
                    color={getStatusColor(payment.status)}
                    variant="soft"
                    startDecorator={getStatusIcon(payment.status)}
                    sx={{
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      px: 1.5,
                      borderRadius: "6px",
                      textTransform: "capitalize",
                    }}
                  >
                    {payment.status}
                  </Chip>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    pt: 1,
                    borderTop: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Typography level="body-xs" sx={{ color: "text.secondary", fontWeight: 500 }}>
                    {formatDate(payment.paidAt)}
                  </Typography>
                  <Typography
                    level="title-sm"
                    fontWeight="700"
                    sx={{
                      color: "success.solidBg",
                      fontSize: "0.9rem",
                    }}
                  >
                    ₱{payment.amount.toLocaleString()}
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

export default SubscriptionPaymentsTable;
