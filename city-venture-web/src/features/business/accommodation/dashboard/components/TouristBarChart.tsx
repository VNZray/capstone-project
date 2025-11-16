import React from "react";
import { Box, Typography } from "@mui/joy";
import { BarChart } from "@mui/x-charts/BarChart";
import Container from "@/src/components/Container";
import { Users } from "lucide-react";
import { colors } from "@/src/utils/Colors";

interface TouristBarChartProps {
  local: number;
  domestic: number;
  foreign: number;
  overseas: number;
}

const TouristBarChart: React.FC<TouristBarChartProps> = ({
  local,
  domestic,
  foreign,
  overseas,
}) => {
  const chartData = [
    { category: "Local", value: local, color: colors.primary },
    { category: "Domestic", value: domestic, color: colors.success },
    { category: "Foreign", value: foreign, color: colors.warningLabel },
    { category: "Overseas", value: overseas, color: colors.error },
  ];

  return (
    <Container elevation={2} hoverEffect="lift" hoverDuration={300} hover>
      <Box
        sx={{
          p: 2.5,
          borderBottom: "1px solid",
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Users size={20} style={{ color: colors.primary }} />
        <Typography level="title-lg" fontWeight="700">
          Tourist Distribution
        </Typography>
      </Box>

      <Box
        sx={{
          p: 2.5,
          height: { xs: 280, sm: 340, md: 380 },
          width: "100%",
          maxWidth: 600,
          mx: "auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <BarChart
          dataset={chartData}
          xAxis={[
            {
              scaleType: "band",
              dataKey: "category",
              label: "Tourist Type",
            },
          ]}
          yAxis={[
            {
              label: "Number of Tourists",
            },
          ]}
          series={[
            {
              dataKey: "value",
              label: "Count",
              valueFormatter: (value) => value?.toLocaleString() || "0",
            },
          ]}
          colors={[colors.primary, colors.success, colors.warningLabel, colors.error]}
          width={undefined}
          height={undefined}
          sx={{ width: "100%", height: "100%" }}
        />
      </Box>
    </Container>
  );
};

export default TouristBarChart;
