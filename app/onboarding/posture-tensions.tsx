import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, ReduceMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OnboardingProgress } from '@/components/OnboardingProgress';
import { PrimaryButton } from '@/components/PrimaryButton';
import { QuizOption } from '@/components/QuizOption';
import { questionCount, questionStep, routeAfterTensions } from '@/lib/onboarding-flow';
import { useOnboardingStore, type TensionZone } from '@/lib/store';
import { color, duration, space, type } from '@/theme/tokens';

const ZONES: { value: TensionZone; labelKey: string }[] = [
  { value: 'nuque', labelKey: 'onboarding.tensionNeck' },
  { value: 'haut-dos', labelKey: 'onboarding.tensionUpperBack' },
  { value: 'bas-dos', labelKey: 'onboarding.tensionLowerBack' },
];

/** Posture 4/6 — zones de tension (multi-choix, « aucune » exclusif). */
export default function TensionsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const intention = useOnboardingStore((state) => state.answers.intention);
  const stored = useOnboardingStore((state) => state.answers.tensions);
  const setAnswer = useOnboardingStore((state) => state.setAnswer);

  const [selected, setSelected] = useState<TensionZone[] | undefined>(stored);
  const none = selected !== undefined && selected.length === 0;

  const toggleZone = (zone: TensionZone) => {
    const current = selected ?? [];
    setSelected(
      current.includes(zone) ? current.filter((z) => z !== zone) : [...current, zone],
    );
  };

  const handleContinue = () => {
    if (selected === undefined) return;
    setAnswer('tensions', selected);
    router.push(routeAfterTensions(intention));
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <OnboardingProgress
        step={questionStep(intention, 'tensions')}
        total={questionCount(intention)}
      />

      <Text style={styles.title}>{t('onboarding.tensionsTitle')}</Text>
      <Text style={styles.subtitle}>{t('onboarding.tensionsSubtitle')}</Text>

      <Animated.View
        style={styles.options}
        entering={FadeInDown.duration(duration.base).reduceMotion(ReduceMotion.System)}
      >
        {ZONES.map((zone) => (
          <QuizOption
            key={zone.value}
            label={t(zone.labelKey)}
            selected={selected?.includes(zone.value) ?? false}
            onPress={() => toggleZone(zone.value)}
          />
        ))}
        <QuizOption
          label={t('onboarding.tensionNone')}
          selected={none}
          onPress={() => setSelected([])}
        />
      </Animated.View>

      <View style={styles.footer}>
        <PrimaryButton
          label={t('common.continue')}
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
