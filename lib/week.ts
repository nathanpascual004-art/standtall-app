/**
 * Semaine courante (lundi → dimanche) en clés locales « YYYY-MM-DD » —
 * pour la rangée L M M J V S D du Programme et les stats hebdo.
 */
import { localDayKey } from './progress';

export const WEEK_LETTERS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'] as const;

/** Les 7 clés de jour de la semaine courante, lundi en premier. */
export function currentWeekKeys(now: Date = new Date()): string[] {
  const monday = new Date(now);
  // getDay() : 0 = dimanche … 6 = samedi → recul jusqu'au lundi.
  const shift = (now.getDay() + 6) % 7;
  monday.setDate(now.getDate() - shift);
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    return localDayKey(day);
  });
}
