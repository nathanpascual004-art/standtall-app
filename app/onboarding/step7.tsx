import { QuizSingleSelectScreen } from '@/components/QuizSingleSelectScreen';

/** Étape 7/14 — tête en avant. */
export default function ForwardHeadScreen() {
  return (
    <QuizSingleSelectScreen
      step={7}
      title="Ta tête part en avant (téléphone, écran) ?"
      answerKey="forwardHead"
      options={[
        { value: 'jamais', label: 'Jamais' },
        { value: 'parfois', label: 'Parfois' },
        { value: 'souvent', label: 'Souvent' },
      ]}
      nextHref="/onboarding/step8"
    />
  );
}
