import { IconButton as JoyIconButton } from '@mui/joy';
import type { IconButtonProps as JoyIconButtonProps } from '@mui/joy';
import type { CSSProperties } from 'react';
import { colors } from '../utils/Colors';
import { getColorStyles } from '@/src/utils/buttonColorStyles';

type ColorScheme = keyof typeof colors;
type AnimationType = 'pulse' | 'bounce' | 'swing' | 'wiggle' | 'fadeIn' | 'slideInUp' | 'slideInDown' | 'slideInLeft' | 'slideInRight' | 'scaleIn' | 'none';
type HoverEffect = 'scale' | 'lift' | 'glow' | 'spin' | 'rotate' | 'pulse-hover' | 'shadow' | 'none';

interface CustomIconButtonProps extends Omit<JoyIconButtonProps, 'color' | 'variant'> {
  variant?: 'solid' | 'outlined' | 'soft' | 'plain';
  colorScheme?: ColorScheme;
  children: React.ReactNode;
  floating?: boolean;
  floatPosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  floatingOffset?: number;
  animation?: AnimationType;
  animationDuration?: number;
  hoverEffect?: HoverEffect;
}

// Animation keyframes
const animationKeyframes = `
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }
  
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  
  @keyframes swing {
    20%, 80% { transform: rotate(0deg); }
    40% { transform: rotate(5deg); }
    60% { transform: rotate(-5deg); }
  }
  
  @keyframes wiggle {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideInUp {
    from { 
      opacity: 0;
      transform: translateY(20px); 
    }
    to { 
      opacity: 1;
      transform: translateY(0); 
    }
  }
  
  @keyframes slideInDown {
    from { 
      opacity: 0;
      transform: translateY(-20px); 
    }
    to { 
      opacity: 1;
      transform: translateY(0); 
    }
  }
  
  @keyframes slideInLeft {
    from { 
      opacity: 0;
      transform: translateX(-20px); 
    }
    to { 
      opacity: 1;
      transform: translateX(0); 
    }
  }
  
  @keyframes slideInRight {
    from { 
      opacity: 0;
      transform: translateX(20px); 
    }
    to { 
      opacity: 1;
      transform: translateX(0); 
    }
  }
  
  @keyframes scaleIn {
    from { 
      opacity: 0;
      transform: scale(0.5); 
    }
    to { 
      opacity: 1;
      transform: scale(1); 
    }
  }
`;

// Inject animation keyframes
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = animationKeyframes;
  document.head.appendChild(style);
}

const getAnimationStyle = (animation: AnimationType, duration: number): CSSProperties => {
  if (animation === 'none' || !animation) return {};

  const animationMap: Record<AnimationType, string> = {
    pulse: 'pulse',
    bounce: 'bounce',
    swing: 'swing',
    wiggle: 'wiggle',
    fadeIn: 'fadeIn',
    slideInUp: 'slideInUp',
    slideInDown: 'slideInDown',
    slideInLeft: 'slideInLeft',
    slideInRight: 'slideInRight',
    scaleIn: 'scaleIn',
    none: '',
  };

  return {
    animation: `${animationMap[animation]} ${duration}s ease-in-out infinite`,
  };
};

const getHoverEffect = (hoverEffect: HoverEffect): Record<string, any> => {
  if (hoverEffect === 'none' || !hoverEffect) return {};

  const hoverEffects: Record<HoverEffect, Record<string, any>> = {
    scale: {
      transition: 'transform 0.3s ease-in-out',
      '&:hover': {
        transform: 'scale(1.15)',
      },
    },
    lift: {
      transition: 'all 0.3s ease-in-out',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
      },
    },
    glow: {
      transition: 'all 0.3s ease-in-out',
      '&:hover': {
        boxShadow: '0 0 20px rgba(0, 119, 182, 0.6)',
      },
    },
    spin: {
      transition: 'transform 0.3s ease-in-out',
      '&:hover': {
        transform: 'rotate(360deg)',
      },
    },
    rotate: {
      transition: 'transform 0.3s ease-in-out',
      '&:hover': {
        transform: 'rotate(15deg)',
      },
    },
    'pulse-hover': {
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        animation: 'pulse 0.5s ease-in-out',
      },
    },
    shadow: {
      transition: 'box-shadow 0.3s ease-in-out',
      '&:hover': {
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
    },
    none: {},
  };

  return hoverEffects[hoverEffect] || {};
};

const IconButton = ({
  variant = 'solid',
  colorScheme = 'primary',
  children,
  sx,
  floating = false,
  floatPosition = 'bottom-right',
  floatingOffset = 20,
  animation = 'none',
  animationDuration = 2,
  hoverEffect = 'none',
  ...props
}: CustomIconButtonProps) => {
  const buttonStyles = getColorStyles(colorScheme as ColorScheme, variant);

  // Generate floating styles based on position
  const getFloatingStyles = () => {
    if (!floating) return {};

    const baseStyles = {
      position: 'fixed' as const,
      zIndex: 1000,
    };

    switch (floatPosition) {
      case 'top-right':
        return {
          ...baseStyles,
          top: `${floatingOffset}px`,
          right: `${floatingOffset}px`,
        };
      case 'top-left':
        return {
          ...baseStyles,
          top: `${floatingOffset}px`,
          left: `${floatingOffset}px`,
        };
      case 'bottom-left':
        return {
          ...baseStyles,
          bottom: `${floatingOffset}px`,
          left: `${floatingOffset}px`,
        };
      case 'bottom-right':
      default:
        return {
          ...baseStyles,
          bottom: `${floatingOffset}px`,
          right: `${floatingOffset}px`,
        };
    }
  };

  const animationStyles = getAnimationStyle(animation, animationDuration);
  const hoverEffectStyles = getHoverEffect(hoverEffect);

  return (
    <JoyIconButton
      variant={variant === 'solid' ? 'solid' : variant === 'outlined' ? 'outlined' : 'soft'}
      sx={{
        ...buttonStyles,
        ...getFloatingStyles(),
        ...animationStyles,
        ...hoverEffectStyles,
        ...sx,
      } as CSSProperties}
      {...props}
    >
      {children}
    </JoyIconButton>
  );
};

export default IconButton;
