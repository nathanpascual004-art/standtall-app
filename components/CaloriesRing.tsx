import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { color, type } from '@/theme/tokens';

const STROKE = 10;

/**
 * Anneau « calories restantes » : piste sombre, arc lime = part de
 * l'objectif déjà consommée, chiffre central = ce qu'il reste à manger
 * aujourd'hui (jamais négatif — un dépassement affiche 0 et le libellé
 * le dit sans culpabiliser).
 */
export function CaloriesRing({
  consumed,
  target,
  size = 148,
}: {
  consumed: number;
  target: number;
  size?: number;
}) {
  const radius = (size - STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = target > 0 ? Math.max(0, Math.min(1, consumed / target)) : 0;
  const remaining = Math.max(0, Math.round(target - consumed));
  const over = consumed > target;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color.railOff}
          strokeWidth={STROKE}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color.accent}
          strokeWidth={STROKE}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={circumference * (1 - ratio)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.center}>
        <Text style={styles.value}>{remaining}</Text>
        <Text style={styles.label}>{over ? 'objectif atteint' : 'kcal restantes'}</Text>
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
    justifyContent: 'center',
  },
  value: {
    ...type.statNumberSmall,
    fontVariant: ['tabular-nums'],
  },
  label: {
    ...type.meta,
    textAlign: 'center',
  },
});
