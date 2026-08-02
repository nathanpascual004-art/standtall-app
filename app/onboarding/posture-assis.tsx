import { QuizSingleSelectScreen } from '@/components/QuizSingleSelectScreen';
import { questionCount, questionStep } from '@/lib/onboarding-flow';
import { useOnboardingStore } from '@/lib/store';

/** Posture 1/6 — heures assis par jour. */
export default function AssisScreen() {
  const intention = useOnboardingStore((state) => state.answers.intention);
  return (
    <QuizSingleSelectScreen
      step={questionStep(intention, 'assis')}
      total={questionCount(intention)}
      title="Combien d'heures assis par jour ?"
      answerKey="sittingHours"
      options={[
        { value: 'moins-4', label: 'Moins de 4 h' },
        { value: '4-8', label: '4 – 8 h' },
        { value: '8-plus', label: 'Plus de 8 h' },
      ]}
      nextHref="/onboarding/posture-telephone"
    />
  );
}
