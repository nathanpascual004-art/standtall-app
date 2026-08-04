import { useTranslation } from 'react-i18next';

import { QuizSingleSelectScreen } from '@/components/QuizSingleSelectScreen';
import { questionCount, questionStep } from '@/lib/onboarding-flow';
import { useOnboardingStore } from '@/lib/store';

/** Nutrition 5/5 — plus grosse difficulté (personnalise les copies). */
export default function NutriDifficulteScreen() {
  const { t } = useTranslation();
  const intention = useOnboardingStore((state) => state.answers.intention);
  return (
    <QuizSingleSelectScreen
      step={questionStep(intention, 'difficulte')}
      total={questionCount(intention)}
      title={t('onboarding.difficultyTitle')}
      answerKey="difficulty"
      options={[
        { value: 'temps', label: t('onboarding.difficultyTime') },
        { value: 'quoi-manger', label: t('onboarding.difficultyWhat') },
        { value: 'grignote', label: t('onboarding.difficultySnacking') },
        { value: 'calories', label: t('onboarding.difficultyTracking') },
      ]}
      nextHref="/onboarding/analyse-nutrition"
    />
  );
}
