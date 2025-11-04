import React from "react";
import { Card, Typography, Box, Stack } from "@mui/joy";
import { TrendingUp, TrendingDown } from "lucide-react";

interface RevenueCardProps {
  title: string;
  amount: number;
  change: number;
  period: string;
  icon?: React.ReactNode;
}

const RevenueCard: React.FC<RevenueCardProps> = ({
  title,
  amount,
  change,
  period,
  icon,
}) => {
  const isPositive = change >= 0;

  return (
    <Card
      variant="outlined"
      sx={{
        p: 2.5,
        borderRadius: 12,
        border: "1px solid",
        borderColor: "divider",
        transition: "all 0.2s",
        "&:hover": {
          boxShadow: "md",
          borderColor: "primary.outlinedBorder",
        },
      }}
    >
      <Stack spacing={1.5}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography level="body-sm" sx={{ color: "text.secondary", fontWeight: 500 }}>
            {title}
          </Typography>
          {icon && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 36,
                height: 36,
                borderRadius: "50%",
                bgcolor: "primary.softBg",
                color: "primary.solidBg",
              }}
            >
              {icon}
            </Box>
          )}
        </Box>

        <Typography level="h2" fontWeight="700" sx={{ color: "text.primary" }}>
          ₱{amount.toLocaleString()}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              px: 1,
              py: 0.5,
              borderRadius: 6,
              bgcolor: isPositive ? "success.softBg" : "danger.softBg",
              color: isPositive ? "success.solidBg" : "danger.solidBg",
            }}
          >
            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <Typography level="body-xs" fontWeight="600">
              {Math.abs(change)}%
            </Typography>
          </Box>
          <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
            vs {period}
          </Typography>
        </Box>
      </Stack>
    </Card>
  );
};

export default RevenueCard;
