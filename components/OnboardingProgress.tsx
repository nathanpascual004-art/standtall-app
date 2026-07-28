import { StyleSheet, Text, View } from 'react-native';

import { colors, fontWeight } from '@/lib/theme';
import { ProgressBar } from './ProgressBar';

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
    gap: 12,
  },
  bar: {
    flex: 1,
  },
  label: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: fontWeight.regular,
    fontVariant: ['tabular-nums'],
  },
});
