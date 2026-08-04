import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, ReduceMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandImage } from '@/components/BrandImage';
import { Card } from '@/components/Card';
import { CheckBurst } from '@/components/CheckBurst';
import { Mascot } from '@/components/Mascot';
import { PressableScale } from '@/components/PressableScale';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ProgressBar } from '@/components/ProgressBar';
import {
  PROGRAM_DISCLAIMER,
  formatExerciseDuration,
  getSession,
  type Session,
} from '@/lib/program';
import { sessionCover } from '@/lib/covers';
import { useAppLanguage } from '@/lib/i18n';
import { ensureReminderPermission, scheduleStreakReminder } from '@/lib/reminders';
import { todayKey, useOnboardingStore } from '@/lib/store';
import {
  borderWidth,
  color,
  duration,
  radius,
  space,
  staggerDelay,
  type,
} from '@/theme/tokens';

/** Dimensions de layout locales (pas des tokens de design). */
const ICON_BUTTON_SIZE = 32;
const MASCOT_SIZE = 88;

const formatClock = (sec: number) => {
  const minutes = Math.floor(sec / 60);
  const seconds = sec % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

/** Apparition en cascade des blocs principaux (sobre, respecte reduce motion). */
const cascade = (index: number) =>
  FadeInDown.delay(index * staggerDelay)
    .duration(duration.base)
    .reduceMotion(ReduceMotion.System);

/** Lecteur étape par étape : exercice courant + timer + « Suivant ». */
function SessionPlayer({
  session,
  onQuit,
  onFinished,
}: {
  session: Session;
  onQuit: () => void;
  onFinished: () => void;
}) {
  const { t } = useTranslation();
  const lang = useAppLanguage();
  const [index, setIndex] = useState(0);
  const exercise = session.exercises[index];
  const [remaining, setRemaining] = useState(exercise.durationSec);

  useEffect(() => {
    setRemaining(session.exercises[index].durationSec);
    const timer = setInterval(() => {
      setRemaining((current) => (current > 0 ? current - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [index, session]);

  const isLast = index === session.exercises.length - 1;

  const handleNext = () => {
    if (isLast) onFinished();
    else setIndex(index + 1);
  };

  // Fin du temps de l'exercice → passage automatique.
  useEffect(() => {
    if (remaining === 0) {
      const next = setTimeout(handleNext, 400);
      return () => clearTimeout(next);
    }
  }, [remaining]);

  const overall =
    (index + 1 - remaining / exercise.durationSec) / session.exercises.length;

  return (
    <View style={styles.flex}>
      <View style={styles.playerHeader}>
        <PressableScale
          onPress={onQuit}
          accessibilityRole="button"
          accessibilityLabel={t('program.quitSessionA11y')}
          hitSlop={12}
          style={styles.iconButton}
        >
          <Ionicons name="close" size={20} color={color.textMuted} />
        </PressableScale>
        <Text style={styles.playerStep}>
          {t('program.exerciseStep', { n: index + 1, total: session.exercises.length })}
        </Text>
        <View style={styles.iconButton} />
      </View>

      <ProgressBar progress={overall} height={4} />

      <View style={styles.playerBody}>
        <View style={styles.playerHead}>
          <View style={styles.cibleChip}>
            <Text style={styles.cibleLabel}>{exercise.cible[lang]}</Text>
          </View>
          <Text style={styles.playerExercise}>{exercise.nom[lang]}</Text>
          <Text style={styles.playerDescription} numberOfLines={3}>
            {exercise.description[lang]}
          </Text>
        </View>

        {/* Illustration du mouvement — le gros de l'écran. Les visuels
            sont en portrait 4:5 ; contentFit="contain" garantit la
            posture ENTIÈRE (jamais coupée) quelle que soit la taille
            d'écran, avec un letterbox minimal. */}
        <View style={styles.playerImageWrap}>
          {exercise.image ? (
            <Image
              source={exercise.image}
              style={styles.playerImageFill}
              contentFit="contain"
            />
          ) : (
            <Ionicons name="body-outline" size={48} color={color.textMuted} />
          )}
        </View>

        <Text style={styles.playerClock}>{formatClock(remaining)}</Text>
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          label={isLast ? t('program.finishSession') : t('program.next')}
          onPress={handleNext}
        />
      </View>
    </View>
  );
}

/** Détail d'une séance : exercices + lecteur + complétion. */
export default function SessionScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const lang = useAppLanguage();
  const { id, start } = useLocalSearchParams<{ id: string; start?: string }>();
  const session = getSession(id);
  const completeSession = useOnboardingStore((state) => state.completeSession);
  const clearProgressEvents = useOnboardingStore((state) => state.clearProgressEvents);
  const events = useOnboardingStore((state) => state.lastProgressEvents);
  // « ?start=1 » (bouton Démarrer de l'accueil) ouvre directement le player.
  const [mode, setMode] = useState<'detail' | 'player' | 'done'>(
    start === '1' ? 'player' : 'detail',
  );

  // Célébrations de la séance qui vient d'être complétée.
  const xpEvent = events.find((e) => e.kind === 'xp');
  const streakEvent = events.find((e) => e.kind === 'streak');
  const freezeUsed = events.find((e) => e.kind === 'freeze_used');
  const levelUp = events.find((e) => e.kind === 'level_up');
  const newBadges = events.filter((e) => e.kind === 'badge_unlocked');

  // Après complétion : permission de notifier (1er bon moment) puis
  // replanification du rappel anti-rupture pour demain 19 h.
  useEffect(() => {
    if (mode !== 'done') return;
    void (async () => {
      await ensureReminderPermission();
      await scheduleStreakReminder(useOnboardingStore.getState().progress, todayKey());
    })();
  }, [mode]);

  if (!session) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
        <Text style={styles.notFoundTitle}>{t('program.sessionNotFound')}</Text>
        <View style={styles.footer}>
          <PrimaryButton label={t('common.back')} onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const handleFinished = () => {
    completeSession(session.id);
    setMode('done');
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      {mode === 'detail' ? (
        <>
          <View style={styles.detailHeader}>
            <PressableScale
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel={t('common.back')}
              hitSlop={12}
              style={styles.iconButton}
            >
              <Ionicons name="chevron-back" size={20} color={color.textMuted} />
            </PressableScale>
          </View>

          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.detailContent}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View entering={cascade(0)}>
              <BrandImage
                source={sessionCover(session.id)}
                aspectRatio={16 / 9}
                borderRadius={radius.tile}
                icon="barbell-outline"
                scrim
                style={styles.hero}
              >
                <Text style={styles.heroTitle}>{session.titre[lang]}</Text>
                <Text style={styles.heroMeta}>
                  {t('program.sessionMeta', {
                    min: session.durationMin,
                    count: session.exercises.length,
                  })}
                </Text>
              </BrandImage>
            </Animated.View>

            <Animated.View entering={cascade(1)} style={styles.exercises}>
              {session.exercises.map((exercise) => (
                <Card key={exercise.id} style={styles.exerciseCard}>
                  <View style={styles.exerciseHeader}>
                    <Text style={styles.exerciseName}>{exercise.nom[lang]}</Text>
                    <Text style={styles.exerciseDuration}>
                      {formatExerciseDuration(exercise.durationSec)}
                    </Text>
                  </View>
                  <Text style={styles.exerciseDescription}>{exercise.description[lang]}</Text>
                  <View style={styles.cibleChip}>
                    <Text style={styles.cibleLabel}>{exercise.cible[lang]}</Text>
                  </View>
                </Card>
              ))}
            </Animated.View>

            <Text style={styles.disclaimer}>{PROGRAM_DISCLAIMER[lang]}</Text>
          </ScrollView>

          <View style={styles.footer}>
            <PrimaryButton label={t('program.startSession')} onPress={() => setMode('player')} />
          </View>
        </>
      ) : null}

      {mode === 'player' ? (
        <SessionPlayer
          session={session}
          onQuit={() => setMode('detail')}
          onFinished={handleFinished}
        />
      ) : null}

      {mode === 'done' ? (
        <View style={styles.doneBody}>
          <View style={styles.doneContent}>
            <CheckBurst />
            <Mascot state="celebrate" size={MASCOT_SIZE} />
            <Text style={styles.doneTitle}>{t('program.sessionDone')}</Text>

            {/* Récompenses de la séance : XP + série (+ joker éventuel). */}
            {xpEvent ? (
              <Text style={styles.doneXp}>
                +{xpEvent.amount} XP
                {xpEvent.bonusApplied ? (
                  <Text style={styles.doneXpBonus}>  · {t('program.streakBonus')}</Text>
                ) : null}
              </Text>
            ) : null}
            {streakEvent && streakEvent.streak > 0 ? (
              <View style={styles.doneStreakRow}>
                <Ionicons name="flame" size={18} color={color.accent} />
                <Text style={styles.doneStreak}>
                  {t('program.streakLine', {
                    count: streakEvent.streak,
                    unit: streakEvent.streak > 1 ? t('common.days') : t('common.day'),
                  })}
                </Text>
              </View>
            ) : null}
            {freezeUsed ? (
              <View style={styles.doneBanner}>
                <Ionicons name="snow-outline" size={16} color={color.accent} />
                <Text style={styles.doneBannerText}>{t('program.freezeUsed')}</Text>
              </View>
            ) : null}
            {levelUp ? (
              <View style={styles.doneBanner}>
                <Ionicons name="trending-up-outline" size={16} color={color.accent} />
                <Text style={styles.doneBannerText}>
                  {t('common.levelN', { level: levelUp.level })} — {levelUp.rank[lang]}
                </Text>
              </View>
            ) : null}
            {newBadges.map((event) => (
              <View key={event.badge.id} style={styles.doneBanner}>
                <Ionicons name="ribbon-outline" size={16} color={color.accent} />
                <Text style={styles.doneBannerText}>
                  {t('program.badgeLine', { title: event.badge.titre[lang] })}
                </Text>
              </View>
            ))}

            <Text style={styles.doneHint}>{t('program.doneHint')}</Text>
          </View>
          <View style={styles.footer}>
            <PrimaryButton
              label={t('program.backToProgram')}
              onPress={() => {
                clearProgressEvents();
                router.replace('/(tabs)/programme');
              }}
            />
          </View>
        </View>
      ) : null}
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
  flex: {
    flex: 1,
  },
  detailHeader: {
    flexDirection: 'row',
  },
  iconButton: {
    width: ICON_BUTTON_SIZE,
    height: ICON_BUTTON_SIZE,
    borderRadius: radius.pill,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailContent: {
    paddingBottom: space.lg,
  },
  notFoundTitle: {
    ...type.screenTitle,
    marginTop: space.lg,
  },
  hero: {
    marginTop: space.lg,
  },
  heroTitle: {
    ...type.statNumberSmall,
  },
  heroMeta: {
    ...type.meta,
    color: color.textSecond,
    marginTop: space.xs / 2,
  },
  exercises: {
    marginTop: space.xl,
    gap: space.md,
  },
  exerciseCard: {
    padding: space.lg,
    gap: space.sm,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  exerciseName: {
    ...type.bodyMedium,
    flex: 1,
  },
  exerciseDuration: {
    ...type.meta,
  },
  exerciseDescription: {
    ...type.body,
  },
  cibleChip: {
    alignSelf: 'flex-start',
    borderWidth: borderWidth.hairline,
    borderColor: color.accent,
    borderRadius: radius.pill,
    paddingHorizontal: space.sm,
    paddingVertical: space.xs / 2,
  },
  cibleLabel: {
    ...type.sectionLabel,
    // Taille réduite du chip (spécifiée par la maquette) — dérivée de sectionLabel.
    fontSize: 10,
    color: color.accent,
  },
  disclaimer: {
    ...type.meta,
    marginTop: space.xl,
    textAlign: 'center',
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space.md,
  },
  playerStep: {
    ...type.meta,
    fontVariant: ['tabular-nums'],
  },
  playerBody: {
    flex: 1,
    alignItems: 'center',
    gap: space.md,
    paddingTop: space.md,
    paddingBottom: space.sm,
  },
  playerHead: {
    alignItems: 'center',
    gap: space.xs,
  },
  playerExercise: {
    ...type.cardTitle,
    fontSize: 19,
    textAlign: 'center',
  },
  playerDescription: {
    ...type.body,
    textAlign: 'center',
  },
  // L'image occupe tout l'espace restant entre description et timer.
  playerImageWrap: {
    flex: 1,
    alignSelf: 'stretch',
    borderRadius: radius.card,
    backgroundColor: color.surfaceAlt,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerImageFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  playerClock: {
    ...type.statNumber,
    fontVariant: ['tabular-nums'],
  },
  doneBody: {
    flex: 1,
  },
  doneContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.md,
  },
  doneTitle: {
    ...type.statNumberSmall,
  },
  doneXp: {
    ...type.statNumberSmall,
    color: color.accent,
    fontVariant: ['tabular-nums'],
  },
  doneXpBonus: {
    ...type.meta,
    color: color.textSecond,
  },
  doneStreakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
  },
  doneStreak: {
    ...type.bodyMedium,
  },
  doneBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    borderWidth: borderWidth.hairline,
    borderColor: color.accent,
    borderRadius: radius.pill,
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
  },
  doneBannerText: {
    ...type.meta,
    color: color.textPrimary,
  },
  doneHint: {
    ...type.body,
    textAlign: 'center',
  },
  footer: {
    paddingTop: space.sm,
    paddingBottom: space.sm,
  },
});
