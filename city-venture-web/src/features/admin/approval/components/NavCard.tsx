import React from "react";
import { Card, CardContent, Stack, Typography } from "@mui/joy";

interface NavCardProps {
  label: string;
  count?: number;
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}

const NavCard: React.FC<NavCardProps> = ({ label, count, icon, active, onClick }) => {
  return (
    <Card
      variant="soft"
      color={active ? "primary" : "neutral"}
      sx={{
        cursor: "pointer",
        transition: "all 0.2s ease",
        "&:hover": { transform: "translateY(-2px)" },
        backgroundColor: active ? "#93c5fd" : undefined,
      }}
      onClick={onClick}
    >
      <CardContent>
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
          <Stack>
            <Typography level="body-sm" sx={{ color: "text.tertiary" }}>{label}</Typography>
            <Typography level="h4">{typeof count === "number" ? count : "-"}</Typography>
          </Stack>
          {icon}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default NavCard;
