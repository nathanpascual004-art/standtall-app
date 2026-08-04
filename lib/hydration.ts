/**
 * Hydratation — état simple : nombre de verres bus par jour (clé locale
 * « YYYY-MM-DD » dans le store), objectif 2 L par défaut. La remise à
 * zéro quotidienne est automatique : chaque jour a sa propre clé.
 */
import { currentLanguage, type AppLanguage } from './i18n';

/** Un verre = 250 ml. */
export const GLASS_ML = 250;
/** Objectif quotidien par défaut. */
export const WATER_GOAL_ML = 2000;
/** Garde-fou de saisie (personne ne journalise 30 verres). */
export const MAX_GLASSES_PER_DAY = 20;

export function waterMl(glasses: number): number {
  return Math.max(0, glasses) * GLASS_ML;
}

/** 0-1 pour la barre de progression. */
export function waterRatio(glasses: number): number {
  return Math.max(0, Math.min(1, waterMl(glasses) / WATER_GOAL_ML));
}

/** « 1,25 / 2 L » (FR) ou « 1.25 / 2 L » (EN) — selon la langue active. */
export function formatWater(glasses: number, lang: AppLanguage = currentLanguage()): string {
  const liters = waterMl(glasses) / 1000;
  const goal = WATER_GOAL_ML / 1000;
  const format = (value: number) => {
    const text = (Math.round(value * 100) / 100).toString();
    return lang === 'fr' ? text.replace('.', ',') : text;
  };
  return `${format(liters)} / ${format(goal)} L`;
}
