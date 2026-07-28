import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OnboardingProgress } from '@/components/OnboardingProgress';
import { PrimaryButton } from '@/components/PrimaryButton';
import { QuizOption } from '@/components/QuizOption';
import type { ActivityLevel } from '@/lib/nutrition';
import { useOnboardingStore } from '@/lib/store';
import { colors, fontWeight, spacing } from '@/lib/theme';

const LEVELS: { value: ActivityLevel; label: string }[] = [
  { value: 'sedentaire', label: 'Sédentaire — peu ou pas de sport' },
  { value: 'leger', label: 'Léger — 1 à 2 séances / semaine' },
  { value: 'modere', label: 'Modéré — 3 à 4 séances / semaine' },
  { value: 'tres-actif', label: 'Très actif — 5+ séances / semaine' },
];

/** Setup nutrition 3/4 — niveau d'activité. */
export default function ActivityScreen() {
  const router = useRouter();
  const draft = useOnboardingStore((state) => state.nutritionDraft);
  const answers = useOnboardingStore((state) => state.answers);
  const setNutritionDraft = useOnboardingStore((state) => state.setNutritionDraft);
  const [selected, setSelected] = useState<ActivityLevel | undefined>(draft.activite);

  const handleContinue = () => {
    if (!selected) return;
    setNutritionDraft({ activite: selected });
    // Taille / âge / sexe viennent du quiz s'ils existent, sinon on les demande.
    const missing = !answers.heightCm || !answers.ageRange || !answers.gender;
    router.push(missing ? '/nutrition-setup/complement' : '/nutrition-setup/recap');
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <OnboardingProgress step={3} total={4} />
      <Text style={styles.title}>Ton niveau d'activité ?</Text>

      <View style={styles.options}>
        {LEVELS.map((level) => (
          <QuizOption
            key={level.value}
            label={level.label}
            selected={selected === level.value}
            onPress={() => setSelected(level.value)}
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
