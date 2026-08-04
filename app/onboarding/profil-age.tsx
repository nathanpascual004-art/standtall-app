import { useTranslation } from 'react-i18next';

import { QuizSingleSelectScreen } from '@/components/QuizSingleSelectScreen';
import { questionCount, questionStep } from '@/lib/onboarding-flow';
import { useOnboardingStore } from '@/lib/store';

/** Écran 4 — âge. */
export default function AgeScreen() {
  const { t } = useTranslation();
  const intention = useOnboardingStore((state) => state.answers.intention);
  return (
    <QuizSingleSelectScreen
      step={questionStep(intention, 'age')}
      total={questionCount(intention)}
      title={t('onboarding.ageTitle')}
      answerKey="ageRange"
      options={[
        { value: '13-17', label: t('onboarding.age1317') },
        { value: '18-24', label: t('onboarding.age1824') },
        { value: '25-34', label: t('onboarding.age2534') },
        { value: '35-44', label: t('onboarding.age3544') },
        { value: '45+', label: t('onboarding.age45plus') },
      ]}
      nextHref="/onboarding/profil-taille"
    />
  );
}
