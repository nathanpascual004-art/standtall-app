import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/Card';
import { OnboardingProgress } from '@/components/OnboardingProgress';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScoreGauge } from '@/components/ScoreGauge';
import { StatCard } from '@/components/StatCard';
import { computePostureResult } from '@/lib/posture';
import { TOTAL_ONBOARDING_STEPS, useOnboardingStore } from '@/lib/store';
import { colors, fonts, spacing } from '@/lib/theme';

/**
 * Étape 14/14 — résultat / reveal verrouillé.
 * Gratuit (preuve de réel) : score + level + percentile.
 * Verrouillé : stature redressée exacte, cm récupérables, programme.
 *
 * IMPORTANT : les valeurs verrouillées ne sont JAMAIS rendues — on affiche
 * des masques (« •••,• cm »). Un flou seul reste lisible sur grand écran.
 * Chaque bloc verrouillé est tappable et mène au paywall.
 */
export default function ResultScreen() {
  const router = useRouter();
  const answers = useOnboardingStore((state) => state.answers);
  const result = computePostureResult(answers);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <OnboardingProgress step={14} total={TOTAL_ONBOARDING_STEPS} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.kicker}>Ton analyse est prête</Text>
          <Text style={styles.headline}>Voici ta vraie stature</Text>
        </View>

        <View style={styles.statRow}>
          <StatCard
            label="Stature avachi"
            value={`${answers.heightCm ?? '—'} cm`}
            style={styles.statCard}
          />
          <Pressable
            onPress={() => router.push('/paywall')}
            accessibilityRole="button"
            accessibilityLabel="Débloquer la stature redressée"
            style={({ pressed }) => [styles.statCard, pressed && styles.pressed]}
          >
            <StatCard label="Bien redressé" value="•••,• cm" locked style={styles.fill} />
          </Pressable>
        </View>

        <Card style={styles.gaugeCard}>
          <ScoreGauge
            value={result.postureScore}
            label={`Score posture — ${result.level}`}
          />
          <Text style={styles.percentile}>
            Meilleure posture que{' '}
            <Text style={styles.percentileValue}>{result.postureScore}%</Text> des
            gens de ton âge
          </Text>
        </Card>

        <Pressable
          onPress={() => router.push('/paywall')}
          accessibilityRole="button"
          accessibilityLabel="Débloquer les centimètres récupérables"
          style={({ pressed }) => (pressed ? styles.pressed : null)}
        >
          <Card style={styles.teaserCard}>
            <View style={styles.teaserRow}>
              <Text style={styles.teaserText}>
                Tu récupères <Text style={styles.blurredInline}>•,• cm</Text> en
                te redressant
              </Text>
              <Ionicons name="lock-closed" size={16} color={colors.textMuted} />
            </View>
          </Card>
        </Pressable>

        <Pressable
          onPress={() => router.push('/paywall')}
          accessibilityRole="button"
          accessibilityLabel="Débloquer le programme personnalisé"
          style={({ pressed }) => (pressed ? styles.pressed : null)}
        >
          <Card style={styles.teaserCard}>
            <View style={styles.teaserRow}>
              <Text style={styles.teaserTitle}>
                Ton programme d'étirements personnalisé
              </Text>
              <Ionicons name="lock-closed" size={16} color={colors.textMuted} />
            </View>
            <View style={styles.programLines}>
              <Text style={styles.blurredLine}>•••••••••••• ••••••• — • min</Text>
              <Text style={styles.blurredLine}>••••••••• •••••••• — • min</Text>
              <Text style={styles.blurredLine}>•••••••••• ••••• — • min</Text>
            </View>
          </Card>
        </Pressable>

        <View style={styles.benefit}>
          <View style={styles.benefitIcon}>
            <Ionicons name="lock-open-outline" size={18} color={colors.accentLight} />
          </View>
          <Text style={styles.benefitText}>
            Débloque ta stature redressée + ton programme perso
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          label="Débloquer mon résultat"
          onPress={() => router.push('/paywall')}
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
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginTop: spacing.xl,
    gap: spacing.xs,
  },
  kicker: {
    color: colors.textMuted,
    fontSize: 13,
    fontFamily: fonts.body,
  },
  headline: {
    color: colors.text,
    fontSize: 19,
    fontFamily: fonts.display,
  },
  statRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
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
    alignItems: 'center',
    paddingVertical: spacing.lg,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  percentile: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    fontFamily: fonts.body,
    textAlign: 'center',
  },
  percentileValue: {
    color: colors.accentLight,
    fontFamily: fonts.medium,
  },
  teaserCard: {
    marginTop: spacing.md,
    padding: spacing.lg,
  },
  teaserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  teaserText: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
    fontFamily: fonts.body,
  },
  teaserTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
    fontFamily: fonts.medium,
  },
  programLines: {
    marginTop: spacing.sm,
    gap: 6,
  },
  // Flou « réel » sans dépendance : texte transparent + ombre rayon 7.
  blurredInline: {
    color: 'transparent',
    fontFamily: fonts.medium,
    textShadowColor: 'rgba(238, 242, 247, 0.9)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 7,
  },
  blurredLine: {
    color: 'transparent',
    fontSize: 13,
    fontFamily: fonts.body,
    textShadowColor: 'rgba(125, 135, 148, 0.9)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 7,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  benefitIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.cardActive,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
    lineHeight: 19,
    fontFamily: fonts.body,
  },
  footer: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
});
