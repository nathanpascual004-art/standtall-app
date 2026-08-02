import { QuizSingleSelectScreen } from '@/components/QuizSingleSelectScreen';
import { questionCount, questionStep } from '@/lib/onboarding-flow';
import { useOnboardingStore } from '@/lib/store';

/** Nutrition 3/5 — nombre de repas par jour. */
export default function NutriRepasScreen() {
  const intention = useOnboardingStore((state) => state.answers.intention);
  return (
    <QuizSingleSelectScreen
      step={questionStep(intention, 'repas')}
      total={questionCount(intention)}
      title="Combien de repas par jour ?"
      answerKey="mealsPerDay"
      options={[
        { value: 2, label: '2 repas' },
        { value: 3, label: '3 repas' },
        { value: 4, label: '4 repas' },
        { value: 5, label: '5 repas ou plus' },
      ]}
      nextHref="/onboarding/nutri-poids"
    />
  );
}
