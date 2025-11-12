import React from "react";
import { Card, Typography, Box, Stack } from "@mui/joy";
import { PieChart } from "lucide-react";
import { colors } from "@/src/utils/Colors";
import Container from "@/src/components/Container";

interface OccupancyPieChartProps {
  totalRooms: number;
  available: number;
  occupied: number;
  maintenance: number;
}

const OccupancyPieChart: React.FC<OccupancyPieChartProps> = ({
  totalRooms,
  available,
  occupied,
  maintenance,
}) => {
  const availablePercent = totalRooms > 0 ? (available / totalRooms) * 100 : 0;
  const occupiedPercent = totalRooms > 0 ? (occupied / totalRooms) * 100 : 0;
  const maintenancePercent = totalRooms > 0 ? (maintenance / totalRooms) * 100 : 0;

  // Calculate pie chart segments
  const segments = [
    { label: "Available", value: available, percent: availablePercent, color: colors.success, startAngle: 0 },
    { label: "Occupied", value: occupied, percent: occupiedPercent, color: "#FFA500", startAngle: 0 },
    { label: "Maintenance", value: maintenance, percent: maintenancePercent, color: colors.error, startAngle: 0 },
  ];

  // Calculate start angles
  let currentAngle = 0;
  segments.forEach((segment) => {
    segment.startAngle = currentAngle;
    currentAngle += (segment.percent / 100) * 360;
  });

  // SVG pie chart
  const createArc = (startAngle: number, endAngle: number) => {
    const start = polarToCartesian(100, 100, 80, endAngle);
    const end = polarToCartesian(100, 100, 80, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return [
      "M", 100, 100,
      "L", start.x, start.y,
      "A", 80, 80, 0, largeArcFlag, 0, end.x, end.y,
      "Z"
    ].join(" ");
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  return (
    <Container
      elevation={2}
      hoverEffect="lift"
      hoverDuration={300}
      hover
    >
      <Stack spacing={2}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <PieChart size={20} style={{ color: colors.primary }} />
          <Typography level="title-lg" fontWeight="700">
            Occupancy Overview
          </Typography>
        </Box>

        {/* Pie Chart */}
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", position: "relative" }}>
          <svg width="200" height="200" viewBox="0 0 200 200">
            {segments.map((segment, index) => {
              if (segment.value === 0) return null;
              const endAngle = segment.startAngle + (segment.percent / 100) * 360;
              return (
                <path
                  key={index}
                  d={createArc(segment.startAngle, endAngle)}
                  fill={segment.color}
                  stroke="white"
                  strokeWidth="2"
                />
              );
            })}
            {/* Center circle for donut effect */}
            <circle cx="100" cy="100" r="50" fill="white" />
            {/* Center text */}
            <text x="100" y="95" textAnchor="middle" fontSize="24" fontWeight="700" fill={colors.text}>
              {totalRooms}
            </text>
            <text x="100" y="115" textAnchor="middle" fontSize="12" fill={colors.gray}>
              Total Rooms
            </text>
          </svg>
        </Box>

        {/* Legend */}
        <Stack spacing={1.5}>
          {segments.map((segment, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: 1.5,
                borderRadius: 8,
                bgcolor: "background.level1",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    bgcolor: segment.color,
                  }}
                />
                <Typography level="body-sm" fontWeight="500">
                  {segment.label}
                </Typography>
              </Box>
              <Box sx={{ textAlign: "right" }}>
                <Typography level="body-sm" fontWeight="700">
                  {segment.value} ({segment.percent.toFixed(0)}%)
                </Typography>
              </Box>
            </Box>
          ))}
        </Stack>

        {/* Occupancy Rate */}
        <Box
          sx={{
            p: 2,
            borderRadius: 8,
            bgcolor: "primary.softBg",
            textAlign: "center",
          }}
        >
          <Typography level="body-xs" sx={{ color: "text.secondary", mb: 0.5 }}>
            Current Occupancy Rate
          </Typography>
          <Typography level="h3" fontWeight="700" sx={{ color: "primary.solidBg" }}>
            {occupiedPercent.toFixed(1)}%
          </Typography>
        </Box>
      </Stack>
    </Container>
  );
};

export default OccupancyPieChart;
