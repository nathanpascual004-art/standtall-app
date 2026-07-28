import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { colors, fontWeight } from '@/lib/theme';

type ScoreGaugeProps = {
  /** Score entre 0 et 100. */
  value: number;
  label?: string;
  size?: number;
  /** Suffixe affiché après la valeur (ex. « % »). */
  suffix?: string;
};

const STROKE = 10;

function polarPoint(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) };
}

/** Arc de demi-cercle de 180° (gauche) vers `endAngle`, sens horaire. */
function arcPath(cx: number, cy: number, r: number, endAngle: number) {
  const start = polarPoint(cx, cy, r, 180);
  const end = polarPoint(cx, cy, r, endAngle);
  return `M ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${end.x} ${end.y}`;
}

/** Jauge semi-circulaire du score de posture (0–100). */
export function ScoreGauge({ value, label, size = 180, suffix = '' }: ScoreGaugeProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const r = (size - STROKE) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const height = size / 2 + STROKE / 2;
  const endAngle = 180 - (clamped / 100) * 180;
  // Tailles de texte proportionnelles (mêmes valeurs qu'avant en size 180).
  const valueSize = Math.round(size * 0.18);
  const labelSize = Math.max(10, Math.round(size * 0.061));

  return (
    <View style={{ width: size, height }}>
      <Svg width={size} height={height} viewBox={`0 0 ${size} ${height}`}>
        <Path
          d={arcPath(cx, cy, r, 0)}
          stroke={colors.border}
          strokeWidth={STROKE}
          strokeLinecap="round"
          fill="none"
        />
        {clamped > 0 && (
          <Path
            d={arcPath(cx, cy, r, endAngle)}
            stroke={colors.accent}
            strokeWidth={STROKE}
            strokeLinecap="round"
            fill="none"
          />
        )}
      </Svg>
      <View style={styles.center}>
        <Text style={[styles.value, { fontSize: valueSize }]}>
          {Math.round(clamped)}
          {suffix}
        </Text>
        {label ? (
          <Text style={[styles.label, { fontSize: labelSize }]}>{label}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  value: {
    color: colors.text,
    fontWeight: fontWeight.medium,
  },
  label: {
    color: colors.textMuted,
    fontWeight: fontWeight.regular,
  },
});
