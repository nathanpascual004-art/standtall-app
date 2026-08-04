/**
 * Conseil du jour — liste STATIQUE de conseils honnêtes qui tourne par
 * jour (déterministe : même jour → même conseil). Angle carburant /
 * récupération / muscle / sommeil — jamais « os », « grandir » ou un ton
 * culpabilisant.
 */
import type { Localized } from './i18n';

export const NUTRITION_TIPS: Localized[] = [
  {
    fr: 'Ajoute une source de protéines à ton prochain repas — ton muscle récupère mieux.',
    en: 'Add a protein source to your next meal — your muscles recover better.',
  },
  {
    fr: "Un verre d'eau à chaque pause écran : l'hydratation aide la récupération.",
    en: 'A glass of water at every screen break: hydration supports recovery.',
  },
  {
    fr: "Répartis tes protéines sur la journée plutôt qu'en un seul repas.",
    en: 'Spread your protein across the day instead of one big meal.',
  },
  {
    fr: 'Après une séance, un vrai repas dans les 2 heures aide tes muscles à récupérer.',
    en: 'After a session, a real meal within 2 hours helps your muscles recover.',
  },
  {
    fr: "Couche-toi 30 minutes plus tôt ce soir : le sommeil, c'est là que le corps se répare.",
    en: 'Go to bed 30 minutes earlier tonight: sleep is when your body repairs itself.',
  },
  {
    fr: "Ajoute des légumes à ton assiette — fibres et micronutriments soutiennent l'énergie.",
    en: 'Add vegetables to your plate — fibre and micronutrients support your energy.',
  },
  {
    fr: 'Mange lentement : la satiété met 15-20 minutes à arriver.',
    en: 'Eat slowly: it takes 15-20 minutes to feel full.',
  },
  {
    fr: "Moins d'écrans avant de dormir = meilleur sommeil = meilleure récupération.",
    en: 'Fewer screens before bed = better sleep = better recovery.',
  },
];

/** Conseil du jour, dérivé de la clé locale « YYYY-MM-DD ». */
export function tipOfDay(dayKey: string): Localized {
  const [y, m, d] = dayKey.split('-').map(Number);
  const dayNumber = Math.floor(Date.UTC(y, (m ?? 1) - 1, d ?? 1) / 86_400_000);
  return NUTRITION_TIPS[((dayNumber % NUTRITION_TIPS.length) + NUTRITION_TIPS.length) % NUTRITION_TIPS.length];
}
