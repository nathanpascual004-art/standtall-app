import { QuizSingleSelectScreen } from '@/components/QuizSingleSelectScreen';
import { questionCount, questionStep } from '@/lib/onboarding-flow';
import { useOnboardingStore } from '@/lib/store';

/** Posture 6/6 — importance de se tenir droit / paraître plus grand. */
export default function ImportanceScreen() {
  const intention = useOnboardingStore((state) => state.answers.intention);
  return (
    <QuizSingleSelectScreen
      step={questionStep(intention, 'importance')}
      total={questionCount(intention)}
      title="À quel point te tenir droit compte pour toi ?"
      answerKey="importance"
      options={[
        { value: 0, label: 'Peu' },
        { value: 1, label: 'Moyennement' },
        { value: 2, label: 'Beaucoup' },
        { value: 3, label: "C'est prioritaire" },
      ]}
      nextHref="/onboarding/analyse-posture"
    />
  );
}
