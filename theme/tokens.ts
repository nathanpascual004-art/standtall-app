/**
 * StandTall — design tokens. SOURCE UNIQUE de vérité du design.
 *
 * Direction artistique : premium sportif, dark permanent, un seul accent
 * vert acide (esprit grande salle de sport), concept signature : la toise.
 *
 * Règle absolue : AUCUNE couleur, taille, rayon ou durée en dur dans les
 * écrans ou composants — tout vient d'ici.
 */
import { Platform, type TextStyle } from 'react-native';

/* ————————————————————————————— COULEURS ————————————————————————————— */

export const color = {
  /** Fond des écrans. */
  bg: '#0C0D0C',
  /** Cartes. */
  surface: '#151614',
  /** Zones photo / tuiles avant image / états sélectionnés. */
  surfaceAlt: '#1C2216',
  /** Hairline des cartes. */
  border: '#24261F',

  /** Vert acide — accent UNIQUE de l'app. */
  accent: '#C9F73C',
  /** Accent enfoncé (press). */
  accentPress: '#A9D62E',
  /** Texte posé SUR l'accent. */
  onAccent: '#0C0D0C',

  /** Rail / segment inactif. */
  railOff: '#25271F',
  /** Graduation de toise inactive. */
  tickOff: '#2E322E',

  textPrimary: '#FFFFFF',
  textSecond: '#9EA29B',
  textMuted: '#6B6F6B',

  /** Macros nutrition (dégradé de l'accent — pas de couleur étrangère). */
  macro1: '#C9F73C', // protéines
  macro2: '#7E9A24', // glucides
  macro3: '#4A5A1A', // lipides

  /** Sémantique destructive (réinitialisation) — usage rare et sobre. */
  danger: '#D05C5C',

  /** Voile sombre bas de photo quand du texte se superpose. */
  scrim: 'rgba(12, 13, 12, 0.72)',
  /** Grade unifié des photos : voile sombre + pointe de lime. */
  photoVeil: 'rgba(12, 13, 12, 0.30)',
  photoLime: 'rgba(201, 247, 60, 0.07)',
  /** Surcouche des valeurs verrouillées (reveal). */
  lockVeil: 'rgba(12, 13, 12, 0.45)',
} as const;

/* ————————————————————————————— TYPOGRAPHIE ————————————————————————————— */

export const font = {
  regular: 'SpaceGrotesk_400Regular',
  medium: 'SpaceGrotesk_500Medium',
  bold: 'SpaceGrotesk_700Bold',
} as const;

/**
 * Échelle typographique. Les capitales passent par textTransform
 * (jamais de chaînes en dur en majuscules — le texte source reste normal).
 * Règle : capitales UNIQUEMENT titres/labels, jamais le corps de texte.
 */
export const type = {
  /** Gros chiffres de stats (score, stature, kcal). */
  statNumber: {
    fontFamily: font.bold,
    fontSize: 44,
    color: color.textPrimary,
  } as TextStyle,
  statNumberSmall: {
    fontFamily: font.bold,
    fontSize: 28,
    color: color.textPrimary,
  } as TextStyle,

  /** Titre d'écran — 700, capitales. */
  screenTitle: {
    fontFamily: font.bold,
    fontSize: 23,
    color: color.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  } as TextStyle,

  /** Grande question d'onboarding — 700, capitales. */
  question: {
    fontFamily: font.bold,
    fontSize: 24,
    lineHeight: 32,
    color: color.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  } as TextStyle,

  /** Label / titre de section — 700, capitales, letter-spacing 1.2. */
  sectionLabel: {
    fontFamily: font.bold,
    fontSize: 11,
    color: color.textSecond,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  } as TextStyle,

  /** Titre d'une carte (minuscules normales). */
  cardTitle: {
    fontFamily: font.bold,
    fontSize: 16,
    color: color.textPrimary,
  } as TextStyle,

  /** Corps de texte. */
  body: {
    fontFamily: font.regular,
    fontSize: 13.5,
    lineHeight: 20,
    color: color.textSecond,
  } as TextStyle,
  bodyMedium: {
    fontFamily: font.medium,
    fontSize: 13.5,
    lineHeight: 20,
    color: color.textPrimary,
  } as TextStyle,
  /** Petites métadonnées (durées, unités). */
  meta: {
    fontFamily: font.regular,
    fontSize: 12.5,
    lineHeight: 18,
    color: color.textMuted,
  } as TextStyle,

  /** Libellé de bouton — capitales. */
  button: {
    fontFamily: font.bold,
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  } as TextStyle,
} as const;

/* ————————————————————————— ESPACEMENTS & RAYONS ————————————————————————— */

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  /** Padding latéral standard des écrans. */
  screen: 16,
  lg: 16,
  xl: 20,
  xxl: 28,
} as const;

export const radius = {
  /** Cartes. */
  card: 16,
  /** Tuiles / vignettes image. */
  tile: 10,
  /** Boutons. */
  button: 10,
  /** Pastilles / pills. */
  pill: 999,
  /** Segments de rail. */
  segment: 3,
} as const;

export const borderWidth = {
  hairline: 1,
} as const;

/* ————————————————————————————— MOTION ————————————————————————————— */

export const duration = {
  /** Feedback tap. */
  tap: 120,
  fast: 180,
  base: 260,
  slow: 420,
} as const;

/** Spring signature (remplissage de toise, apparitions). */
export const spring = {
  damping: 18,
  stiffness: 160,
  mass: 1,
} as const;

/** Échelle d'un élément pressé. */
export const pressScale = 0.97;

/** Délai de cascade entre cartes (stagger). */
export const staggerDelay = 60;

/* ————————————————————————————— DIVERS ————————————————————————————— */

/** Neutralise l'outline blanc des TextInput sur web. */
export const webNoOutline: TextStyle | null =
  Platform.OS === 'web' ? ({ outlineStyle: 'none' } as unknown as TextStyle) : null;

export const tokens = {
  color,
  font,
  type,
  space,
  radius,
  borderWidth,
  duration,
  spring,
  pressScale,
  staggerDelay,
} as const;

export type Tokens = typeof tokens;
