import React from "react";
import { Stack } from "@mui/material";
import Container from "@/src/components/Container";
import Typography from "@/src/components/Typography";

type InfoCardProps = {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  color?: string;
};

export default function InfoCard({
  icon,
  title,
  subtitle,
  color,
}: InfoCardProps) {
  return (
    <Container hover elevation={2}>
      <Stack gap={0.5} alignItems="center" textAlign="center">
        {/* Icon */}
        {icon && (
          <div
            style={{
              padding: "12px",
              borderRadius: "8px",
              backgroundColor: color,
              height: "32px",
            }}
          >
            {icon}
          </div>
        )}

        {/* Title */}
        <Typography.CardTitle size="sm">{title}</Typography.CardTitle>

        {/* Subtitle */}
        {subtitle && (
          <Typography.CardSubTitle size="sm">{subtitle}</Typography.CardSubTitle>
        )}
      </Stack>
    </Container>
  );
}
