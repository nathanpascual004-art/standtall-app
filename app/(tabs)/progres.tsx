import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, ReduceMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Polygon } from 'react-native-svg';

import { Card } from '@/components/Card';
import { Mascot } from '@/components/Mascot';
import { PressableScale } from '@/components/PressableScale';
import { ProgressBar } from '@/components/ProgressBar';
import { SectionLabel } from '@/components/SectionLabel';
import { HABIT_XP, HABITS } from '@/lib/habits';
import { displayStreak, levelProgress, rankForLevel } from '@/lib/progress';
import { todayKey, useOnboardingStore } from '@/lib/store';
import { borderWidth, color, duration, radius, space, staggerDelay, type } from '@/theme/tokens';

/** Dimensions de layout locales (pas des tokens de design). */
const CHECK_SIZE = 26;
const MASCOT_SIZE = 72;
const HEX_SIZE = 46;
const ICON_BUTTON_SIZE = 44;

const cascade = (index: number) =>
  FadeInDown.delay(index * staggerDelay)
    .duration(duration.base)
    .reduceMotion(ReduceMotion.System);

/** Points d'un hexagone régulier (pointe en haut) dans un carré size×size. */
function hexPoints(size: number): string {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 2;
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
  }).join(' ');
}

/** Badge hexagonal de niveau (actuel = lime plein, suivant = contour). */
function HexBadge({ level, active }: { level: number; active: boolean }) {
  return (
    <View style={styles.hex}>
      <Svg width={HEX_SIZE} height={HEX_SIZE}>
        <Polygon
          points={hexPoints(HEX_SIZE)}
          fill={active ? color.accent : 'none'}
          stroke={active ? color.accent : color.border}
          strokeWidth={1.5}
        />
      </Svg>
      <View style={styles.hexCenter} pointerEvents="none">
        <Text style={[styles.hexLabel, active && styles.hexLabelActive]}>{level}</Text>
      </View>
    </View>
  );
}

/** Onglet Progrès — série, niveau/XP, habitudes du jour. */
export default function ProgresScreen() {
  const router = useRouter();
  const progress = useOnboardingStore((state) => state.progress);
  const habits = useOnboardingStore((state) => state.habits);
  const toggleHabit = useOnboardingStore((state) => state.toggleHabit);

  const today = todayKey();
  const streak = displayStreak(progress, today);
  const level = levelProgress(progress.xp);
  const nextRank = rankForLevel(level.level + 1);
  const checked = habits[today] ?? [];
  const checkedCount = HABITS.filter((habit) => checked.includes(habit.id)).length;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Progrès</Text>
          <PressableScale
            onPress={() => router.push('/recompenses')}
            accessibilityRole="button"
            accessibilityLabel="Récompenses"
            hitSlop={8}
            style={styles.iconButton}
          >
            <Ionicons name="calendar-outline" size={20} color={color.textMuted} />
          </PressableScale>
        </View>

        {/* Ta série. */}
        <Animated.View entering={cascade(0)}>
          <Card style={styles.streakCard}>
            <View style={styles.streakText}>
              <SectionLabel>Ta série</SectionLabel>
              <View style={styles.streakRow}>
                <Ionicons
                  name="flame"
                  size={26}
                  color={streak > 0 ? color.accent : color.textMuted}
                />
                <Text style={styles.streakValue}>{streak}</Text>
                <Text style={styles.streakUnit}>jour{streak > 1 ? 's' : ''}</Text>
              </View>
              <Text style={styles.streakRecord}>
                Meilleur record : {progress.bestStreak} jour{progress.bestStreak > 1 ? 's' : ''}
              </Text>
            </View>
            <Mascot state={streak > 0 ? 'upright' : 'encourage'} size={MASCOT_SIZE} />
          </Card>
        </Animated.View>

        {/* Niveau actuel — tap = Récompenses (badges, jokers, record). */}
        <Animated.View entering={cascade(1)}>
          <PressableScale
            onPress={() => router.push('/recompenses')}
            accessibilityRole="button"
            accessibilityLabel="Niveau actuel — voir les récompenses"
          >
            <Card style={styles.levelCard}>
              <SectionLabel>Niveau actuel</SectionLabel>
              <View style={styles.levelRow}>
                <View style={styles.levelText}>
                  <Text style={styles.levelName}>
                    Niveau {level.level} · {level.rank}
                  </Text>
                  <Text style={styles.levelXp}>
                    {level.current} / {level.needed} XP
                  </Text>
                  <ProgressBar progress={level.ratio} style={styles.levelBar} />
                  <Text style={styles.levelNext}>Prochain niveau : {nextRank}</Text>
                </View>
                <View style={styles.hexRow}>
                  <HexBadge level={level.level} active />
                  <HexBadge level={level.level + 1} active={false} />
                </View>
              </View>
            </Card>
          </PressableScale>
        </Animated.View>

        {/* Habitudes du jour. */}
        <Animated.View entering={cascade(2)}>
          <View style={styles.habitsHeader}>
            <SectionLabel>Habitudes du jour</SectionLabel>
            <Text style={styles.habitsCount}>
              {checkedCount}/{HABITS.length} complétées
            </Text>
          </View>
          <View style={styles.list}>
            {HABITS.map((habit) => {
              const isChecked = checked.includes(habit.id);
              return (
                <PressableScale
                  key={habit.id}
                  onPress={() => toggleHabit(habit.id)}
                  haptic="selection"
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isChecked }}
                  accessibilityLabel={`Habitude ${habit.titre}`}
                >
                  <Card style={[styles.habit, isChecked && styles.habitChecked]}>
                    <Ionicons
                      name={habit.icon}
                      size={20}
                      color={isChecked ? color.accent : color.textSecond}
                    />
                    <View style={styles.habitText}>
                      <Text
                        style={[styles.habitTitle, isChecked && styles.habitTitleChecked]}
                      >
                        {habit.titre}
                      </Text>
                      <Text style={styles.habitDescription}>{habit.description}</Text>
                    </View>
                    {isChecked ? (
                      <View style={styles.habitDone}>
                        <Text style={styles.habitDoneLabel}>Validée</Text>
                      </View>
                    ) : null}
                    <View style={[styles.check, isChecked && styles.checkChecked]}>
                      {isChecked ? (
                        <Ionicons name="checkmark" size={16} color={color.onAccent} />
                      ) : null}
                    </View>
                  </Card>
                </PressableScale>
              );
            })}
          </View>
        </Animated.View>

        <Text style={styles.footnote}>
          Chaque habitude cochée rapporte +{HABIT_XP} XP. La série, elle, avance
          avec tes séances — la régularité fait le redressement.
        </Text>
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
  title: {
    ...type.screenTitle,
  },
  iconButton: {
    width: ICON_BUTTON_SIZE,
    height: ICON_BUTTON_SIZE,
    borderRadius: radius.pill,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.lg,
    marginTop: space.lg,
    padding: space.lg,
  },
  streakText: {
    flex: 1,
    gap: space.xs,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: space.xs,
  },
  streakValue: {
    ...type.statNumber,
    fontVariant: ['tabular-nums'],
  },
  streakUnit: {
    ...type.bodyMedium,
    color: color.textSecond,
  },
  streakRecord: {
    ...type.meta,
  },
  levelCard: {
    marginTop: space.md,
    padding: space.lg,
    gap: space.md,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.lg,
  },
  levelText: {
    flex: 1,
    gap: space.xs,
  },
  levelName: {
    ...type.cardTitle,
  },
  levelXp: {
    ...type.meta,
    fontVariant: ['tabular-nums'],
  },
  levelBar: {
    marginVertical: space.xs / 2,
  },
  levelNext: {
    ...type.meta,
    color: color.accent,
  },
  hexRow: {
    flexDirection: 'row',
    gap: space.sm,
  },
  hex: {
    width: HEX_SIZE,
    height: HEX_SIZE,
  },
  hexCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hexLabel: {
    ...type.bodyMedium,
    color: color.textMuted,
    fontVariant: ['tabular-nums'],
  },
  hexLabelActive: {
    color: color.onAccent,
  },
  habitsHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: space.xl,
    marginBottom: space.md,
  },
  habitsCount: {
    ...type.meta,
    fontVariant: ['tabular-nums'],
  },
  list: {
    gap: space.md,
  },
  habit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.lg,
  },
  habitChecked: {
    borderWidth: borderWidth.hairline,
    borderColor: color.accent,
  },
  habitText: {
    flex: 1,
    gap: space.xs / 2,
  },
  habitTitle: {
    ...type.bodyMedium,
  },
  habitTitleChecked: {
    color: color.accent,
  },
  habitDescription: {
    ...type.meta,
  },
  habitDone: {
    borderRadius: radius.pill,
    backgroundColor: color.surfaceAlt,
    paddingHorizontal: space.sm,
    paddingVertical: space.xs / 2,
  },
  habitDoneLabel: {
    ...type.sectionLabel,
    fontSize: 9,
    color: color.accent,
  },
  check: {
    width: CHECK_SIZE,
    height: CHECK_SIZE,
    borderRadius: radius.tile,
    borderWidth: 1.5,
    borderColor: color.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkChecked: {
    backgroundColor: color.accent,
    borderColor: color.accent,
  },
  footnote: {
    ...type.meta,
    marginTop: space.xl,
    textAlign: 'center',
  },
});
