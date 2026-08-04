import { useTranslation } from 'react-i18next';

import { QuizSingleSelectScreen } from '@/components/QuizSingleSelectScreen';
import { questionCount, questionStep } from '@/lib/onboarding-flow';
import { useOnboardingStore } from '@/lib/store';

/** Posture 3/6 — auto-description de la posture. */
export default function TenueScreen() {
  const { t } = useTranslation();
  const intention = useOnboardingStore((state) => state.answers.intention);
  return (
    <QuizSingleSelectScreen
      step={questionStep(intention, 'tenue')}
      total={questionCount(intention)}
      title={t('onboarding.postureTitle')}
      answerKey="postureType"
      options={[
        { value: 'droit', label: t('onboarding.postureStraight') },
        { value: 'legerement-voute', label: t('onboarding.postureSlightlySlouched') },
        { value: 'tres-voute', label: t('onboarding.postureVerySlouched') },
      ]}
      nextHref="/onboarding/posture-tensions"
    />
  );
}
