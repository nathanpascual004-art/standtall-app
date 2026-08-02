import { QuizSingleSelectScreen } from '@/components/QuizSingleSelectScreen';
import { questionCount, questionStep } from '@/lib/onboarding-flow';
import { useOnboardingStore } from '@/lib/store';

/** Posture 5/6 — perception : « je me trouve plus petit que ma taille ». */
export default function PercuScreen() {
  const intention = useOnboardingStore((state) => state.answers.intention);
  return (
    <QuizSingleSelectScreen
      step={questionStep(intention, 'percu')}
      total={questionCount(intention)}
      title="Tu te trouves plus petit que ta taille réelle ?"
      answerKey="feelSmaller"
      options={[
        { value: 0, label: 'Pas du tout' },
        { value: 1, label: 'Un peu' },
        { value: 2, label: 'Souvent' },
        { value: 3, label: 'Beaucoup' },
      ]}
      nextHref="/onboarding/posture-importance"
    />
  );
}
