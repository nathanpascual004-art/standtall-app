import { useEffect } from 'react';

import { AnalysisScreen } from '@/components/AnalysisScreen';
import { ageFromRange, computeTargets, type NutritionProfile } from '@/lib/nutrition';
import { useOnboardingStore, type NutriIntent } from '@/lib/store';

/** Objectif d'onboarding → objectif de calcul (perte = sèche, mieux manger = maintien). */
const GOAL_MAP: Record<NutriIntent, NutritionProfile['goal']> = {
  masse: 'masse',
  maintien: 'maintien',
  perte: 'seche',
  'mieux-manger': 'maintien',
};

/**
 * Analyse 3 — calcul RÉEL des besoins (Mifflin-St Jeor) pendant que
 * l'écran « tourne » : le profil nutrition est posé dans le store, donc
 * l'onglet Nutrition est prêt dès la fin de l'onboarding.
 */
export default function AnalyseNutritionScreen() {
  const answers = useOnboardingStore((state) => state.answers);
  const setNutritionProfile = useOnboardingStore((state) => state.setNutritionProfile);

  useEffect(() => {
    if (!answers.poidsKg || !answers.heightCm || !answers.ageRange) return;
    const profile: NutritionProfile = {
      poidsKg: answers.poidsKg,
      tailleCm: answers.heightCm,
      age: ageFromRange(answers.ageRange),
      sexe: answers.gender ?? 'autre',
      activite: answers.activite ?? 'modere',
      goal: GOAL_MAP[answers.nutriGoal ?? 'maintien'],
    };
    setNutritionProfile(profile, computeTargets(profile));
    // Volontairement au montage uniquement : les réponses sont figées ici.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AnalysisScreen
      steps={['Calcul de tes besoins nutritionnels…']}
      durationMs={2200}
      nextHref="/onboarding/analyse-finale"
    />
  );
}
