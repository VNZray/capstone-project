import React from "react";
import Container from "./Container";
import Typography from "./Typography";
import Button from "./Button";
import { Box } from "@mui/joy";

// Type Definitions
type CardSize = "xs" | "sm" | "default" | "md" | "lg";
type CardVariant = "grid" | "list";
type AspectRatio = "1/1" | "4/3" | "16/9" | "3/2" | "21/9";

interface CardAction {
  label: string;
  onClick: () => void;
  variant?: "solid" | "outlined" | "soft" | "plain";
  colorScheme?: "primary" | "secondary" | "success" | "warning" | "error" | "info";
  disabled?: boolean;
  fullWidth?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  iconOnly?: boolean;
}

interface CardProps {
  // Image
  image?: string;
  imageAlt?: string;
  aspectRatio?: AspectRatio;
  
  // Content
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  
  // Actions
  actions?: CardAction[];
  
  // Layout
  size?: CardSize;
  variant?: CardVariant;
  
  // Styling
  elevation?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  hover?: boolean;
  hoverEffect?: "lift" | "glow" | "scale" | "highlight" | "shadow-expand";
  
  // Interaction
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

// Size configurations
const getSizeConfig = (size: CardSize, variant: CardVariant) => {
  const configs = {
    grid: {
      xs: {
        imageHeight: "120px",
        titleSize: "xs" as const,
        subtitleSize: "xs" as const,
        padding: "12px",
        gap: "8px",
        buttonSize: "sm" as const,
      },
      sm: {
        imageHeight: "160px",
        titleSize: "sm" as const,
        subtitleSize: "xs" as const,
        padding: "14px",
        gap: "10px",
        buttonSize: "sm" as const,
      },
      default: {
        imageHeight: "200px",
        titleSize: "sm" as const,
        subtitleSize: "sm" as const,
        padding: "16px",
        gap: "12px",
        buttonSize: "md" as const,
      },
      md: {
        imageHeight: "240px",
        titleSize: "normal" as const,
        subtitleSize: "sm" as const,
        padding: "18px",
        gap: "14px",
        buttonSize: "md" as const,
      },
      lg: {
        imageHeight: "280px",
        titleSize: "md" as const,
        subtitleSize: "normal" as const,
        padding: "20px",
        gap: "16px",
        buttonSize: "lg" as const,
      },
    },
    list: {
      xs: {
        imageWidth: "80px",
        titleSize: "xs" as const,
        subtitleSize: "xs" as const,
        padding: "12px",
        gap: "12px",
        buttonSize: "sm" as const,
      },
      sm: {
        imageWidth: "100px",
        titleSize: "sm" as const,
        subtitleSize: "xs" as const,
        padding: "14px",
        gap: "14px",
        buttonSize: "sm" as const,
      },
      default: {
        imageWidth: "120px",
        titleSize: "sm" as const,
        subtitleSize: "sm" as const,
        padding: "16px",
        gap: "16px",
        buttonSize: "md" as const,
      },
      md: {
        imageWidth: "150px",
        titleSize: "normal" as const,
        subtitleSize: "sm" as const,
        padding: "18px",
        gap: "18px",
        buttonSize: "md" as const,
      },
      lg: {
        imageWidth: "180px",
        titleSize: "md" as const,
        subtitleSize: "normal" as const,
        padding: "20px",
        gap: "20px",
        buttonSize: "lg" as const,
      },
    },
  };

  return configs[variant][size];
};

// Convert aspect ratio string to number
const getAspectRatioValue = (aspectRatio: AspectRatio): number => {
  const ratios = {
    "1/1": 1,
    "4/3": 4 / 3,
    "16/9": 16 / 9,
    "3/2": 3 / 2,
    "21/9": 21 / 9,
  };
  return ratios[aspectRatio];
};

const Card: React.FC<CardProps> = ({
  image,
  imageAlt = "Card image",
  aspectRatio = "16/9",
  title,
  subtitle,
  children,
  actions,
  size = "default",
  variant = "grid",
  elevation = 1,
  hover = true,
  hoverEffect = "lift",
  onClick,
  className,
  style,
}) => {
  const config = getSizeConfig(size, variant) as any;
  const aspectRatioValue = getAspectRatioValue(aspectRatio);

  // Grid variant (vertical layout)
  if (variant === "grid") {
    return (
      <Container
        elevation={elevation}
        padding="0"
        gap="0"
        hover={hover}
        hoverEffect={hoverEffect}
        onClick={onClick}
        cursor={onClick ? "pointer" : "default"}
        className={className}
        style={{
          margin: 0,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          ...style,
        }}
      >
        {/* Image */}
        {image && (
          <Box
            sx={{
              width: "100%",
              aspectRatio: aspectRatioValue,
              overflow: "hidden",
              backgroundColor: "#f0f0f0",
              position: "relative",
            }}
          >
            <img
              src={image}
              alt={imageAlt}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          </Box>
        )}

        {/* Content */}
        <Box
          sx={{
            padding: config.padding,
            display: "flex",
            flexDirection: "column",
            gap: config.gap,
            flex: 1,
          }}
        >
          {/* Title and Children Container */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "12px",
            }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography.CardTitle
                size={config.titleSize}
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {title}
              </Typography.CardTitle>
              {subtitle && (
                <Typography.CardSubTitle
                  size={config.subtitleSize}
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    mt: 0.5,
                  }}
                >
                  {subtitle}
                </Typography.CardSubTitle>
              )}
            </Box>

            {/* Children beside title */}
            {children && (
              <Box sx={{ flexShrink: 0 }}>
                {children}
              </Box>
            )}
          </Box>

          {/* Action Buttons */}
          {actions && actions.length > 0 && (
            <Box
              sx={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
                marginTop: "auto",
              }}
            >
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || "solid"}
                  colorScheme={action.colorScheme || "primary"}
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick();
                  }}
                  disabled={action.disabled}
                  size={config.buttonSize}
                >
                  {action.label}
                </Button>
              ))}
            </Box>
          )}
        </Box>
      </Container>
    );
  }

  // List variant (horizontal layout)
  return (
    <Container
      elevation={elevation}
      padding="0"
      gap="0"
      direction="row"
      hover={hover}
      hoverEffect={hoverEffect}
      onClick={onClick}
      cursor={onClick ? "pointer" : "default"}
      className={className}
      style={{
        margin: 0,
        overflow: "hidden",
        ...style,
      }}
    >
      {/* Image */}
      {image && (
        <Box
          sx={{
            width: config.imageWidth,
            flexShrink: 0,
            aspectRatio: aspectRatioValue,
            overflow: "hidden",
            backgroundColor: "#f0f0f0",
            position: "relative",
          }}
        >
          <img
            src={image}
            alt={imageAlt}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        </Box>
      )}

      {/* Content */}
      <Box
        sx={{
          padding: config.padding,
          display: "flex",
          flexDirection: "column",
          gap: config.gap,
          flex: 1,
          minWidth: 0,
        }}
      >
        {/* Title and Children Container */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "12px",
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography.CardTitle
              size={config.titleSize}
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {title}
            </Typography.CardTitle>
            {subtitle && (
              <Typography.CardSubTitle
                size={config.subtitleSize}
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  mt: 0.5,
                }}
              >
                {subtitle}
              </Typography.CardSubTitle>
            )}
          </Box>

          {/* Children beside title */}
          {children && (
            <Box sx={{ flexShrink: 0 }}>
              {children}
            </Box>
          )}
        </Box>

        {/* Action Buttons */}
        {actions && actions.length > 0 && (
          <Box
            sx={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
              marginTop: "auto",
            }}
          >
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || "solid"}
                colorScheme={action.colorScheme || "primary"}
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick();
                }}
                disabled={action.disabled}
                size={config.buttonSize}
              >
                {action.label}
              </Button>
            ))}
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default Card;
export type { CardProps, CardAction, CardSize, CardVariant, AspectRatio };
