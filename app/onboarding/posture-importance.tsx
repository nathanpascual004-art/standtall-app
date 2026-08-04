import { useTranslation } from 'react-i18next';

import { QuizSingleSelectScreen } from '@/components/QuizSingleSelectScreen';
import { questionCount, questionStep } from '@/lib/onboarding-flow';
import { useOnboardingStore } from '@/lib/store';

/** Posture 6/6 — importance de se tenir droit / paraître plus grand. */
export default function ImportanceScreen() {
  const { t } = useTranslation();
  const intention = useOnboardingStore((state) => state.answers.intention);
  return (
    <QuizSingleSelectScreen
      step={questionStep(intention, 'importance')}
      total={questionCount(intention)}
      title={t('onboarding.importanceTitle')}
      answerKey="importance"
      options={[
        { value: 0, label: t('onboarding.importanceLow') },
        { value: 1, label: t('onboarding.importanceMedium') },
        { value: 2, label: t('onboarding.importanceHigh') },
        { value: 3, label: t('onboarding.importanceTop') },
      ]}
      nextHref="/onboarding/analyse-posture"
    />
  );
}
