import { Redirect, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OnboardingProgress } from '@/components/OnboardingProgress';
import { PrimaryButton } from '@/components/PrimaryButton';
import { StatCard } from '@/components/StatCard';
import {
  ageFromRange,
  computeTargets,
  type NutritionProfile,
} from '@/lib/nutrition';
import { useOnboardingStore } from '@/lib/store';
import { colors, fontWeight, spacing } from '@/lib/theme';

/** Setup nutrition 4/4 — récap des cibles calculées. */
export default function NutritionRecapScreen() {
  const router = useRouter();
  const answers = useOnboardingStore((state) => state.answers);
  const draft = useOnboardingStore((state) => state.nutritionDraft);
  const setNutritionProfile = useOnboardingStore((state) => state.setNutritionProfile);

  const tailleCm = draft.tailleCm ?? answers.heightCm;
  const age = draft.age ?? (answers.ageRange ? ageFromRange(answers.ageRange) : undefined);
  const sexe = draft.sexe ?? answers.gender;

  if (!draft.poidsKg || !draft.goal || !draft.activite || !tailleCm || !age || !sexe) {
    return <Redirect href="/nutrition-setup" />;
  }

  const profile: NutritionProfile = {
    poidsKg: draft.poidsKg,
    tailleCm,
    age,
    sexe,
    activite: draft.activite,
    goal: draft.goal,
  };
  const targets = computeTargets(profile);

  const handleStart = () => {
    setNutritionProfile(profile, targets);
    // dismissTo : referme le setup et revient sur l'onglet Nutrition déjà
    // présent dans la pile (évite d'empiler une 2e instance des tabs).
    router.dismissTo('/(tabs)/nutrition');
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <OnboardingProgress step={4} total={4} />
      <Text style={styles.title}>Tes objectifs nutrition</Text>

      <StatCard
        label="Calories / jour"
        value={`${targets.calories} kcal`}
        style={styles.caloriesCard}
      />

      <View style={styles.macroRow}>
        <StatCard label="Protéines" value={`${targets.proteinesG} g`} style={styles.flex} />
        <StatCard label="Glucides" value={`${targets.glucidesG} g`} style={styles.flex} />
        <StatCard label="Lipides" value={`${targets.lipidesG} g`} style={styles.flex} />
      </View>

      <Text style={styles.note}>Estimation, à ajuster selon les résultats réels.</Text>

      <View style={styles.footer}>
        <PrimaryButton label="C'est parti" onPress={handleStart} />
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
  caloriesCard: {
    marginTop: spacing.xxl,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  macroRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  flex: {
    flex: 1,
  },
  note: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: fontWeight.regular,
    marginTop: spacing.lg,
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: spacing.sm,
  },
});
