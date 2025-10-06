import * as React from "react";
import { Box, Typography } from "@mui/joy";
import Container from "@/src/components/Container";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  percentage?: number;
  color?: "success" | "danger" | "primary" | "neutral" | "warning";
  showProgress?: boolean;
  total?: number;
}

// Simple SVG Pie Chart Component
const PieChart: React.FC<{
  percentage: number;
  color: string;
  size?: number;
}> = ({ percentage, color, size = 120 }) => {
  const circumference = 2 * Math.PI * 45; // radius is 45
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{ transform: "rotate(-90deg)" }}
    >
      {/* Background circle */}
      <circle
        cx="50"
        cy="50"
        r="45"
        fill="none"
        stroke="#F0F0F0"
        strokeWidth="10"
      />
      {/* Progress circle */}
      <circle
        cx="50"
        cy="50"
        r="45"
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.5s ease" }}
      />
    </svg>
  );
};

const getColorHex = (color: string): string => {
  const colorMap: Record<string, string> = {
    primary: "#0B6BCB",
    success: "#1F7A1F",
    danger: "#C41C1C",
    warning: "#9A5B13",
    neutral: "#636B74",
  };
  return colorMap[color] || colorMap.primary;
};

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  percentage,
  color = "primary",
  showProgress = false,
  total,
}) => {
  const colorHex = getColorHex(color);

  return (
    <Container
      elevation={2}
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* Header Section */}
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, mb: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 44,
            height: 44,
            borderRadius: 12,
            bgcolor: `${color}.softBg`,
            color: `${color}.solidBg`,
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography level="body-xs" sx={{ opacity: 0.7, mb: 0.5 }}>
            {label}
          </Typography>
          <Typography level="h2" sx={{ fontWeight: 700, fontSize: 32 }}>
            {value}
          </Typography>
        </Box>
      </Box>

      {/* Pie Chart Section */}
      {showProgress && percentage !== undefined && (
        <>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
              my: 2,
            }}
          >
            <PieChart percentage={percentage} color={colorHex} size={140} />
            <Box
              sx={{
                position: "absolute",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography
                level="h1"
                sx={{ fontWeight: 800, fontSize: 36, lineHeight: 1 }}
              >
                {percentage}%
              </Typography>
              <Typography level="body-xs" sx={{ opacity: 0.6, mt: 0.5 }}>
                of total
              </Typography>
            </Box>
          </Box>

          {/* Details Section */}
          <Box
            sx={{
              mt: "auto",
              pt: 2,
              borderTop: "1px solid",
              borderColor: "divider",
            }}
          >
            {total !== undefined && (
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography level="body-sm" sx={{ opacity: 0.7 }}>
                  Total Reviews
                </Typography>
                <Typography level="body-sm" sx={{ fontWeight: 600 }}>
                  {total}
                </Typography>
              </Box>
            )}
          </Box>
        </>
      )}
    </Container>
  );
};

export default StatCard;
