/**
 * Parcours — le programme affiché en chemin vertical (niveaux → jours).
 *
 * AUCUN contenu inventé : chaque jour pointe vers une des séances réelles
 * de lib/program.ts (rotation Redressement → Anti-tête → Mobilité). Le
 * parcours change l'AFFICHAGE et la structure de progression, pas les
 * exercices.
 *
 * Honnêteté : niveaux et trophées récompensent la régularité et la
 * posture — jamais une promesse de centimètres.
 */
import { SESSIONS, type Session } from './program';
import { dayDiffInDays } from './progress';

export const DAYS_PER_LEVEL = 7;
export const JOURNEY_LEVELS = 4;
/** Longueur totale du programme (compte à rebours honnête). */
export const JOURNEY_DAY_COUNT = DAYS_PER_LEVEL * JOURNEY_LEVELS;

/** Intitulés de niveau sobres (pas d'emoji piment, pas de « croissance »). */
export const LEVEL_LABELS = ['Fondations', 'Consolidation', 'Renforcement', 'Maîtrise'] as const;

export type JourneyDay = {
  /** Index global 0-based (0 = Jour 1). */
  index: number;
  /** Niveau 1-based. */
  level: number;
  /** Jour dans le niveau, 1-based (1..7). */
  dayInLevel: number;
  session: Session;
};

export type JourneyLevel = {
  level: number;
  label: string;
  days: JourneyDay[];
};

/** Séance réelle du jour n (rotation sur les séances existantes). */
export function sessionForDay(index: number): Session {
  return SESSIONS[((index % SESSIONS.length) + SESSIONS.length) % SESSIONS.length];
}

/** Le parcours complet, statique et dérivé de lib/program.ts. */
export function buildJourney(): JourneyLevel[] {
  return Array.from({ length: JOURNEY_LEVELS }, (_, l) => ({
    level: l + 1,
    label: LEVEL_LABELS[Math.min(l, LEVEL_LABELS.length - 1)],
    days: Array.from({ length: DAYS_PER_LEVEL }, (_, d) => {
      const index = l * DAYS_PER_LEVEL + d;
      return { index, level: l + 1, dayInLevel: d + 1, session: sessionForDay(index) };
    }),
  }));
}

// ── Progression (persistée dans le store) ───────────────────────────────
export type JourneyState = {
  /** Index du jour COURANT (0-based) — les jours < day sont faits. */
  day: number;
  /** Dernier jour local (« YYYY-MM-DD ») où le parcours a avancé. */
  lastAdvanceDay: string | null;
};

export const INITIAL_JOURNEY: JourneyState = { day: 0, lastAdvanceDay: null };

/**
 * Avance d'un nœud à la complétion d'une séance — au plus UNE fois par
 * jour calendaire (le parcours est un rythme quotidien, pas un compteur
 * de séances), plafonné à la fin du programme. Une horloge qui recule
 * (fuseau) n'avance ni ne recule rien.
 */
export function advanceJourney(journey: JourneyState, dayKey: string): JourneyState {
  if (journey.day >= JOURNEY_DAY_COUNT) return journey;
  if (journey.lastAdvanceDay) {
    const diff = dayDiffInDays(journey.lastAdvanceDay, dayKey);
    if (diff <= 0) return journey; // déjà avancé aujourd'hui (ou horloge qui recule)
  }
  return { day: journey.day + 1, lastAdvanceDay: dayKey };
}

export type JourneyNodeState = 'done' | 'current' | 'locked';

export function nodeState(journey: JourneyState, index: number): JourneyNodeState {
  if (index < journey.day) return 'done';
  if (index === journey.day) return 'current';
  return 'locked';
}

/** Le trophée d'un niveau est débloqué quand tous ses jours sont faits. */
export function levelTrophyUnlocked(journey: JourneyState, level: number): boolean {
  return journey.day >= level * DAYS_PER_LEVEL;
}

/** Nombre de jours faits dans un niveau (pour la jauge « jour x / 7 »). */
export function daysDoneInLevel(journey: JourneyState, level: number): number {
  return Math.max(0, Math.min(DAYS_PER_LEVEL, journey.day - (level - 1) * DAYS_PER_LEVEL));
}
