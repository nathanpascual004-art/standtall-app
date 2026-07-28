import { QuizSingleSelectScreen } from '@/components/QuizSingleSelectScreen';

/** Étape 9/14 — épaules enroulées vers l'avant. */
export default function ShouldersScreen() {
  return (
    <QuizSingleSelectScreen
      step={9}
      title="Tes épaules s'enroulent vers l'avant ?"
      answerKey="roundedShoulders"
      options={[
        { value: 'non', label: 'Non' },
        { value: 'un-peu', label: 'Un peu' },
        { value: 'oui', label: 'Oui' },
      ]}
      nextHref="/onboarding/step10"
    />
  );
}
