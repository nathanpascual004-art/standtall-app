import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/Card';
import { PrimaryButton } from '@/components/PrimaryButton';
import { StatCard } from '@/components/StatCard';
import { Toise } from '@/components/Toise';
import { hasNutrition, hasPosture } from '@/lib/onboarding-flow';
import { computePostureResult } from '@/lib/posture';
import { useOnboardingStore } from '@/lib/store';
import { color, font, radius, space, type } from '@/theme/tokens';

/**
 * Écran 9 — résultat / reveal verrouillé, adapté à l'intention.
 * Gratuit (preuve de réel) : score + level + percentile.
 * Verrouillé : stature redressée exacte, cm récupérables, programme,
 * et (si intention nutrition) l'objectif calorique + macros.
 *
 * IMPORTANT : les valeurs verrouillées ne sont JAMAIS rendues — on affiche
 * des masques (« •••,• cm »). Un flou seul reste lisible sur grand écran.
 * Chaque bloc verrouillé est tappable et mène au paywall.
 */
export default function ResultScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const answers = useOnboardingStore((state) => state.answers);
  const result = computePostureResult(answers);
  const posture = hasPosture(answers.intention);
  const nutrition = hasNutrition(answers.intention);

  const levelLabel =
    result.level === 'bonne'
      ? t('onboarding.postureLevelGood')
      : result.level === 'moyenne'
        ? t('onboarding.postureLevelMedium')
        : t('onboarding.postureLevelFix');

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.kicker}>
            {posture ? t('onboarding.resultKickerPosture') : t('onboarding.resultKicker')}
          </Text>
          <Text style={styles.headline}>
            {posture
              ? t('onboarding.resultHeadlinePosture')
              : t('onboarding.resultHeadlineNutrition')}
          </Text>
        </View>

        {posture ? (
          <>
            <View style={styles.statRow}>
              <StatCard
                label={t('onboarding.resultSlouchedLabel')}
                value={`${answers.heightCm ?? '—'} cm`}
                style={styles.statCard}
              />
              <Pressable
                onPress={() => router.push('/paywall')}
                accessibilityRole="button"
                accessibilityLabel={t('onboarding.resultUnlockUprightA11y')}
                style={({ pressed }) => [styles.statCard, pressed && styles.pressed]}
              >
                <StatCard
                  label={t('onboarding.resultUprightLabel')}
                  value={t('onboarding.resultMaskedCm')}
                  locked
                  style={styles.fill}
                />
              </Pressable>
            </View>

            <Card style={styles.gaugeCard}>
              <Toise
                score={result.postureScore}
                label={t('onboarding.resultPostureScoreLabel')}
                subtext={t('onboarding.resultPostureLevel', { level: levelLabel })}
              />
              <Text style={styles.percentile}>
                {t('onboarding.resultPercentileBefore')}
                <Text style={styles.percentileValue}>{result.postureScore}%</Text>
                {t('onboarding.resultPercentileAfter')}
              </Text>
            </Card>

            <Pressable
              onPress={() => router.push('/paywall')}
              accessibilityRole="button"
              accessibilityLabel={t('onboarding.resultUnlockCmA11y')}
              style={({ pressed }) => (pressed ? styles.pressed : null)}
            >
              <Card style={styles.teaserCard}>
                <View style={styles.teaserRow}>
                  <Text style={styles.teaserText}>
                    {t('onboarding.resultRegainBefore')}
                    <Text style={styles.blurredInline}>{t('onboarding.resultMaskedSmallCm')}</Text>
                    {t('onboarding.resultRegainAfter')}
                  </Text>
                  <Ionicons name="lock-closed" size={16} color={color.textSecond} />
                </View>
              </Card>
            </Pressable>

            <Pressable
              onPress={() => router.push('/paywall')}
              accessibilityRole="button"
              accessibilityLabel={t('onboarding.resultUnlockProgramA11y')}
              style={({ pressed }) => (pressed ? styles.pressed : null)}
            >
              <Card style={styles.teaserCard}>
                <View style={styles.teaserRow}>
                  <Text style={styles.teaserTitle}>{t('onboarding.resultProgramTitle')}</Text>
                  <Ionicons name="lock-closed" size={16} color={color.textSecond} />
                </View>
                <View style={styles.programLines}>
                  <Text style={styles.blurredLine}>•••••••••••• ••••••• — • min</Text>
                  <Text style={styles.blurredLine}>••••••••• •••••••• — • min</Text>
                  <Text style={styles.blurredLine}>•••••••••• ••••• — • min</Text>
                </View>
              </Card>
            </Pressable>
          </>
        ) : null}

        {nutrition ? (
          <Pressable
            onPress={() => router.push('/paywall')}
            accessibilityRole="button"
            accessibilityLabel={t('onboarding.resultUnlockNutritionA11y')}
            style={({ pressed }) => (pressed ? styles.pressed : null)}
          >
            <Card style={styles.teaserCard}>
              <View style={styles.teaserRow}>
                <Text style={styles.teaserTitle}>{t('onboarding.resultNutritionTitle')}</Text>
                <Ionicons name="lock-closed" size={16} color={color.textSecond} />
              </View>
              <View style={styles.programLines}>
                <Text style={styles.teaserText}>
                  {t('onboarding.resultNutritionGoalBefore')}
                  <Text style={styles.blurredInline}>{t('onboarding.resultMaskedKcal')}</Text>
                  {t('onboarding.resultNutritionGoalAfter')}
                </Text>
                <Text style={styles.blurredLine}>{t('onboarding.resultMaskedMacros')}</Text>
              </View>
            </Card>
          </Pressable>
        ) : null}

        <View style={styles.benefit}>
          <View style={styles.benefitIcon}>
            <Ionicons name="lock-open-outline" size={18} color={color.accent} />
          </View>
          <Text style={styles.benefitText}>
            {posture && nutrition
              ? t('onboarding.resultBenefitBoth')
              : posture
                ? t('onboarding.resultBenefitPosture')
                : t('onboarding.resultBenefitNutrition')}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          label={t('onboarding.resultUnlockCta')}
          onPress={() => router.push('/paywall')}
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
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: space.lg,
  },
  header: {
    alignItems: 'center',
    marginTop: space.xl,
    gap: space.xs,
  },
  kicker: {
    ...type.sectionLabel,
  },
  headline: {
    ...type.screenTitle,
  },
  statRow: {
    flexDirection: 'row',
    gap: space.md,
    marginTop: space.xl,
  },
  statCard: {
    flex: 1,
  },
  fill: {
    flex: 1,
  },
  pressed: {
    opacity: 0.85,
  },
  gaugeCard: {
    padding: space.lg,
    marginTop: space.md,
    gap: space.md,
  },
  percentile: {
    ...type.body,
  },
  percentileValue: {
    color: color.accent,
    fontFamily: font.medium,
  },
  teaserCard: {
    marginTop: space.md,
    padding: space.lg,
  },
  teaserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  teaserText: {
    flex: 1,
    ...type.bodyMedium,
  },
  teaserTitle: {
    flex: 1,
    ...type.cardTitle,
  },
  programLines: {
    marginTop: space.sm,
    gap: space.xs,
  },
  // Flou « réel » sans dépendance : texte transparent + ombre rayon 7
  // (même mécanique que le masque flouté de StatCard).
  blurredInline: {
    color: 'transparent',
    fontFamily: font.medium,
    textShadowColor: color.textSecond,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 7,
  },
  blurredLine: {
    ...type.body,
    color: 'transparent',
    textShadowColor: color.textMuted,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 7,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    marginTop: space.lg,
  },
  benefitIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: color.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    flex: 1,
    ...type.body,
    color: color.textPrimary,
  },
  footer: {
    paddingTop: space.sm,
    paddingBottom: space.sm,
  },
});
