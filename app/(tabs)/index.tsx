import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/Card';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ProgressChart } from '@/components/ProgressChart';
import { ScoreGauge } from '@/components/ScoreGauge';
import { StatCard } from '@/components/StatCard';
import { computePostureResult } from '@/lib/posture';
import { SESSIONS } from '@/lib/program';
import { todayKey, useOnboardingStore } from '@/lib/store';
import { colors, fonts, radius, spacing } from '@/lib/theme';

const formatCm = (value: number) => `${value.toFixed(1).replace('.', ',')} cm`;

/** Onglet Stature — dashboard principal (après paywall). */
export default function StatureScreen() {
  const router = useRouter();
  const answers = useOnboardingStore((state) => state.answers);
  const completedSessions = useOnboardingStore((state) => state.completedSessions);
  const result = computePostureResult(answers);

  const doneToday = completedSessions[todayKey()] ?? [];
  const nextSession =
    SESSIONS.find((session) => !doneToday.includes(session.id)) ?? SESSIONS[0];

  // % du programme du jour réellement complété (séances faites aujourd'hui).
  const programCompletion = Math.round((doneToday.length / SESSIONS.length) * 100);

  // Progression réelle : point de départ = score actuel, puis un point par
  // séance complétée (toutes journées confondues), +1 pt plafonné à 100.
  const totalDone = Object.values(completedSessions).reduce(
    (sum, ids) => sum + ids.length,
    0,
  );
  const progressScores = Array.from({ length: totalDone + 1 }, (_, i) =>
    Math.min(100, result.postureScore + i),
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons name="body-outline" size={20} color={colors.accentLight} />
          </View>
          <Text style={styles.headerTitle}>Posture & Stature</Text>
          <Pressable
            onPress={() => router.push('/(tabs)/profil')}
            accessibilityRole="button"
            accessibilityLabel="Réglages"
            hitSlop={8}
            style={({ pressed }) => [pressed && { opacity: 0.7 }]}
          >
            <Ionicons name="settings-outline" size={22} color={colors.textMuted} />
          </Pressable>
        </View>

        <View style={styles.statRow}>
          <StatCard
            label="Stature avachi"
            value={`${answers.heightCm ?? '—'} cm`}
            style={styles.statCard}
          />
          <StatCard
            label="Bien redressé"
            value={formatCm(result.correctedHeightCm)}
            style={[styles.statCard, styles.statCardAccent]}
          />
        </View>

        <Card style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Ionicons name="arrow-up-outline" size={16} color={colors.accentLight} />
          </View>
          <Text style={styles.infoText}>
            Tu récupères{' '}
            <Text style={styles.infoValue}>{formatCm(result.heightLossCm)}</Text> en
            te redressant
          </Text>
        </Card>

        <Card style={styles.chartCard}>
          <Text style={styles.cardLabel}>Progression posture</Text>
          {totalDone >= 2 ? (
            <ProgressChart data={progressScores} />
          ) : (
            <View style={styles.chartEmpty}>
              <Text style={styles.chartEmptyText}>
                Complète tes séances pour voir ta progression
              </Text>
            </View>
          )}
        </Card>

        <Text style={styles.percentile}>
          Meilleure posture que{' '}
          <Text style={styles.percentileValue}>{result.postureScore}%</Text> des gens
          de ton âge
        </Text>

        <View style={styles.gaugeRow}>
          <Card style={styles.gaugeCard}>
            <ScoreGauge value={result.postureScore} label="Score posture" size={110} />
          </Card>
          <Card style={styles.gaugeCard}>
            <ScoreGauge
              value={programCompletion}
              label="Programme complété"
              size={110}
              suffix="%"
            />
          </Card>
        </View>

        <Card style={styles.sessionCard}>
          <Text style={styles.cardLabel}>Prochaine séance</Text>
          <Text style={styles.sessionTitle}>
            {nextSession.titre} — {nextSession.durationMin} min
          </Text>
          <PrimaryButton
            label="Commencer"
            onPress={() => router.push(`/session/${nextSession.id}`)}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.button,
    backgroundColor: colors.cardActive,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 20,
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
  statCardAccent: {
    borderWidth: 1,
    borderColor: colors.accent,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
    padding: spacing.lg,
  },
  infoIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.cardActive,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.body,
  },
  infoValue: {
    color: colors.accentLight,
    fontFamily: fonts.medium,
  },
  chartCard: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  // État vide : même hauteur que la courbe pour un layout stable.
  chartEmpty: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  chartEmptyText: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    fontFamily: fonts.body,
    textAlign: 'center',
  },
  cardLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontFamily: fonts.body,
  },
  percentile: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    fontFamily: fonts.body,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  percentileValue: {
    color: colors.accentLight,
    fontFamily: fonts.medium,
  },
  gaugeRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  gaugeCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  sessionCard: {
    marginTop: spacing.md,
    padding: spacing.lg,
    gap: spacing.md,
  },
  sessionTitle: {
    color: colors.text,
    fontSize: 15,
    fontFamily: fonts.medium,
  },
});
