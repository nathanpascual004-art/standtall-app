import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/Card';
import { ProgressBar } from '@/components/ProgressBar';
import { PROGRAM_DISCLAIMER, SESSIONS, type Session } from '@/lib/program';
import { todayKey, useOnboardingStore } from '@/lib/store';
import { colors, fonts, spacing } from '@/lib/theme';

function SessionCard({ session, doneToday }: { session: Session; doneToday: boolean }) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push(`/session/${session.id}`)}
      accessibilityRole="button"
      style={({ pressed }) => [pressed && { opacity: 0.85 }]}
    >
      <Card style={styles.sessionCard}>
        <View style={styles.sessionHeader}>
          <View style={styles.sessionText}>
            <Text style={styles.sessionTitle}>{session.titre}</Text>
            <Text style={styles.sessionMeta}>
              {session.durationMin} min · {session.exercises.length} exercices
              {doneToday ? ' · faite aujourd’hui' : ''}
            </Text>
          </View>
          {doneToday ? (
            <Ionicons name="checkmark-circle" size={22} color={colors.accentLight} />
          ) : (
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          )}
        </View>
        <ProgressBar progress={doneToday ? 1 : 0} height={4} />
      </Card>
    </Pressable>
  );
}

/** Onglet Programme — les 3 séances posture / mobilité. */
export default function ProgrammeScreen() {
  const completedSessions = useOnboardingStore((state) => state.completedSessions);
  const doneToday = completedSessions[todayKey()] ?? [];

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Ton programme</Text>

        <View style={styles.list}>
          {SESSIONS.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              doneToday={doneToday.includes(session.id)}
            />
          ))}
        </View>

        <Text style={styles.disclaimer}>{PROGRAM_DISCLAIMER}</Text>
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
  title: {
    color: colors.text,
    fontSize: 26,
    fontFamily: fonts.display,
  },
  list: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  sessionCard: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  sessionText: {
    flex: 1,
    gap: 2,
  },
  sessionTitle: {
    color: colors.text,
    fontSize: 16,
    fontFamily: fonts.bodyMedium,
  },
  sessionMeta: {
    color: colors.textMuted,
    fontSize: 13,
    fontFamily: fonts.body,
  },
  disclaimer: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
    fontFamily: fonts.body,
    marginTop: spacing.xl,
    textAlign: 'center',
  },
});
