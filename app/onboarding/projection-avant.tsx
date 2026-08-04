import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, ReduceMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/PrimaryButton';
import { ProjectionStage } from '@/components/ProjectionStage';
import { computePostureResult } from '@/lib/posture';
import { useOnboardingStore } from '@/lib/store';
import { color, duration, space, type } from '@/theme/tokens';

/** Écran 6 — ton personnage aujourd'hui, à SA taille, contre la toise. */
export default function ProjectionAvantScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const answers = useOnboardingStore((state) => state.answers);
  const result = computePostureResult(answers);
  const heightCm = answers.heightCm ?? 175;

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.body}>
        <Animated.Text
          entering={FadeInDown.duration(duration.base).reduceMotion(ReduceMotion.System)}
          style={styles.value}
        >
          {heightCm} cm
        </Animated.Text>

        <ProjectionStage
          heightCm={heightCm}
          fullHeightCm={result.correctedHeightCm}
          postureScore={result.postureScore}
          ratio={0}
        />

        <Text style={styles.copy}>{t('onboarding.projectionBeforeTitle')}</Text>
        <Text style={styles.sub}>{t('onboarding.projectionBeforeSub')}</Text>
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          label={t('onboarding.projectionCta')}
          onPress={() => router.push('/onboarding/projection')}
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
  body: {
    flex: 1,
    justifyContent: 'center',
    gap: space.lg,
  },
  value: {
    ...type.statNumber,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  copy: {
    ...type.question,
    textAlign: 'center',
    textTransform: 'none',
    letterSpacing: 0,
  },
  sub: {
    ...type.body,
    textAlign: 'center',
  },
  footer: {
    paddingBottom: space.sm,
  },
});
