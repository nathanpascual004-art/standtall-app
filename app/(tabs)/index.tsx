import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ScrollView } from 'react-native';
import Animated, { FadeInDown, ReduceMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Line } from 'react-native-svg';

import { Card } from '@/components/Card';
import { PressableScale } from '@/components/PressableScale';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ProgressBar } from '@/components/ProgressBar';
import { SectionLabel } from '@/components/SectionLabel';
import {
  buildJourney,
  daysDoneInLevel,
  DAYS_PER_LEVEL,
  JOURNEY_DAY_COUNT,
} from '@/lib/journey';
import { computePostureResult } from '@/lib/posture';
import { SESSIONS } from '@/lib/program';
import { displayStreak } from '@/lib/progress';
import { todayKey, useOnboardingStore } from '@/lib/store';
import { borderWidth, color, duration, font, radius, space, staggerDelay, type } from '@/theme/tokens';

const DAYS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const MONTHS = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
];

const formatToday = () => {
  const now = new Date();
  return `${DAYS[now.getDay()]} ${now.getDate()} ${MONTHS[now.getMonth()]}`;
};

const formatCm = (value: number) => `${value.toFixed(1).replace('.', ',')} cm`;

/** Dimensions de layout locales (pas des tokens de design). */
const RING_SIZE = 132;
const RING_STROKE = 9;
const GEAR_SIZE = 44;
const TILE_ICON_SIZE = 40;
const GHOST_ICON_SIZE = 128;

/** Apparition en cascade des blocs principaux (sobre, respecte reduce motion). */
const cascade = (index: number) =>
  FadeInDown.delay(index * staggerDelay)
    .duration(duration.base)
    .reduceMotion(ReduceMotion.System);

/**
 * Arc de score : anneau lime (part du score sur 100) autour d'une
 * silhouette placeholder (dos + colonne pointillée) — l'asset final
 * remplacera l'icône.
 */
function ScoreRing({ score }: { score: number }) {
  const radius = (RING_SIZE - RING_STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = Math.max(0, Math.min(1, score / 100));

  return (
    <View style={styles.ring}>
      <Svg width={RING_SIZE} height={RING_SIZE}>
        <Circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={radius}
          stroke={color.railOff}
          strokeWidth={RING_STROKE}
          fill={color.surfaceAlt}
        />
        <Circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={radius}
          stroke={color.accent}
          strokeWidth={RING_STROKE}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={circumference * (1 - ratio)}
          transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
        />
        {/* Colonne pointillée de la silhouette. */}
        <Line
          x1={RING_SIZE / 2}
          y1={RING_SIZE * 0.34}
          x2={RING_SIZE / 2}
          y2={RING_SIZE * 0.74}
          stroke={color.accent}
          strokeWidth={2}
          strokeDasharray="2 5"
          strokeLinecap="round"
        />
      </Svg>
      <View style={styles.ringBody} pointerEvents="none">
        <Ionicons name="body-outline" size={RING_SIZE * 0.5} color={color.tickOff} />
      </View>
    </View>
  );
}

/** Tuile stat (série / séances / objectif). */
function StatTile({
  icon,
  label,
  value,
  unit,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  unit?: string;
}) {
  return (
    <Card style={styles.tile}>
      <View style={styles.tileIcon}>
        <Ionicons name={icon} size={19} color={color.accent} />
      </View>
      <View style={styles.tileText}>
        <Text style={styles.tileLabel} numberOfLines={1}>
          {label}
        </Text>
        <Text style={styles.tileValue} numberOfLines={1}>
          {value}
          {unit ? <Text style={styles.tileUnit}> {unit}</Text> : null}
        </Text>
      </View>
    </Card>
  );
}

/** Accueil — alignement, stats, routine du jour (maquette de référence). */
export default function AccueilScreen() {
  const router = useRouter();
  const answers = useOnboardingStore((state) => state.answers);
  const completedSessions = useOnboardingStore((state) => state.completedSessions);
  const progress = useOnboardingStore((state) => state.progress);
  const journey = useOnboardingStore((state) => state.journey);
  const result = computePostureResult(answers);

  const doneToday = completedSessions[todayKey()] ?? [];
  const nextSession =
    SESSIONS.find((session) => !doneToday.includes(session.id)) ?? SESSIONS[0];

  // Score courant : base quiz + 1 pt par séance complétée, plafonné à 100.
  const totalDone = Object.values(completedSessions).reduce(
    (sum, ids) => sum + ids.length,
    0,
  );
  const currentScore = Math.min(100, result.postureScore + totalDone);

  const streak = displayStreak(progress, todayKey());
  const levels = buildJourney();
  const currentLevel =
    levels.find((l) => journey.day < l.level * DAYS_PER_LEVEL) ?? levels[levels.length - 1];
  // Barre du niveau : jours faits dans le niveau en cours (0-7).
  const levelRatio = daysDoneInLevel(journey, currentLevel.level) / DAYS_PER_LEVEL;
  // Objectif : part du programme de 28 jours déjà parcourue.
  const objectifPct = Math.round((journey.day / JOURNEY_DAY_COUNT) * 100);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* En-tête. */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.headerDate}>{formatToday()}</Text>
            <Text style={styles.headerTitle}>Prêt à progresser ?</Text>
            <Text style={styles.headerSub}>
              {doneToday.length > 0
                ? 'Séance du jour faite — bien joué.'
                : 'Ta routine du jour est prête.'}
            </Text>
          </View>
          <PressableScale
            onPress={() => router.push('/(tabs)/profil')}
            accessibilityRole="button"
            accessibilityLabel="Réglages"
            hitSlop={8}
            style={styles.gear}
          >
            <Ionicons name="settings-outline" size={20} color={color.textMuted} />
          </PressableScale>
        </View>

        {/* Hero — ton alignement. */}
        <Animated.View entering={cascade(0)}>
          <Card style={styles.heroCard}>
            <SectionLabel style={styles.heroLabel}>Ton alignement</SectionLabel>
            <View style={styles.heroRow}>
              <View style={styles.heroLeft}>
                <View style={styles.scoreRow}>
                  <Text style={styles.scoreValue}>{currentScore}</Text>
                  <Text style={styles.scoreMax}>/100</Text>
                </View>
                <Text style={styles.levelName}>Niveau {currentLevel.label}</Text>
                <ProgressBar progress={levelRatio} style={styles.levelBar} />
              </View>
              <ScoreRing score={currentScore} />
            </View>

            {/* Potentiel estimé — honnête : hauteur POSTURALE. */}
            <View style={styles.potential}>
              <View style={styles.potentialIcon}>
                <Ionicons name="trending-up-outline" size={17} color={color.accent} />
              </View>
              <View style={styles.potentialText}>
                <View style={styles.potentialHead}>
                  <Text style={styles.potentialLabel}>Potentiel estimé</Text>
                  <Pressable
                    onPress={() => router.push('/(tabs)/progres')}
                    accessibilityRole="button"
                    accessibilityLabel="Voir mon analyse"
                  >
                    <Text style={styles.potentialLink}>Voir mon analyse →</Text>
                  </Pressable>
                </View>
                <Text style={styles.potentialValue}>
                  <Text style={styles.potentialCm}>+{formatCm(result.heightLossCm)}</Text>
                  <Text style={styles.potentialSuffix}> de hauteur posturale</Text>
                </Text>
              </View>
            </View>
          </Card>
        </Animated.View>

        {/* Tuiles stats. */}
        <Animated.View entering={cascade(1)} style={styles.tileRow}>
          <StatTile
            icon="flame-outline"
            label="Série"
            value={String(streak)}
            unit={streak > 1 ? 'jours' : 'jour'}
          />
          <StatTile
            icon="calendar-outline"
            label="Séances"
            value={String(progress.totalSessions)}
          />
          <StatTile icon="locate-outline" label="Objectif" value={String(objectifPct)} unit="%" />
        </Animated.View>

        {/* Routine du jour. */}
        <Animated.View entering={cascade(2)}>
          <SectionLabel style={styles.routineLabel}>Routine du jour</SectionLabel>
          <Card style={styles.routineCard}>
            <View style={styles.routineGhost} pointerEvents="none">
              <Ionicons name="body-outline" size={GHOST_ICON_SIZE} color={color.surfaceAlt} />
            </View>
            <Text style={styles.routineTitle}>{nextSession.titre}</Text>
            <Text style={styles.routineMeta}>
              {nextSession.durationMin} min · {nextSession.exercises.length} exercices ·{' '}
              {currentLevel.label}
            </Text>
            <PrimaryButton
              label="Démarrer la séance"
              onPress={() => router.push(`/session/${nextSession.id}?start=1`)}
              style={styles.routineButton}
            />
            <Pressable
              onPress={() => router.push(`/session/${nextSession.id}`)}
              accessibilityRole="button"
              style={styles.routineLink}
            >
              <Text style={styles.routineLinkLabel}>Voir les exercices →</Text>
            </Pressable>
          </Card>
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
    alignItems: 'flex-start',
    gap: space.md,
  },
  headerText: {
    flex: 1,
    gap: space.xs,
  },
  headerDate: {
    ...type.sectionLabel,
  },
  headerTitle: {
    fontFamily: font.bold,
    fontSize: 30,
    lineHeight: 36,
    color: color.textPrimary,
  },
  headerSub: {
    ...type.body,
  },
  gear: {
    width: GEAR_SIZE,
    height: GEAR_SIZE,
    borderRadius: radius.pill,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    marginTop: space.lg,
    padding: space.lg,
    gap: space.md,
  },
  heroLabel: {
    color: color.accent,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.lg,
  },
  heroLeft: {
    flex: 1,
    gap: space.xs,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: space.xs,
  },
  scoreValue: {
    ...type.statNumber,
    fontSize: 64,
    lineHeight: 68,
    fontVariant: ['tabular-nums'],
  },
  scoreMax: {
    ...type.bodyMedium,
    color: color.textMuted,
  },
  levelName: {
    ...type.body,
    color: color.textPrimary,
  },
  levelBar: {
    marginTop: space.xs,
  },
  ring: {
    width: RING_SIZE,
    height: RING_SIZE,
  },
  ringBody: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  potential: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: color.surfaceAlt,
    borderRadius: radius.tile,
    padding: space.md,
  },
  potentialIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  potentialText: {
    flex: 1,
    gap: space.xs / 2,
  },
  potentialHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.sm,
  },
  potentialLabel: {
    ...type.meta,
  },
  potentialValue: {
    ...type.body,
  },
  potentialCm: {
    ...type.bodyMedium,
    color: color.accent,
  },
  potentialSuffix: {
    color: color.textSecond,
  },
  potentialLink: {
    ...type.meta,
    color: color.accent,
  },
  tileRow: {
    flexDirection: 'row',
    gap: space.sm,
    marginTop: space.md,
  },
  tile: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs + 2,
    paddingVertical: space.md,
    paddingHorizontal: space.sm,
  },
  tileIcon: {
    width: TILE_ICON_SIZE,
    height: TILE_ICON_SIZE,
    borderRadius: radius.pill,
    backgroundColor: color.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileText: {
    flex: 1,
    gap: space.xs / 2,
  },
  tileLabel: {
    ...type.sectionLabel,
    fontSize: 9,
    letterSpacing: 0.8,
  },
  tileValue: {
    ...type.statNumberSmall,
    fontSize: 22,
    lineHeight: 26,
    fontVariant: ['tabular-nums'],
  },
  tileUnit: {
    ...type.meta,
  },
  routineLabel: {
    marginTop: space.xl,
    marginBottom: space.md,
  },
  routineCard: {
    padding: space.lg,
    gap: space.sm,
    overflow: 'hidden',
  },
  routineGhost: {
    position: 'absolute',
    right: -space.lg,
    top: -space.sm,
    opacity: 0.6,
  },
  routineTitle: {
    ...type.statNumberSmall,
  },
  routineMeta: {
    ...type.meta,
    color: color.textSecond,
  },
  routineButton: {
    marginTop: space.md,
  },
  routineLink: {
    alignItems: 'center',
    paddingVertical: space.sm,
  },
  routineLinkLabel: {
    ...type.bodyMedium,
    color: color.accent,
  },
});
