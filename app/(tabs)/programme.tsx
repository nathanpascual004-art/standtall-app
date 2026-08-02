import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, ReduceMotion, ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandImage } from '@/components/BrandImage';
import { Card } from '@/components/Card';
import { PressableScale } from '@/components/PressableScale';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SectionLabel } from '@/components/SectionLabel';
import {
  buildJourney,
  daysDoneInLevel,
  DAYS_PER_LEVEL,
  JOURNEY_DAY_COUNT,
  levelTrophyUnlocked,
  nodeState,
  type JourneyDay,
  type JourneyNodeState,
} from '@/lib/journey';
import { PROGRAM_DISCLAIMER } from '@/lib/program';
import { displayStreak, isActiveToday, localDayKey } from '@/lib/progress';
import { todayKey, useOnboardingStore } from '@/lib/store';
import { borderWidth, color, duration, radius, space, staggerDelay, type } from '@/theme/tokens';

/** Dimensions de layout locales (pas des tokens de design). */
const NODE_SIZE = 46;
const NODE_CURRENT_SIZE = 66;
const SEGMENT_HEIGHT = 26;
const SEGMENT_WIDTH = 4;

const cascade = (index: number) =>
  FadeInDown.delay(index * staggerDelay)
    .duration(duration.base)
    .reduceMotion(ReduceMotion.System);

/** Segment vertical du chemin (lime = parcouru, gris = à venir). */
function PathSegment({ reached }: { reached: boolean }) {
  return (
    <View
      style={[styles.segment, { backgroundColor: reached ? color.accent : color.railOff }]}
    />
  );
}

/** Un nœud jour du parcours. */
function DayNode({
  day,
  state,
  advancedToday,
}: {
  day: JourneyDay;
  state: JourneyNodeState;
  advancedToday: boolean;
}) {
  const router = useRouter();
  const isCurrent = state === 'current';
  const locked = state === 'locked';

  const node = (
    <View
      style={[
        styles.node,
        state === 'done' && styles.nodeDone,
        isCurrent && styles.nodeCurrent,
        locked && styles.nodeLocked,
      ]}
    >
      {state === 'done' ? (
        <Ionicons name="checkmark" size={22} color={color.onAccent} />
      ) : isCurrent ? (
        <Ionicons name="play" size={24} color={color.accent} />
      ) : (
        <Ionicons name="lock-closed" size={16} color={color.textMuted} />
      )}
    </View>
  );

  return (
    <View style={styles.nodeBlock}>
      {locked ? (
        node
      ) : (
        <PressableScale
          onPress={() => router.push(`/session/${day.session.id}`)}
          haptic="selection"
          accessibilityRole="button"
          accessibilityLabel={`Jour ${day.index + 1} — ${day.session.titre}`}
        >
          {isCurrent ? (
            // Pop d'arrivée du nœud courant (respecte reduce motion).
            <Animated.View
              key={day.index}
              entering={ZoomIn.springify().damping(14).reduceMotion(ReduceMotion.System)}
            >
              {node}
            </Animated.View>
          ) : (
            node
          )}
        </PressableScale>
      )}
      {isCurrent ? (
        <Text style={styles.currentLabel}>{advancedToday ? 'Demain' : "Aujourd'hui"}</Text>
      ) : null}
      <Text style={[styles.nodeMeta, locked && styles.nodeMetaLocked]}>
        Jour {day.index + 1} · {day.session.titre}
      </Text>
    </View>
  );
}

/** Nœud trophée de fin de niveau. */
function TrophyNode({ unlocked, level }: { unlocked: boolean; level: number }) {
  return (
    <View style={styles.nodeBlock}>
      <View style={[styles.node, styles.trophy, unlocked && styles.trophyUnlocked]}>
        <Ionicons
          name="trophy"
          size={20}
          color={unlocked ? color.onAccent : color.textMuted}
        />
      </View>
      <Text style={[styles.nodeMeta, !unlocked && styles.nodeMetaLocked]}>
        {unlocked ? `Niveau ${level} complété` : `Trophée du niveau ${level}`}
      </Text>
    </View>
  );
}

/**
 * Parcours nutrition léger : les 7 derniers jours de journal.
 * Dette technique (voir DETTE-TECHNIQUE.md) : l'onglet Nutrition complet
 * (scan, journal, favoris) migrera ici dans une passe dédiée — la tab
 * bar repassera alors à 4 onglets.
 */
function NutritionJourney() {
  const router = useRouter();
  const meals = useOnboardingStore((state) => state.meals);
  const targets = useOnboardingStore((state) => state.nutritionTargets);

  if (!targets) {
    return (
      <Animated.View entering={cascade(1)}>
        <Card style={styles.nutritionSetupCard}>
          <SectionLabel>Parcours nutrition</SectionLabel>
          <Text style={styles.nutritionSetupText}>
            Configure ton suivi pour voir tes objectifs et ton journal ici.
          </Text>
          <PrimaryButton
            label="Configurer"
            variant="secondary"
            onPress={() => router.push('/nutrition-setup')}
          />
        </Card>
      </Animated.View>
    );
  }

  // 7 derniers jours (J-6 → aujourd'hui) : fait = au moins un repas journalisé.
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const key = localDayKey(date);
    return { key, done: (meals[key] ?? []).length > 0, isToday: i === 6 };
  });

  return (
    <Animated.View entering={cascade(1)}>
      <Card style={styles.nutritionCard}>
        <SectionLabel>Suivi des 7 derniers jours</SectionLabel>
        <Text style={styles.nutritionMeta}>
          Objectif : {targets.calories} kcal / jour. Un nœud plein = un jour avec au
          moins un repas journalisé.
        </Text>
        <View style={styles.nutritionPath}>
          {days.map((day, index) => (
            <View key={day.key} style={styles.nutritionNodeBlock}>
              {index > 0 ? (
                <View
                  style={[
                    styles.nutritionSegment,
                    { backgroundColor: days[index - 1].done ? color.accent : color.railOff },
                  ]}
                />
              ) : null}
              <View
                style={[
                  styles.nutritionNode,
                  day.done && styles.nutritionNodeDone,
                  day.isToday && styles.nutritionNodeToday,
                ]}
              >
                {day.done ? (
                  <Ionicons name="checkmark" size={14} color={color.onAccent} />
                ) : null}
              </View>
              <Text style={styles.nutritionNodeLabel}>
                {day.isToday ? 'Auj.' : `J-${6 - index}`}
              </Text>
            </View>
          ))}
        </View>
        <PrimaryButton
          label="Scanner un repas"
          onPress={() => router.push('/(tabs)/nutrition')}
        />
      </Card>
    </Animated.View>
  );
}

/** Onglet Parcours — le programme en chemin vertical façon jeu. */
export default function ParcoursScreen() {
  const journey = useOnboardingStore((state) => state.journey);
  const progress = useOnboardingStore((state) => state.progress);
  const [category, setCategory] = useState<'posture' | 'nutrition'>('posture');

  const levels = useMemo(buildJourney, []);
  const today = todayKey();
  const streak = displayStreak(progress, today);
  const advancedToday =
    journey.lastAdvanceDay === today || isActiveToday(progress, today);
  const daysLeft = Math.max(0, JOURNEY_DAY_COUNT - journey.day);
  const currentLevel =
    levels.find((l) => journey.day < l.level * DAYS_PER_LEVEL) ?? levels[levels.length - 1];

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Parcours</Text>

        {/* Toggle catégorie. */}
        <View style={styles.toggle}>
          <PressableScale
            onPress={() => setCategory('posture')}
            accessibilityRole="button"
            accessibilityLabel="Parcours posture"
            style={[styles.pill, category === 'posture' && styles.pillActive]}
          >
            <Text style={[styles.pillLabel, category === 'posture' && styles.pillLabelActive]}>
              Posture
            </Text>
          </PressableScale>
          <PressableScale
            onPress={() => setCategory('nutrition')}
            accessibilityRole="button"
            accessibilityLabel="Parcours nutrition"
            style={[styles.pill, category === 'nutrition' && styles.pillActive]}
          >
            <Text
              style={[styles.pillLabel, category === 'nutrition' && styles.pillLabelActive]}
            >
              Nutrition
            </Text>
          </PressableScale>
        </View>

        {category === 'nutrition' ? (
          <NutritionJourney />
        ) : (
          <>
            {/* Carte hero : niveau en cours + compte à rebours + streak. */}
            <Animated.View entering={cascade(0)} style={styles.heroBlock}>
              <BrandImage aspectRatio={16 / 9} borderRadius={radius.tile} icon="body-outline" scrim>
                <View style={styles.heroRow}>
                  <View style={styles.heroText}>
                    <Text style={styles.heroTitle}>
                      Niveau {currentLevel.level} — {currentLevel.label}
                    </Text>
                    <Text style={styles.heroMeta}>
                      {daysLeft > 0
                        ? `${daysLeft} jour${daysLeft > 1 ? 's' : ''} restants sur le programme`
                        : 'Programme complété'}
                    </Text>
                  </View>
                  <View style={styles.heroStreak}>
                    <Ionicons
                      name="flame"
                      size={18}
                      color={streak > 0 ? color.accent : color.textMuted}
                    />
                    <Text style={styles.heroStreakValue}>{streak}</Text>
                  </View>
                </View>
              </BrandImage>
            </Animated.View>

            {/* Le chemin vertical, niveau par niveau. */}
            {levels.map((level) => (
              <View key={level.level}>
                <View style={styles.levelHeader}>
                  <SectionLabel>{`Niveau ${level.level}`}</SectionLabel>
                  <Text style={styles.levelGauge}>
                    jour {daysDoneInLevel(journey, level.level)} / {DAYS_PER_LEVEL}
                  </Text>
                  <Text style={styles.levelDifficulty}>{level.label}</Text>
                </View>

                <View style={styles.path}>
                  {level.days.map((day) => (
                    <View key={day.index} style={styles.pathItem}>
                      {day.dayInLevel > 1 || day.level > 1 ? (
                        <PathSegment reached={journey.day >= day.index} />
                      ) : null}
                      <DayNode
                        day={day}
                        state={nodeState(journey, day.index)}
                        advancedToday={advancedToday}
                      />
                    </View>
                  ))}
                  <PathSegment reached={levelTrophyUnlocked(journey, level.level)} />
                  <TrophyNode
                    unlocked={levelTrophyUnlocked(journey, level.level)}
                    level={level.level}
                  />
                </View>
              </View>
            ))}
          </>
        )}

        <Text style={styles.disclaimer}>{PROGRAM_DISCLAIMER}</Text>
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
  title: {
    ...type.screenTitle,
  },
  toggle: {
    flexDirection: 'row',
    gap: space.sm,
    marginTop: space.lg,
  },
  pill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: space.md,
    borderRadius: radius.pill,
    backgroundColor: color.surface,
    borderWidth: borderWidth.hairline,
    borderColor: color.border,
  },
  pillActive: {
    backgroundColor: color.accent,
    borderColor: color.accent,
  },
  pillLabel: {
    ...type.sectionLabel,
    color: color.textSecond,
  },
  pillLabelActive: {
    color: color.onAccent,
  },
  heroBlock: {
    marginTop: space.lg,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: space.md,
  },
  heroText: {
    flex: 1,
    gap: space.xs / 2,
  },
  heroTitle: {
    ...type.cardTitle,
  },
  heroMeta: {
    ...type.meta,
    color: color.textSecond,
  },
  heroStreak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    backgroundColor: color.scrim,
    borderRadius: radius.pill,
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
  },
  heroStreakValue: {
    ...type.bodyMedium,
    fontVariant: ['tabular-nums'],
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    marginTop: space.xxl,
    marginBottom: space.md,
  },
  levelGauge: {
    ...type.meta,
    fontVariant: ['tabular-nums'],
    flex: 1,
  },
  levelDifficulty: {
    ...type.meta,
    color: color.textMuted,
  },
  path: {
    alignItems: 'center',
  },
  pathItem: {
    alignItems: 'center',
  },
  segment: {
    width: SEGMENT_WIDTH,
    height: SEGMENT_HEIGHT,
    borderRadius: SEGMENT_WIDTH / 2,
  },
  nodeBlock: {
    alignItems: 'center',
    gap: space.xs,
  },
  node: {
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: radius.pill,
    backgroundColor: color.surfaceAlt,
    borderWidth: borderWidth.hairline,
    borderColor: color.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeDone: {
    backgroundColor: color.accent,
    borderColor: color.accent,
  },
  nodeCurrent: {
    width: NODE_CURRENT_SIZE,
    height: NODE_CURRENT_SIZE,
    backgroundColor: color.surface,
    borderWidth: 3,
    borderColor: color.accent,
  },
  nodeLocked: {
    backgroundColor: color.surface,
  },
  trophy: {
    backgroundColor: color.surface,
  },
  trophyUnlocked: {
    backgroundColor: color.accent,
    borderColor: color.accent,
  },
  currentLabel: {
    ...type.sectionLabel,
    color: color.accent,
  },
  nodeMeta: {
    ...type.meta,
    textAlign: 'center',
  },
  nodeMetaLocked: {
    color: color.textMuted,
  },
  nutritionSetupCard: {
    marginTop: space.lg,
    padding: space.lg,
    gap: space.md,
  },
  nutritionSetupText: {
    ...type.body,
  },
  nutritionCard: {
    marginTop: space.lg,
    padding: space.lg,
    gap: space.md,
  },
  nutritionMeta: {
    ...type.body,
  },
  nutritionPath: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginVertical: space.sm,
  },
  nutritionNodeBlock: {
    alignItems: 'center',
    gap: space.xs,
    flex: 1,
  },
  nutritionSegment: {
    display: 'none',
  },
  nutritionNode: {
    width: 26,
    height: 26,
    borderRadius: radius.pill,
    backgroundColor: color.surfaceAlt,
    borderWidth: borderWidth.hairline,
    borderColor: color.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nutritionNodeDone: {
    backgroundColor: color.accent,
    borderColor: color.accent,
  },
  nutritionNodeToday: {
    borderWidth: 2,
    borderColor: color.accent,
  },
  nutritionNodeLabel: {
    ...type.meta,
    fontSize: 10,
  },
  disclaimer: {
    ...type.meta,
    marginTop: space.xl,
    textAlign: 'center',
  },
});
