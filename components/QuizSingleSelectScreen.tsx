import { useRouter, type Href } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OnboardingProgress } from '@/components/OnboardingProgress';
import { PrimaryButton } from '@/components/PrimaryButton';
import { QuizOption } from '@/components/QuizOption';
import { TOTAL_ONBOARDING_STEPS, useOnboardingStore, type QuizAnswers } from '@/lib/store';
import { colors, fonts, spacing } from '@/lib/theme';

type AnswerKey = keyof QuizAnswers;

type Option<K extends AnswerKey> = {
  value: NonNullable<QuizAnswers[K]>;
  label: string;
  /** Illustration optionnelle, reçoit l'état sélectionné. */
  icon?: (selected: boolean) => ReactNode;
};

type QuizSingleSelectScreenProps<K extends AnswerKey> = {
  step: number;
  title: string;
  answerKey: K;
  options: Option<K>[];
  nextHref: Href;
};

/**
 * Écran générique du quiz : barre de progression, titre, options
 * single-select, bouton Continuer (désactivé sans sélection).
 * Stocke la réponse dans le store zustand puis navigue vers l'écran suivant.
 */
export function QuizSingleSelectScreen<K extends AnswerKey>({
  step,
  title,
  answerKey,
  options,
  nextHref,
}: QuizSingleSelectScreenProps<K>) {
  const router = useRouter();
  const stored = useOnboardingStore((state) => state.answers[answerKey]);
  const setAnswer = useOnboardingStore((state) => state.setAnswer);
  const [selected, setSelected] = useState<QuizAnswers[K] | undefined>(stored);

  const handleContinue = () => {
    if (selected === undefined) return;
    setAnswer(answerKey, selected);
    router.push(nextHref);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <OnboardingProgress step={step} total={TOTAL_ONBOARDING_STEPS} />

      <Text style={styles.title}>{title}</Text>

      <View style={styles.options}>
        {options.map((option) => {
          const isSelected = selected === option.value;
          return (
            <QuizOption
              key={String(option.value)}
              label={option.label}
              selected={isSelected}
              icon={option.icon?.(isSelected)}
              onPress={() => setSelected(option.value)}
            />
          );
        })}
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          label="Continuer"
          disabled={selected === undefined}
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
