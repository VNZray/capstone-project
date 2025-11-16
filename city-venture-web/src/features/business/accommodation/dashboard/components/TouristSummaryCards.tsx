import React from "react";
import { Box, Grid } from "@mui/joy";
import StatCard from "./StatCard";
import { Users, MapPin, Globe, Plane } from "lucide-react";

interface TouristSummaryCardsProps {
  local: number;
  domestic: number;
  foreign: number;
  overseas: number;
  total: number;
  period?: string | undefined;
}

const TouristSummaryCards: React.FC<TouristSummaryCardsProps> = ({
  local,
  domestic,
  foreign,
  overseas,
  total,
  period,
}) => {
  const totalNonZero = total || 1; // Avoid division by zero

  return (
    <Grid container spacing={2.5}>
      {/* Total Card - Full Width */}
      <Grid xs={12} md={6} lg={2.4}>
        <StatCard
          icon={<Users size={20} />}
          label="Total Tourists"
          value={total.toLocaleString()}
          change={0}
          color="primary"
        />
      </Grid>

      {/* Individual Category Cards */}
      <Grid xs={12} md={6} lg={2.4}>
        <StatCard
          icon={<MapPin size={20} />}
          label="Local Tourists"
          value={local.toLocaleString()}
          change={0}
          color="primary"
        />
      </Grid>

      <Grid xs={12} md={6} lg={2.4}>
        <StatCard
          icon={<Users size={20} />}
          label="Domestic Tourists"
          value={domestic.toLocaleString()}
          change={0}
          color="success"
        />
      </Grid>

      <Grid xs={12} md={6} lg={2.4}>
        <StatCard
          icon={<Globe size={20} />}
          label="Foreign Tourists"
          value={foreign.toLocaleString()}
          change={0}
          color="warning"
        />
      </Grid>

      <Grid xs={12} md={6} lg={2.4}>
        <StatCard
          icon={<Plane size={20} />}
          label="Overseas Tourists"
          value={overseas.toLocaleString()}
          change={0}
          color="danger"
        />
      </Grid>
    </Grid>
  );
};

export default TouristSummaryCards;
