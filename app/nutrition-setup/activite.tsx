import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, ReduceMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OnboardingProgress } from '@/components/OnboardingProgress';
import { PrimaryButton } from '@/components/PrimaryButton';
import { QuizOption } from '@/components/QuizOption';
import type { ActivityLevel } from '@/lib/nutrition';
import { useOnboardingStore } from '@/lib/store';
import { color, duration, space, type } from '@/theme/tokens';

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

      {/* Une seule animation par écran : apparition douce du bloc d'options. */}
      <Animated.View
        style={styles.options}
        entering={FadeInDown.duration(duration.base).reduceMotion(ReduceMotion.System)}
      >
        {LEVELS.map((level) => (
          <QuizOption
            key={level.value}
            label={level.label}
            selected={selected === level.value}
            onPress={() => setSelected(level.value)}
          />
        ))}
      </Animated.View>

      <View style={styles.footer}>
        <PrimaryButton label="Continuer" disabled={!selected} onPress={handleContinue} />
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
  options: {
    marginTop: space.xxl,
    gap: space.md,
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: space.sm,
  },
});
