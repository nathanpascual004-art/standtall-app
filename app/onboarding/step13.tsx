import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Mascot } from '@/components/Mascot';
import { OnboardingProgress } from '@/components/OnboardingProgress';
import { ProgressBar } from '@/components/ProgressBar';
import { TOTAL_ONBOARDING_STEPS } from '@/lib/store';
import { color, space, type } from '@/theme/tokens';

const MESSAGES = [
  'Analyse de ta posture…',
  'Calcul de ta stature réelle…',
  'Génération de ton programme…',
];

const DURATION_MS = 2500;
const TICK_MS = 50;

/** Étape 13/14 — loader animé (2,5 s) puis navigation vers le résultat. */
export default function LoaderScreen() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startedAt = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const next = Math.min(1, elapsed / DURATION_MS);
      setProgress(next);
      if (next >= 1) {
        clearInterval(interval);
        router.replace('/onboarding/resultat');
      }
    }, TICK_MS);
    return () => clearInterval(interval);
  }, [router]);

  const currentIndex = Math.min(
    MESSAGES.length - 1,
    Math.floor(progress * MESSAGES.length),
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <OnboardingProgress step={13} total={TOTAL_ONBOARDING_STEPS} />

      <View style={styles.body}>
        <View style={styles.mascot}>
          <Mascot state="neutral" size={88} />
        </View>

        <ActivityIndicator size="large" color={color.accent} />

        <View style={styles.messages}>
          {MESSAGES.map((message, index) => {
            const done = index < currentIndex;
            const active = index === currentIndex;
            return (
              <View key={message} style={styles.messageRow}>
                <Ionicons
                  name={done ? 'checkmark-circle' : 'ellipse-outline'}
                  size={18}
                  color={done || active ? color.accent : color.border}
                />
                <Text
                  style={[
                    styles.message,
                    (done || active) && styles.messageActive,
                  ]}
                >
                  {message}
                </Text>
              </View>
            );
          })}
        </View>

        <ProgressBar progress={progress} style={styles.bar} />
      </View>
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
  body: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    gap: space.xxl,
    paddingBottom: space.xxl,
  },
  mascot: {
    alignItems: 'center',
  },
  messages: {
    gap: space.lg,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  message: {
    ...type.body,
    color: color.textMuted,
  },
  messageActive: {
    ...type.bodyMedium,
  },
  bar: {
    marginTop: space.sm,
  },
});
