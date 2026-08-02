import { AnalysisScreen } from '@/components/AnalysisScreen';
import { routeAfterProfil } from '@/lib/onboarding-flow';
import { useOnboardingStore } from '@/lib/store';

/** Analyse 1 — après le profil commun (~2 s), puis branche posture/nutrition. */
export default function AnalyseProfilScreen() {
  const intention = useOnboardingStore((state) => state.answers.intention);
  return (
    <AnalysisScreen
      steps={['Analyse de ton profil…']}
      durationMs={2000}
      nextHref={routeAfterProfil(intention)}
    />
  );
}
