import { Image, type ImageSource } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';

import { color } from '@/theme/tokens';

/**
 * États de la mascotte (state-machine).
 * Cible : rig Rive (.riv via rive-react-native) piloté par ces états.
 * Fallback intermédiaire : un PNG par état dans ASSETS ci-dessous.
 * Fallback actuel : silhouette SVG paramétrique (posture selon l'état),
 * pour intégrer la mécanique sans attendre les assets finaux.
 */
export type MascotState = 'slouched' | 'neutral' | 'upright' | 'celebrate' | 'encourage';

/**
 * Déposer les PNG dans assets/mascot/<state>.png puis les référencer ici :
 *   slouched: require('@/assets/mascot/slouched.png'),
 * Le SVG placeholder disparaît automatiquement pour les états fournis.
 */
const ASSETS: Partial<Record<MascotState, ImageSource | number>> = {};

type MascotProps = {
  /** État explicite — prioritaire sur `score`. */
  state?: MascotState;
  /** Sinon, dérive la posture du score (0-100) : voûté → droit. */
  score?: number;
  size?: number;
};

/** slouch 1 = complètement voûté, 0 = parfaitement droit. */
function slouchFor(state: MascotState | undefined, score: number | undefined): number {
  if (state === 'slouched') return 1;
  if (state === 'upright' || state === 'celebrate') return 0;
  if (state === 'encourage') return 0.15;
  if (state === 'neutral') return 0.45;
  if (score !== undefined) return 1 - Math.min(100, Math.max(0, score)) / 100;
  return 0.45;
}

/**
 * Mascotte StandTall — singe coach en survêt, lime sur noir.
 * Sur l'accueil : sa posture se redresse à mesure que le score monte
 * (il « reprend sa taille » — il ne grandit pas).
 */
export function Mascot({ state, score, size = 96 }: MascotProps) {
  const resolved: MascotState =
    state ?? (slouchFor(undefined, score) > 0.55 ? 'slouched' : slouchFor(undefined, score) > 0.3 ? 'neutral' : 'upright');

  const asset = ASSETS[resolved];
  if (asset) {
    return <Image source={asset} style={{ width: size, height: size }} contentFit="contain" />;
  }

  const slouch = slouchFor(state, score);
  const celebrate = state === 'celebrate';
  const encourage = state === 'encourage';

  // Géométrie 100×100 : tête qui avance/descend et dos qui se courbe
  // proportionnellement au slouch.
  const headX = 50 + slouch * 14;
  const headY = 26 + slouch * 9;
  const backCurve = 12 + slouch * 16;
  const hipX = 46;
  const armLift = celebrate ? -26 : encourage ? -10 : 6 + slouch * 6;

  return (
    <View style={{ width: size, height: size }} accessibilityLabel={`Mascotte (${resolved})`}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        {/* Dos / corps (survêt) : courbe hanche → épaules. */}
        <Path
          d={`M ${hipX} 88 C ${hipX - 4} ${88 - backCurve} ${headX - 14} ${headY + 26} ${headX - 6} ${headY + 16}`}
          stroke={color.surfaceAlt}
          strokeWidth={17}
          strokeLinecap="round"
          fill="none"
        />
        {/* Zip du survêt. */}
        <Path
          d={`M ${hipX + 2} 84 C ${hipX - 1} ${86 - backCurve} ${headX - 11} ${headY + 27} ${headX - 5} ${headY + 19}`}
          stroke={color.accent}
          strokeWidth={1.6}
          fill="none"
        />
        {/* Bras. */}
        <Line
          x1={headX - 8}
          y1={headY + 20}
          x2={headX + 12}
          y2={headY + 20 + armLift}
          stroke={color.surfaceAlt}
          strokeWidth={8}
          strokeLinecap="round"
        />
        {celebrate ? (
          <Line
            x1={headX - 10}
            y1={headY + 20}
            x2={headX - 24}
            y2={headY - 6}
            stroke={color.surfaceAlt}
            strokeWidth={8}
            strokeLinecap="round"
          />
        ) : null}
        {/* Jambes. */}
        <Line x1={hipX - 2} y1={86} x2={hipX - 6} y2={97} stroke={color.surfaceAlt} strokeWidth={8} strokeLinecap="round" />
        <Line x1={hipX + 6} y1={86} x2={hipX + 10} y2={97} stroke={color.surfaceAlt} strokeWidth={8} strokeLinecap="round" />
        {/* Oreilles. */}
        <Circle cx={headX - 11} cy={headY - 2} r={4.5} fill={color.surfaceAlt} />
        <Circle cx={headX + 11} cy={headY - 2} r={4.5} fill={color.surfaceAlt} />
        {/* Tête. */}
        <Circle cx={headX} cy={headY} r={11.5} fill={color.surfaceAlt} />
        {/* Museau. */}
        <Circle cx={headX} cy={headY + 4} r={6} fill={color.bg} opacity={0.55} />
        {/* Yeux. */}
        <Circle cx={headX - 4} cy={headY - 2.5} r={1.6} fill={color.accent} />
        <Circle cx={headX + 4} cy={headY - 2.5} r={1.6} fill={color.accent} />
        {/* Sifflet de coach (cordon + sifflet accent). */}
        <Line
          x1={headX - 4}
          y1={headY + 12}
          x2={headX - 9}
          y2={headY + 21}
          stroke={color.textMuted}
          strokeWidth={1}
        />
        <Circle cx={headX - 10} cy={headY + 23} r={3} fill={color.accent} />
        {/* Logo ST à l'épaule. */}
        <SvgText
          x={headX + 3}
          y={headY + 24}
          fontSize={6}
          fontWeight="bold"
          fill={color.accent}
        >
          ST
        </SvgText>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({});
