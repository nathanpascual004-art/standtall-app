import { useTranslation } from 'react-i18next';

import { QuizSingleSelectScreen } from '@/components/QuizSingleSelectScreen';
import { questionCount, questionStep } from '@/lib/onboarding-flow';
import { useOnboardingStore } from '@/lib/store';

/** Écran 3 — sexe (adapte les calculs nutrition et le personnage). */
export default function SexeScreen() {
  const { t } = useTranslation();
  const intention = useOnboardingStore((state) => state.answers.intention);
  return (
    <QuizSingleSelectScreen
      step={questionStep(intention, 'sexe')}
      total={questionCount(intention)}
      title={t('onboarding.sexTitle')}
      answerKey="gender"
      options={[
        { value: 'homme', label: t('onboarding.sexMale') },
        { value: 'femme', label: t('onboarding.sexFemale') },
        { value: 'autre', label: t('onboarding.sexOther') },
      ]}
      nextHref="/onboarding/profil-age"
    />
  );
}
