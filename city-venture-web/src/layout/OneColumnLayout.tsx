import * as React from "react";
import { Box, Stack } from "@mui/joy";
import { Outlet } from "react-router-dom";
import Header from "../components/Main/Header";

interface OneColumnLayoutProps {
  children?: React.ReactNode; // Optional children
  maxWidth?: number | string; // Optional override
  padding?: string | number; // Optional override
}

const OneColumnLayout: React.FC<OneColumnLayoutProps> = ({
  maxWidth = 600,
  padding = "24px 16px",
  children,
}) => {
  return (
    <>
      <Box
        sx={{
          minHeight: "100vh",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          bgcolor: "background.body",
        }}
      >
        <Stack
          sx={{
            width: "100%",
            maxWidth: { xs: "100%", sm: maxWidth },
            boxSizing: "border-box",
            flex: 1,
            px: { xs: 1, sm: 0 },
            py: { xs: 2, sm: 3 },
            m: "0 auto",
            minHeight: "100vh",
          }}
          spacing={2}
        >
          <Box sx={{ p: padding }}>{children || <Outlet />}</Box>
        </Stack>
      </Box>
    </>
  );
};

export default OneColumnLayout;
