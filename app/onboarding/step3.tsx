import { QuizSingleSelectScreen } from '@/components/QuizSingleSelectScreen';

/** Étape 3/14 — tranche d'âge. */
export default function AgeScreen() {
  return (
    <QuizSingleSelectScreen
      step={3}
      title="Ton âge ?"
      answerKey="ageRange"
      options={[
        { value: '13-17', label: '13 – 17 ans' },
        { value: '18-24', label: '18 – 24 ans' },
        { value: '25-34', label: '25 – 34 ans' },
        { value: '35-44', label: '35 – 44 ans' },
        { value: '45+', label: '45 ans et plus' },
      ]}
      nextHref="/onboarding/step4"
    />
  );
}
