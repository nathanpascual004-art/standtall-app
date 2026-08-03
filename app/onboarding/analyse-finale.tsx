import { useEffect, useMemo } from 'react';

import { AnalysisScreen } from '@/components/AnalysisScreen';
import { buildProfileFromAnswers, computeTargets } from '@/lib/nutrition';
import { hasNutrition, hasPosture, routeAfterFinale } from '@/lib/onboarding-flow';
import { computePostureResult } from '@/lib/posture';
import { useOnboardingStore } from '@/lib/store';

const SITTING_LABELS = {
  'moins-4': 'moins de 4 h',
  '4-8': '4-8 h',
  '8-plus': '8 h+',
} as const;

const AGE_LABELS = {
  '13-17': '13-17 ans',
  '18-24': '18-24 ans',
  '25-34': '25-34 ans',
  '35-44': '35-44 ans',
  '45+': '45 ans+',
} as const;

/**
 * Phase 4 — l'analyse finale : grand cercle 0→100 % et étapes cochées
 * avec les VRAIES infos de l'utilisateur (le théâtre est dans le timing,
 * pas dans les données).
 */
export default function AnalyseFinaleScreen() {
  const answers = useOnboardingStore((state) => state.answers);
  const setNutritionProfile = useOnboardingStore((state) => state.setNutritionProfile);
  const intention = answers.intention;

  // Calculé ici (et pas lu du store) : « Les deux » saute l'analyse
  // nutrition intermédiaire, cet écran est donc le seul chargement.
  const profile = useMemo(() => buildProfileFromAnswers(answers), [answers]);
  const targets = useMemo(() => (profile ? computeTargets(profile) : null), [profile]);

  useEffect(() => {
    if (!hasNutrition(intention) || !profile || !targets) return;
    setNutritionProfile(profile, targets);
    // Volontairement au montage uniquement : les réponses sont figées ici.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sexe =
    answers.gender === 'homme' ? 'homme' : answers.gender === 'femme' ? 'femme' : 'profil';
  const age = answers.ageRange ? AGE_LABELS[answers.ageRange] : '—';

  const steps = [
    `Profil analysé (${sexe}, ${age}, ${answers.heightCm ?? '—'} cm)`,
    ...(hasPosture(intention)
      ? [
          `Posture évaluée (${
            answers.sittingHours ? SITTING_LABELS[answers.sittingHours] : '—'
          } assis/jour détecté)`,
          'Ta pleine hauteur estimée',
        ]
      : []),
    ...(hasNutrition(intention) && targets
      ? [
          `Besoins calculés : ~${targets.calories} kcal · ${targets.proteinesG} g de protéines`,
        ]
      : []),
  ];

  // Le résultat est déjà réel ici (déterministe) — l'écran ne fait que le présenter.
  void computePostureResult(answers);

  return (
    <AnalysisScreen
      steps={steps}
      durationMs={3600}
      circle
      mascotState="encourage"
      footnote="On croise tes réponses pour te faire un bilan personnalisé…"
      nextHref={routeAfterFinale(intention)}
    />
  );
}
