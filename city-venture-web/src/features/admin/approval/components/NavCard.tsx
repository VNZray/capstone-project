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
      padding="1.25rem"
      elevation={2}
      radius="12px"
      hoverDuration={200}
      background={active ? colors.primary : colors.white}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          {active ? (
            <div>
              <Typography level="body-md" sx={{ color: colors.white }}>
                {label}
              </Typography>
              <Typography level="h4" sx={{ color: colors.white }}>
                {typeof count === "number" ? count : "-"}
              </Typography>
            </div>
          ) : (
            <div>
              <Typography level="body-md" sx={{ color: colors.black }}>
                {label}
              </Typography>
              <Typography level="h4" sx={{ color: colors.black }}>
                {typeof count === "number" ? count : "-"}
              </Typography>
            </div>
          )}
        </div>
        {active ? (
          <div style={{ color: colors.white }}>{icon}</div>
        ) : (
          <div style={{ color: colors.black }}>{icon}</div>
        )}
      </div>
    </Container>
  );
};

export default NavCard;
