import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, ReduceMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Mascot } from '@/components/Mascot';
import { OnboardingProgress } from '@/components/OnboardingProgress';
import { PrimaryButton } from '@/components/PrimaryButton';
import { TOTAL_ONBOARDING_STEPS } from '@/lib/store';
import { color, duration, space, type } from '@/theme/tokens';

/** Étape 11/14 — écran insight (pas de question). */
export default function InsightScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <OnboardingProgress step={11} total={TOTAL_ONBOARDING_STEPS} />

      <Animated.View
        style={styles.body}
        entering={FadeInDown.duration(duration.base).reduceMotion(ReduceMotion.System)}
      >
        <Mascot state="encourage" size={72} />
        <Text style={styles.insight}>
          Rester assis 8h+ par jour tasse la colonne et enroule les épaules.
        </Text>
        <Text style={styles.consequence}>
          Résultat : plusieurs centimètres de stature perdus au quotidien.
        </Text>
      </Animated.View>

      <View style={styles.footer}>
        <PrimaryButton label="Continuer" onPress={() => router.push('/onboarding/step12')} />
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
    gap: space.lg,
    paddingBottom: space.xxl,
  },
  // Corps de texte long : pas de capitales (textTransform désactivé).
  insight: {
    ...type.question,
    textTransform: 'none',
    letterSpacing: 0,
  },
  consequence: {
    ...type.cardTitle,
    color: color.accent,
  },
  footer: {
    paddingBottom: space.sm,
  },
});
