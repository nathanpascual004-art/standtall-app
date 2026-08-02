import { AnalysisScreen } from '@/components/AnalysisScreen';
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
  const targets = useOnboardingStore((state) => state.nutritionTargets);
  const intention = answers.intention;

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
      ? [`Besoins calculés : ~${targets.calories} kcal`]
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
