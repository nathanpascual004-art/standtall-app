import { QuizSingleSelectScreen } from '@/components/QuizSingleSelectScreen';
import { questionCount, questionStep } from '@/lib/onboarding-flow';
import { useOnboardingStore } from '@/lib/store';

/** Posture 2/6 — temps de téléphone par jour (signal tête penchée). */
export default function TelephoneScreen() {
  const intention = useOnboardingStore((state) => state.answers.intention);
  return (
    <QuizSingleSelectScreen
      step={questionStep(intention, 'telephone')}
      total={questionCount(intention)}
      title="Temps sur ton téléphone par jour ?"
      answerKey="phoneHours"
      options={[
        { value: 'moins-2', label: 'Moins de 2 h' },
        { value: '2-5', label: '2 – 5 h' },
        { value: '5-plus', label: 'Plus de 5 h' },
      ]}
      nextHref="/onboarding/posture-tenue"
    />
  );
}
