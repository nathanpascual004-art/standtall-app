import { QuizSingleSelectScreen } from '@/components/QuizSingleSelectScreen';

/** Étape 1/14 — objectif principal. */
export default function GoalScreen() {
  return (
    <QuizSingleSelectScreen
      step={1}
      title="Quel est ton objectif ?"
      answerKey="goal"
      options={[
        { value: 'taller', label: 'Paraître plus grand' },
        { value: 'posture', label: 'Corriger ma posture' },
        { value: 'back-pain', label: 'Moins de douleurs de dos' },
        { value: 'presence', label: 'Plus de présence' },
      ]}
      nextHref="/onboarding/step2"
    />
  );
}
