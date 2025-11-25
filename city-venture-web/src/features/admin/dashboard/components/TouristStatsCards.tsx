import React from "react";
import { Grid } from "@mui/joy";
import StatCard from "./StatCard";
import { Users, MapPin, Globe, Plane } from "lucide-react";

interface TouristStatsCardsProps {
  local: number;
  domestic: number;
  foreign: number;
  overseas: number;
  total: number;
}

const TouristStatsCards: React.FC<TouristStatsCardsProps> = ({
  local,
  domestic,
  foreign,
  overseas,
  total,
}) => {
  return (
    <Grid container spacing={2.5}>
      <Grid xs={12} sm={6} md={2.4}>
        <StatCard
          icon={<Users size={20} />}
          label="Total Tourists"
          value={total}
          color="primary"
        />
      </Grid>

      <Grid xs={12} sm={6} md={2.4}>
        <StatCard
          icon={<MapPin size={20} />}
          label="Local Tourists"
          value={local}
          color="primary"
        />
      </Grid>

      <Grid xs={12} sm={6} md={2.4}>
        <StatCard
          icon={<Users size={20} />}
          label="Domestic Tourists"
          value={domestic}
          color="success"
        />
      </Grid>

      <Grid xs={12} sm={6} md={2.4}>
        <StatCard
          icon={<Globe size={20} />}
          label="Foreign Tourists"
          value={foreign}
          color="warning"
        />
      </Grid>

      <Grid xs={12} sm={6} md={2.4}>
        <StatCard
          icon={<Plane size={20} />}
          label="Overseas Tourists"
          value={overseas}
          color="danger"
        />
      </Grid>
    </Grid>
  );
};

export default TouristStatsCards;
