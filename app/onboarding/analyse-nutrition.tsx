import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { AnalysisScreen } from '@/components/AnalysisScreen';
import { buildProfileFromAnswers, computeTargets } from '@/lib/nutrition';
import { useOnboardingStore } from '@/lib/store';

/**
 * Analyse 3 — calcul RÉEL des besoins (Mifflin-St Jeor) pendant que
 * l'écran « tourne » : le profil nutrition est posé dans le store, donc
 * l'onglet Nutrition est prêt dès la fin de l'onboarding.
 */
export default function AnalyseNutritionScreen() {
  const { t } = useTranslation();
  const answers = useOnboardingStore((state) => state.answers);
  const setNutritionProfile = useOnboardingStore((state) => state.setNutritionProfile);

  useEffect(() => {
    const profile = buildProfileFromAnswers(answers);
    if (!profile) return;
    setNutritionProfile(profile, computeTargets(profile));
    // Volontairement au montage uniquement : les réponses sont figées ici.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AnalysisScreen
      steps={[t('onboarding.analysisNutritionStep')]}
      durationMs={2200}
      nextHref="/onboarding/analyse-finale"
    />
  );
}
