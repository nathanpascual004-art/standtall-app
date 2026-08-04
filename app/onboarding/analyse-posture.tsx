import { useTranslation } from 'react-i18next';

import { AnalysisScreen } from '@/components/AnalysisScreen';
import { routeAfterPosture } from '@/lib/onboarding-flow';
import { useOnboardingStore } from '@/lib/store';

/** Analyse 2 — après le bloc posture (2 étapes qui défilent, ~2,6 s). */
export default function AnalysePostureScreen() {
  const { t } = useTranslation();
  const intention = useOnboardingStore((state) => state.answers.intention);
  return (
    <AnalysisScreen
      steps={[t('onboarding.analysisPostureStep1'), t('onboarding.analysisPostureStep2')]}
      durationMs={2600}
      nextHref={routeAfterPosture(intention)}
    />
  );
}
