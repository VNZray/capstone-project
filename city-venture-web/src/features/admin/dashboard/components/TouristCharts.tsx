import React from "react";
import { Box, Grid } from "@mui/joy";
import Container from "@/src/components/Container";
import Typography from "@/src/components/Typography";
import { colors } from "@/src/utils/Colors";

interface TouristChartsProps {
  local: number;
  domestic: number;
  foreign: number;
  overseas: number;
}

const COLORS = {
  local: "#0A1B47",
  domestic: "#10B981",
  foreign: "#F59E0B",
  overseas: "#EF4444",
};

const TouristCharts: React.FC<TouristChartsProps> = ({
  local,
  domestic,
  foreign,
  overseas,
}) => {
  const total = local + domestic + foreign + overseas || 1;

  const barData = [
    { name: "Local", value: local, fill: COLORS.local },
    { name: "Domestic", value: domestic, fill: COLORS.domestic },
    { name: "Foreign", value: foreign, fill: COLORS.foreign },
    { name: "Overseas", value: overseas, fill: COLORS.overseas },
  ];

  const pieData = [
    { name: "Local", value: local, percent: (local / total) * 100, color: COLORS.local },
    { name: "Domestic", value: domestic, percent: (domestic / total) * 100, color: COLORS.domestic },
    { name: "Foreign", value: foreign, percent: (foreign / total) * 100, color: COLORS.foreign },
    { name: "Overseas", value: overseas, percent: (overseas / total) * 100, color: COLORS.overseas },
  ];

  const maxValue = Math.max(...barData.map((d) => d.value)) || 1;

  return (
    <Grid container spacing={2.5}>
      <Grid xs={12} md={6}>
        <Container elevation={2}>
          <Box sx={{ p: 2 }}>
            <Typography.CardTitle>Tourist Distribution (Bar Chart)</Typography.CardTitle>
            <Typography.Body size="sm" sx={{ color: colors.gray }}>
              Tourist categories comparison
            </Typography.Body>
          </Box>
          <Box sx={{ p: 2 }}>
            {barData.map((item) => (
              <Box key={item.name} sx={{ mb: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                  <Typography.Body size="sm">{item.name}</Typography.Body>
                  <Typography.Body size="sm" sx={{ fontWeight: 600 }}>
                    {item.value.toLocaleString()}
                  </Typography.Body>
                </Box>
                <Box
                  sx={{
                    width: "100%",
                    height: 8,
                    bgcolor: "background.level2",
                    borderRadius: 4,
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      width: `${(item.value / maxValue) * 100}%`,
                      height: "100%",
                      bgcolor: item.fill,
                      transition: "width 0.3s ease",
                    }}
                  />
                </Box>
              </Box>
            ))}
          </Box>
        </Container>
      </Grid>

      <Grid xs={12} md={6}>
        <Container elevation={2}>
          <Box sx={{ p: 2 }}>
            <Typography.CardTitle>Tourist Distribution (Breakdown)</Typography.CardTitle>
            <Typography.Body size="sm" sx={{ color: colors.gray }}>
              Percentage breakdown by category
            </Typography.Body>
          </Box>
          <Box sx={{ p: 2 }}>
            {pieData.map((item) => (
              <Box
                key={item.name}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  p: 1.5,
                  mb: 1,
                  borderRadius: 2,
                  bgcolor: "background.level1",
                  "&:hover": {
                    bgcolor: "background.level2",
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      bgcolor: item.color,
                    }}
                  />
                  <Typography.Body size="sm">{item.name}</Typography.Body>
                </Box>
                <Box sx={{ textAlign: "right" }}>
                  <Typography.Body size="sm" sx={{ fontWeight: 600 }}>
                    {item.percent.toFixed(1)}%
                  </Typography.Body>
                  <Typography.Body size="xs" sx={{ color: "text.tertiary" }}>
                    {item.value.toLocaleString()}
                  </Typography.Body>
                </Box>
              </Box>
            ))}
          </Box>
        </Container>
      </Grid>
    </Grid>
  );
};

export default TouristCharts;
