import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { AnalysisScreen } from '@/components/AnalysisScreen';
import { buildProfileFromAnswers, computeTargets } from '@/lib/nutrition';
import { hasNutrition, hasPosture, routeAfterFinale } from '@/lib/onboarding-flow';
import { computePostureResult } from '@/lib/posture';
import { useOnboardingStore } from '@/lib/store';

const SITTING_KEYS = {
  'moins-4': 'onboarding.sittingUnder4',
  '4-8': 'onboarding.sitting4to8',
  '8-plus': 'onboarding.sittingOver8',
} as const;

const AGE_KEYS = {
  '13-17': 'onboarding.age1317',
  '18-24': 'onboarding.age1824',
  '25-34': 'onboarding.age2534',
  '35-44': 'onboarding.age3544',
  '45+': 'onboarding.age45plus',
} as const;

/**
 * Phase 4 — l'analyse finale : grand cercle 0→100 % et étapes cochées
 * avec les VRAIES infos de l'utilisateur (le théâtre est dans le timing,
 * pas dans les données).
 */
export default function AnalyseFinaleScreen() {
  const { t } = useTranslation();
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
    answers.gender === 'homme'
      ? t('onboarding.finaleSexMale')
      : answers.gender === 'femme'
        ? t('onboarding.finaleSexFemale')
        : t('onboarding.finaleSexOther');
  const age = answers.ageRange ? t(AGE_KEYS[answers.ageRange]) : '—';

  const steps = [
    t('onboarding.finaleStepProfile', { sex: sexe, age, height: answers.heightCm ?? '—' }),
    ...(hasPosture(intention)
      ? [
          t('onboarding.finaleStepPosture', {
            sitting: answers.sittingHours ? t(SITTING_KEYS[answers.sittingHours]) : '—',
          }),
          t('onboarding.finaleStepFullHeight'),
        ]
      : []),
    ...(hasNutrition(intention) && targets
      ? [
          t('onboarding.finaleStepNeeds', {
            kcal: targets.calories,
            protein: targets.proteinesG,
          }),
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
      footnote={t('onboarding.finaleFootnote')}
      nextHref={routeAfterFinale(intention)}
    />
  );
}
