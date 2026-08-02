/**
 * Conseil du jour — liste STATIQUE de conseils honnêtes qui tourne par
 * jour (déterministe : même jour → même conseil). Angle carburant /
 * récupération / muscle / sommeil — jamais « os », « grandir » ou un ton
 * culpabilisant.
 */

export const NUTRITION_TIPS = [
  'Ajoute une source de protéines à ton prochain repas — ton muscle récupère mieux.',
  'Un verre d\'eau à chaque pause écran : l\'hydratation aide la récupération.',
  'Répartis tes protéines sur la journée plutôt qu\'en un seul repas.',
  'Après une séance, un vrai repas dans les 2 heures aide tes muscles à récupérer.',
  'Couche-toi 30 minutes plus tôt ce soir : le sommeil, c\'est là que le corps se répare.',
  'Ajoute des légumes à ton assiette — fibres et micronutriments soutiennent l\'énergie.',
  'Mange lentement : la satiété met 15-20 minutes à arriver.',
  'Moins d\'écrans avant de dormir = meilleur sommeil = meilleure récupération.',
] as const;

/** Conseil du jour, dérivé de la clé locale « YYYY-MM-DD ». */
export function tipOfDay(dayKey: string): string {
  const [y, m, d] = dayKey.split('-').map(Number);
  const dayNumber = Math.floor(Date.UTC(y, (m ?? 1) - 1, d ?? 1) / 86_400_000);
  return NUTRITION_TIPS[((dayNumber % NUTRITION_TIPS.length) + NUTRITION_TIPS.length) % NUTRITION_TIPS.length];
}
