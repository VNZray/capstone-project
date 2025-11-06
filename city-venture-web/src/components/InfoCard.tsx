import React from "react";
import { Stack } from "@mui/material";
import Container from "@/src/components/Container";
import ResponsiveText from "./ResponsiveText";

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
        <ResponsiveText type="card-title-normal">{title}</ResponsiveText>

        {/* Subtitle */}
        {subtitle && <ResponsiveText type="card-sub-title-normal">{subtitle}</ResponsiveText>}
      </Stack>
    </Container>
  );
}
