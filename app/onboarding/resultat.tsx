import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/Card';
import { OnboardingProgress } from '@/components/OnboardingProgress';
import { ScoreGauge } from '@/components/ScoreGauge';
import { computePostureResult } from '@/lib/posture';
import { TOTAL_ONBOARDING_STEPS, useOnboardingStore } from '@/lib/store';
import { colors, fontWeight, spacing } from '@/lib/theme';

/**
 * Étape 14/14 — écran résultat (placeholder).
 * Sera remplacé par le reveal verrouillé (score + stature récupérable + paywall).
 */
export default function ResultScreen() {
  const answers = useOnboardingStore((state) => state.answers);
  const { postureScore } = computePostureResult(answers);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <OnboardingProgress step={14} total={TOTAL_ONBOARDING_STEPS} />

      <Text style={styles.title}>Ton résultat</Text>

      <Card style={styles.gaugeCard}>
        <ScoreGauge value={postureScore} label="Score de posture" />
      </Card>

      <View style={styles.footer}>
        <Text style={styles.hint}>
          Placeholder — le reveal verrouillé (stature récupérable, programme,
          paywall) sera construit ici.
        </Text>
      </View>
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
  gaugeCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginTop: spacing.xxl,
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: spacing.sm,
  },
  hint: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: fontWeight.regular,
  },
});
