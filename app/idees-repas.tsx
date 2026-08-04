import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, ReduceMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/Card';
import { PressableScale } from '@/components/PressableScale';
import { SectionLabel } from '@/components/SectionLabel';
import { useAppLanguage } from '@/lib/i18n';
import {
  GOAL_SUBTITLES,
  MEAL_IDEAS,
  MEAL_IDEAS_DISCLAIMER,
  MEAL_MOMENTS,
  MOMENT_LABELS,
} from '@/lib/meal-ideas';
import { useOnboardingStore, type NutriIntent } from '@/lib/store';
import { color, duration, radius, space, staggerDelay, type } from '@/theme/tokens';

/** Dimensions de layout locales (pas des tokens de design). */
const ICON_BUTTON_SIZE = 32;

const cascade = (index: number) =>
  FadeInDown.delay(index * staggerDelay)
    .duration(duration.base)
    .reduceMotion(ReduceMotion.System);

/** Objectif de contenu : réponse d'onboarding, sinon profil nutrition. */
function resolveGoal(): NutriIntent {
  const state = useOnboardingStore.getState();
  if (state.answers.nutriGoal) return state.answers.nutriGoal;
  const goal = state.nutritionProfile?.goal;
  if (goal === 'masse') return 'masse';
  if (goal === 'seche') return 'perte';
  return 'maintien';
}

/** Idées de repas curées par objectif — v1 statique, honnête. */
export default function IdeesRepasScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const lang = useAppLanguage();
  const setMealIdeaDraft = useOnboardingStore((state) => state.setMealIdeaDraft);
  const goal = resolveGoal();
  const ideas = MEAL_IDEAS[goal];

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <PressableScale
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
          hitSlop={12}
          style={styles.iconButton}
        >
          <Ionicons name="chevron-back" size={20} color={color.textMuted} />
        </PressableScale>
        <Text style={styles.title}>{t('nutrition.mealIdeasTitle')}</Text>
        <View style={styles.iconButton} />
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>{GOAL_SUBTITLES[goal][lang]}</Text>

        {MEAL_MOMENTS.map((moment, momentIndex) => (
          <Animated.View key={moment} entering={cascade(momentIndex)}>
            <SectionLabel style={styles.momentLabel}>{MOMENT_LABELS[moment][lang]}</SectionLabel>
            <View style={styles.list}>
              {ideas[moment].map((idea) => (
                <PressableScale
                  key={idea.nom.fr}
                  onPress={() => {
                    // Bonus : pré-remplit « Ajouter manuellement » côté Nutrition.
                    // Le nom est résolu ICI : le journal stocke une chaîne.
                    setMealIdeaDraft({
                      nom: idea.nom[lang],
                      calories: idea.kcal,
                      proteinesG: idea.proteinesG,
                      glucidesG: idea.glucidesG,
                      lipidesG: idea.lipidesG,
                    });
                    router.back();
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={t('nutrition.ideaA11y', { name: idea.nom[lang] })}
                >
                  <Card style={styles.idea}>
                    <View style={styles.ideaHead}>
                      <Text style={styles.ideaName}>{idea.nom[lang]}</Text>
                      <Text style={styles.ideaKcal}>{idea.kcal} kcal</Text>
                    </View>
                    <Text style={styles.ideaDescription}>{idea.description[lang]}</Text>
                    <View style={styles.ideaWhy}>
                      <Ionicons name="flash-outline" size={13} color={color.accent} />
                      <Text style={styles.ideaWhyText}>{idea.pourquoi[lang]}</Text>
                    </View>
                  </Card>
                </PressableScale>
              ))}
            </View>
          </Animated.View>
        ))}

        <Text style={styles.disclaimer}>{MEAL_IDEAS_DISCLAIMER[lang]}</Text>
      </ScrollView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space.sm,
  },
  iconButton: {
    width: ICON_BUTTON_SIZE,
    height: ICON_BUTTON_SIZE,
    borderRadius: radius.pill,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...type.screenTitle,
  },
  content: {
    paddingBottom: space.xl,
  },
  subtitle: {
    ...type.body,
    textAlign: 'center',
  },
  momentLabel: {
    marginTop: space.xl,
    marginBottom: space.md,
  },
  list: {
    gap: space.sm,
  },
  idea: {
    padding: space.lg,
    gap: space.xs,
  },
  ideaHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: space.md,
  },
  ideaName: {
    ...type.bodyMedium,
    flex: 1,
  },
  ideaKcal: {
    ...type.meta,
    color: color.accent,
    fontVariant: ['tabular-nums'],
  },
  ideaDescription: {
    ...type.meta,
  },
  ideaWhy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    marginTop: space.xs / 2,
  },
  ideaWhyText: {
    ...type.meta,
    color: color.textSecond,
    flex: 1,
  },
  disclaimer: {
    ...type.meta,
    textAlign: 'center',
    marginTop: space.xl,
  },
});
