import { QuizSingleSelectScreen } from '@/components/QuizSingleSelectScreen';

/** Étape 2/14 — genre. */
export default function GenderScreen() {
  return (
    <QuizSingleSelectScreen
      step={2}
      title="Tu es..."
      answerKey="gender"
      options={[
        { value: 'homme', label: 'Homme' },
        { value: 'femme', label: 'Femme' },
        { value: 'autre', label: 'Autre' },
      ]}
      nextHref="/onboarding/step3"
    />
  );
}
