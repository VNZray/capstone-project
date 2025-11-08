import React from "react";
import { Box, Typography } from "@mui/joy";
import { PieChart } from "@mui/x-charts/PieChart";
import Container from "@/src/components/Container";
import { PieChart as PieChartIcon } from "lucide-react";
import { colors } from "@/src/utils/Colors";

interface TouristPieChartProps {
  local: number;
  domestic: number;
  foreign: number;
  overseas: number;
}

const TouristPieChart: React.FC<TouristPieChartProps> = ({
  local,
  domestic,
  foreign,
  overseas,
}) => {
  const total = local + domestic + foreign + overseas;

  const pieData = [
    {
      id: 0,
      value: local,
      label: "Local",
      color: colors.primary,
    },
    {
      id: 1,
      value: domestic,
      label: "Domestic",
      color: colors.success,
    },
    {
      id: 2,
      value: foreign,
      label: "Foreign",
      color: colors.warningLabel,
    },
    {
      id: 3,
      value: overseas,
      label: "Overseas",
      color: colors.error,
    },
  ].filter((item) => item.value > 0); // Only show non-zero values

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
        <PieChartIcon size={20} style={{ color: colors.primary }} />
        <Typography level="title-lg" fontWeight="700">
          Tourist Breakdown
        </Typography>
      </Box>

      <Box
        sx={{
          p: 2.5,
          height: 350,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {total > 0 ? (
          <PieChart
            series={[
              {
                data: pieData,
                faded: {
                  innerRadius: 30,
                  additionalRadius: -10,
                  color: "gray",
                },
                valueFormatter: (item) => {
                  const percentage = ((item.value / total) * 100).toFixed(1);
                  return `${item.value.toLocaleString()} (${percentage}%)`;
                },
              },
            ]}
            colors={pieData.map((item) => item.color)}
            width={400}
            height={300}
            slotProps={{
              legend: {
                position: { vertical: "middle", horizontal: "end" },
              },
            }}
          />
        ) : (
          <Typography level="body-md" sx={{ color: "text.tertiary" }}>
            No tourist data available
          </Typography>
        )}
      </Box>
    </Container>
  );
};

export default TouristPieChart;
