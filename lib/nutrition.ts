/**
 * Calcul des besoins nutritionnels.
 * Estimation, à ajuster selon les résultats réels.
 * 100 % déterministe : les mêmes entrées produisent toujours les mêmes cibles.
 */
import type { AgeRange, Gender, NutriIntent, QuizAnswers } from './store';

export type NutritionGoal = 'masse' | 'seche' | 'maintien';

export type ActivityLevel = 'sedentaire' | 'leger' | 'modere' | 'tres-actif';

export type NutritionProfile = {
  poidsKg: number;
  tailleCm: number;
  age: number;
  sexe: Gender;
  activite: ActivityLevel;
  goal: NutritionGoal;
};

export type NutritionTargets = {
  calories: number;
  proteinesG: number;
  glucidesG: number;
  lipidesG: number;
};

/** Un repas enregistré dans le journal du jour. */
export type MealEntry = {
  id: string;
  nom: string;
  calories: number;
  proteinesG: number;
  glucidesG: number;
  lipidesG: number;
};

/** Facteurs d'activité : sédentaire 1.2 → très actif 1.725. */
const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentaire: 1.2,
  leger: 1.375,
  modere: 1.55,
  'tres-actif': 1.725,
};

/** Ajustement selon l'objectif : masse +12 % (10-15), sèche -18 % (15-20), maintien 0. */
const GOAL_FACTORS: Record<NutritionGoal, number> = {
  masse: 1.12,
  seche: 0.82,
  maintien: 1,
};

/** Âge représentatif (milieu de tranche) à partir de la réponse du quiz. */
export function ageFromRange(range: AgeRange): number {
  switch (range) {
    case '13-17':
      return 15;
    case '18-24':
      return 21;
    case '25-34':
      return 30;
    case '35-44':
      return 40;
    case '45+':
      return 50;
  }
}

/** Objectif d'onboarding → objectif de calcul (recomposition = sèche douce). */
export const NUTRI_GOAL_MAP: Record<NutriIntent, NutritionGoal> = {
  masse: 'masse',
  maintien: 'maintien',
  perte: 'seche',
  'mieux-manger': 'maintien',
};

/**
 * Profil nutrition dérivé des réponses d'onboarding (null si incomplet).
 * Utilisé par les écrans d'analyse — Mifflin-St Jeor via computeTargets.
 */
export function buildProfileFromAnswers(answers: QuizAnswers): NutritionProfile | null {
  if (!answers.poidsKg || !answers.heightCm || !answers.ageRange) return null;
  return {
    poidsKg: answers.poidsKg,
    tailleCm: answers.heightCm,
    age: ageFromRange(answers.ageRange),
    sexe: answers.gender ?? 'autre',
    activite: answers.activite ?? 'modere',
    goal: NUTRI_GOAL_MAP[answers.nutriGoal ?? 'maintien'],
  };
}

export function computeTargets(profile: NutritionProfile): NutritionTargets {
  const { poidsKg, tailleCm, age, sexe, activite, goal } = profile;

  // BMR — Mifflin-St Jeor. Constante sexe : +5 homme, -161 femme,
  // moyenne des deux (-78) pour « autre ».
  const sexConstant = sexe === 'homme' ? 5 : sexe === 'femme' ? -161 : -78;
  const bmr = 10 * poidsKg + 6.25 * tailleCm - 5 * age + sexConstant;

  const maintenance = bmr * ACTIVITY_FACTORS[activite];
  const calories = Math.round(maintenance * GOAL_FACTORS[goal]);

  // Protéines ~1.8 g/kg, lipides ~25 % des calories (9 kcal/g),
  // glucides = le reste (4 kcal/g).
  const proteinesG = Math.round(poidsKg * 1.8);
  const lipidesG = Math.round((calories * 0.25) / 9);
  const glucidesG = Math.round(
    Math.max(0, calories - proteinesG * 4 - lipidesG * 9) / 4,
  );

  return { calories, proteinesG, glucidesG, lipidesG };
}
