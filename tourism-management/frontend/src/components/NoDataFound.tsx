import React from "react";
import { Box, Typography, Stack } from "@mui/joy";
import { SearchX, Database, FileX, Inbox } from "lucide-react";

interface NoDataFoundProps {
  children?: React.ReactNode;
  title?: string;
  message?: string;
  icon?: "search" | "database" | "file" | "inbox";
  size?: "small" | "medium" | "large";
}

const NoDataFound: React.FC<NoDataFoundProps> = ({
  title = "No results found",
  message = "We couldn't find what you searched for. Try searching again.",
  icon = "search",
  size = "medium",
  children,
}) => {
  // Icon size mapping
  const iconSizeMap = {
    small: 80,
    medium: 120,
    large: 160,
  };

  // Text size mapping
  const titleLevelMap = {
    small: "h4" as const,
    medium: "h3" as const,
    large: "h2" as const,
  };

  const messageLevelMap = {
    small: "body-sm" as const,
    medium: "body-md" as const,
    large: "body-lg" as const,
  };

  // Icon component selection
  const renderIcon = () => {
    const iconSize = iconSizeMap[size];
    const iconProps = {
      size: iconSize,
      strokeWidth: 1.5,
      style: { opacity: 0.3 },
    };

    switch (icon) {
      case "database":
        return <Database {...iconProps} />;
      case "file":
        return <FileX {...iconProps} />;
      case "inbox":
        return <Inbox {...iconProps} />;
      case "search":
      default:
        return <SearchX {...iconProps} />;
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        py: { xs: 4, sm: 6, md: 8 },
        px: 2,
        textAlign: "center",
        minHeight: size === "large" ? "60vh" : size === "medium" ? "40vh" : "30vh",
      }}
    >
      <Stack spacing={2} alignItems="center" sx={{ maxWidth: 500 }}>
        {/* Icon/Illustration */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: iconSizeMap[size] + 40,
            height: iconSizeMap[size] + 40,
            borderRadius: "50%",
            bgcolor: "background.level1",
            mb: 2,
            position: "relative",
            "&::before": {
              content: '""',
              position: "absolute",
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              bgcolor: "primary.softBg",
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
          <Box sx={{ color: "primary.solidBg", zIndex: 1 }}>
            {renderIcon()}
          </Box>
        </Box>

        {/* Title */}
        <Typography
          level={titleLevelMap[size]}
          fontWeight="600"
          sx={{
            color: "primary.solidBg",
            mb: 1,
          }}
        >
          {title}
        </Typography>

        {/* Message */}
        <Typography
          level={messageLevelMap[size]}
          sx={{
            color: "text.secondary",
            maxWidth: 400,
            lineHeight: 1.6,
          }}
        >
          {message}
        </Typography>

        {children}
      </Stack>
    </Box>
  );
};

export default NoDataFound;
