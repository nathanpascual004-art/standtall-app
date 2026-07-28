import type { QuizAnswers } from './store';

/**
 * Calcul du score de posture (0–100) à partir des réponses du quiz.
 * Heuristique de départ : on part d'une base haute et chaque signal
 * de posture dégradée retire des points. La formule sera affinée
 * (photo de profil, analyse de courbure) dans les écrans suivants.
 */
export function computePostureScore(answers: QuizAnswers): number {
  let score = 92;

  if (answers.postureType === 'legerement-voute') score -= 12;
  if (answers.postureType === 'tres-voute') score -= 24;

  if (answers.forwardHead === 'parfois') score -= 6;
  if (answers.forwardHead === 'souvent') score -= 12;

  if (answers.pain === 'parfois') score -= 6;
  if (answers.pain === 'regulieres') score -= 12;

  if (answers.roundedShoulders === 'un-peu') score -= 6;
  if (answers.roundedShoulders === 'oui') score -= 12;

  if (answers.sittingHours === '4-8') score -= 5;
  if (answers.sittingHours === '8-plus') score -= 10;

  return clampScore(score);
}

/**
 * Stature potentielle récupérable en cm — la posture tasse la colonne
 * et enroule les épaules ; le redressement et la décompression rendent
 * une partie de cette stature perdue.
 */
export function computeRecoverableCm(answers: QuizAnswers): number {
  const score = computePostureScore(answers);
  const potential = ((100 - score) / 100) * 4.5;
  return Math.round(Math.max(0.5, Math.min(4.5, potential)) * 10) / 10;
}

export function clampScore(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)));
}
