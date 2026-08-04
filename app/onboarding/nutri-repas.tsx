import { useTranslation } from 'react-i18next';

import { QuizSingleSelectScreen } from '@/components/QuizSingleSelectScreen';
import { questionCount, questionStep } from '@/lib/onboarding-flow';
import { useOnboardingStore } from '@/lib/store';

/** Nutrition 3/5 — nombre de repas par jour. */
export default function NutriRepasScreen() {
  const { t } = useTranslation();
  const intention = useOnboardingStore((state) => state.answers.intention);
  return (
    <QuizSingleSelectScreen
      step={questionStep(intention, 'repas')}
      total={questionCount(intention)}
      title={t('onboarding.mealsTitle')}
      answerKey="mealsPerDay"
      options={[
        { value: 2, label: t('onboarding.meals2') },
        { value: 3, label: t('onboarding.meals3') },
        { value: 4, label: t('onboarding.meals4') },
        { value: 5, label: t('onboarding.meals5plus') },
      ]}
      nextHref="/onboarding/nutri-poids"
    />
  );
}
