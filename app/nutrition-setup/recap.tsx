import { Redirect, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, ReduceMotion } from 'react-native-reanimated';
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
import {
  borderWidth,
  color,
  duration,
  space,
  staggerDelay,
  type,
} from '@/theme/tokens';

/** Apparition en cascade des cartes (sobre, respecte reduce motion). */
const cascade = (index: number) =>
  FadeInDown.delay(index * staggerDelay)
    .duration(duration.base)
    .reduceMotion(ReduceMotion.System);

/** Setup nutrition 4/4 — récap des cibles calculées. */
export default function NutritionRecapScreen() {
  const router = useRouter();
  const { t } = useTranslation();
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
      <Text style={styles.title}>{t('nutrition.setupRecapTitle')}</Text>

      <Animated.View entering={cascade(0)}>
        <StatCard
          label={t('nutrition.setupCaloriesPerDay')}
          value={`${targets.calories} kcal`}
          style={styles.caloriesCard}
        />
      </Animated.View>

      <Animated.View entering={cascade(1)} style={styles.macroRow}>
        <StatCard
          label={t('nutrition.protein')}
          value={`${targets.proteinesG} g`}
          style={styles.flex}
        />
        <StatCard
          label={t('nutrition.carbs')}
          value={`${targets.glucidesG} g`}
          style={styles.flex}
        />
        <StatCard
          label={t('nutrition.fats')}
          value={`${targets.lipidesG} g`}
          style={styles.flex}
        />
      </Animated.View>

      <Text style={styles.note}>{t('nutrition.setupEstimateNote')}</Text>

      <View style={styles.footer}>
        <PrimaryButton label={t('nutrition.setupStartCta')} onPress={handleStart} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: color.bg,
    paddingHorizontal: space.screen,
    paddingTop: space.md,
  },
  title: {
    ...type.question,
    marginTop: space.xxl,
  },
  caloriesCard: {
    marginTop: space.xxl,
    borderWidth: borderWidth.hairline,
    borderColor: color.accent,
  },
  macroRow: {
    flexDirection: 'row',
    gap: space.md,
    marginTop: space.md,
  },
  flex: {
    flex: 1,
  },
  note: {
    ...type.meta,
    marginTop: space.lg,
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: space.sm,
  },
});
