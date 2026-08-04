import { useTranslation } from 'react-i18next';

import { QuizSingleSelectScreen } from '@/components/QuizSingleSelectScreen';
import { questionCount, questionStep } from '@/lib/onboarding-flow';
import { useOnboardingStore } from '@/lib/store';

/** Nutrition 2/5 — niveau d'activité (facteur du calcul des besoins). */
export default function NutriActiviteScreen() {
  const { t } = useTranslation();
  const intention = useOnboardingStore((state) => state.answers.intention);
  return (
    <QuizSingleSelectScreen
      step={questionStep(intention, 'activite')}
      total={questionCount(intention)}
      title={t('onboarding.activityTitle')}
      answerKey="activite"
      options={[
        { value: 'sedentaire', label: t('onboarding.activitySedentary') },
        { value: 'leger', label: t('onboarding.activityLight') },
        { value: 'modere', label: t('onboarding.activityModerate') },
        { value: 'tres-actif', label: t('onboarding.activityVeryActive') },
      ]}
      nextHref="/onboarding/nutri-repas"
    />
  );
}
