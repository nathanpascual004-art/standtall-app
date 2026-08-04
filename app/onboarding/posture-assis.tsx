import { useTranslation } from 'react-i18next';

import { QuizSingleSelectScreen } from '@/components/QuizSingleSelectScreen';
import { questionCount, questionStep } from '@/lib/onboarding-flow';
import { useOnboardingStore } from '@/lib/store';

/** Posture 1/6 — heures assis par jour. */
export default function AssisScreen() {
  const { t } = useTranslation();
  const intention = useOnboardingStore((state) => state.answers.intention);
  return (
    <QuizSingleSelectScreen
      step={questionStep(intention, 'assis')}
      total={questionCount(intention)}
      title={t('onboarding.sittingTitle')}
      answerKey="sittingHours"
      options={[
        { value: 'moins-4', label: t('onboarding.sittingUnder4') },
        { value: '4-8', label: t('onboarding.sitting4to8') },
        { value: '8-plus', label: t('onboarding.sittingOver8') },
      ]}
      nextHref="/onboarding/posture-telephone"
    />
  );
}
