import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, ReduceMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/Card';
import { Mascot } from '@/components/Mascot';
import { PressableScale } from '@/components/PressableScale';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ProgressChart } from '@/components/ProgressChart';
import { SectionLabel } from '@/components/SectionLabel';
import { SegmentRail } from '@/components/SegmentRail';
import { StatCard } from '@/components/StatCard';
import { Toise } from '@/components/Toise';
import { waterRatio } from '@/lib/hydration';
import { computePostureResult } from '@/lib/posture';
import { SESSIONS } from '@/lib/program';
import { displayStreak, levelProgress } from '@/lib/progress';
import { todayKey, useOnboardingStore } from '@/lib/store';
import { borderWidth, color, duration, radius, space, staggerDelay, type } from '@/theme/tokens';

const formatCm = (value: number) => `${value.toFixed(1).replace('.', ',')} cm`;

const DAYS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const MONTHS = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
];

const formatToday = () => {
  const now = new Date();
  return `${DAYS[now.getDay()]} ${now.getDate()} ${MONTHS[now.getMonth()]}`;
};

/** Hauteurs de layout locales (pas des tokens de design). */
const TOISE_HEIGHT = 168;
const MASCOT_SIZE = 92;
const CHART_HEIGHT = 120;
const LEVEL_BAR_HEIGHT = 56;

/** Apparition en cascade des cartes principales (sobre, respecte reduce motion). */
const cascade = (index: number) =>
  FadeInDown.delay(index * staggerDelay)
    .duration(duration.base)
    .reduceMotion(ReduceMotion.System);

/** Onglet Stature — dashboard principal (après paywall). */
export default function StatureScreen() {
  const router = useRouter();
  const answers = useOnboardingStore((state) => state.answers);
  const completedSessions = useOnboardingStore((state) => state.completedSessions);
  const nutritionTargets = useOnboardingStore((state) => state.nutritionTargets);
  const water = useOnboardingStore((state) => state.water);
  const progress = useOnboardingStore((state) => state.progress);
  const result = computePostureResult(answers);

  // Gamification : streak affiché (jokers compris) + niveau/rang.
  const streak = displayStreak(progress, todayKey());
  const level = levelProgress(progress.xp);

  const doneToday = completedSessions[todayKey()] ?? [];
  const nextSession =
    SESSIONS.find((session) => !doneToday.includes(session.id)) ?? SESSIONS[0];

  // Progression réelle : point de départ = score actuel, puis un point par
  // séance complétée (toutes journées confondues), +1 pt plafonné à 100.
  const totalDone = Object.values(completedSessions).reduce(
    (sum, ids) => sum + ids.length,
    0,
  );
  const progressScores = Array.from({ length: totalDone + 1 }, (_, i) =>
    Math.min(100, result.postureScore + i),
  );

  // Score courant : dernier point de la progression (base quiz + 1 pt par
  // séance complétée, plafonné à 100). Le reveal garde le score initial.
  const currentScore = progressScores[progressScores.length - 1];

  // Sous-texte honnête de la toise : part de la pleine hauteur réellement tenue.
  const pct = answers.heightCm
    ? Math.round((answers.heightCm / result.correctedHeightCm) * 100)
    : undefined;
  const toiseSubtext =
    pct !== undefined ? `Tu te tiens à ${pct} % de ta pleine hauteur.` : undefined;

  // Hydratation du jour — pour la carte compacte « Nutrition du jour ».
  const hydrationPct = Math.round(waterRatio(water[todayKey()] ?? 0) * 100);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Salut 👋</Text>
            <Text style={styles.headerDate}>{formatToday()}</Text>
          </View>
          <PressableScale
            onPress={() => router.push('/(tabs)/profil')}
            accessibilityRole="button"
            accessibilityLabel="Réglages"
            hitSlop={8}
          >
            <Ionicons name="settings-outline" size={22} color={color.textMuted} />
          </PressableScale>
        </View>

        <Animated.View entering={cascade(0)}>
          <PressableScale
            onPress={() => router.push('/recompenses')}
            accessibilityRole="button"
            accessibilityLabel="Récompenses"
          >
            <Card style={styles.streakCard}>
              <View style={styles.streakBlock}>
                <View style={styles.streakRow}>
                  <Ionicons name="flame" size={26} color={streak > 0 ? color.accent : color.textMuted} />
                  <Text style={styles.streakValue}>{streak}</Text>
                </View>
                <Text style={styles.gamifLabel}>Streak</Text>
              </View>
              <View style={styles.levelBlock}>
                <Text style={styles.levelValue}>Niv. {level.level}</Text>
                <Text style={styles.rankLabel}>{level.rank}</Text>
                <Text style={styles.gamifLabel}>Niveau</Text>
              </View>
              {/* Barre verticale — raccord avec la signature « toise ». */}
              <View style={styles.levelBarBlock}>
                <View style={styles.levelBarRail}>
                  <View style={[styles.levelBarFill, { height: `${Math.round(level.ratio * 100)}%` }]} />
                </View>
                <Text style={styles.levelBarMeta}>
                  {level.current}/{level.needed} XP
                </Text>
              </View>
            </Card>
          </PressableScale>
        </Animated.View>

        <Animated.View entering={cascade(1)}>
          <Card style={styles.heroCard}>
            <View style={styles.heroToise}>
              <Toise
                score={currentScore}
                delta={currentScore - result.postureScore}
                label="Score de stature"
                subtext={toiseSubtext}
                height={TOISE_HEIGHT}
              />
            </View>
            <Mascot score={currentScore} size={MASCOT_SIZE} />
          </Card>
          <Text style={styles.percentile}>
            Meilleure posture que{' '}
            <Text style={styles.percentileValue}>{currentScore}%</Text> des gens
            de ton âge
          </Text>
        </Animated.View>

        <Animated.View entering={cascade(2)} style={styles.statRow}>
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
        </Animated.View>

        <Animated.View entering={cascade(3)}>
          <Card style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <Ionicons name="arrow-up-outline" size={16} color={color.accent} />
            </View>
            <Text style={styles.infoText}>
              Tu récupères{' '}
              <Text style={styles.infoValue}>{formatCm(result.heightLossCm)}</Text> en
              te redressant
            </Text>
          </Card>
        </Animated.View>

        <Animated.View entering={cascade(4)}>
          <Card style={styles.programCard}>
            <SectionLabel>Programme du jour</SectionLabel>
            <SegmentRail total={SESSIONS.length} done={doneToday.length} />
            <Text style={styles.programMeta}>
              {doneToday.length}/{SESSIONS.length} séances aujourd'hui
            </Text>
          </Card>
        </Animated.View>

        <Animated.View entering={cascade(5)}>
          <Card style={styles.sessionCard}>
            <SectionLabel>Prochaine séance</SectionLabel>
            <Text style={styles.sessionTitle}>
              {nextSession.titre} — {nextSession.durationMin} min
            </Text>
            <PrimaryButton
              label="Commencer"
              onPress={() => router.push(`/session/${nextSession.id}`)}
            />
          </Card>
        </Animated.View>

        <Animated.View entering={cascade(6)}>
          <Card style={styles.chartCard}>
            <SectionLabel>Progression posture</SectionLabel>
            {totalDone >= 2 ? (
              <ProgressChart data={progressScores} height={CHART_HEIGHT} />
            ) : (
              <View style={styles.chartEmpty}>
                <Text style={styles.chartEmptyText}>
                  Complète tes séances pour voir ta progression
                </Text>
              </View>
            )}
          </Card>
        </Animated.View>

        {/* Carte compacte — la nutrition fait partie de l'expérience sans
            surcharger l'accueil (le détail vit dans l'onglet Nutrition). */}
        <Animated.View entering={cascade(7)}>
          <PressableScale
            onPress={() =>
              nutritionTargets
                ? router.push('/(tabs)/nutrition')
                : router.push('/nutrition-setup')
            }
            accessibilityRole="button"
            accessibilityLabel="Nutrition du jour"
          >
            <Card style={styles.nutritionCompact}>
              <Ionicons name="nutrition-outline" size={18} color={color.accent} />
              <View style={styles.nutritionCompactText}>
                <Text style={styles.nutritionCompactTitle}>Nutrition du jour</Text>
                <Text style={styles.nutritionCompactMeta}>
                  {nutritionTargets
                    ? `Hydratation ${hydrationPct} % · 1 conseil dispo`
                    : 'Configure ton suivi carburant'}
                </Text>
              </View>
              <Text style={styles.nutritionCompactLink}>
                {nutritionTargets ? 'Voir mon suivi →' : 'Configurer →'}
              </Text>
            </Card>
          </PressableScale>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: color.bg,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: space.screen,
    paddingTop: space.md,
    paddingBottom: space.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
  },
  headerTitle: {
    ...type.cardTitle,
  },
  headerDate: {
    ...type.meta,
    marginTop: space.xs / 2,
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.lg,
    marginTop: space.lg,
    padding: space.lg,
  },
  streakBlock: {
    alignItems: 'flex-start',
    gap: space.xs,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
  },
  streakValue: {
    ...type.statNumberSmall,
    fontVariant: ['tabular-nums'],
  },
  gamifLabel: {
    ...type.sectionLabel,
  },
  levelBlock: {
    flex: 1,
    gap: space.xs / 2,
  },
  levelValue: {
    ...type.cardTitle,
  },
  rankLabel: {
    ...type.meta,
    color: color.accent,
  },
  levelBarBlock: {
    alignItems: 'center',
    gap: space.xs,
  },
  levelBarRail: {
    width: 8,
    height: LEVEL_BAR_HEIGHT,
    borderRadius: radius.pill,
    backgroundColor: color.railOff,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  levelBarFill: {
    width: '100%',
    borderRadius: radius.pill,
    backgroundColor: color.accent,
  },
  levelBarMeta: {
    ...type.meta,
    fontVariant: ['tabular-nums'],
  },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    marginTop: space.lg,
    padding: space.lg,
  },
  heroToise: {
    flex: 1,
  },
  percentile: {
    ...type.body,
    textAlign: 'center',
    marginTop: space.md,
  },
  percentileValue: {
    ...type.bodyMedium,
    color: color.accent,
  },
  statRow: {
    flexDirection: 'row',
    gap: space.md,
    marginTop: space.md,
  },
  statCard: {
    flex: 1,
  },
  statCardAccent: {
    borderWidth: borderWidth.hairline,
    borderColor: color.accent,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    marginTop: space.md,
    padding: space.lg,
  },
  infoIcon: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: color.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    ...type.body,
    flex: 1,
    color: color.textPrimary,
  },
  infoValue: {
    ...type.bodyMedium,
    color: color.accent,
  },
  programCard: {
    marginTop: space.md,
    padding: space.lg,
    gap: space.md,
  },
  programMeta: {
    ...type.meta,
    fontVariant: ['tabular-nums'],
  },
  sessionCard: {
    marginTop: space.md,
    padding: space.lg,
    gap: space.md,
  },
  sessionTitle: {
    ...type.cardTitle,
  },
  chartCard: {
    marginTop: space.md,
    padding: space.lg,
    gap: space.sm,
  },
  // État vide : même hauteur que la courbe pour un layout stable.
  chartEmpty: {
    height: CHART_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.lg,
  },
  chartEmptyText: {
    ...type.body,
    color: color.textMuted,
    textAlign: 'center',
  },
  nutritionCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    marginTop: space.md,
    padding: space.lg,
  },
  nutritionCompactText: {
    flex: 1,
    gap: space.xs / 2,
  },
  nutritionCompactTitle: {
    ...type.bodyMedium,
  },
  nutritionCompactMeta: {
    ...type.meta,
  },
  nutritionCompactLink: {
    ...type.meta,
    color: color.accent,
  },
});
