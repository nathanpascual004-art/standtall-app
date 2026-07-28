/**
 * Thème global StandTall — design premium sombre.
 * Police système uniquement, poids 400 (regular) et 500 (medium).
 */

export const colors = {
  bg: '#0a0d13',
  card: '#12161e',
  cardActive: '#16324f',
  accent: '#2f6bd6',
  accentLight: '#4a8fe0',
  text: '#eef2f7',
  textMuted: '#7d8794',
  border: '#242b36',
  /** Actions destructives (réinitialisation…). */
  danger: '#d05c5c',
} as const;

export const radius = {
  card: 14,
  button: 13,
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
} as const;

export const theme = { colors, radius, fontWeight, spacing } as const;

export type Theme = typeof theme;
