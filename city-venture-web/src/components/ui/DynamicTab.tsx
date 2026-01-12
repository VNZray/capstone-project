import React from "react";
import Button from "../Button";
import type { CSSProperties } from "react";
import { colors } from "../../utils/Colors";

type ColorScheme = keyof typeof colors;
type ButtonSize = "sm" | "md" | "lg";
type ButtonVariant = "solid" | "outlined" | "soft" | "plain";

export interface TabItem {
  id: string | number;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  count?: number;
}

interface DynamicTabProps {
  tabs: TabItem[];
  activeTabId: string | number;
  onChange: (tabId: string | number) => void;
  colorScheme?: ColorScheme;
  size?: ButtonSize;
  variant?: "filled" | "outlined"; // filled uses solid for active, outlined for inactive
  gap?: number;
  fullWidth?: boolean;
  customStyle?: CSSProperties;
  showIcons?: boolean;
  onlyIconActive?: boolean;
  padding?: number | string;
  margin?: number | string;
}

const DynamicTab = ({
  padding = 16,
  margin,
  tabs,
  activeTabId,
  onChange,
  colorScheme = "primary",
  size = "md",
  variant = "filled",
  gap = 8,
  fullWidth = false,
  customStyle,
  showIcons = true,
  onlyIconActive = false,
}: DynamicTabProps) => {
  const containerStyle: CSSProperties = {
    display: "flex",
    gap: `${gap}px`,
    width: fullWidth ? "100%" : "auto",
    flexWrap: "wrap",
    padding,
    margin,
    ...customStyle,
  };

  const buttonStyle: CSSProperties = fullWidth
    ? {
        flex: 1,
        minWidth: "0",
      }
    : {};

  return (
    <div style={containerStyle}>
      {tabs.map((tab) => {
        const isActive = activeTabId === tab.id;
        const buttonVariant: ButtonVariant =
          variant === "filled"
            ? isActive
              ? "solid"
              : "outlined"
            : isActive
            ? "soft"
            : "plain";

        return (
          <Button
            key={tab.id}
            colorScheme={colorScheme}
            size={size}
            variant={buttonVariant}
            startDecorator={showIcons && tab.icon ? tab.icon : undefined}
            onClick={() => onChange(tab.id)}
            disabled={tab.disabled}
            sx={buttonStyle}
          >
            {onlyIconActive && isActive && tab.icon
              ? tab.icon
              : !onlyIconActive && tab.label
              ? tab.label
              : tab.label}
            {tab.count !== undefined && (
              <span
                style={{
                  marginLeft: "8px",
                  backgroundColor: isActive
                    ? "rgba(255,255,255,0.3)"
                    : "rgba(0,0,0,0.1)",
                  padding: "2px 8px",
                  borderRadius: "10px",
                  fontSize: "0.85em",
                  fontWeight: 600,
                }}
              >
                {tab.count}
              </span>
            )}
          </Button>
        );
      })}
    </div>
  );
};

export default DynamicTab;
