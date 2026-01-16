import * as React from "react";
import { Box, Divider } from "@mui/joy";
import Container from "@/src/components/Container";
import Typography from "@/src/components/Typography";

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
    <Container hover elevation={2} direction="column">
      {/* Header Section */}
      <Container padding="0" direction="row">
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
        <Container padding="0" gap="0">
          <Typography.Label size="xs" sx={{ opacity: 0.5, mb: 0.5 }}>
            {label}
          </Typography.Label>
          <Typography.CardSubTitle size="lg" weight="bold">
            {value}
          </Typography.CardSubTitle>
        </Container>
      </Container>

      {/* Pie Chart Section */}
      {showProgress && percentage !== undefined && (
        <Container padding="0">
          <Container
            padding="0"
            align="center"
            justify="center"
            style={{ position: "relative" }}
          >
            <PieChart percentage={percentage} color={colorHex} size={140} />
            <Container
              style={{ position: "absolute" }}
              padding="0"
              align="center"
              justify="center"
              gap="0"
            >
              <Typography.Title weight="bold">{percentage}%</Typography.Title>
              <Typography.Body sx={{ opacity: 0.6, mt: 0.5 }}>
                of total
              </Typography.Body>
            </Container>
          </Container>

          <Divider></Divider>

          {/* Details Section */}
          <Container padding="0">
            {total !== undefined && (
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography.Body size="xs" sx={{ opacity: 0.7 }}>
                  Total Reviews
                </Typography.Body>
                <Typography.Body size="xs" weight="bold">
                  {total}
                </Typography.Body>
              </Box>
            )}
          </Container>
        </Container>
      )}
    </Container>
  );
};

export default StatCard;
