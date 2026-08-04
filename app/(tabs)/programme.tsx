import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, ReduceMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandImage } from '@/components/BrandImage';
import { Card } from '@/components/Card';
import { PressableScale } from '@/components/PressableScale';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ProgressBar } from '@/components/ProgressBar';
import { SectionLabel } from '@/components/SectionLabel';
import { sessionCover } from '@/lib/covers';
import { useAppLanguage } from '@/lib/i18n';
import {
  buildJourney,
  daysDoneInLevel,
  DAYS_PER_LEVEL,
  JOURNEY_LEVELS,
} from '@/lib/journey';
import { PROGRAM_DISCLAIMER, SESSIONS } from '@/lib/program';
import { levelProgress } from '@/lib/progress';
import { todayKey, useOnboardingStore } from '@/lib/store';
import { currentWeekKeys, WEEK_LETTERS } from '@/lib/week';
import { borderWidth, color, duration, radius, space, staggerDelay, type } from '@/theme/tokens';

/** Dimensions de layout locales (pas des tokens de design). */
const WEEK_DOT_SIZE = 36;
const ICON_BUTTON_SIZE = 44;

const cascade = (index: number) =>
  FadeInDown.delay(index * staggerDelay)
    .duration(duration.base)
    .reduceMotion(ReduceMotion.System);

/** Pastille d'un jour de la semaine (L M M J V S D). */
function WeekDot({
  letter,
  dayOfMonth,
  state,
}: {
  letter: string;
  dayOfMonth: number;
  state: 'done' | 'today' | 'past' | 'future';
}) {
  return (
    <View style={styles.weekCell}>
      <Text style={styles.weekLetter}>{letter}</Text>
      <View
        style={[
          styles.weekDot,
          state === 'done' && styles.weekDotDone,
          state === 'today' && styles.weekDotToday,
        ]}
      >
        {state === 'done' ? (
          <Ionicons name="checkmark" size={16} color={color.onAccent} />
        ) : state === 'future' ? (
          <Ionicons name="lock-closed" size={12} color={color.textMuted} />
        ) : (
          <Text
            style={[styles.weekDotLabel, state === 'today' && styles.weekDotLabelToday]}
          >
            {dayOfMonth}
          </Text>
        )}
      </View>
    </View>
  );
}

/** Onglet Programme — niveau en cours, semaine, prochaine séance, niveaux. */
export default function ProgrammeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const lang = useAppLanguage();
  const journey = useOnboardingStore((state) => state.journey);
  const progress = useOnboardingStore((state) => state.progress);
  const completedSessions = useOnboardingStore((state) => state.completedSessions);

  const levels = useMemo(buildJourney, []);
  const today = todayKey();
  const currentLevel =
    levels.find((l) => journey.day < l.level * DAYS_PER_LEVEL) ?? levels[levels.length - 1];
  const levelDone = daysDoneInLevel(journey, currentLevel.level);
  const levelPct = Math.round((levelDone / DAYS_PER_LEVEL) * 100);
  const xp = levelProgress(progress.xp);

  const doneToday = completedSessions[today] ?? [];
  const nextSession =
    SESSIONS.find((session) => !doneToday.includes(session.id)) ?? SESSIONS[0];

  // Semaine courante : fait / aujourd'hui / passé / à venir.
  const weekKeys = currentWeekKeys();
  const week = weekKeys.map((key, index) => {
    const done = (completedSessions[key] ?? []).length > 0;
    const isToday = key === today;
    return {
      key,
      letter: WEEK_LETTERS[lang][index],
      dayOfMonth: Number(key.slice(-2)),
      state: done ? ('done' as const) : isToday ? ('today' as const) : key < today ? ('past' as const) : ('future' as const),
    };
  });

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{t('common.tabProgram')}</Text>
          <PressableScale
            onPress={() => router.push('/(tabs)/profil')}
            accessibilityRole="button"
            accessibilityLabel={t('program.settingsA11y')}
            hitSlop={8}
            style={styles.iconButton}
          >
            <Ionicons name="options-outline" size={20} color={color.textMuted} />
          </PressableScale>
        </View>

        {/* Carte niveau : identité à gauche, progression à droite. */}
        <Animated.View entering={cascade(0)}>
          <Card style={styles.levelCard}>
            <View style={styles.levelLeft}>
              <SectionLabel>{t('program.levelLabel')}</SectionLabel>
              <Text style={styles.levelName}>{currentLevel.label[lang]}</Text>
              <Text style={styles.levelMeta}>
                {t('program.levelOf', { level: currentLevel.level, total: JOURNEY_LEVELS })}
              </Text>
            </View>
            <View style={styles.levelRight}>
              <Text style={styles.levelProgressLabel}>{t('program.levelProgress')}</Text>
              <Text style={styles.levelPct}>{levelPct}%</Text>
              <ProgressBar progress={levelDone / DAYS_PER_LEVEL} />
              <Text style={styles.levelXp}>
                {xp.current} / {xp.needed} XP
              </Text>
            </View>
          </Card>
        </Animated.View>

        {/* Séances de la semaine. */}
        <Animated.View entering={cascade(1)}>
          <SectionLabel style={styles.sectionLabel}>{t('program.weekSessions')}</SectionLabel>
          <Card style={styles.weekCard}>
            {week.map((day) => (
              <WeekDot
                key={day.key}
                letter={day.letter}
                dayOfMonth={day.dayOfMonth}
                state={day.state}
              />
            ))}
          </Card>
        </Animated.View>

        {/* Prochaine séance. */}
        <Animated.View entering={cascade(2)}>
          <SectionLabel style={styles.sectionLabel}>{t('program.nextSession')}</SectionLabel>
          <BrandImage
            source={sessionCover(nextSession.id)}
            aspectRatio={16 / 9}
            borderRadius={radius.card}
            icon="body-outline"
            scrim
          >
            <Text style={styles.nextTitle}>{nextSession.titre[lang]}</Text>
            <Text style={styles.nextMeta}>
              {t('program.sessionMeta', {
                min: nextSession.durationMin,
                count: nextSession.exercises.length,
              })}
            </Text>
            <PrimaryButton
              label={t('program.startShort')}
              onPress={() => router.push(`/session/${nextSession.id}?start=1`)}
              style={styles.nextButton}
            />
          </BrandImage>
        </Animated.View>

        {/* Les niveaux du programme. */}
        <Animated.View entering={cascade(3)}>
          <SectionLabel style={styles.sectionLabel}>{t('common.tabProgram')}</SectionLabel>
          <View style={styles.levelList}>
            {levels.map((level) => {
              const done = daysDoneInLevel(journey, level.level);
              const isCurrent = level.level === currentLevel.level;
              const locked = journey.day < (level.level - 1) * DAYS_PER_LEVEL;
              return (
                <Card
                  key={level.level}
                  style={[styles.levelRow, isCurrent && styles.levelRowActive]}
                >
                  <View style={styles.levelRowText}>
                    <Text
                      style={[styles.levelRowName, locked && styles.levelRowNameLocked]}
                    >
                      {level.label[lang]}
                    </Text>
                    <Text style={styles.levelRowMeta}>
                      {done}/{DAYS_PER_LEVEL} {t('common.days')}
                    </Text>
                  </View>
                  {locked ? (
                    <Ionicons name="lock-closed" size={16} color={color.textMuted} />
                  ) : (
                    <Text style={styles.levelRowCount}>
                      {done}/{DAYS_PER_LEVEL}
                    </Text>
                  )}
                </Card>
              );
            })}
          </View>
        </Animated.View>

        <Text style={styles.disclaimer}>{PROGRAM_DISCLAIMER[lang]}</Text>
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
  levelCard: {
    flexDirection: 'row',
    gap: space.lg,
    marginTop: space.lg,
    padding: space.lg,
  },
  levelLeft: {
    flex: 1,
    gap: space.xs,
  },
  levelName: {
    ...type.cardTitle,
  },
  levelMeta: {
    ...type.meta,
  },
  levelRight: {
    flex: 1,
    gap: space.xs,
  },
  levelProgressLabel: {
    ...type.meta,
  },
  levelPct: {
    ...type.statNumberSmall,
    fontVariant: ['tabular-nums'],
  },
  levelXp: {
    ...type.meta,
    fontVariant: ['tabular-nums'],
  },
  sectionLabel: {
    marginTop: space.xl,
    marginBottom: space.md,
  },
  weekCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: space.md,
  },
  weekCell: {
    alignItems: 'center',
    gap: space.xs,
  },
  weekLetter: {
    ...type.sectionLabel,
    fontSize: 10,
  },
  weekDot: {
    width: WEEK_DOT_SIZE,
    height: WEEK_DOT_SIZE,
    borderRadius: radius.pill,
    backgroundColor: color.surfaceAlt,
    borderWidth: borderWidth.hairline,
    borderColor: color.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekDotDone: {
    backgroundColor: color.accent,
    borderColor: color.accent,
  },
  weekDotToday: {
    borderWidth: 2,
    borderColor: color.accent,
    backgroundColor: color.surface,
  },
  weekDotLabel: {
    ...type.meta,
    fontVariant: ['tabular-nums'],
  },
  weekDotLabelToday: {
    color: color.accent,
  },
  nextTitle: {
    ...type.cardTitle,
  },
  nextMeta: {
    ...type.meta,
    color: color.textPrimary,
    marginTop: space.xs / 2,
  },
  nextButton: {
    marginTop: space.md,
  },
  levelList: {
    gap: space.sm,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.lg,
  },
  levelRowActive: {
    borderWidth: borderWidth.hairline,
    borderColor: color.accent,
  },
  levelRowText: {
    flex: 1,
    gap: space.xs / 2,
  },
  levelRowName: {
    ...type.bodyMedium,
  },
  levelRowNameLocked: {
    color: color.textMuted,
  },
  levelRowMeta: {
    ...type.meta,
  },
  levelRowCount: {
    ...type.bodyMedium,
    color: color.accent,
    fontVariant: ['tabular-nums'],
  },
  disclaimer: {
    ...type.meta,
    marginTop: space.xl,
    textAlign: 'center',
  },
});
