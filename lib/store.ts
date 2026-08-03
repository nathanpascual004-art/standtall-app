import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type {
  ActivityLevel,
  MealEntry,
  NutritionProfile,
  NutritionTargets,
} from './nutrition';
import { HABIT_XP } from './habits';
import { MAX_GLASSES_PER_DAY } from './hydration';
import { advanceJourney, INITIAL_JOURNEY, JOURNEY_DAY_COUNT, type JourneyState } from './journey';
import { getSession } from './program';
import {
  applySessionCompletion,
  applyXpGain,
  INITIAL_PROGRESS,
  SESSION_XP,
  type ProgressEvent,
  type ProgressState,
} from './progress';

/** Repas mémorisé pour les favoris — un MealEntry sans identifiant. */
export type SavedMeal = Omit<MealEntry, 'id'>;

/** Idée de repas sélectionnée — pré-remplit l'ajout manuel (transitoire). */
export type MealIdeaDraft = SavedMeal;

/** Objectif principal choisi à l'étape 1 (ancien flow — conservé pour compat). */
export type Goal = 'taller' | 'posture' | 'back-pain' | 'presence';

/** Intention choisie à l'écran 2 du nouvel onboarding — branche la suite. */
export type Intention = 'posture' | 'nutrition' | 'both';

/** Temps d'écran téléphone par jour. */
export type PhoneHours = 'moins-2' | '2-5' | '5-plus';

/** Zones de tension déclarées (multi-choix ; [] = aucune). */
export type TensionZone = 'nuque' | 'haut-dos' | 'bas-dos';

/** Échelle 0-3 : pas du tout → beaucoup. */
export type Scale4 = 0 | 1 | 2 | 3;

/** Objectif nutrition du nouvel onboarding (plus large que NutritionGoal). */
export type NutriIntent = 'masse' | 'maintien' | 'perte' | 'mieux-manger';

/** Plus grosse difficulté nutrition déclarée. */
export type NutriDifficulty = 'temps' | 'quoi-manger' | 'grignote' | 'calories';

export type Gender = 'homme' | 'femme' | 'autre';

export type AgeRange = '13-17' | '18-24' | '25-34' | '35-44' | '45+';

/** Heures assis / devant un écran par jour. */
export type SittingHours = 'moins-4' | '4-8' | '8-plus';

/** Tenue spontanée (étape 6). */
export type PostureType = 'droit' | 'legerement-voute' | 'tres-voute';

/** Tête qui part en avant (étape 7). */
export type ForwardHead = 'jamais' | 'parfois' | 'souvent';

/** Douleurs dos / nuque / épaules (étape 8). */
export type PainFrequency = 'aucune' | 'parfois' | 'regulieres';

/** Épaules enroulées vers l'avant (étape 9). */
export type ShoulderRoll = 'non' | 'un-peu' | 'oui';

/** Minutes par jour consacrées au programme (étape 12). */
export type DailyMinutes = 5 | 10 | 15;

/**
 * Réponses du quiz — une clé par écran.
 */
export type QuizAnswers = {
  /** Intention (nouvel onboarding) — branche posture / nutrition / both. */
  intention?: Intention;
  gender?: Gender;
  ageRange?: AgeRange;
  /** Taille actuelle en cm — la référence du personnage. */
  heightCm?: number;
  sittingHours?: SittingHours;
  /** Temps de téléphone par jour (remplace « tête en avant »). */
  phoneHours?: PhoneHours;
  postureType?: PostureType;
  /** Zones de tension (multi-choix ; [] = aucune). */
  tensions?: TensionZone[];
  /** « Tu te trouves plus petit que ta taille réelle ? » (0-3). */
  feelSmaller?: Scale4;
  /** Importance de se tenir droit / paraître plus grand (0-3). */
  importance?: Scale4;
  /** Bloc nutrition du nouvel onboarding. */
  nutriGoal?: NutriIntent;
  activite?: ActivityLevel;
  mealsPerDay?: 2 | 3 | 4 | 5;
  poidsKg?: number;
  difficulty?: NutriDifficulty;
  /** Email de capture du bilan (écran 8). */
  email?: string;
  /** Prénom (personnalisation accueil/profil) — optionnel. */
  firstName?: string;
  // ── Champs de l'ancien flow — conservés pour les profils existants ──
  goal?: Goal;
  forwardHead?: ForwardHead;
  pain?: PainFrequency;
  roundedShoulders?: ShoulderRoll;
  profilePhotoUri?: string;
  dailyMinutes?: DailyMinutes;
};

/** Clé du jour courant, ex. « 2026-07-28 » — sert d'index au suivi. */
export function todayKey(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

type OnboardingState = {
  /** true une fois le store rechargé depuis le disque (hydratation). */
  hasHydrated: boolean;
  answers: QuizAnswers;
  /** Code de parrainage validé à l'onboarding (affiliation) — optionnel. */
  referralCode?: string;
  /** Passe à true à la fin du flow (reveal/paywall) — débloque les tabs. */
  onboardingDone: boolean;
  /** Séances complétées, par clé du jour : { "2026-07-28": ["redressement-base"] }. */
  completedSessions: Record<string, string[]>;
  /** Réponses en cours du setup nutrition (sous-onboarding). */
  nutritionDraft: Partial<NutritionProfile>;
  /** Profil nutrition validé + cibles calculées une fois à la fin du setup. */
  nutritionProfile?: NutritionProfile;
  nutritionTargets?: NutritionTargets;
  /** Journal des repas, par clé du jour. */
  meals: Record<string, MealEntry[]>;
  /** Repas favoris (réutilisation en 1 tap depuis l'écran Nutrition). */
  favoriteMeals: SavedMeal[];
  /** Progression gamifiée : streak, jokers, XP, badges (lib/progress). */
  progress: ProgressState;
  /** Avancement du parcours (niveaux/jours) — lib/journey. */
  journey: JourneyState;
  /** Habitudes cochées par jour : { "2026-08-02": ["eau", …] }. */
  habits: Record<string, string[]>;
  /** Habitudes déjà créditées en XP (anti re-coche le même jour). */
  habitsRewarded: Record<string, string[]>;
  /** Verres d'eau bus par jour : { "2026-08-02": 5 } (reset auto par clé). */
  water: Record<string, number>;
  /**
   * Idée de repas tapée dans « Idées de repas » — consommée par l'écran
   * Nutrition pour pré-remplir l'ajout manuel. Jamais persisté.
   */
  mealIdeaDraft: MealIdeaDraft | null;
  /**
   * Événements de la DERNIÈRE séance complétée (XP, joker, niveau,
   * badges) — transitoire, consommé par l'écran de fin pour les
   * célébrations, jamais persisté.
   */
  lastProgressEvents: ProgressEvent[];
  setHasHydrated: (value: boolean) => void;
  setAnswer: <K extends keyof QuizAnswers>(key: K, value: QuizAnswers[K]) => void;
  setReferralCode: (code: string | undefined) => void;
  completeOnboarding: () => void;
  completeSession: (sessionId: string) => void;
  setNutritionDraft: (patch: Partial<NutritionProfile>) => void;
  setNutritionProfile: (profile: NutritionProfile, targets: NutritionTargets) => void;
  addMeal: (meal: Omit<MealEntry, 'id'>) => void;
  removeMeal: (mealId: string) => void;
  /** Ajoute/retire un repas des favoris (identifié par son nom). */
  toggleFavoriteMeal: (meal: SavedMeal) => void;
  /** Coche/décoche une habitude du jour (XP créditée à la 1re coche). */
  toggleHabit: (habitId: string) => void;
  /** Ajoute (+1) ou retire (-1) un verre d'eau au compteur du jour. */
  addWater: (delta: 1 | -1) => void;
  setMealIdeaDraft: (draft: MealIdeaDraft | null) => void;
  /** Vide les événements de célébration une fois affichés. */
  clearProgressEvents: () => void;
  reset: () => void;
};

/**
 * Sous-ensemble du store écrit sur le disque. Le PostureResult n'est pas
 * stocké : il se recalcule à l'identique depuis `answers` (déterministe).
 * `hasHydrated` et `nutritionDraft` (état transitoire du wizard) restent
 * en mémoire uniquement.
 */
type PersistedState = Pick<
  OnboardingState,
  | 'answers'
  | 'referralCode'
  | 'onboardingDone'
  | 'completedSessions'
  | 'nutritionProfile'
  | 'nutritionTargets'
  | 'meals'
  | 'favoriteMeals'
  | 'progress'
  | 'journey'
  | 'habits'
  | 'habitsRewarded'
  | 'water'
>;

const PERSIST_VERSION = 5;

/**
 * Storage no-op pour le pré-rendu statique web (Node, pas de window).
 * Sur iOS/Android et dans le navigateur, AsyncStorage est utilisé.
 */
const noopStorage = {
  getItem: async () => null,
  setItem: async () => {},
  removeItem: async () => {},
};

const initialState = {
  hasHydrated: false,
  answers: {},
  onboardingDone: false,
  completedSessions: {},
  nutritionDraft: {},
  meals: {},
  favoriteMeals: [] as SavedMeal[],
  progress: INITIAL_PROGRESS,
  journey: INITIAL_JOURNEY,
  habits: {} as Record<string, string[]>,
  habitsRewarded: {} as Record<string, string[]>,
  water: {} as Record<string, number>,
  mealIdeaDraft: null as MealIdeaDraft | null,
  lastProgressEvents: [] as ProgressEvent[],
} as const;

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      ...initialState,
      setHasHydrated: (value) => set({ hasHydrated: value }),
      setAnswer: (key, value) =>
        set((state) => ({ answers: { ...state.answers, [key]: value } })),
      setReferralCode: (code) => set({ referralCode: code }),
      completeOnboarding: () => set({ onboardingDone: true }),
      completeSession: (sessionId) =>
        set((state) => {
          const day = todayKey();
          const done = state.completedSessions[day] ?? [];
          // Refaire une séance déjà complétée aujourd'hui ne redonne
          // ni XP ni streak (anti-farm) — comme avant pour le suivi.
          if (done.includes(sessionId)) return state;
          const exerciseCount = getSession(sessionId)?.exercises.length ?? 0;
          const { progress, events } = applySessionCompletion(
            state.progress,
            day,
            exerciseCount,
          );
          return {
            completedSessions: {
              ...state.completedSessions,
              [day]: [...done, sessionId],
            },
            progress,
            // Le parcours avance d'un nœud (au plus une fois par jour).
            journey: advanceJourney(state.journey, day),
            lastProgressEvents: events,
          };
        }),
      toggleHabit: (habitId) =>
        set((state) => {
          const day = todayKey();
          const checked = state.habits[day] ?? [];
          const isChecked = checked.includes(habitId);
          const habits = {
            ...state.habits,
            [day]: isChecked
              ? checked.filter((id) => id !== habitId)
              : [...checked, habitId],
          };
          // XP créditée UNE fois par habitude et par jour (décocher ne
          // retire rien, re-cocher ne recrédite pas — anti-farm).
          const rewarded = state.habitsRewarded[day] ?? [];
          if (isChecked || rewarded.includes(habitId)) {
            return { habits };
          }
          const { progress } = applyXpGain(state.progress, HABIT_XP);
          return {
            habits,
            habitsRewarded: { ...state.habitsRewarded, [day]: [...rewarded, habitId] },
            progress,
          };
        }),
      addWater: (delta) =>
        set((state) => {
          const day = todayKey();
          const current = state.water[day] ?? 0;
          const next = Math.max(0, Math.min(MAX_GLASSES_PER_DAY, current + delta));
          if (next === current) return state;
          return { water: { ...state.water, [day]: next } };
        }),
      setMealIdeaDraft: (draft) => set({ mealIdeaDraft: draft }),
      clearProgressEvents: () => set({ lastProgressEvents: [] }),
      setNutritionDraft: (patch) =>
        set((state) => ({ nutritionDraft: { ...state.nutritionDraft, ...patch } })),
      setNutritionProfile: (profile, targets) =>
        set({ nutritionProfile: profile, nutritionTargets: targets, nutritionDraft: {} }),
      addMeal: (meal) =>
        set((state) => {
          const day = todayKey();
          const entry: MealEntry = { ...meal, id: `${day}-${Date.now().toString(36)}` };
          return { meals: { ...state.meals, [day]: [...(state.meals[day] ?? []), entry] } };
        }),
      toggleFavoriteMeal: (meal) =>
        set((state) => {
          const exists = state.favoriteMeals.some((f) => f.nom === meal.nom);
          return {
            favoriteMeals: exists
              ? state.favoriteMeals.filter((f) => f.nom !== meal.nom)
              : [...state.favoriteMeals, meal].slice(-12),
          };
        }),
      removeMeal: (mealId) =>
        set((state) => {
          const day = todayKey();
          return {
            meals: {
              ...state.meals,
              [day]: (state.meals[day] ?? []).filter((meal) => meal.id !== mealId),
            },
          };
        }),
      reset: () =>
        set({
          answers: {},
          referralCode: undefined,
          onboardingDone: false,
          completedSessions: {},
          nutritionDraft: {},
          nutritionProfile: undefined,
          nutritionTargets: undefined,
          meals: {},
          favoriteMeals: [],
          progress: INITIAL_PROGRESS,
          journey: INITIAL_JOURNEY,
          habits: {},
          habitsRewarded: {},
          water: {},
          lastProgressEvents: [],
        }),
    }),
    {
      name: 'standtall-store',
      version: PERSIST_VERSION,
      storage: createJSONStorage(() =>
        typeof window === 'undefined' ? noopStorage : AsyncStorage,
      ),
      partialize: (state): PersistedState => ({
        answers: state.answers,
        referralCode: state.referralCode,
        onboardingDone: state.onboardingDone,
        completedSessions: state.completedSessions,
        nutritionProfile: state.nutritionProfile,
        nutritionTargets: state.nutritionTargets,
        meals: state.meals,
        favoriteMeals: state.favoriteMeals,
        progress: state.progress,
        journey: state.journey,
        habits: state.habits,
        habitsRewarded: state.habitsRewarded,
        water: state.water,
      }),
      // v1 → v2 : ajout des repas favoris (liste vide par défaut).
      // v2 → v3 : ajout de la progression — les séances déjà faites
      // créditent le total et l'XP ; le streak repart proprement (on ne
      // peut pas reconstituer les jours consécutifs de façon fiable).
      migrate: (persistedState, version) => {
        const state = persistedState as PersistedState;
        if (version < 2 && !Array.isArray(state.favoriteMeals)) {
          state.favoriteMeals = [];
        }
        if (version < 3 || !state.progress) {
          const totalSessions = Object.values(state.completedSessions ?? {}).reduce(
            (sum, list) => sum + list.length,
            0,
          );
          state.progress = {
            ...INITIAL_PROGRESS,
            totalSessions,
            xp: totalSessions * SESSION_XP,
          };
        }
        // v3 → v4 : parcours + habitudes. Les séances déjà faites créditent
        // l'avancement du parcours (une par jour, plafonné).
        if (version < 4 || !state.journey) {
          const daysActive = Object.keys(state.completedSessions ?? {}).length;
          state.journey = {
            day: Math.min(JOURNEY_DAY_COUNT, daysActive),
            lastAdvanceDay: null,
          };
        }
        if (!state.habits) state.habits = {};
        if (!state.habitsRewarded) state.habitsRewarded = {};
        // v4 → v5 : compteur d'hydratation.
        if (!state.water) state.water = {};
        return state;
      },
      onRehydrateStorage: () => () => {
        // Toujours débloquer l'app, même si la lecture disque a échoué.
        useOnboardingStore.setState({ hasHydrated: true });
      },
    },
  ),
);
