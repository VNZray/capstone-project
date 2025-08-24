import React from "react";
import { Card, CardContent, Stack } from "@mui/material";
import Text from "@/src/components/Text";

type InfoCardProps = {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  onClick?: () => void;
  color?: string;
};

export default function InfoCard({
  icon,
  title,
  subtitle,
  onClick,
  color,
}: InfoCardProps) {
  return (
    <Card
      elevation={3}
      onClick={onClick}
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        borderRadius: 3,
        cursor: onClick ? "pointer" : "default",
        transition: "0.3s",
        "&:hover": {
          transform: onClick ? "translateY(-4px)" : "none",
          boxShadow: onClick ? 6 : 3,
        },
      }}
    >
      <CardContent style={{ padding: "16px" }}>
        <Stack gap={0.3} alignItems="center" textAlign="center">
          {/* Icon */}
          {icon && <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: color, height: "32px" }}>{icon}</div>}

          {/* Title */}
          <Text variant="card-title">{title}</Text>

          {/* Subtitle */}
          {subtitle && <Text variant="card-sub-title">{subtitle}</Text>}
        </Stack>
      </CardContent>
    </Card>
  );
}
