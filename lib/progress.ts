/**
 * Progression — streak (la star), jokers, XP, niveaux, badges.
 *
 * Logique PURE : aucune date « maintenant » ici — les fonctions reçoivent
 * des clés de jour « YYYY-MM-DD » calculées en HEURE LOCALE de l'appareil
 * (via todayKey() du store), pour éviter les ruptures injustes à minuit
 * UTC. Les différences de jours se calculent en UTC sur les composantes
 * de la clé : insensibles aux changements d'heure (DST) et de fuseau.
 *
 * Honnêteté : les rangs et badges récompensent la RÉGULARITÉ et la
 * posture — jamais une promesse de centimètres.
 */

// ── Paramètres (v1 simple — faciles à ajuster) ──────────────────────────
export const SESSION_XP = 100;
export const EXERCISE_XP = 10;
/** Bonus d'XP tant que la série est active (≥ 2 jours) : +10 %. */
export const STREAK_XP_BONUS = 0.1;
export const INITIAL_FREEZES = 1;
export const MAX_FREEZES = 2;
/** Un joker regagné tous les 7 jours de série. */
export const FREEZE_EVERY_STREAK_DAYS = 7;

export type ProgressState = {
  /** Jours consécutifs avec au moins une séance complétée. */
  streak: number;
  bestStreak: number;
  /** Dernier jour actif, clé locale « YYYY-MM-DD » (null = jamais). */
  lastActiveDay: string | null;
  /** Jokers en réserve — un joker couvre UN jour raté. */
  freezes: number;
  xp: number;
  totalSessions: number;
  /** Ids des badges débloqués (voir BADGES). */
  badges: string[];
};

export const INITIAL_PROGRESS: ProgressState = {
  streak: 0,
  bestStreak: 0,
  lastActiveDay: null,
  freezes: INITIAL_FREEZES,
  xp: 0,
  totalSessions: 0,
  badges: [],
};

// ── Badges (jalons v1) ──────────────────────────────────────────────────
export type Badge = {
  id: string;
  titre: string;
  description: string;
  kind: 'streak' | 'sessions';
  seuil: number;
};

export const BADGES: Badge[] = [
  { id: 'premiere-seance', titre: 'Première séance', description: 'Ta toute première séance complétée.', kind: 'sessions', seuil: 1 },
  { id: 'streak-7', titre: 'Semaine complète', description: '7 jours d’affilée.', kind: 'streak', seuil: 7 },
  { id: 'streak-30', titre: 'Un mois sans lâcher', description: '30 jours d’affilée.', kind: 'streak', seuil: 30 },
  { id: 'streak-100', titre: 'Centurion du maintien', description: '100 jours d’affilée.', kind: 'streak', seuil: 100 },
  { id: 'seances-30', titre: '30 séances', description: '30 séances complétées au total.', kind: 'sessions', seuil: 30 },
  { id: 'seances-100', titre: '100 séances', description: '100 séances complétées au total.', kind: 'sessions', seuil: 100 },
];

// ── Rangs nommés (sobres, univers posture — jamais de cm promis) ────────
export const RANKS = [
  'Départ redressé', // niveau 1
  'Régulier',
  'Posture stable',
  'Bien ancré',
  'Discipliné',
  'Posture solide',
  'Port assuré',
  'Colonne d’acier',
  'Maître du maintien', // niveau 9 et au-delà
] as const;

export function rankForLevel(level: number): string {
  return RANKS[Math.max(0, Math.min(RANKS.length - 1, level - 1))];
}

// ── Niveaux : courbe 100 × niveau² (facile au début, plus lent ensuite) ─
/** XP cumulé requis pour ATTEINDRE un niveau (niveau 1 = départ, 0 XP). */
export function xpForLevel(level: number): number {
  return 100 * (level - 1) * (level - 1);
}

/** Niveau atteint pour un XP cumulé (≥ 1). */
export function levelForXp(xp: number): number {
  return Math.floor(Math.sqrt(Math.max(0, xp) / 100)) + 1;
}

/** Avancement vers le prochain niveau, pour la barre verticale. */
export function levelProgress(xp: number): {
  level: number;
  rank: string;
  /** XP gagné depuis le niveau courant. */
  current: number;
  /** XP nécessaire entre le niveau courant et le suivant. */
  needed: number;
  /** 0-1 pour la jauge. */
  ratio: number;
} {
  const level = levelForXp(xp);
  const floor = xpForLevel(level);
  const ceil = xpForLevel(level + 1);
  const needed = ceil - floor;
  const current = Math.max(0, xp - floor);
  return {
    level,
    rank: rankForLevel(level),
    current,
    needed,
    ratio: Math.max(0, Math.min(1, current / needed)),
  };
}

// ── Jours locaux ────────────────────────────────────────────────────────
/** Clé de jour « YYYY-MM-DD » en HEURE LOCALE de l'appareil. */
export function localDayKey(date: Date = new Date()): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/**
 * Différence en jours entiers entre deux clés (b - a). Calculée en UTC
 * sur les composantes : un changement d'heure (DST) ou de fuseau ne
 * produit jamais de journée de 23/25 h.
 */
export function dayDiffInDays(a: string, b: string): number {
  const [ay, am, ad] = a.split('-').map(Number);
  const [by, bm, bd] = b.split('-').map(Number);
  const utcA = Date.UTC(ay, am - 1, ad);
  const utcB = Date.UTC(by, bm - 1, bd);
  return Math.round((utcB - utcA) / 86_400_000);
}

// ── Streak affiché (sans mutation) ──────────────────────────────────────
/**
 * Série effective à afficher AUJOURD'HUI, sans rien modifier :
 * - hier ou aujourd'hui actif → la série tient ;
 * - jours ratés couvrables par les jokers en réserve → la série tient
 *   (les jokers seront réellement consommés à la prochaine séance) ;
 * - sinon → 0 (série cassée).
 */
export function displayStreak(progress: ProgressState, todayKey: string): number {
  if (!progress.lastActiveDay || progress.streak === 0) return 0;
  const diff = dayDiffInDays(progress.lastActiveDay, todayKey);
  if (diff <= 1) return progress.streak;
  const missed = diff - 1;
  return missed <= progress.freezes ? progress.streak : 0;
}

/** La séance du jour est-elle déjà faite (pour le rappel anti-rupture) ? */
export function isActiveToday(progress: ProgressState, todayKey: string): boolean {
  return progress.lastActiveDay === todayKey;
}

// ── Événements (pour les célébrations UI) ───────────────────────────────
export type ProgressEvent =
  | { kind: 'xp'; amount: number; bonusApplied: boolean }
  | { kind: 'streak'; streak: number; isNewDay: boolean }
  | { kind: 'freeze_used'; count: number }
  | { kind: 'freeze_earned' }
  | { kind: 'level_up'; level: number; rank: string }
  | { kind: 'badge_unlocked'; badge: Badge };

// ── Le cœur : une séance complétée ──────────────────────────────────────
/**
 * Applique une séance complétée le jour `dayKey` (clé LOCALE).
 * Règles de série :
 * - même jour → la série ne bouge pas (mais l'XP tombe) ;
 * - jour suivant → +1 ;
 * - jour(s) raté(s) couvert(s) par les jokers → jokers consommés
 *   automatiquement, la série continue (+1 pour aujourd'hui) ;
 * - jour(s) raté(s) sans assez de jokers → série repartie à 1 ;
 * - horloge qui recule (voyage de fuseau) → on ne casse JAMAIS la série.
 * Un joker est regagné tous les 7 jours de série (réserve max 2).
 */
export function applySessionCompletion(
  progress: ProgressState,
  dayKey: string,
  exerciseCount: number,
): { progress: ProgressState; events: ProgressEvent[] } {
  const events: ProgressEvent[] = [];
  let streak = progress.streak;
  let freezes = progress.freezes;
  let lastActiveDay = dayKey;
  let isNewDay = true;

  if (progress.lastActiveDay === dayKey) {
    isNewDay = false; // 2e séance du même jour
  } else if (progress.lastActiveDay === null) {
    streak = 1;
  } else {
    const diff = dayDiffInDays(progress.lastActiveDay, dayKey);
    const missed = diff - 1;
    if (diff <= 0) {
      // Le jour local a reculé (changement de fuseau) : neutre.
      isNewDay = false;
      lastActiveDay = progress.lastActiveDay;
    } else if (missed === 0) {
      streak += 1;
    } else if (missed <= freezes) {
      freezes -= missed;
      streak += 1;
      events.push({ kind: 'freeze_used', count: missed });
    } else {
      streak = 1;
    }
  }

  // Joker regagné à chaque palier de 7 jours de série (plafond 2).
  if (streak > progress.streak && streak % FREEZE_EVERY_STREAK_DAYS === 0 && freezes < MAX_FREEZES) {
    freezes += 1;
    events.push({ kind: 'freeze_earned' });
  }

  events.push({ kind: 'streak', streak, isNewDay });

  // XP — bonus de régularité tant que la série est active (≥ 2 jours).
  const bonusApplied = streak >= 2;
  const gained = Math.round(
    (SESSION_XP + EXERCISE_XP * Math.max(0, exerciseCount)) * (1 + (bonusApplied ? STREAK_XP_BONUS : 0)),
  );
  const xp = progress.xp + gained;
  events.push({ kind: 'xp', amount: gained, bonusApplied });

  const levelBefore = levelForXp(progress.xp);
  const levelAfter = levelForXp(xp);
  if (levelAfter > levelBefore) {
    events.push({ kind: 'level_up', level: levelAfter, rank: rankForLevel(levelAfter) });
  }

  const totalSessions = progress.totalSessions + 1;
  const bestStreak = Math.max(progress.bestStreak, streak);

  const badges = [...progress.badges];
  for (const badge of BADGES) {
    if (badges.includes(badge.id)) continue;
    const value = badge.kind === 'streak' ? streak : totalSessions;
    if (value >= badge.seuil) {
      badges.push(badge.id);
      events.push({ kind: 'badge_unlocked', badge });
    }
  }

  return {
    progress: { streak, bestStreak, lastActiveDay, freezes, xp, totalSessions, badges },
    events,
  };
}
