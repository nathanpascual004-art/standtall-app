import { useTranslation } from 'react-i18next';

import { QuizSingleSelectScreen } from '@/components/QuizSingleSelectScreen';
import { questionCount, questionStep } from '@/lib/onboarding-flow';
import { useOnboardingStore } from '@/lib/store';

/** Posture 2/6 — temps de téléphone par jour (signal tête penchée). */
export default function TelephoneScreen() {
  const { t } = useTranslation();
  const intention = useOnboardingStore((state) => state.answers.intention);
  return (
    <QuizSingleSelectScreen
      step={questionStep(intention, 'telephone')}
      total={questionCount(intention)}
      title={t('onboarding.phoneTitle')}
      answerKey="phoneHours"
      options={[
        { value: 'moins-2', label: t('onboarding.phoneUnder2') },
        { value: '2-5', label: t('onboarding.phone2to5') },
        { value: '5-plus', label: t('onboarding.phoneOver5') },
      ]}
      nextHref="/onboarding/posture-tenue"
    />
  );
}
