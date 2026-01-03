import { Box, Chip } from "@mui/joy";
import Typography from "@/src/components/Typography";
import { colors } from "@/src/utils/Colors";
import type { ReactNode } from "react";

interface StatCardProps {
  icon: ReactNode;
  title: string;
  count: number;
  badge?: string;
  iconBgColor?: string;
}

const StatCard = ({
  icon,
  title,
  count,
  badge,
  iconBgColor,
}: StatCardProps) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        padding: "clamp(1rem, 3vw, 1.5rem)",
        backgroundColor: colors.background,
        borderRadius: "12px",
        border: `1px solid #e0e0e0`,
        transition: "all 0.2s ease",
        "&:hover": {
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          borderColor: colors.primary,
        },
      }}
    >
      {/* Icon */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "clamp(40px, 10vw, 48px)",
          height: "clamp(40px, 10vw, 48px)",
          borderRadius: "10px",
          backgroundColor: iconBgColor || colors.primary + "20",
          flexShrink: 0,
          fontSize: "clamp(1.25rem, 3vw, 1.5rem)",
        }}
      >
        {icon}
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography.Label
          size="xs"
          color="default"
          sx={{ opacity: 0.7, marginBottom: "4px" }}
        >
          {title}
        </Typography.Label>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography.Header size="sm" weight="bold">
            {count}
          </Typography.Header>
          {badge && (
            <Chip
              size="sm"
              variant="soft"
              color="success"
              sx={{
                fontSize: "clamp(0.625rem, 1.5vw, 0.75rem)",
                padding: "2px 6px",
                height: "auto",
              }}
            >
              {badge}
            </Chip>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default StatCard;
