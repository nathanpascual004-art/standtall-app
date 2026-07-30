import { StyleSheet, View, type ViewStyle } from 'react-native';

import { color } from '@/theme/tokens';

type ProgressBarProps = {
  /** Progression entre 0 et 1. */
  progress: number;
  height?: number;
  style?: ViewStyle;
};

/** Barre de progression : rail `railOff`, remplissage `accent`. */
export function ProgressBar({ progress, height = 6, style }: ProgressBarProps) {
  const clamped = Math.min(1, Math.max(0, progress));

  return (
    <View style={[styles.track, { height, borderRadius: height / 2 }, style]}>
      <View
        style={[
          styles.fill,
          { width: `${clamped * 100}%`, borderRadius: height / 2 },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: color.railOff,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: color.accent,
  },
});
