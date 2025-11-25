import React from "react";
import Container from "@/src/components/Container";

import { colors } from "@/src/utils/Colors";
import { Typography } from "@mui/joy";

interface NavCardProps {
  label: string;
  count?: number;
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}

const NavCard: React.FC<NavCardProps> = ({
  label,
  count,
  icon,
  active,
  onClick,
}) => {
  return (
    <Container
      hover
      hoverEffect="lift"
      cursor="pointer"
      onClick={onClick}
      padding="1rem"
      elevation={2}
      radius="12px"
      hoverDuration={150}
      background={colors.white}
      style={{
        border: active ? `1px solid ${colors.primary}` : `1px solid #E5E7EB`,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: active ? colors.primary : "#0A1B4720",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: active ? colors.white : colors.primary,
          }}
        >
          {icon}
        </div>
        <Typography level="h4" sx={{ color: colors.black, lineHeight: 1 }}>
          {typeof count === "number" ? count : "-"}
        </Typography>
        <Typography level="body-sm" sx={{ color: colors.black, opacity: 0.9 }}>
          {label}
        </Typography>
      </div>
    </Container>
  );
};

export default NavCard;
