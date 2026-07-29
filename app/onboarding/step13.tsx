import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OnboardingProgress } from '@/components/OnboardingProgress';
import { ProgressBar } from '@/components/ProgressBar';
import { TOTAL_ONBOARDING_STEPS } from '@/lib/store';
import { colors, fonts, spacing } from '@/lib/theme';

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
        <ActivityIndicator size="large" color={colors.accentLight} />

        <View style={styles.messages}>
          {MESSAGES.map((message, index) => {
            const done = index < currentIndex;
            const active = index === currentIndex;
            return (
              <View key={message} style={styles.messageRow}>
                <Ionicons
                  name={done ? 'checkmark-circle' : 'ellipse-outline'}
                  size={18}
                  color={done || active ? colors.accentLight : colors.border}
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
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    gap: spacing.xxl,
    paddingBottom: spacing.xxl,
  },
  messages: {
    gap: spacing.lg,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  message: {
    color: colors.textMuted,
    fontSize: 15,
    fontFamily: fonts.body,
  },
  messageActive: {
    color: colors.text,
    fontFamily: fonts.medium,
  },
  bar: {
    marginTop: spacing.sm,
  },
});
