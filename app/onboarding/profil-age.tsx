import { QuizSingleSelectScreen } from '@/components/QuizSingleSelectScreen';
import { questionCount, questionStep } from '@/lib/onboarding-flow';
import { useOnboardingStore } from '@/lib/store';

/** Écran 4 — âge. */
export default function AgeScreen() {
  const intention = useOnboardingStore((state) => state.answers.intention);
  return (
    <QuizSingleSelectScreen
      step={questionStep(intention, 'age')}
      total={questionCount(intention)}
      title="Ton âge ?"
      answerKey="ageRange"
      options={[
        { value: '13-17', label: '13 – 17 ans' },
        { value: '18-24', label: '18 – 24 ans' },
        { value: '25-34', label: '25 – 34 ans' },
        { value: '35-44', label: '35 – 44 ans' },
        { value: '45+', label: '45 ans et plus' },
      ]}
      nextHref="/onboarding/profil-taille"
    />
  );
}
