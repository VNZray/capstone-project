import React from "react";
import { Typography, Box, Stack } from "@mui/joy";
import { Users, MapPin, Globe, Plane } from "lucide-react";
import { colors } from "@/src/utils/Colors";
import Container from "@/src/components/Container";

interface TouristStatsCardProps {
  local: number;
  domestic: number;
  foreign: number;
  overseas: number;
  totalBookings: number;
}

const TouristStatsCard: React.FC<TouristStatsCardProps> = ({
  local,
  domestic,
  foreign,
  overseas,
  totalBookings,
}) => {
  const stats = [
    {
      label: "Local Tourists",
      value: local,
      percent: totalBookings > 0 ? (local / totalBookings) * 100 : 0,
      icon: <MapPin size={18} />,
      color: colors.primary,
    },
    {
      label: "Domestic Tourists",
      value: domestic,
      percent: totalBookings > 0 ? (domestic / totalBookings) * 100 : 0,
      icon: <Users size={18} />,
      color: colors.success,
    },
    {
      label: "Foreign Tourists",
      value: foreign,
      percent: totalBookings > 0 ? (foreign / totalBookings) * 100 : 0,
      icon: <Globe size={18} />,
      color: "#9333ea", // Purple
    },
    {
      label: "Overseas Tourists",
      value: overseas,
      percent: totalBookings > 0 ? (overseas / totalBookings) * 100 : 0,
      icon: <Plane size={18} />,
      color: "#0ea5e9", // Sky blue
    },
  ];

  return (
    <Container
      elevation={2}
      hoverEffect="lift"
      hoverDuration={300}
      hover
    >
      <Box sx={{ p: 2.5, borderBottom: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", gap: 1 }}>
        <Users size={20} style={{ color: colors.primary }} />
        <Typography level="title-lg" fontWeight="700">
          Tourist Demographics
        </Typography>
      </Box>

      <Box sx={{ p: 2 }}>
        <Stack spacing={2}>
          {stats.map((stat, index) => (
            <Box
              key={index}
              sx={{
                p: 2,
                borderRadius: 8,
                bgcolor: "background.level1",
                transition: "all 0.2s",
                "&:hover": {
                  bgcolor: "background.level2",
                  transform: "translateY(-2px)",
                },
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      bgcolor: `${stat.color}20`,
                      color: stat.color,
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Typography level="body-sm" fontWeight="500">
                    {stat.label}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: "right" }}>
                  <Typography level="title-md" fontWeight="700" sx={{ color: stat.color }}>
                    {stat.value}
                  </Typography>
                  <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
                    {stat.percent.toFixed(1)}%
                  </Typography>
                </Box>
              </Box>
              
              {/* Progress bar */}
              <Box
                sx={{
                  width: "100%",
                  height: 6,
                  bgcolor: "background.level2",
                  borderRadius: 3,
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    width: `${stat.percent}%`,
                    height: "100%",
                    bgcolor: stat.color,
                    transition: "width 0.3s ease",
                  }}
                />
              </Box>
            </Box>
          ))}
        </Stack>

        {/* Total Summary */}
        <Box
          sx={{
            mt: 2,
            p: 2,
            borderRadius: 8,
            bgcolor: "primary.softBg",
            textAlign: "center",
          }}
        >
          <Typography level="body-xs" sx={{ color: "text.secondary", mb: 0.5 }}>
            Total Tourist Bookings
          </Typography>
          <Typography level="h3" fontWeight="700" sx={{ color: "primary.solidBg" }}>
            {totalBookings.toLocaleString()}
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default TouristStatsCard;
