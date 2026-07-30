import { StyleSheet, View, type ViewStyle } from 'react-native';

import { color, radius, space } from '@/theme/tokens';

type SegmentRailProps = {
  /** Nombre total de segments (ex. séances du programme). */
  total: number;
  /** Segments accomplis (accent). */
  done: number;
  height?: number;
  style?: ViewStyle;
};

/** Rail segmenté — progression discrète (segments faits en accent). */
export function SegmentRail({ total, done, height = 8, style }: SegmentRailProps) {
  const clamped = Math.min(total, Math.max(0, done));

  return (
    <View style={[styles.rail, style]}>
      {Array.from({ length: total }, (_, index) => (
        <View
          key={index}
          style={[
            styles.segment,
            { height },
            index < clamped ? styles.segmentDone : null,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  rail: {
    flexDirection: 'row',
    gap: space.sm - 2,
  },
  segment: {
    flex: 1,
    borderRadius: radius.segment,
    backgroundColor: color.railOff,
  },
  segmentDone: {
    backgroundColor: color.accent,
  },
});
