import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OnboardingProgress } from '@/components/OnboardingProgress';
import { TOTAL_ONBOARDING_STEPS } from '@/lib/store';
import { colors, fontWeight, spacing } from '@/lib/theme';

/** Étape 2/14 — placeholder, à construire après validation de l'étape 1. */
export default function Step2Screen() {
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <OnboardingProgress step={2} total={TOTAL_ONBOARDING_STEPS} />
      <Text style={styles.title}>Écran 2</Text>
      <Text style={styles.hint}>
        Prochain écran du quiz — sera construit après validation de l'étape 1.
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: 26,
    lineHeight: 34,
    fontWeight: fontWeight.medium,
    marginTop: spacing.xxl,
  },
  hint: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: fontWeight.regular,
    marginTop: spacing.md,
  },
});
