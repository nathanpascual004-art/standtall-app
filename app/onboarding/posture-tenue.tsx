import { QuizSingleSelectScreen } from '@/components/QuizSingleSelectScreen';
import { questionCount, questionStep } from '@/lib/onboarding-flow';
import { useOnboardingStore } from '@/lib/store';

/** Posture 3/6 — auto-description de la posture. */
export default function TenueScreen() {
  const intention = useOnboardingStore((state) => state.answers.intention);
  return (
    <QuizSingleSelectScreen
      step={questionStep(intention, 'tenue')}
      total={questionCount(intention)}
      title="Comment tu décrirais ta posture ?"
      answerKey="postureType"
      options={[
        { value: 'droit', label: 'Droite' },
        { value: 'legerement-voute', label: 'Un peu affaissée' },
        { value: 'tres-voute', label: 'Très affaissée' },
      ]}
      nextHref="/onboarding/posture-tensions"
    />
  );
}
