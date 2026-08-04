import { useTranslation } from 'react-i18next';

import { AnalysisScreen } from '@/components/AnalysisScreen';
import { routeAfterProfil } from '@/lib/onboarding-flow';
import { useOnboardingStore } from '@/lib/store';

/** Analyse 1 — après le profil commun (~2 s), puis branche posture/nutrition. */
export default function AnalyseProfilScreen() {
  const { t } = useTranslation();
  const intention = useOnboardingStore((state) => state.answers.intention);
  return (
    <AnalysisScreen
      steps={[t('onboarding.analysisProfileStep')]}
      durationMs={2000}
      nextHref={routeAfterProfil(intention)}
    />
  );
}
