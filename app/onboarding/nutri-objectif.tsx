import { useTranslation } from 'react-i18next';

import { QuizSingleSelectScreen } from '@/components/QuizSingleSelectScreen';
import { questionCount, questionStep } from '@/lib/onboarding-flow';
import { useOnboardingStore } from '@/lib/store';

/** Nutrition 1/5 — objectif. */
export default function NutriObjectifScreen() {
  const { t } = useTranslation();
  const intention = useOnboardingStore((state) => state.answers.intention);
  return (
    <QuizSingleSelectScreen
      step={questionStep(intention, 'objectif')}
      total={questionCount(intention)}
      title={t('onboarding.goalTitle')}
      answerKey="nutriGoal"
      options={[
        { value: 'masse', label: t('onboarding.goalMass') },
        { value: 'maintien', label: t('onboarding.goalMaintain') },
        { value: 'perte', label: t('onboarding.goalRecomp') },
        { value: 'mieux-manger', label: t('onboarding.goalEatBetter') },
      ]}
      nextHref="/onboarding/nutri-activite"
    />
  );
}
