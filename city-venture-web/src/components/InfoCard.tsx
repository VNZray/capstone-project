import React from "react";
import { Card, CardContent, Stack } from "@mui/material";
import Text from "@/src/components/Text";
import Container from "@/src/components/Container";

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
    <Container elevation={2}>
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
        <Text variant="card-title">{title}</Text>

        {/* Subtitle */}
        {subtitle && <Text variant="card-sub-title">{subtitle}</Text>}
      </Stack>
    </Container>
  );
}
