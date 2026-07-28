import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type {
  MealEntry,
  NutritionProfile,
  NutritionTargets,
} from './nutrition';

/** Nombre total d'étapes du quiz d'onboarding. */
export const TOTAL_ONBOARDING_STEPS = 14;

/** Objectif principal choisi à l'étape 1. */
export type Goal = 'taller' | 'posture' | 'back-pain' | 'presence';

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
  goal?: Goal;
  gender?: Gender;
  ageRange?: AgeRange;
  /** Taille actuelle en cm (étape 4). */
  heightCm?: number;
  sittingHours?: SittingHours;
  postureType?: PostureType;
  forwardHead?: ForwardHead;
  pain?: PainFrequency;
  roundedShoulders?: ShoulderRoll;
  /** URI locale de la photo de profil (étape 10) — analyse à venir. */
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
  setHasHydrated: (value: boolean) => void;
  setAnswer: <K extends keyof QuizAnswers>(key: K, value: QuizAnswers[K]) => void;
  completeOnboarding: () => void;
  completeSession: (sessionId: string) => void;
  setNutritionDraft: (patch: Partial<NutritionProfile>) => void;
  setNutritionProfile: (profile: NutritionProfile, targets: NutritionTargets) => void;
  addMeal: (meal: Omit<MealEntry, 'id'>) => void;
  removeMeal: (mealId: string) => void;
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
  | 'onboardingDone'
  | 'completedSessions'
  | 'nutritionProfile'
  | 'nutritionTargets'
  | 'meals'
>;

const PERSIST_VERSION = 1;

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
} as const;

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      ...initialState,
      setHasHydrated: (value) => set({ hasHydrated: value }),
      setAnswer: (key, value) =>
        set((state) => ({ answers: { ...state.answers, [key]: value } })),
      completeOnboarding: () => set({ onboardingDone: true }),
      completeSession: (sessionId) =>
        set((state) => {
          const day = todayKey();
          const done = state.completedSessions[day] ?? [];
          if (done.includes(sessionId)) return state;
          return {
            completedSessions: {
              ...state.completedSessions,
              [day]: [...done, sessionId],
            },
          };
        }),
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
          onboardingDone: false,
          completedSessions: {},
          nutritionDraft: {},
          nutritionProfile: undefined,
          nutritionTargets: undefined,
          meals: {},
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
        onboardingDone: state.onboardingDone,
        completedSessions: state.completedSessions,
        nutritionProfile: state.nutritionProfile,
        nutritionTargets: state.nutritionTargets,
        meals: state.meals,
      }),
      // Migrations futures : brancher ici sur `version` quand le schéma
      // persisté évolue, sans casser les installs existantes.
      migrate: (persistedState, _version) => persistedState as PersistedState,
      onRehydrateStorage: () => () => {
        // Toujours débloquer l'app, même si la lecture disque a échoué.
        useOnboardingStore.setState({ hasHydrated: true });
      },
    },
  ),
);
