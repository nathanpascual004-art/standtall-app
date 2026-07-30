import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, ReduceMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandImage } from '@/components/BrandImage';
import { Card } from '@/components/Card';
import { PressableScale } from '@/components/PressableScale';
import { SectionLabel } from '@/components/SectionLabel';
import { PROGRAM_DISCLAIMER, SESSIONS, type Session } from '@/lib/program';
import { todayKey, useOnboardingStore } from '@/lib/store';
import { color, duration, radius, space, staggerDelay, type } from '@/theme/tokens';

/** Dimensions de layout locales (pas des tokens de design). */
const THUMB_SIZE = 52;
const THUMB_RADIUS = 9;
const HERO_PLAY_SIZE = 44;

/** Apparition en cascade des cartes principales (sobre, respecte reduce motion). */
const cascade = (index: number) =>
  FadeInDown.delay(index * staggerDelay)
    .duration(duration.base)
    .reduceMotion(ReduceMotion.System);

/** Carte hero — la prochaine séance à faire, en pleine largeur. */
function HeroSession({ session }: { session: Session }) {
  const router = useRouter();
  const open = () => router.push(`/session/${session.id}`);

  return (
    <PressableScale
      onPress={open}
      haptic="impact"
      accessibilityRole="button"
      accessibilityLabel={session.titre}
    >
      <BrandImage
        aspectRatio={16 / 9}
        borderRadius={radius.tile}
        icon="barbell-outline"
        scrim
      >
        <View style={styles.heroRow}>
          <View style={styles.heroText}>
            <Text style={styles.heroTitle}>{session.titre}</Text>
            <Text style={styles.heroMeta}>
              {session.durationMin} min · {session.exercises.length} exercices
            </Text>
          </View>
          <PressableScale
            onPress={open}
            haptic="impact"
            accessibilityRole="button"
            accessibilityLabel="Lancer la séance"
            style={styles.heroPlay}
          >
            <Ionicons name="play" size={18} color={color.onAccent} />
          </PressableScale>
        </View>
      </BrandImage>
    </PressableScale>
  );
}

/** Vignette liste — les autres séances du programme. */
function SessionRow({ session, doneToday }: { session: Session; doneToday: boolean }) {
  const router = useRouter();

  return (
    <PressableScale
      onPress={() => router.push(`/session/${session.id}`)}
      accessibilityRole="button"
      accessibilityLabel={session.titre}
    >
      <Card style={styles.row}>
        <BrandImage
          height={THUMB_SIZE}
          borderRadius={THUMB_RADIUS}
          icon="body-outline"
          style={styles.thumb}
        />
        <View style={styles.rowText}>
          <Text style={styles.rowTitle}>{session.titre}</Text>
          <Text style={styles.rowMeta}>
            {session.durationMin} min · {session.exercises.length} exercices
            {doneToday ? ' · faite aujourd’hui' : ''}
          </Text>
        </View>
        {doneToday ? (
          <Ionicons name="checkmark-circle" size={20} color={color.accent} />
        ) : null}
        <Ionicons name="play" size={18} color={color.accent} />
      </Card>
    </PressableScale>
  );
}

/** Onglet Programme — les 3 séances posture / mobilité. */
export default function ProgrammeScreen() {
  const completedSessions = useOnboardingStore((state) => state.completedSessions);
  const doneToday = completedSessions[todayKey()] ?? [];

  // Séance mise en avant : la première non faite aujourd'hui.
  const heroSession =
    SESSIONS.find((session) => !doneToday.includes(session.id)) ?? SESSIONS[0];
  const otherSessions = SESSIONS.filter((session) => session.id !== heroSession.id);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Programme</Text>

        <Animated.View entering={cascade(0)} style={styles.heroBlock}>
          <SectionLabel>Séance du jour</SectionLabel>
          <HeroSession session={heroSession} />
        </Animated.View>

        <Animated.View entering={cascade(1)} style={styles.list}>
          {otherSessions.map((session) => (
            <SessionRow
              key={session.id}
              session={session}
              doneToday={doneToday.includes(session.id)}
            />
          ))}
        </Animated.View>

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
  heroBlock: {
    marginTop: space.lg,
    gap: space.sm,
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
  heroPlay: {
    width: HERO_PLAY_SIZE,
    height: HERO_PLAY_SIZE,
    borderRadius: radius.pill,
    backgroundColor: color.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    marginTop: space.lg,
    gap: space.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  thumb: {
    width: THUMB_SIZE,
  },
  rowText: {
    flex: 1,
    gap: space.xs / 2,
  },
  rowTitle: {
    ...type.bodyMedium,
  },
  rowMeta: {
    ...type.meta,
  },
  disclaimer: {
    ...type.meta,
    marginTop: space.xl,
    textAlign: 'center',
  },
});
