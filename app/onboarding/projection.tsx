import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/PrimaryButton';
import { ProjectionStage } from '@/components/ProjectionStage';
import { formatDecimal, useAppLanguage, type AppLanguage } from '@/lib/i18n';
import { computePostureResult } from '@/lib/posture';
import { useOnboardingStore } from '@/lib/store';
import { color, space, type } from '@/theme/tokens';

const DELAY_MS = 500;
const GROW_MS = 1600;
const TICK_MS = 30;

const formatCm = (value: number, lang: AppLanguage) => `${formatDecimal(value, 1, lang)} cm`;
const easeOut = (t: number) => 1 - (1 - t) * (1 - t);

/**
 * Écran 7 — LA projection : le personnage se redresse et reprend les cm
 * que sa posture lui vole, la toise monte en même temps. Chiffres réels.
 */
export default function ProjectionScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const lang = useAppLanguage();
  const reducedMotion = useReducedMotion();
  const answers = useOnboardingStore((state) => state.answers);
  const result = computePostureResult(answers);
  const heightCm = answers.heightCm ?? 175;

  const [ratio, setRatio] = useState(reducedMotion ? 1 : 0);

  useEffect(() => {
    if (reducedMotion) return;
    const startedAt = Date.now() + DELAY_MS;
    const interval = setInterval(() => {
      const t = Math.max(0, Math.min(1, (Date.now() - startedAt) / GROW_MS));
      setRatio(easeOut(t));
      if (t >= 1) clearInterval(interval);
    }, TICK_MS);
    return () => clearInterval(interval);
  }, [reducedMotion]);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.body}>
        <Text style={styles.score}>{result.postureScore}</Text>
        <Text style={styles.scoreLabel}>{t('common.statureScore')}</Text>

        <ProjectionStage
          heightCm={heightCm}
          fullHeightCm={result.correctedHeightCm}
          postureScore={result.postureScore}
          ratio={ratio}
        />

        <Text style={styles.copy}>{t('onboarding.projectionTitle')}</Text>
        <Text style={styles.sub}>
          {t('onboarding.projectionSubBefore')}
          <Text style={styles.subStrong}>{formatCm(result.heightLossCm, lang)}</Text>
          {t('onboarding.projectionSubAfter')}
        </Text>
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          label={t('common.continue')}
          onPress={() => router.push('/onboarding/email')}
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
    gap: space.md,
  },
  score: {
    ...type.statNumber,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  scoreLabel: {
    ...type.sectionLabel,
    textAlign: 'center',
  },
  copy: {
    ...type.question,
    textAlign: 'center',
    textTransform: 'none',
    letterSpacing: 0,
    marginTop: space.sm,
  },
  sub: {
    ...type.body,
    textAlign: 'center',
  },
  subStrong: {
    ...type.bodyMedium,
    color: color.accent,
  },
  footer: {
    paddingBottom: space.sm,
  },
});
