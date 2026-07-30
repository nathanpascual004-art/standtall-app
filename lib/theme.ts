/**
 * COUCHE DE COMPATIBILITÉ TEMPORAIRE — ne plus rien ajouter ici.
 *
 * La source de vérité du design est theme/tokens.ts. Ce fichier mappe les
 * anciens noms vers les nouveaux tokens le temps de migrer chaque écran
 * (import '@/theme/tokens'), puis sera supprimé.
 */
import { color, font, radius as tokenRadius, space } from '@/theme/tokens';

export const colors = {
  bg: color.bg,
  card: color.surface,
  cardActive: color.surfaceAlt,
  accent: color.accent,
  accentLight: color.accent,
  text: color.textPrimary,
  textMuted: color.textSecond,
  border: color.border,
  danger: color.danger,
} as const;

export const radius = {
  card: tokenRadius.card,
  button: tokenRadius.button,
} as const;

export const fonts = {
  display: font.bold,
  medium: font.medium,
  body: font.regular,
} as const;

export const spacing = {
  xs: space.xs,
  sm: space.sm,
  md: space.md,
  lg: space.lg,
  xl: space.xl,
  xxl: space.xxl,
} as const;

export const theme = { colors, radius, fonts, spacing } as const;

export type Theme = typeof theme;
