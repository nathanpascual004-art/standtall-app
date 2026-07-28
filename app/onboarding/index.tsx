import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OnboardingProgress } from '@/components/OnboardingProgress';
import { PrimaryButton } from '@/components/PrimaryButton';
import { QuizOption } from '@/components/QuizOption';
import { TOTAL_ONBOARDING_STEPS, useOnboardingStore, type Goal } from '@/lib/store';
import { colors, fontWeight, spacing } from '@/lib/theme';

const GOALS: { value: Goal; label: string }[] = [
  { value: 'taller', label: 'Paraître plus grand' },
  { value: 'posture', label: 'Corriger ma posture' },
  { value: 'back-pain', label: 'Moins de douleurs de dos' },
  { value: 'presence', label: 'Plus de présence' },
];

/** Étape 1/14 — objectif principal. */
export default function GoalScreen() {
  const router = useRouter();
  const storedGoal = useOnboardingStore((state) => state.answers.goal);
  const setAnswer = useOnboardingStore((state) => state.setAnswer);
  const [selected, setSelected] = useState<Goal | undefined>(storedGoal);

  const handleContinue = () => {
    if (!selected) return;
    setAnswer('goal', selected);
    router.push('/onboarding/step2');
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <OnboardingProgress step={1} total={TOTAL_ONBOARDING_STEPS} />

      <Text style={styles.title}>Quel est ton objectif ?</Text>

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
        <PrimaryButton
          label="Continuer"
          disabled={!selected}
          onPress={handleContinue}
        />
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
