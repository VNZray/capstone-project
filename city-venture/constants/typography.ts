// Temporary helper to provide typography values
// This replaces the deleted typography.ts file
export const typography = {
  display: 32,
  h1: 28,
  h2: 24,
  h3: 20,
  h4: 18,
  body: 16,
  bodySmall: 14,
  caption: 12,
  micro: 10,
};

// Deprecated: Use direct values or ThemedText component instead
export function useTypography() {
  return typography;
}
