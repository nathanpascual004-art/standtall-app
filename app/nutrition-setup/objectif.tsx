import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OnboardingProgress } from '@/components/OnboardingProgress';
import { PrimaryButton } from '@/components/PrimaryButton';
import { QuizOption } from '@/components/QuizOption';
import type { NutritionGoal } from '@/lib/nutrition';
import { useOnboardingStore } from '@/lib/store';
import { colors, fonts, spacing } from '@/lib/theme';

const GOALS: { value: NutritionGoal; label: string }[] = [
  { value: 'masse', label: 'Prise de masse' },
  { value: 'seche', label: 'Sèche' },
  { value: 'maintien', label: 'Maintien' },
];

/** Setup nutrition 2/4 — objectif. */
export default function NutritionGoalScreen() {
  const router = useRouter();
  const draft = useOnboardingStore((state) => state.nutritionDraft);
  const setNutritionDraft = useOnboardingStore((state) => state.setNutritionDraft);
  const [selected, setSelected] = useState<NutritionGoal | undefined>(draft.goal);

  const handleContinue = () => {
    if (!selected) return;
    setNutritionDraft({ goal: selected });
    router.push('/nutrition-setup/activite');
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <OnboardingProgress step={2} total={4} />
      <Text style={styles.title}>Ton objectif nutrition ?</Text>

      <View style={styles.options}>
        {GOALS.map((goal) => (
          <QuizOption
            key={goal.value}
            label={goal.label}
            selected={selected === goal.value}
            onPress={() => setSelected(goal.value)}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <PrimaryButton label="Continuer" disabled={!selected} onPress={handleContinue} />
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
    fontFamily: fonts.display,
    marginTop: spacing.xxl,
  },
  options: {
    marginTop: spacing.xxl,
    gap: 10,
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: spacing.sm,
  },
});
