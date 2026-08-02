import { QuizSingleSelectScreen } from '@/components/QuizSingleSelectScreen';
import { questionCount, questionStep } from '@/lib/onboarding-flow';
import { useOnboardingStore } from '@/lib/store';

/** Écran 3 — sexe (adapte les calculs nutrition et le personnage). */
export default function SexeScreen() {
  const intention = useOnboardingStore((state) => state.answers.intention);
  return (
    <QuizSingleSelectScreen
      step={questionStep(intention, 'sexe')}
      total={questionCount(intention)}
      title="Ton sexe ?"
      answerKey="gender"
      options={[
        { value: 'homme', label: 'Homme' },
        { value: 'femme', label: 'Femme' },
        { value: 'autre', label: 'Autre / je préfère ne pas dire' },
      ]}
      nextHref="/onboarding/profil-age"
    />
  );
}
