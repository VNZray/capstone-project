import * as React from "react";
import { Box, Stack } from "@mui/joy";
import { Outlet } from "react-router-dom";
import Header from "../components/Main/Header";

interface TwoColumnLayoutProps {
  left?: React.ReactNode;
  right?: React.ReactNode;
  leftWidth?: number | string;
  rightWidth?: number | string;
  gap?: number | string;
  maxWidth?: number | string;
  padding?: string | number;
}

const TwoColumnLayout: React.FC<TwoColumnLayoutProps> = ({
  left,
  right,
  leftWidth = 800,
  rightWidth = 1,
  gap = 3,
  maxWidth = 1800,
  padding = "24px 16px",
}) => {
  return (
    <>
      <Box
        sx={{
          minHeight: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          bgcolor: "background.body",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={gap}
          sx={{
            width: "100%",
            maxWidth: { xs: "100%", md: maxWidth },
            boxSizing: "border-box",
            flex: 1,
            m: "0 auto",
            minHeight: "100%",
          }}
        >
          <Box
            sx={{
              width: { xs: "100%", md: leftWidth },
              flexShrink: 0,
              p: padding,
            }}
          >
            {left || <Outlet context="left" />}
          </Box>
          <Box
            sx={{
              width: { xs: "100%", md: rightWidth },
              flexGrow: 1,
              p: padding,
            }}
          >
            {right || <Outlet context="right" />}
          </Box>
        </Stack>
      </Box>
    </>
  );
};

export default TwoColumnLayout;
