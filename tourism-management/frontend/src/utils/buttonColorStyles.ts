import { colors } from './Colors';

type ColorScheme = keyof typeof colors;
type Variant = 'solid' | 'outlined' | 'soft' | 'plain';

/**
 * Generates hover color based on the base color
 * Darkens the color for solid variants and lightens for others
 */
const generateHoverColor = (baseColor: string, variant: Variant): string => {
  // Convert hex to RGB for manipulation
  const hex = baseColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  let newR = r;
  let newG = g;
  let newB = b;

  if (variant === 'solid') {
    // Darken by 20% for solid
    newR = Math.max(0, Math.floor(r * 0.8));
    newG = Math.max(0, Math.floor(g * 0.8));
    newB = Math.max(0, Math.floor(b * 0.8));
  } else {
    // Lighten by 30% for other variants
    newR = Math.min(255, Math.floor(r + (255 - r) * 0.3));
    newG = Math.min(255, Math.floor(g + (255 - g) * 0.3));
    newB = Math.min(255, Math.floor(b + (255 - b) * 0.3));
  }

  const toHex = (num: number) => Math.round(num).toString(16).padStart(2, '0');
  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
};

/**
 * Generates background color for soft variants
 * Lightens the color significantly
 */
const generateSoftBackground = (baseColor: string): string => {
  const hex = baseColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Lighten by 80%
  const newR = Math.min(255, Math.floor(r + (255 - r) * 0.8));
  const newG = Math.min(255, Math.floor(g + (255 - g) * 0.8));
  const newB = Math.min(255, Math.floor(b + (255 - b) * 0.8));

  const toHex = (num: number) => Math.round(num).toString(16).padStart(2, '0');
  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
};

/**
 * Gets the appropriate text color (white or dark) based on luminance
 */
const getTextColor = (baseColor: string): string => {
  const hex = baseColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5 ? '#000000' : '#ffffff';
};

/**
 * Dynamically generates color styles for a given color scheme and variant
 */
export const getColorStyles = (colorScheme: ColorScheme, variant: Variant) => {
  const baseColor = colors[colorScheme];

  if (!baseColor) {
    console.warn(`Color scheme "${colorScheme}" not found in colors palette`);
    return {};
  }

  const hoverColor = generateHoverColor(baseColor, variant);
  const softBg = generateSoftBackground(baseColor);
  const textColor = getTextColor(baseColor);

  switch (variant) {
    case 'solid':
      return {
        backgroundColor: baseColor,
        color: textColor,
        '&:hover': {
          backgroundColor: hoverColor,
        },
      };

    case 'outlined':
      return {
        borderColor: baseColor,
        color: baseColor,
        border: `1px solid ${baseColor}`,
        '&:hover': {
          backgroundColor: softBg,
        },
      };

    case 'soft':
      return {
        backgroundColor: softBg,
        color: baseColor,
        '&:hover': {
          backgroundColor: generateHoverColor(softBg, 'soft'),
        },
      };

    case 'plain':
      return {
        color: baseColor,
        '&:hover': {
          backgroundColor: softBg,
        },
      };

    default:
      return {};
  }
};

/**
 * Gets all available color schemes from the colors palette
 * Filters out non-color properties and returns only valid color hex values
 */
export const getAvailableColorSchemes = (): ColorScheme[] => {
  return Object.entries(colors)
    .filter(([_, value]) => typeof value === 'string' && value.startsWith('#'))
    .map(([key]) => key as ColorScheme);
};
