import Svg, { Circle, Path } from 'react-native-svg';

import { colors } from '@/lib/theme';

export type PostureVariant = 'droit' | 'legerement-voute' | 'tres-voute';

type PostureFigureProps = {
  variant: PostureVariant;
  /** Couleur du tracé (par défaut : textMuted). */
  color?: string;
  size?: number;
};

/**
 * Silhouette de profil minimaliste (tête + colonne + jambe) illustrant
 * la tenue spontanée : droit, légèrement voûté, très voûté.
 */
export function PostureFigure({
  variant,
  color = colors.textMuted,
  size = 44,
}: PostureFigureProps) {
  // viewBox 44x44 — tête vers la droite (profil), sol en bas.
  let head = { cx: 24, cy: 8 };
  let spine = 'M 24 12 L 24 30';

  if (variant === 'legerement-voute') {
    head = { cx: 27, cy: 9 };
    spine = 'M 26 13 Q 21 21 23 30';
  } else if (variant === 'tres-voute') {
    head = { cx: 31, cy: 12 };
    spine = 'M 29 16 Q 18 22 22 30';
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 44 44">
      <Circle cx={head.cx} cy={head.cy} r={4.5} stroke={color} strokeWidth={2.5} fill="none" />
      <Path d={spine} stroke={color} strokeWidth={2.5} strokeLinecap="round" fill="none" />
      <Path d="M 23 30 L 23 40" stroke={color} strokeWidth={2.5} strokeLinecap="round" fill="none" />
    </Svg>
  );
}
