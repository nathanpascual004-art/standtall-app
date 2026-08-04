import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, ReduceMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/Card';
import { PressableScale } from '@/components/PressableScale';
import { useOnboardingStore, type Intention } from '@/lib/store';
import { color, duration, space, staggerDelay, type } from '@/theme/tokens';

const CHOICES: { value: Intention; emoji: string; titre: string; sous: string }[] = [
  { value: 'posture', emoji: '🧍', titre: 'intentionPosture', sous: 'intentionPostureSub' },
  { value: 'nutrition', emoji: '🍽️', titre: 'intentionNutrition', sous: 'intentionNutritionSub' },
  { value: 'both', emoji: '⚡', titre: 'intentionBoth', sous: 'intentionBothSub' },
];

const cascade = (index: number) =>
  FadeInDown.delay(index * staggerDelay)
    .duration(duration.base)
    .reduceMotion(ReduceMotion.System);

/** Écran 2 — l'intention : branche tout le reste du questionnaire. */
export default function IntentionScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const setAnswer = useOnboardingStore((state) => state.setAnswer);

  const choose = (value: Intention) => {
    setAnswer('intention', value);
    router.push('/onboarding/profil-sexe');
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <Text style={styles.title}>{t('onboarding.intentionTitle')}</Text>

      <View style={styles.cards}>
        {CHOICES.map((choice, index) => (
          <Animated.View key={choice.value} entering={cascade(index)}>
            <PressableScale
              onPress={() => choose(choice.value)}
              haptic="selection"
              accessibilityRole="button"
              accessibilityLabel={t(`onboarding.${choice.titre}`)}
            >
              <Card style={styles.card}>
                <Text style={styles.emoji}>{choice.emoji}</Text>
                <View style={styles.cardText}>
                  <Text style={styles.cardTitle}>{t(`onboarding.${choice.titre}`)}</Text>
                  <Text style={styles.cardSub}>{t(`onboarding.${choice.sous}`)}</Text>
                </View>
              </Card>
            </PressableScale>
          </Animated.View>
        ))}
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
  title: {
    ...type.question,
    marginTop: space.xxl,
  },
  cards: {
    marginTop: space.xxl,
    gap: space.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.lg,
    padding: space.xl,
  },
  emoji: {
    fontSize: 30,
  },
  cardText: {
    flex: 1,
    gap: space.xs / 2,
  },
  cardTitle: {
    ...type.cardTitle,
  },
  cardSub: {
    ...type.body,
  },
});
