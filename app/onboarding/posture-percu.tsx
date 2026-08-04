import { useTranslation } from 'react-i18next';

import { QuizSingleSelectScreen } from '@/components/QuizSingleSelectScreen';
import { questionCount, questionStep } from '@/lib/onboarding-flow';
import { useOnboardingStore } from '@/lib/store';

/** Posture 5/6 — perception : « je me trouve plus petit que ma taille ». */
export default function PercuScreen() {
  const { t } = useTranslation();
  const intention = useOnboardingStore((state) => state.answers.intention);
  return (
    <QuizSingleSelectScreen
      step={questionStep(intention, 'percu')}
      total={questionCount(intention)}
      title={t('onboarding.feelSmallerTitle')}
      answerKey="feelSmaller"
      options={[
        { value: 0, label: t('onboarding.feelSmallerNo') },
        { value: 1, label: t('onboarding.feelSmallerLittle') },
        { value: 2, label: t('onboarding.feelSmallerOften') },
        { value: 3, label: t('onboarding.feelSmallerLot') },
      ]}
      nextHref="/onboarding/posture-importance"
    />
  );
}
