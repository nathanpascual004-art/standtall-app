import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/Card';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ProgressBar } from '@/components/ProgressBar';
import {
  PROGRAM_DISCLAIMER,
  formatExerciseDuration,
  getSession,
  type Session,
} from '@/lib/program';
import { useOnboardingStore } from '@/lib/store';
import { colors, fontWeight, radius, spacing } from '@/lib/theme';

const formatClock = (sec: number) => {
  const minutes = Math.floor(sec / 60);
  const seconds = sec % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

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
        <Pressable
          onPress={onQuit}
          accessibilityRole="button"
          accessibilityLabel="Quitter la séance"
          hitSlop={12}
          style={({ pressed }) => [styles.iconButton, pressed && { opacity: 0.7 }]}
        >
          <Ionicons name="close" size={20} color={colors.textMuted} />
        </Pressable>
        <Text style={styles.playerStep}>
          Exercice {index + 1}/{session.exercises.length}
        </Text>
        <View style={styles.iconButton} />
      </View>

      <ProgressBar progress={overall} height={4} />

      <View style={styles.playerBody}>
        <View style={styles.cibleChip}>
          <Text style={styles.cibleLabel}>{exercise.cible}</Text>
        </View>
        <Text style={styles.playerExercise}>{exercise.nom}</Text>
        <Text style={styles.playerDescription}>{exercise.description}</Text>
        <Text style={styles.playerClock}>{formatClock(remaining)}</Text>
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          label={isLast ? 'Terminer la séance' : 'Suivant'}
          onPress={handleNext}
        />
      </View>
    </View>
  );
}

/** Détail d'une séance : exercices + lecteur + complétion. */
export default function SessionScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const session = getSession(id);
  const completeSession = useOnboardingStore((state) => state.completeSession);
  const [mode, setMode] = useState<'detail' | 'player' | 'done'>('detail');

  if (!session) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
        <Text style={styles.title}>Séance introuvable</Text>
        <View style={styles.footer}>
          <PrimaryButton label="Retour" onPress={() => router.back()} />
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
            <Pressable
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Retour"
              hitSlop={12}
              style={({ pressed }) => [styles.iconButton, pressed && { opacity: 0.7 }]}
            >
              <Ionicons name="chevron-back" size={20} color={colors.textMuted} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.detailContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.title}>{session.titre}</Text>
            <Text style={styles.meta}>
              {session.durationMin} min · {session.exercises.length} exercices
            </Text>

            <View style={styles.exercises}>
              {session.exercises.map((exercise) => (
                <Card key={exercise.id} style={styles.exerciseCard}>
                  <View style={styles.exerciseHeader}>
                    <Text style={styles.exerciseName}>{exercise.nom}</Text>
                    <Text style={styles.exerciseDuration}>
                      {formatExerciseDuration(exercise.durationSec)}
                    </Text>
                  </View>
                  <Text style={styles.exerciseDescription}>{exercise.description}</Text>
                  <View style={styles.cibleChip}>
                    <Text style={styles.cibleLabel}>{exercise.cible}</Text>
                  </View>
                </Card>
              ))}
            </View>

            <Text style={styles.disclaimer}>{PROGRAM_DISCLAIMER}</Text>
          </ScrollView>

          <View style={styles.footer}>
            <PrimaryButton label="Démarrer la séance" onPress={() => setMode('player')} />
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
            <Ionicons name="checkmark-circle" size={56} color={colors.accentLight} />
            <Text style={styles.doneTitle}>Séance terminée</Text>
            <Text style={styles.doneHint}>
              Bien joué. La régularité fait le redressement — reviens demain.
            </Text>
          </View>
          <View style={styles.footer}>
            <PrimaryButton
              label="Retour au programme"
              onPress={() => router.replace('/(tabs)/programme')}
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
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  flex: {
    flex: 1,
  },
  detailHeader: {
    flexDirection: 'row',
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailContent: {
    paddingBottom: spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: 26,
    lineHeight: 34,
    fontWeight: fontWeight.medium,
    marginTop: spacing.lg,
  },
  meta: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: fontWeight.regular,
    marginTop: spacing.xs,
  },
  exercises: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  exerciseCard: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  exerciseName: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    fontWeight: fontWeight.medium,
  },
  exerciseDuration: {
    color: colors.accentLight,
    fontSize: 13,
    fontWeight: fontWeight.medium,
  },
  exerciseDescription: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: fontWeight.regular,
  },
  cibleChip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.cardActive,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  cibleLabel: {
    color: colors.accentLight,
    fontSize: 11,
    fontWeight: fontWeight.medium,
  },
  disclaimer: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: fontWeight.regular,
    marginTop: spacing.xl,
    textAlign: 'center',
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  playerStep: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: fontWeight.regular,
    fontVariant: ['tabular-nums'],
  },
  playerBody: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  playerExercise: {
    color: colors.text,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: fontWeight.medium,
    textAlign: 'center',
  },
  playerDescription: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: fontWeight.regular,
    textAlign: 'center',
  },
  playerClock: {
    color: colors.text,
    fontSize: 48,
    fontWeight: fontWeight.medium,
    fontVariant: ['tabular-nums'],
    marginTop: spacing.sm,
  },
  doneBody: {
    flex: 1,
  },
  doneContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  doneTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: fontWeight.medium,
  },
  doneHint: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: fontWeight.regular,
    textAlign: 'center',
  },
  footer: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
});
