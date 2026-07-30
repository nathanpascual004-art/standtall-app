import { StyleSheet, Text, View } from 'react-native';

import { ProgressBar } from '@/components/ProgressBar';
import { color, space, type } from '@/theme/tokens';

type OnboardingProgressProps = {
  /** Étape courante (1-indexée). */
  step: number;
  total: number;
};

/** Barre de progression d'onboarding affichée en haut d'écran. */
export function OnboardingProgress({ step, total }: OnboardingProgressProps) {
  return (
    <View style={styles.row}>
      <ProgressBar progress={step / total} height={4} style={styles.bar} />
      <Text style={styles.label}>
        {step}/{total}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  bar: {
    flex: 1,
  },
  label: {
    ...type.meta,
    fontSize: 11,
    color: color.textMuted,
    fontVariant: ['tabular-nums'],
  },
});
