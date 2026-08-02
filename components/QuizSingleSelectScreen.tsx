import { useRouter, type Href } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, ReduceMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OnboardingProgress } from '@/components/OnboardingProgress';
import { PrimaryButton } from '@/components/PrimaryButton';
import { QuizOption } from '@/components/QuizOption';
import { useOnboardingStore, type QuizAnswers } from '@/lib/store';
import { color, duration, space, type } from '@/theme/tokens';

type AnswerKey = keyof QuizAnswers;

type Option<K extends AnswerKey> = {
  value: NonNullable<QuizAnswers[K]>;
  label: string;
  /** Illustration optionnelle, reçoit l'état sélectionné. */
  icon?: (selected: boolean) => ReactNode;
};

type QuizSingleSelectScreenProps<K extends AnswerKey> = {
  step: number;
  /** Total de questions de la branche (dépend de l'intention). */
  total: number;
  title: string;
  /** Sous-titre optionnel sous le titre. */
  subtitle?: string;
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
  total,
  title,
  subtitle,
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
      <OnboardingProgress step={step} total={total} />

      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

      {/* Une seule animation par écran : apparition douce du bloc d'options. */}
      <Animated.View
        style={styles.options}
        entering={FadeInDown.duration(duration.base).reduceMotion(ReduceMotion.System)}
      >
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
      </Animated.View>

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
    backgroundColor: color.bg,
    paddingHorizontal: space.screen,
    paddingTop: space.md,
  },
  title: {
    ...type.question,
    marginTop: space.xxl,
  },
  subtitle: {
    ...type.body,
    marginTop: space.sm,
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
