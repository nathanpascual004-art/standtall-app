import { QuizSingleSelectScreen } from '@/components/QuizSingleSelectScreen';
import { questionCount, questionStep } from '@/lib/onboarding-flow';
import { useOnboardingStore } from '@/lib/store';

/** Nutrition 2/5 — niveau d'activité (facteur du calcul des besoins). */
export default function NutriActiviteScreen() {
  const intention = useOnboardingStore((state) => state.answers.intention);
  return (
    <QuizSingleSelectScreen
      step={questionStep(intention, 'activite')}
      total={questionCount(intention)}
      title="Ton niveau d'activité ?"
      answerKey="activite"
      options={[
        { value: 'sedentaire', label: 'Sédentaire' },
        { value: 'leger', label: 'Léger (1-2 séances/sem)' },
        { value: 'modere', label: 'Modéré (3-4 séances/sem)' },
        { value: 'tres-actif', label: 'Très actif (5+ séances/sem)' },
      ]}
      nextHref="/onboarding/nutri-repas"
    />
  );
}
