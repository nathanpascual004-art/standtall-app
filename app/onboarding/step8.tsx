import { QuizSingleSelectScreen } from '@/components/QuizSingleSelectScreen';

/** Étape 8/14 — douleurs dos / nuque / épaules. */
export default function PainScreen() {
  return (
    <QuizSingleSelectScreen
      step={8}
      title="Douleurs dos, nuque ou épaules ?"
      answerKey="pain"
      options={[
        { value: 'aucune', label: 'Aucune' },
        { value: 'parfois', label: 'Parfois' },
        { value: 'regulieres', label: 'Régulières' },
      ]}
      nextHref="/onboarding/step9"
    />
  );
}
