import { AnalysisScreen } from '@/components/AnalysisScreen';
import { routeAfterPosture } from '@/lib/onboarding-flow';
import { useOnboardingStore } from '@/lib/store';

/** Analyse 2 — après le bloc posture (2 étapes qui défilent, ~2,6 s). */
export default function AnalysePostureScreen() {
  const intention = useOnboardingStore((state) => state.answers.intention);
  return (
    <AnalysisScreen
      steps={['Évaluation de ta posture…', 'Estimation de ta pleine hauteur…']}
      durationMs={2600}
      nextHref={routeAfterPosture(intention)}
    />
  );
}
