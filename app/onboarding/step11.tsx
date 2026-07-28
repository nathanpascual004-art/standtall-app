import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OnboardingProgress } from '@/components/OnboardingProgress';
import { PrimaryButton } from '@/components/PrimaryButton';
import { TOTAL_ONBOARDING_STEPS } from '@/lib/store';
import { colors, fontWeight, radius, spacing } from '@/lib/theme';

/** Étape 11/14 — écran insight (pas de question). */
export default function InsightScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <OnboardingProgress step={11} total={TOTAL_ONBOARDING_STEPS} />

      <View style={styles.body}>
        <View style={styles.iconBadge}>
          <Ionicons name="body-outline" size={28} color={colors.accentLight} />
        </View>
        <Text style={styles.insight}>
          Rester assis 8h+ par jour tasse la colonne et enroule les épaules.
        </Text>
        <Text style={styles.consequence}>
          Résultat : plusieurs centimètres de stature perdus au quotidien.
        </Text>
      </View>

      <View style={styles.footer}>
        <PrimaryButton label="Continuer" onPress={() => router.push('/onboarding/step12')} />
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
  body: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: radius.card,
    backgroundColor: colors.cardActive,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  insight: {
    color: colors.text,
    fontSize: 24,
    lineHeight: 33,
    fontWeight: fontWeight.medium,
  },
  consequence: {
    color: colors.accentLight,
    fontSize: 17,
    lineHeight: 25,
    fontWeight: fontWeight.regular,
  },
  footer: {
    paddingBottom: spacing.sm,
  },
});
