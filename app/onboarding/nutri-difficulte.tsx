import { QuizSingleSelectScreen } from '@/components/QuizSingleSelectScreen';
import { questionCount, questionStep } from '@/lib/onboarding-flow';
import { useOnboardingStore } from '@/lib/store';

/** Nutrition 5/5 — plus grosse difficulté (personnalise les copies). */
export default function NutriDifficulteScreen() {
  const intention = useOnboardingStore((state) => state.answers.intention);
  return (
    <QuizSingleSelectScreen
      step={questionStep(intention, 'difficulte')}
      total={questionCount(intention)}
      title="Ta plus grosse difficulté ?"
      answerKey="difficulty"
      options={[
        { value: 'temps', label: 'Le manque de temps' },
        { value: 'quoi-manger', label: 'Je ne sais pas quoi manger' },
        { value: 'grignote', label: 'Je grignote' },
        { value: 'calories', label: 'Je ne suis pas mes calories' },
      ]}
      nextHref="/onboarding/analyse-nutrition"
    />
  );
}
