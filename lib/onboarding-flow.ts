/**
 * Branchement du nouvel onboarding — l'intention (écran 2) pilote tout.
 *
 *   posture   : commun → bloc posture → analyse finale → projection → email
 *   nutrition : commun → bloc nutrition → analyse finale → email (pas de
 *               projection : aucune donnée posture, on reste honnête)
 *   both      : commun → posture → nutrition → analyse finale → projection → email
 *
 * La barre de progression ne compte que les VRAIES questions (pas les
 * écrans d'analyse) — ses totaux dépendent donc de la branche.
 */

export type Intention = 'posture' | 'nutrition' | 'both';

/** Questions par bloc, dans l'ordre d'affichage. */
const COMMON_QUESTIONS = ['intention', 'sexe', 'age', 'taille'] as const;
const POSTURE_QUESTIONS = [
  'assis', 'telephone', 'tenue', 'tensions', 'percu', 'importance',
] as const;
const NUTRITION_QUESTIONS = [
  'objectif', 'activite', 'repas', 'poids', 'difficulte',
] as const;

export type QuestionId =
  | (typeof COMMON_QUESTIONS)[number]
  | (typeof POSTURE_QUESTIONS)[number]
  | (typeof NUTRITION_QUESTIONS)[number];

export const hasPosture = (intention: Intention | undefined) =>
  intention === 'posture' || intention === 'both';
export const hasNutrition = (intention: Intention | undefined) =>
  intention === 'nutrition' || intention === 'both';

/** Liste ordonnée des questions pour une intention. */
export function questionList(intention: Intention | undefined): QuestionId[] {
  return [
    ...COMMON_QUESTIONS,
    ...(hasPosture(intention) ? POSTURE_QUESTIONS : []),
    ...(hasNutrition(intention) ? NUTRITION_QUESTIONS : []),
  ];
}

/** Nombre total de questions de la branche (pour la barre). */
export function questionCount(intention: Intention | undefined): number {
  return questionList(intention).length;
}

/** Position (1-based) d'une question dans la branche. */
export function questionStep(intention: Intention | undefined, id: QuestionId): number {
  const index = questionList(intention).indexOf(id);
  return index === -1 ? 1 : index + 1;
}

// ── Routage entre blocs (les écrans d'analyse aiguillent ici) ───────────
/** Après l'analyse du profil commun. */
export function routeAfterProfil(intention: Intention | undefined): string {
  return hasPosture(intention) ? '/onboarding/posture-assis' : '/onboarding/nutri-objectif';
}

/** Après l'analyse du bloc posture. */
export function routeAfterPosture(intention: Intention | undefined): string {
  return hasNutrition(intention) ? '/onboarding/nutri-objectif' : '/onboarding/analyse-finale';
}

/** Après l'analyse finale : la projection n'a de sens qu'avec la posture. */
export function routeAfterFinale(intention: Intention | undefined): string {
  return hasPosture(intention) ? '/onboarding/projection-avant' : '/onboarding/email';
}
