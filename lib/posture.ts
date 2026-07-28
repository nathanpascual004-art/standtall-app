import type { QuizAnswers } from './store';

/**
 * Calcul du score de posture (0–100) à partir des réponses du quiz.
 * Stub pour l'instant : la formule sera affinée à mesure que les
 * écrans du quiz (et leurs réponses) seront validés.
 */
export function computePostureScore(answers: QuizAnswers): number {
  let score = 62;
  if (answers.goal === 'back-pain') score -= 8;
  if (answers.goal === 'posture') score -= 4;
  return clampScore(score);
}

export function clampScore(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)));
}
