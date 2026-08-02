import { QuizSingleSelectScreen } from '@/components/QuizSingleSelectScreen';
import { questionCount, questionStep } from '@/lib/onboarding-flow';
import { useOnboardingStore } from '@/lib/store';

/** Nutrition 1/5 — objectif. */
export default function NutriObjectifScreen() {
  const intention = useOnboardingStore((state) => state.answers.intention);
  return (
    <QuizSingleSelectScreen
      step={questionStep(intention, 'objectif')}
      total={questionCount(intention)}
      title="Ton objectif ?"
      answerKey="nutriGoal"
      options={[
        { value: 'masse', label: 'Prise de masse' },
        { value: 'maintien', label: 'Maintien' },
        { value: 'perte', label: 'Perte de poids' },
        { value: 'mieux-manger', label: 'Juste mieux manger' },
      ]}
      nextHref="/onboarding/nutri-activite"
    />
  );
}
