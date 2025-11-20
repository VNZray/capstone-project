import React from "react";
import { Box, Typography, Stack, Button } from "@mui/joy";
import { ServerCrash, RefreshCw } from "lucide-react";

export default function ServerDown(): React.ReactElement {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        bgcolor: "background.body",
        px: 2,
      }}
    >
      <Stack spacing={3} alignItems="center" sx={{ maxWidth: 500, textAlign: "center" }}>
        {/* Icon */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 140,
            height: 140,
            borderRadius: "50%",
            bgcolor: "background.level1",
            position: "relative",
            "&::before": {
              content: '""',
              position: "absolute",
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              bgcolor: "danger.softBg",
              opacity: 0.1,
              animation: "pulse 2s ease-in-out infinite",
            },
            "@keyframes pulse": {
              "0%, 100%": {
                transform: "scale(1)",
                opacity: 0.1,
              },
              "50%": {
                transform: "scale(1.1)",
                opacity: 0.15,
              },
            },
          }}
        >
          <ServerCrash size={80} strokeWidth={1.5} style={{ opacity: 0.3 }} />
        </Box>

        {/* Error Code */}
        <Typography
          level="h1"
          sx={{
            fontSize: { xs: "4rem", sm: "5rem" },
            fontWeight: 800,
            color: "danger.solidBg",
            lineHeight: 1,
            opacity: 0.9,
          }}
        >
          503
        </Typography>

        {/* Title */}
        <Typography
          level="h3"
          fontWeight="600"
          sx={{ color: "text.primary", mb: 0.5 }}
        >
          Server Unavailable
        </Typography>

        {/* Message */}
        <Typography
          level="body-md"
          sx={{
            color: "text.secondary",
            lineHeight: 1.6,
            maxWidth: 400,
          }}
        >
          We're unable to connect to the server at the moment. This could be due to maintenance or a temporary issue.
        </Typography>

        {/* Action Button */}
        <Button
          size="lg"
          color="primary"
          variant="solid"
          startDecorator={<RefreshCw size={18} />}
          onClick={handleRetry}
          sx={{ mt: 2, minWidth: 200 }}
        >
          Retry Connection
        </Button>

        {/* Help Text */}
        <Typography
          level="body-xs"
          sx={{ color: "text.tertiary", mt: 2, opacity: 0.7 }}
        >
          If the problem persists, please contact support.
        </Typography>
      </Stack>
    </Box>
  );
}
