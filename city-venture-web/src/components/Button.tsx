import { Button as JoyButton } from "@mui/joy";
import type { ButtonProps as JoyButtonProps } from "@mui/joy";
import type { CSSProperties, ReactNode } from "react";
import { colors } from "../utils/Colors";
import { getColorStyles } from "../utils/buttonColorStyles";

type ColorScheme = keyof typeof colors;

interface CustomButtonProps extends Omit<JoyButtonProps, "color" | "variant"> {
  variant?: "solid" | "outlined" | "soft" | "plain";
  colorScheme?: ColorScheme;
  children: React.ReactNode;
  /** @deprecated Use startDecorator instead */
  leftIcon?: ReactNode;
  /** @deprecated Use endDecorator instead */
  rightIcon?: ReactNode;
}

const Button = ({
  variant = "solid",
  colorScheme = "primary",
  children,
  sx,
  leftIcon,
  rightIcon,
  startDecorator,
  endDecorator,
  ...props
}: CustomButtonProps) => {
  const buttonStyles = getColorStyles(colorScheme, variant);

  return (
    <JoyButton
      variant={
        variant === "solid"
          ? "solid"
          : variant === "outlined"
          ? "outlined"
          : "soft"
      }
      startDecorator={startDecorator ?? leftIcon}
      endDecorator={endDecorator ?? rightIcon}
      sx={
        {
          ...buttonStyles,
          ...sx,
        } as CSSProperties
      }
      {...props}
    >
      {children}
    </JoyButton>
  );
};

export default Button;
