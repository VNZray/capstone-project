import { Grid } from "@mui/joy";
import InfoCard from "@/src/components/InfoCard";
import { Building2, Shield, FileText, Calendar } from "lucide-react";
import { colors } from "@/src/utils/Colors";
import type { Permit } from "@/src/types/Permit";

interface QuickStatsProps {
  user: any;
  permits: Permit[];
}

const QuickStats = ({ user, permits }: QuickStatsProps) => {
  return (
    <Grid container spacing={2} sx={{ mb: 2 }}>
      <Grid xs={12} sm={6} md={3}>
        <InfoCard
          icon={<Building2 size={24} color="white" />}
          title="Active Businesses"
          subtitle={user?.business_id ? "1" : "0"}
          color={colors.primary}
        />
      </Grid>
      <Grid xs={12} sm={6} md={3}>
        <InfoCard
          icon={<Shield size={24} color="white" />}
          title="Account Status"
          subtitle={user?.is_active ? "Active" : "Inactive"}
          color={colors.success}
        />
      </Grid>
      <Grid xs={12} sm={6} md={3}>
        <InfoCard
          icon={<FileText size={24} color="white" />}
          title="Permits"
          subtitle={
            permits.filter((p) => p.status === "approved").length +
            "/" +
            permits.length
          }
          color={colors.warning}
        />
      </Grid>
      <Grid xs={12} sm={6} md={3}>
        <InfoCard
          icon={<Calendar size={24} color="white" />}
          title="Member Since"
          subtitle={
            user?.created_at
              ? new Date(user.created_at).getFullYear().toString()
              : "N/A"
          }
          color={colors.info}
        />
      </Grid>
    </Grid>
  );
};

export default QuickStats;