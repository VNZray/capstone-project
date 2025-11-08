import { Button as JoyButton } from '@mui/joy';
import type { ButtonProps as JoyButtonProps } from '@mui/joy';
import type { CSSProperties } from 'react';
import { colors } from '../utils/Colors';
import { getColorStyles } from '../utils/buttonColorStyles';

type ColorScheme = keyof typeof colors;

interface CustomButtonProps extends Omit<JoyButtonProps, 'color' | 'variant'> {
  variant?: 'solid' | 'outlined' | 'soft' | 'plain';
  colorScheme?: ColorScheme;
  children: React.ReactNode;
}

const Button = ({
  variant = 'solid',
  colorScheme = 'primary',
  children,
  sx,
  ...props
}: CustomButtonProps) => {
  const buttonStyles = getColorStyles(colorScheme, variant);

  return (
    <JoyButton
      variant={variant === 'solid' ? 'solid' : variant === 'outlined' ? 'outlined' : 'soft'}
      sx={{
        ...buttonStyles,
        ...sx,
      } as CSSProperties}
      {...props}
    >
      {children}
    </JoyButton>
  );
};

export default Button;