import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, ReduceMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/Card';
import { Mascot } from '@/components/Mascot';
import { PressableScale } from '@/components/PressableScale';
import { SectionLabel } from '@/components/SectionLabel';
import { HABIT_XP, HABITS } from '@/lib/habits';
import { displayStreak, levelProgress } from '@/lib/progress';
import { todayKey, useOnboardingStore } from '@/lib/store';
import { borderWidth, color, duration, radius, space, staggerDelay, type } from '@/theme/tokens';

/** Dimensions de layout locales (pas des tokens de design). */
const CHECK_SIZE = 26;
const MASCOT_SIZE = 64;

const cascade = (index: number) =>
  FadeInDown.delay(index * staggerDelay)
    .duration(duration.base)
    .reduceMotion(ReduceMotion.System);

/** Onglet Progrès — streak, checklist d'habitudes, niveau et récompenses. */
export default function ProgresScreen() {
  const router = useRouter();
  const progress = useOnboardingStore((state) => state.progress);
  const habits = useOnboardingStore((state) => state.habits);
  const toggleHabit = useOnboardingStore((state) => state.toggleHabit);

  const today = todayKey();
  const streak = displayStreak(progress, today);
  const level = levelProgress(progress.xp);
  const checked = habits[today] ?? [];

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Progrès</Text>

        {/* Streak en tête : la mécanique centrale reste la série de séances. */}
        <Animated.View entering={cascade(0)}>
          <Card style={styles.streakCard}>
            <View style={styles.streakBlock}>
              <View style={styles.streakRow}>
                <Ionicons
                  name="flame"
                  size={26}
                  color={streak > 0 ? color.accent : color.textMuted}
                />
                <Text style={styles.streakValue}>{streak}</Text>
              </View>
              <Text style={styles.streakLabel}>Streak</Text>
            </View>
            <Text style={styles.streakHint}>
              Ta série avance avec tes séances. Les habitudes, elles, rapportent de
              l'XP (+{HABIT_XP} chacune) et installent les bons réflexes.
            </Text>
            <Mascot state="encourage" size={MASCOT_SIZE} />
          </Card>
        </Animated.View>

        {/* Niveau + accès aux récompenses (badges, record, jokers). */}
        <Animated.View entering={cascade(1)}>
          <PressableScale
            onPress={() => router.push('/recompenses')}
            accessibilityRole="button"
            accessibilityLabel="Récompenses"
          >
            <Card style={styles.levelCard}>
              <View style={styles.levelText}>
                <Text style={styles.levelValue}>Niv. {level.level}</Text>
                <Text style={styles.levelRank}>{level.rank}</Text>
              </View>
              <Text style={styles.levelLink}>Récompenses</Text>
              <Ionicons name="chevron-forward" size={16} color={color.textMuted} />
            </Card>
          </PressableScale>
        </Animated.View>

        <Animated.View entering={cascade(2)}>
          <SectionLabel style={styles.listLabel}>Habitudes du jour</SectionLabel>
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
          Des réflexes de posture et de bien-être — la régularité fait le
          redressement.
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
  title: {
    ...type.screenTitle,
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.lg,
    marginTop: space.lg,
    padding: space.lg,
  },
  streakBlock: {
    alignItems: 'center',
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
  streakLabel: {
    ...type.sectionLabel,
  },
  streakHint: {
    ...type.body,
    flex: 1,
  },
  levelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    marginTop: space.md,
    padding: space.lg,
  },
  levelText: {
    flex: 1,
    gap: space.xs / 2,
  },
  levelValue: {
    ...type.cardTitle,
  },
  levelRank: {
    ...type.meta,
    color: color.accent,
  },
  levelLink: {
    ...type.meta,
    color: color.textSecond,
  },
  listLabel: {
    marginTop: space.xl,
    marginBottom: space.md,
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
