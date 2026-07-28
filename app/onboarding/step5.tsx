import { QuizSingleSelectScreen } from '@/components/QuizSingleSelectScreen';

/** Étape 5/14 — heures assis / écran par jour. */
export default function SittingHoursScreen() {
  return (
    <QuizSingleSelectScreen
      step={5}
      title="Combien d'heures assis/écran par jour ?"
      answerKey="sittingHours"
      options={[
        { value: 'moins-4', label: 'Moins de 4 h' },
        { value: '4-8', label: '4 à 8 h' },
        { value: '8-plus', label: 'Plus de 8 h' },
      ]}
      nextHref="/onboarding/step6"
    />
  );
}
